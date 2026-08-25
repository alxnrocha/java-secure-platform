import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentsView } from './DocumentsView';

describe('DocumentsView Component', () => {
  it('renders institutional document catalog cards', () => {
    render(<DocumentsView />);
    expect(screen.getByText('Institutional Documents & Regulatory Reports Center')).toBeInTheDocument();
    expect(screen.getByText(/Official Trial Balance/i)).toBeInTheDocument();
    expect(screen.getByText(/Income Statement/i)).toBeInTheDocument();
    expect(screen.getByText(/Cryptographic Proof of Immutability/i)).toBeInTheDocument();
    expect(screen.getByText(/Basel III Capital Adequacy/i)).toBeInTheDocument();
  });
});
