#!/bin/bash

# 🧪 Script de configuration de l'environnement de tests pour E-COMPTA-IA
# Ce script configure tous les outils nécessaires pour les tests automatisés

set -e

echo "🧪 Configuration de l'environnement de tests E-COMPTA-IA"
echo "=================================================="

# ===================================================
# CONFIGURATION DES VARIABLES
# ===================================================
NODE_VERSION="18"
CHROME_VERSION="stable"
TEST_DB_NAME="ecompta_test"
TEST_PORT=4200

# ===================================================
# INSTALLATION DES DÉPENDANCES DE TEST
# ===================================================
echo "📦 Installation des dépendances de test..."

# Jest et outils de test unitaire
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  jest-preset-angular \
  jest-environment-jsdom \
  @testing-library/angular \
  @testing-library/jest-dom \
  @testing-library/user-event

# Playwright pour les tests E2E
npm install --save-dev \
  @playwright/test \
  playwright

# Outils de couverture
npm install --save-dev \
  nyc \
  codecov \
  c8

# Outils de qualité
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  lint-staged \
  husky

# Lighthouse pour les tests de performance
npm install --save-dev \
  @lhci/cli \
  lighthouse

echo "✅ Dépendances installées"

# ===================================================
# CONFIGURATION JEST
# ===================================================
echo "⚙️ Configuration de Jest..."

cat > jest.config.js << 'EOF'
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  
  // Chemins de modules
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths || {}, {
      prefix: '<rootDir>/'
    }),
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/app/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1'
  },

  // Couverture de code
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text', 'json'],
  collectCoverageFrom: [
    'src/app/**/*.{ts,js}',
    '!src/app/**/*.spec.{ts,js}',
    '!src/app/**/*.mock.{ts,js}',
    '!src/app/**/*.module.{ts,js}',
    '!src/app/**/*.config.{ts,js}',
    '!src/app/**/index.{ts,js}'
  ],
  
  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Seuils spécifiques par module critique
    './src/app/modules/comptabilite/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/app/modules/fiscal-settings/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Transformation des fichiers
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: 'tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },

  // Ignorés
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/e2e/'
  ],

  // Timeout des tests
  testTimeout: 30000,

  // Reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'jest-results.xml'
    }]
  ]
};
EOF

# Fichier de setup Jest
cat > src/setup-jest.ts << 'EOF'
import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Configuration globale pour les tests
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

// Mock des services globaux
class MockIntersectionObserver {
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;
EOF

echo "✅ Jest configuré"

# ===================================================
# CONFIGURATION PLAYWRIGHT
# ===================================================
echo "🎭 Configuration de Playwright..."

cat > playwright.config.ts << 'EOF'
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { outputFolder: 'e2e-results/html' }],
    ['junit', { outputFile: 'e2e-results/junit.xml' }],
    ['json', { outputFile: 'e2e-results/results.json' }]
  ],
  
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run start:test',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
EOF

echo "✅ Playwright configuré"

# ===================================================
# CONFIGURATION LIGHTHOUSE CI
# ===================================================
echo "🏃‍♂️ Configuration de Lighthouse CI..."

cat > lighthouserc.js << 'EOF'
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200',
        'http://localhost:4200/dashboard',
        'http://localhost:4200/comptabilite',
        'http://localhost:4200/elearning'
      ],
      startServerCommand: 'npm run start:test',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.6 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
EOF

echo "✅ Lighthouse CI configuré"

# ===================================================
# SCRIPTS NPM POUR LES TESTS
# ===================================================
echo "📝 Ajout des scripts npm pour les tests..."

# Backup du package.json actuel
cp package.json package.json.bak

