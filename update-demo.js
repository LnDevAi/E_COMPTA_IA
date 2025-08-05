// Script de mise à jour automatique pour E COMPTA IA
// Ce script met à jour le fichier demo-live.html avec les derniers développements

const fs = require('fs');
const path = require('path');

class DemoUpdater {
    constructor() {
        this.modulesStatus = {
            'infrastructure': { status: 'completed', progress: 100 },
            'identity-enterprise': { status: 'completed', progress: 100 },
            'dashboard': { status: 'in-progress', progress: 0 },
            'chart-accounts': { status: 'pending', progress: 0 },
            'third-party': { status: 'pending', progress: 0 },
            'accounting-entries': { status: 'pending', progress: 0 },
            'ai-assistant': { status: 'pending', progress: 0 },
            'journals': { status: 'pending', progress: 0 },
            'general-ledger': { status: 'pending', progress: 0 },
            'trial-balance': { status: 'pending', progress: 0 },
            'bank-reconciliation': { status: 'pending', progress: 0 },
            'financial-statements': { status: 'pending', progress: 0 },
            'tax-declarations': { status: 'pending', progress: 0 }
        };
        
        this.updates = [];
    }
    
    // Ajouter une mise à jour
    addUpdate(moduleId, status, details = {}) {
        this.modulesStatus[moduleId] = { status, ...details };
        this.updates.push({
            timestamp: new Date(),
            module: moduleId,
            status,
            details
        });
        
        this.updateDemoFile();
    }
    
    // Calculer la progression globale
    calculateGlobalProgress() {
        const modules = Object.values(this.modulesStatus);
        const completedModules = modules.filter(m => m.status === 'completed').length;
        const totalModules = modules.length;
        
        return {
            completed: completedModules,
            total: totalModules,
            percentage: Math.round((completedModules / totalModules) * 100)
        };
    }
    
    // Mettre à jour le fichier demo-live.html
    updateDemoFile() {
        try {
            const demoPath = path.join(__dirname, 'demo-live.html');
            let content = fs.readFileSync(demoPath, 'utf8');
            
            const progress = this.calculateGlobalProgress();
            
            // Mise à jour de la progression JavaScript
            const jsUpdate = `
        // Mise à jour automatique du timestamp
        function updateTimestamp() {
            const now = new Date();
            document.getElementById('timestamp').textContent = now.toLocaleString('fr-FR');
        }
        
        // Simulation mise à jour progression
        function updateProgress() {
            const completed = ${progress.completed}; // Modules terminés
            const total = ${progress.total}; // Total modules
            const percentage = ${progress.percentage};
            
            document.getElementById('progressFill').style.width = percentage + '%';
            document.getElementById('progressText').textContent = \`\${completed}/\${total} modules (\${percentage}%)\`;
        }`;
            
            // Remplacer le script de progression
            content = content.replace(
                /\/\/ Simulation mise à jour progression[\s\S]*?percentage \+ '%';[\s\S]*?modules \(\$\{percentage\}%\)\`;[\s\S]*?}/,
                jsUpdate
            );
            
            // Ajouter timestamp de dernière modification
            const timestampSection = `
            <strong>🕒 Dernière mise à jour:</strong> <span id="timestamp"></span><br>
            <strong>📁 Fichiers créés:</strong> ${this.countCreatedFiles()} fichiers<br>
            <strong>📝 Lignes de code:</strong> ~${this.estimateCodeLines()} lignes TypeScript<br>
            <strong>🎯 Progression:</strong> ${progress.completed}/${progress.total} modules (${progress.percentage}%)`;
            
            content = content.replace(
                /<strong>🕒 Dernière mise à jour:<\/strong>[\s\S]*?<strong>🎯 Conformité AUDCIF:<\/strong>.*?Identité Entreprise/,
                timestampSection
            );
            
            fs.writeFileSync(demoPath, content, 'utf8');
            
            console.log(`✅ Demo mise à jour: ${progress.completed}/${progress.total} modules (${progress.percentage}%)`);
            
        } catch (error) {
            console.error('❌ Erreur mise à jour demo:', error.message);
        }
    }
    
    // Compter les fichiers créés
    countCreatedFiles() {
        const completed = Object.values(this.modulesStatus).filter(m => m.status === 'completed').length;
        return completed * 3; // Approximation: 3 fichiers par module (model, service, component)
    }
    
    // Estimer les lignes de code
    estimateCodeLines() {
        const completed = Object.values(this.modulesStatus).filter(m => m.status === 'completed').length;
        return completed * 400; // Approximation: 400 lignes par module
    }
    
    // Obtenir les dernières mises à jour
    getRecentUpdates(limit = 5) {
        return this.updates
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
}

// Instance globale
const demoUpdater = new DemoUpdater();

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DemoUpdater;
}

// Mise à jour automatique toutes les 30 secondes
setInterval(() => {
    demoUpdater.updateDemoFile();
}, 30000);

console.log('🚀 E COMPTA IA - Script de mise à jour automatique démarré');
console.log('📁 Surveillez demo-live.html pour les mises à jour en temps réel');

// Simulation de mise à jour pour test
setTimeout(() => {
    demoUpdater.addUpdate('dashboard', 'in-progress', { progress: 25 });
}, 5000);