import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionLedger } from './TransactionLedger';

describe('TransactionLedger Component', () => {
  it('renders Double-Entry Transaction Ledger header and table columns', () => {
    render(<TransactionLedger />);
    expect(screen.getByText('Double-Entry Transaction Ledger')).toBeDefined();
    expect(screen.getByText('TIMESTAMP')).toBeDefined();
    expect(screen.getByText('TRANSACTION REF')).toBeDefined();
    expect(screen.getByText('DEBIT ACCOUNT')).toBeDefined();
    expect(screen.getByText('CREDIT ACCOUNT')).toBeDefined();
    expect(screen.getByText('AMOUNT (EUR)')).toBeDefined();
    expect(screen.getByText('STATUS')).toBeDefined();
  });
});
