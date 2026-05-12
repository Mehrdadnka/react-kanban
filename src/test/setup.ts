// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// ═══════════════════════════════════════════
// Radix Tooltip Provider Mock 
// ═══════════════════════════════════════════
vi.mock('@radix-ui/react-tooltip', async () => {
  const actual = await vi.importActual('@radix-ui/react-tooltip');
  return {
    ...actual,
    Provider: ({ children }: any) => children,
    Root: ({ children }: any) => children,
    Trigger: ({ children }: any) => children,
    Portal: ({ children }: any) => children,
    Content: ({ children }: any) => children,
    Arrow: () => null,
  };
});

// Mock TooltipProvider from @radix-ui/themes
vi.mock('@radix-ui/themes', async () => {
  const actual = await vi.importActual('@radix-ui/themes');
  return {
    ...actual,
    Tooltip: ({ children }: any) => children,
  };
});

// ═══════════════════════════════════════════
// Browser API Mocks
// ═══════════════════════════════════════════
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as any;

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class IntersectionObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root: Element | null = null;
  rootMargin = '0px';
  thresholds = [0];
  constructor() {}
}
global.IntersectionObserver = IntersectionObserverMock as any;

window.scrollTo = vi.fn() as any;
Element.prototype.scrollTo = vi.fn();

// ═══════════════════════════════════════════
// Storage Mock
// ═══════════════════════════════════════════
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
};

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// ═══════════════════════════════════════════
// Console Filter
// ═══════════════════════════════════════════
const originalError = console.error;
console.error = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (msg.includes('React does not recognize the')) return;
  if (msg.includes('validateDOMNesting')) return;
  if (msg.includes('inside a test was not wrapped in act')) return;
  if (msg.includes('Tooltip must be used within TooltipProvider')) return;
  originalError(...args);
};

beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
  vi.clearAllMocks();
});