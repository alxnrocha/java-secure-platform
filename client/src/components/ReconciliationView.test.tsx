import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReconciliationView } from './ReconciliationView';

describe('ReconciliationView Component', () => {
  it('renders reconciliation header and KPI metrics', () => {
    render(<ReconciliationView />);
    expect(screen.getByText('Autonomous Bank Reconciliation Engine')).toBeInTheDocument();
    expect(screen.getByText('Total Feed Volume')).toBeInTheDocument();
    expect(screen.getByText('Reconciled Balance')).toBeInTheDocument();
    expect(screen.getByText('Pending Settlement')).toBeInTheDocument();
  });

  it('renders filter bar and external bank feed lines', () => {
    render(<ReconciliationView />);
    expect(screen.getByPlaceholderText(/Search bank reference/i)).toBeInTheDocument();
    expect(screen.getByText(/Deutsche Bundesbank/i)).toBeInTheDocument();
  });
});
