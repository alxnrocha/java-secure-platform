import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransferModal } from './TransferModal';

describe('TransferModal Component', () => {
  it('renders Transfer modal when open', () => {
    render(<TransferModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText(/New Atomic Ledger Transaction/i)).toBeDefined();
    expect(screen.getByText('Source Account (DEBIT)')).toBeDefined();
    expect(screen.getByText('Destination Account (CREDIT)')).toBeDefined();
    expect(screen.getByText(/Double-Entry Accounting Preview/i)).toBeDefined();
    expect(screen.getByText(/Ledger Balanced: Δ = €0.00/i)).toBeDefined();
  });
});
