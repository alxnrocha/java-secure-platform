import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartOfAccounts } from './ChartOfAccounts';

describe('ChartOfAccounts Component', () => {
  it('renders Chart of Accounts header', () => {
    render(<ChartOfAccounts />);
    expect(screen.getByText('Chart of Accounts')).toBeDefined();
    expect(screen.getByText('ACCOUNT')).toBeDefined();
    expect(screen.getByText('BALANCE (EUR)')).toBeDefined();
  });
});
