import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SolvencyDashboard } from './SolvencyDashboard';

describe('SolvencyDashboard Component', () => {
  it('renders Solvency Dashboard header and metric cards', () => {
    render(<SolvencyDashboard />);
    expect(screen.getByText(/Panel Ejecutivo de Solvencia/i)).toBeDefined();
    expect(screen.getByText('Total Asset Liquidity')).toBeDefined();
    expect(screen.getByText('Total Liabilities')).toBeDefined();
  });
});
