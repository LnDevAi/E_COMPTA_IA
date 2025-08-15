const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const PLAN_PATH = path.join(DATA_DIR, 'plan.json');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJsonSafe(p, fallback) {
	try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return fallback; }
}
function saveJsonSafe(p, obj) {
	try { fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf-8'); } catch {}
}

// Seed plan from assets if no local file
function seedPlanIfEmpty() {
	if (fs.existsSync(PLAN_PATH)) return;
	let items = [];
	try {
		const assetsPlan = path.resolve(__dirname, '../src/assets/data/plan-comptable.json');
		if (fs.existsSync(assetsPlan)) {
			items = JSON.parse(fs.readFileSync(assetsPlan, 'utf-8'));
		}
	} catch {}
	saveJsonSafe(PLAN_PATH, { items });
}
seedPlanIfEmpty();

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Chart of Accounts endpoints
app.get('/api/plan', (req, res) => {
	const data = loadJsonSafe(PLAN_PATH, { items: [] });
	res.json({ items: data.items || [] });
});

app.put('/api/plan', (req, res) => {
	const items = Array.isArray(req.body.items) ? req.body.items : [];
	saveJsonSafe(PLAN_PATH, { items });
	res.json({ items });
});

app.post('/api/plan/subaccount', (req, res) => {
	const { parentCode, code, intitule, description } = req.body || {};
	if (!code || !intitule) return res.status(400).json({ ok: false, error: 'code & intitule required' });
	const data = loadJsonSafe(PLAN_PATH, { items: [] });
	if (data.items.find((x) => x.code === code)) return res.status(409).json({ ok: false, error: 'code already exists' });
	const item = { code, intitule, parent: parentCode || null, classe: String(code).charAt(0), description: description || '', locked: false };
	data.items.push(item);
	saveJsonSafe(PLAN_PATH, data);
	res.json({ ok: true, item });
});

app.delete('/api/plan/subaccount/:code', (req, res) => {
	const code = req.params.code;
	const data = loadJsonSafe(PLAN_PATH, { items: [] });
	const next = data.items.filter((x) => x.code !== code);
	saveJsonSafe(PLAN_PATH, { items: next });
	res.status(204).end();
});

// Import plan (CSV or JSON)
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/plan/import', upload.single('file'), (req, res) => {
	if (!req.file) return res.status(400).json({ accepted: [], errors: ['no file'] });
	const buf = req.file.buffer.toString('utf-8');
	let accepted = [], errors = [];
	try {
		if (req.file.originalname.endsWith('.json')) {
			const arr = JSON.parse(buf);
			if (Array.isArray(arr)) accepted = arr.filter(x => x.code && x.intitule);
		} else { // CSV: code;intitule;classe;parent;nature
			const lines = buf.split(/\r?\n/).filter(l=>l.trim());
			for (let i=1;i<lines.length;i++) {
				const [code,intitule,classe,parent,nature] = lines[i].split(';');
				if (code && intitule) accepted.push({ code, intitule, classe, parent, nature });
			}
		}
		// Merge into plan
		const data = loadJsonSafe(PLAN_PATH, { items: [] });
		const existingCodes = new Set(data.items.map(x=>x.code));
		for (const it of accepted) { if (!existingCodes.has(it.code)) data.items.push(it); }
		saveJsonSafe(PLAN_PATH, data);
	} catch (e) {
		errors.push(String(e));
	}
	res.json({ accepted, errors });
});

// Export CSV
app.get('/api/plan/export.csv', (req, res) => {
	const data = loadJsonSafe(PLAN_PATH, { items: [] });
	const header = 'code;intitule;classe;parent;nature';
	const rows = (data.items||[]).map(i => [i.code, csv(i.intitule), i.classe||'', i.parent||'', i.nature||''].join(';'));
	res.setHeader('Content-Type', 'text/csv; charset=utf-8');
	res.setHeader('Content-Disposition', 'attachment; filename="plan.csv"');
	res.send('\ufeff' + [header, ...rows].join('\n'));
});

