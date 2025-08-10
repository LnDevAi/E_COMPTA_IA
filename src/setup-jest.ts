import 'jest-preset-angular/setup-jest';

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

Object.defineProperty(window, 'ResizeObserver', {
  value: class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
});

Object.defineProperty(window, 'IntersectionObserver', {
  value: class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
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
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Setup pour les tests async
beforeEach(() => {
  jest.clearAllMocks();
});