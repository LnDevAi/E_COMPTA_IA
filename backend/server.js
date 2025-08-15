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

// Stubs for other modules
app.get('/api/user-management/*', (req,res)=>res.json({ ok:true, items:[] }));
app.get('/api/financial-statements/*', (req,res)=>res.json({ ok:true }));
app.get('/api/bank-reconciliation/*', (req,res)=>res.json({ ok:true }));
app.get('/api/fiscal-settings/*', (req,res)=>res.json({ ok:true }));
app.get('/api/balance-n1/*', (req,res)=>res.json({ ok:true }));
app.get('/api/knowledge-base/*', (req,res)=>res.json({ ok:true }));
app.get('/api/invoices/:id/download', (req,res)=>{ res.setHeader('Content-Type','application/pdf'); res.send('%PDF-1.3\n%… minimal'); });
app.get('/api/certificats/:id/download', (req,res)=>{ res.setHeader('Content-Type','application/pdf'); res.send('%PDF-1.3\n%… minimal'); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend API listening on :${PORT}`));