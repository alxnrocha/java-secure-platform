import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.tsx';

describe('VaultLedger Core Client App', () => {
  it('renders brand title and security status badges', () => {
    render(<App />);
    expect(screen.getByText('VaultLedger')).toBeInTheDocument();
    expect(screen.getByText(/Core Engine v1.0/i)).toBeInTheDocument();
    expect(screen.getByText(/RSA-256 Auth/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PostgreSQL 17/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Ledger Invariant ΣD = ΣC/i)).toBeInTheDocument();
  });

  it('renders navigation tabs correctly', () => {
    render(<App />);
    expect(screen.getByText('Visión General')).toBeInTheDocument();
    expect(screen.getByText('Libro Mayor (Double-Entry)')).toBeInTheDocument();
    expect(screen.getByText('Pista de Auditoría SHA-256')).toBeInTheDocument();
    expect(screen.getByText('Análisis de Solvencia')).toBeInTheDocument();
  });
});
