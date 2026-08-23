import { mockDatabase } from '../data/mockDatabase';
import { 
  Account, 
  AccountHierarchy, 
  AccountSummary, 
  CreateAccountPayload, 
  CreateTransactionPayload, 
  Transaction, 
  AuditLog, 
  AuditChainVerification, 
  FinancialMetrics, 
  User 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private useLiveBackend = false;

  public setUseLiveBackend(value: boolean) {
    this.useLiveBackend = value;
  }

  public isUsingLiveBackend(): boolean {
    return this.useLiveBackend;
  }

  // --- ACCOUNTS ---

  public async getAccounts(): Promise<Account[]> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback to mock DB
      }
    }
    return mockDatabase.getAccounts();
  }

  public async getAccountHierarchy(): Promise<AccountHierarchy[]> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts/hierarchy`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.getChartHierarchy();
  }

  public async getAccountSummary(): Promise<AccountSummary> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts/summary`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.getAccountSummary();
  }

  public async createAccount(payload: CreateAccountPayload, token?: string): Promise<Account> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/accounts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
        const err = await res.json();
        throw new Error(err.detail || err.message || 'Error creating account');
      } catch (e: any) {
        if (e.message) throw e;
      }
    }
    return mockDatabase.createAccount(payload);
  }

  // --- TRANSACTIONS ---

  public async getTransactions(): Promise<Transaction[]> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/transfers`);
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.getTransactions();
  }

  public async postTransaction(
    payload: CreateTransactionPayload, 
    currentUser: User, 
    token?: string
  ): Promise<Transaction> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/transfers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) return await res.json();
        const err = await res.json();
        throw new Error(err.detail || err.message || 'Error posting transaction');
      } catch (e: any) {
        if (e.message) throw e;
      }
    }
    return mockDatabase.postTransaction(payload, currentUser);
  }

  public async reverseTransaction(
    txId: string, 
    reason: string, 
    currentUser: User, 
    token?: string
  ): Promise<Transaction> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/transfers/${txId}/reverse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason }),
        });
        if (res.ok) return await res.json();
        const err = await res.json();
        throw new Error(err.detail || err.message || 'Error reversing transaction');
      } catch (e: any) {
        if (e.message) throw e;
      }
    }
    return mockDatabase.reverseTransaction(txId, reason, currentUser);
  }

  // --- FORENSIC AUDIT ---

  public async getAuditLogs(token?: string): Promise<AuditLog[]> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/audit`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.getAuditLogs();
  }

  public async verifyAuditChain(token?: string): Promise<AuditChainVerification> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/audit/verify`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.verifyAuditChain();
  }

  public simulateTamper(blockId?: string): boolean {
    return mockDatabase.simulateTamper(blockId);
  }

  public resetDatabase(): void {
    mockDatabase.resetDatabase();
  }

  // --- METRICS ---

  public async getSolvencyMetrics(token?: string): Promise<FinancialMetrics> {
    if (this.useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/metrics/solvency`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (res.ok) return await res.json();
      } catch {
        // Fallback
      }
    }
    return mockDatabase.getSolvencyMetrics();
  }
}

export const apiClient = new ApiClient();
