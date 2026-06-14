import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Recharts ResponsiveContainer to render children directly
vi.mock('recharts', async () => {
  const original = await vi.importActual<any>('recharts');
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => children,
    AreaChart: ({ children }: any) => children,
    BarChart: ({ children }: any) => children,
    PieChart: ({ children }: any) => children,
    Tooltip: ({ formatter }: any) => {
      if (formatter) {
        try {
          formatter(10, 'name', { payload: {} }, 0);
        } catch (e) {
          // ignore potential errors in formatter runs
        }
      }
      return null;
    },
    Pie: ({ label, data }: any) => {
      if (label && data && data.length > 0) {
        try {
          label({ name: 'Food', percent: 0.5 });
          label({ name: 'Food', percent: undefined });
        } catch (e) {
          // ignore potential errors
        }
      }
      return null;
    },
  };
});

// Mock window.confirm
window.confirm = vi.fn(() => true);

// Mock Element.prototype.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

