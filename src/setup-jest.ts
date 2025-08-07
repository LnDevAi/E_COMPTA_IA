import 'jest-preset-angular/setup-jest';
import '@testing-library/jest-dom';

// Configuration globale pour les tests E-COMPTA-IA
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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
global.sessionStorage = sessionStorageMock;

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver;

// Mock pour Angular Material
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock pour les APIs financières
global.fetch = jest.fn();

// Configuration pour les tests SYSCOHADA
global.SYSCOHADA_CONFIG = {
  PLAN_COMPTABLE: 'SYSCOHADA_AUDCIF',
  DEVISE: 'XOF',
  PAYS: 'BF',
  TVA_TAUX: 18
};

// Helper functions pour les tests
global.createMockUser = () => ({
  id: 'test-user-1',
  email: 'test@e-compta-ia.com',
  nom: 'Test User',
  role: 'ADMIN',
  entreprise: {
    id: 'test-entreprise-1',
    nom: 'Test SARL',
    pays: 'BF'
  }
});

global.createMockEntreprise = () => ({
  id: 'test-entreprise-1',
  nom: 'Test SARL',
  siret: '12345678901234',
  pays: 'BF',
  devise: 'XOF',
  exercice: {
    debut: '2024-01-01',
    fin: '2024-12-31'
  }
});

global.createMockEcriture = () => ({
  id: 'test-ecriture-1',
  numero: 'ECR-2024-001',
  date: '2024-01-15',
  libelle: 'Test écriture comptable',
  journal: 'VTE',
  lignes: [
    {
      compte: '411100',
      libelle: 'Clients',
      debit: 1000000,
      credit: 0
    },
    {
      compte: '701100',
      libelle: 'Ventes',
      debit: 0,
      credit: 1000000
    }
  ]
});

// Setup pour les tests async
beforeEach(() => {
  jest.clearAllMocks();
});

// Configuration de Jest DOM matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received != null;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
});

// Console override pour les tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Setup pour les tests de performance
global.performance = global.performance || {};
global.performance.mark = global.performance.mark || jest.fn();
global.performance.measure = global.performance.measure || jest.fn();
global.performance.getEntriesByName = global.performance.getEntriesByName || jest.fn().mockReturnValue([]);

// Mock pour les Web Workers
class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }

  postMessage(msg) {
    if (this.onmessage) {
      this.onmessage({ data: msg });
    }
  }

  terminate() {}
}

global.Worker = MockWorker;