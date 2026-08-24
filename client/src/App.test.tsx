import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App.tsx';

describe('VaultLedger Core Client App', () => {
  it('renders brand title and security status badges', () => {
    render(<App />);
    expect(screen.getByText('VaultLedger')).toBeInTheDocument();
    expect(screen.getByText(/System Encrypted • RSA-256/i)).toBeInTheDocument();
    expect(screen.getByText('Total Asset Liquidity')).toBeInTheDocument();
    expect(screen.getByText('Total Liabilities')).toBeInTheDocument();
  });

  it('renders navigation sidebar items correctly', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
    expect(screen.getByText('Reports & Solvency')).toBeInTheDocument();
  });
});