# Ajout des scripts de test
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = {
  ...pkg.scripts,
  'test': 'jest',
  'test:watch': 'jest --watch',
  'test:ci': 'jest --ci --coverage --watchAll=false',
  'test:coverage': 'jest --coverage',
  'test:debug': 'node --inspect-brk node_modules/.bin/jest --runInBand',
  'test:clear': 'jest --clearCache',
  
  'e2e': 'playwright test',
  'e2e:ui': 'playwright test --ui',
  'e2e:debug': 'playwright test --debug',
  'e2e:report': 'playwright show-report e2e-results/html',
  
  'test:performance': 'lhci autorun',
  'test:load': 'node scripts/load-test.js',
  
  'test:all': 'npm run test:ci && npm run e2e && npm run test:performance',
  
  'start:test': 'ng serve --configuration=test --port=4200',
  
  'lint': 'eslint src/**/*.{ts,html}',
  'lint:fix': 'eslint src/**/*.{ts,html} --fix',
  'prettier': 'prettier --write src/**/*.{ts,html,scss,json}',
  'prettier:check': 'prettier --check src/**/*.{ts,html,scss,json}',
  
  'analyze:bundle': 'ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json',
  'audit:performance': 'npm run test:performance',
  'audit:dependencies': 'npm audit --audit-level=moderate'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

echo "✅ Scripts npm ajoutés"

# ===================================================
# CONFIGURATION BASE DE DONNÉES DE TEST
# ===================================================
echo "🗄️ Configuration de la base de données de test..."

# Script pour créer la base de test (PostgreSQL)
cat > scripts/setup-test-db.sql << 'EOF'
-- Création de la base de données de test pour E-COMPTA-IA
CREATE DATABASE ecompta_test;
CREATE USER ecompta_test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE ecompta_test TO ecompta_test_user;

-- Configuration pour les tests
\c ecompta_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Schéma de base pour les tests
CREATE SCHEMA IF NOT EXISTS test_data;
GRANT ALL ON SCHEMA test_data TO ecompta_test_user;
EOF

echo "✅ Configuration base de données créée"

# ===================================================
# FIXTURES ET DONNÉES DE TEST
# ===================================================
echo "📊 Création des fixtures de test..."

mkdir -p src/app/testing/fixtures

cat > src/app/testing/fixtures/entreprise.fixture.ts << 'EOF'
import { Entreprise } from '@modules/entreprise/models/entreprise.model';

export const ENTREPRISE_TEST_FIXTURE: Entreprise = {
  id: 'test-entreprise-1',
  raisonSociale: 'Test SARL',
  formeJuridique: 'SARL',
  secteurActivite: 'Services informatiques',
  pays: 'BF',
  ville: 'Ouagadougou',
  adresse: '123 Avenue Test',
  telephone: '+226 25 12 34 56',
  email: 'test@example.com',
  numeroIFU: 'TEST123456789',
  registreCommerce: 'RCCM-TEST-123',
  exerciceComptable: {
    dateDebut: new Date('2024-01-01'),
    dateFin: new Date('2024-12-31'),
    dureeEnMois: 12,
    statut: 'ouvert'
  },
  regimeFiscal: 'reel_normal',
  assujettissementTVA: true,
  tauxTVA: 18,
  devise: 'XOF',
  planComptable: 'SYSCOHADA',
  dateCreation: new Date(),
  dateModification: new Date(),
  actif: true
};
EOF

cat > src/app/testing/fixtures/ecriture.fixture.ts << 'EOF'
import { EcritureComptable } from '@modules/comptabilite/models/ecriture.model';

export const ECRITURE_TEST_FIXTURE: EcritureComptable = {
  id: 'test-ecriture-1',
  numero: 'ACH-2024-001',
  date: new Date('2024-03-15'),
  libelle: 'Achat marchandises Test SARL',
  journal: 'ACH',
  montantTotal: 1180000,
  equilibre: true,
  lignes: [
    {
      id: 'ligne-1',
      compte: '601100',
      libelleCompte: 'Achats de marchandises',
      debit: 1000000,
      credit: 0,
      tiers: 'FOUR001',
      devise: 'XOF'
    },
    {
      id: 'ligne-2', 
      compte: '445100',
      libelleCompte: 'TVA déductible sur achats',
      debit: 180000,
      credit: 0,
      tiers: null,
      devise: 'XOF'
    },
    {
      id: 'ligne-3',
      compte: '401100', 
      libelleCompte: 'Fournisseurs',
      debit: 0,
      credit: 1180000,
      tiers: 'FOUR001',
      devise: 'XOF'
    }
  ],
  pieceJointe: 'facture-test-001.pdf',
  statut: 'validee',
  entrepriseId: 'test-entreprise-1',
  utilisateurId: 'test-user-1',
  dateCreation: new Date(),
  dateModification: new Date()
};
EOF

echo "✅ Fixtures créées"

# ===================================================
# HELPERS DE TEST
# ===================================================
echo "🛠️ Création des helpers de test..."

cat > src/app/testing/test-helpers.ts << 'EOF'
import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Helpers pour simplifier les tests Angular
 */
export class TestHelpers {
  
  /**
   * Trouve un élément par son data-testid
   */
  static getByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Trouve tous les éléments par leur data-testid
   */
  static getAllByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Simule un clic sur un élément
   */
  static clickElement(element: DebugElement): void {
    element.nativeElement.click();
  }

  /**
   * Saisit du texte dans un input
   */
  static setInputValue(element: DebugElement, value: string): void {
    const input = element.nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  /**
   * Attend qu'un élément soit présent
   */
  static async waitForElement<T>(
    fixture: ComponentFixture<T>, 
    testId: string, 
    timeout = 5000
  ): Promise<DebugElement> {
    const start = Date.now();
    
    while (Date.now() - start < timeout) {
      const element = this.getByTestId(fixture, testId);
      if (element) {
        return element;
      }
      
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Element with testId "${testId}" not found within ${timeout}ms`);
  }

  /**
   * Vérifie qu'un élément contient un texte
   */
  static expectElementToContainText(element: DebugElement, text: string): void {
    expect(element.nativeElement.textContent).toContain(text);
  }

  /**
   * Mock d'un service Angular
   */
  static createServiceMock<T>(serviceMethods: Array<keyof T>): jasmine.SpyObj<T> {
    const mock = jasmine.createSpyObj('MockService', serviceMethods);
    return mock;
  }
}

/**
 * Attendre un délai spécifique (pour les tests async)
 */
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Mock des données SYSCOHADA
 */
export const MOCK_SYSCOHADA_DATA = {
  comptes: [
    { numero: '601100', libelle: 'Achats de marchandises' },
    { numero: '701100', libelle: 'Ventes de marchandises' },
    { numero: '445100', libelle: 'TVA déductible sur achats' },
    { numero: '443100', libelle: 'TVA collectée' }
  ],
  journaux: [
    { code: 'ACH', libelle: 'Journal des achats' },
    { code: 'VTE', libelle: 'Journal des ventes' },
    { code: 'BQ', libelle: 'Journal de banque' },
    { code: 'PAIE', libelle: 'Journal de paie' }
  ]
};
EOF

echo "✅ Helpers créés"

# ===================================================
# CONFIGURATION ESLINT
# ===================================================
echo "🔍 Configuration d'ESLint..."

cat > .eslintrc.json << 'EOF'
{
  "root": true,
  "ignorePatterns": ["projects/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": [
        "eslint:recommended",
        "@angular-eslint/recommended",
        "@angular-eslint/template/process-inline-templates",
        "@typescript-eslint/recommended"
      ],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          { "type": "attribute", "prefix": "app", "style": "camelCase" }
        ],
        "@angular-eslint/component-selector": [
          "error",
          { "type": "element", "prefix": "app", "style": "kebab-case" }
        ],
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/no-explicit-any": "warn",
        "prefer-const": "error",
        "no-var": "error"
      }
    },
    {
      "files": ["*.html"],
      "extends": ["@angular-eslint/template/recommended"],
      "rules": {}
    },
    {
      "files": ["*.spec.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
EOF

echo "✅ ESLint configuré"

# ===================================================
# CONFIGURATION PRETTIER
# ===================================================
echo "🎨 Configuration de Prettier..."

cat > .prettierrc << 'EOF'
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
EOF

cat > .prettierignore << 'EOF'
# Build outputs
dist/
coverage/
e2e-results/

# Dependencies
node_modules/

# Logs
*.log

# Generated files
*.d.ts
EOF

echo "✅ Prettier configuré"

# ===================================================
# INSTALLATION PLAYWRIGHT BROWSERS
# ===================================================
echo "🎭 Installation des navigateurs Playwright..."
npx playwright install

# ===================================================
# FINALISATION
# ===================================================
echo ""
echo "🎉 Configuration de l'environnement de tests terminée !"
echo ""
echo "📋 Commandes disponibles:"
echo "  npm run test              # Tests unitaires"
echo "  npm run test:watch        # Tests en mode watch"
echo "  npm run test:coverage     # Tests avec couverture"
echo "  npm run e2e               # Tests end-to-end"
echo "  npm run e2e:ui            # Tests E2E avec interface"
echo "  npm run test:performance  # Tests de performance"
echo "  npm run test:all          # Tous les tests"
echo "  npm run lint              # Vérification du code"
echo "  npm run prettier          # Formatage du code"
echo ""
echo "🏃‍♂️ Pour lancer les tests:"
echo "  npm run test:all"
echo ""
echo "✅ Environnement prêt pour les tests E-COMPTA-IA !"