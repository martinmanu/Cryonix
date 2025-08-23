// Mock localStorage and sessionStorage for testing
Object.defineProperty(window, 'localStorage', {
  value: {
    store: {} as Record<string, string>,
    getItem: jest.fn((key: string) => window.localStorage.store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      window.localStorage.store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete window.localStorage.store[key];
    }),
    clear: jest.fn(() => {
      window.localStorage.store = {};
    }),
    get length() {
      return Object.keys(this.store).length;
    },
    key: jest.fn((index: number) => Object.keys(window.localStorage.store)[index] || null)
  },
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    store: {} as Record<string, string>,
    getItem: jest.fn((key: string) => window.sessionStorage.store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      window.sessionStorage.store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete window.sessionStorage.store[key];
    }),
    clear: jest.fn(() => {
      window.sessionStorage.store = {};
    }),
    get length() {
      return Object.keys(this.store).length;
    },
    key: jest.fn((index: number) => Object.keys(window.sessionStorage.store)[index] || null)
  },
  writable: true
});

// Mock IndexedDB
const mockIDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
  cmp: jest.fn()
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIDB,
  writable: true
});