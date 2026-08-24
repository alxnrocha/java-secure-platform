import '@testing-library/jest-dom';

// Global ResizeObserver mock for Recharts ResponsiveContainer
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