function csv(v) { return (v && (v.includes(';') || v.includes('"'))) ? '"'+v.replace(/"/g,'""')+'"' : (v||''); }

// ---------- Helpers per module ----------
function dataPath(name) { return path.join(DATA_DIR, `${name}.json`); }
function load(name, fallback) { return loadJsonSafe(dataPath(name), fallback); }
function save(name, obj) { return saveJsonSafe(dataPath(name), obj); }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.floor(Math.random()*1e4)}`; }

// ---------- User Management ----------
app.get('/api/user-management/users', (req,res)=>{
	const data = load('users', { users: [] });
	res.json({ users: data.users });
});
app.post('/api/user-management/users', (req,res)=>{
	const data = load('users', { users: [] });
	const u = req.body || {}; u.id = genId('U');
	data.users.push(u); save('users', data); res.status(201).json(u);
});
app.put('/api/user-management/users/:id', (req,res)=>{
	const data = load('users', { users: [] });
	const id = req.params.id; const idx = data.users.findIndex(x=>x.id===id);
	if (idx<0) return res.status(404).json({ error:'not found' });
	data.users[idx] = { ...data.users[idx], ...req.body, id }; save('users', data);
	res.json(data.users[idx]);
});
app.delete('/api/user-management/users/:id', (req,res)=>{
	const data = load('users', { users: [] });
	const id = req.params.id; const next = data.users.filter(x=>x.id!==id); save('users',{ users: next });
	res.status(204).end();
});

// ---------- Fiscal Settings (Taxes) ----------
app.get('/api/fiscal-settings/taxes', (req,res)=>{
	const data = load('fiscal', { taxes: [] }); res.json({ taxes: data.taxes });
});
app.put('/api/fiscal-settings/taxes', (req,res)=>{
	const taxes = Array.isArray(req.body?.taxes) ? req.body.taxes : [];
	save('fiscal', { taxes }); res.json({ taxes });
});

// ---------- Balance N-1 (opening balances) ----------
app.get('/api/balance-n1/opening', (req,res)=>{
	const data = load('balanceN1', { opening: [] }); res.json({ opening: data.opening });
});
app.put('/api/balance-n1/opening', (req,res)=>{
	const opening = Array.isArray(req.body?.opening) ? req.body.opening : [];
	save('balanceN1', { opening }); res.json({ opening });
});

// ---------- Financial Statements ----------
app.post('/api/financial-statements/compute', (req,res)=>{
	// inputs: { entries: Ecriture[], from, to }
	const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
	const from = String(req.body?.from||''); const to = String(req.body?.to||'');
	const within = (d)=> (!from||d>=from)&&(!to||d<=to);
	let produits=0, charges=0, c1=0,c2=0,c3=0,c4=0,c5=0;
	for (const e of entries) {
		if (!within(e.date)) continue;
		for (const l of e.lignes||[]) {
			const code = String(l.compte||''); const delta = (Number(l.debit)||0)-(Number(l.credit)||0);
			const cls = code[0];
			if (cls==='7') produits += -delta; else if (cls==='6') charges += delta; else if (cls==='1') c1 += -delta; else if (cls==='2') c2 += delta; else if (cls==='3') c3 += delta; else if (cls==='4') c4 += delta; else if (cls==='5') c5 += delta;
		}
	}
	const resultat = produits - charges;
	res.json({ produits, charges, resultat, bilan:{ actif:{ imm:c2, sto:c3, tres:c5 }, passif:{ cap:c1, tiers:-c4, result:resultat } } });
});

// ---------- Bank Reconciliation ----------
app.get('/api/bank-reconciliation/transactions', (req,res)=>{
	const data = load('reconciliation', { transactions: [], statements: [] });
	res.json({ transactions: data.transactions, statements: data.statements });
});
app.post('/api/bank-reconciliation/transactions', (req,res)=>{
	const data = load('reconciliation', { transactions: [], statements: [] });
	const tx = req.body || {}; tx.id = genId('TX'); data.transactions.push(tx); save('reconciliation', data); res.status(201).json(tx);
});
app.post('/api/bank-reconciliation/statements', (req,res)=>{
	const data = load('reconciliation', { transactions: [], statements: [] });
	const st = req.body || {}; st.id = genId('ST'); data.statements.push(st); save('reconciliation', data); res.status(201).json(st);
});
app.post('/api/bank-reconciliation/match', (req,res)=>{
	res.json({ ok:true, matches: req.body?.pairs||[] });
});

// ---------- Knowledge Base ----------
app.get('/api/knowledge-base/items', (req,res)=>{
	const data = load('kb', { items: [] }); res.json({ items: data.items });
});
app.post('/api/knowledge-base/items', (req,res)=>{
	const data = load('kb', { items: [] }); const it = req.body||{}; it.id = genId('KB'); data.items.push(it); save('kb', data); res.status(201).json(it);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend API listening on :${PORT}`));