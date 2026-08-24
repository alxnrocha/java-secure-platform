import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditTrail } from './AuditTrail';

describe('AuditTrail Component', () => {
  it('renders Immutable Audit Log header and verification controls', () => {
    render(<AuditTrail />);
    expect(screen.getByText('Immutable Audit Log')).toBeDefined();
    expect(screen.getByText('Total Events')).toBeDefined();
    expect(screen.getByText('Integrity Status')).toBeDefined();
    expect(screen.getByText('Verify Chain')).toBeDefined();
  });
});
