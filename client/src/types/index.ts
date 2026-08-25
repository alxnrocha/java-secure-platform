export type RoleType = 
  | 'ROLE_ADMIN' 
  | 'ROLE_OPERATOR' 
  | 'ROLE_AUDITOR' 
  | 'ROLE_COMPLIANCE_OFFICER';

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export type EntryType = 'DEBIT' | 'CREDIT';

export type TransactionStatus = 'PENDING' | 'POSTED' | 'REVERSED' | 'REJECTED' | 'AUDITED';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleType;
  active: boolean;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  active: boolean;
  parentAccountId?: string | null;
  normalBalance: 'DEBIT' | 'CREDIT';
  createdAt: string;
}

export interface AccountHierarchy extends Account {
  subAccounts: AccountHierarchy[];
}

export interface AccountSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  breakdownByType: Record<string, number>;
  totalAccountsCount: number;
}

export interface CreateAccountPayload {
  code: string;
  name: string;
  type: AccountType;
  currency?: string;
  parentAccountId?: string;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  accountCode: string;
  accountName: string;
  entryType: EntryType;
  amount: number;
  runningBalance: number;
  description?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  referenceNumber: string;
  description: string;
  status: TransactionStatus;
  totalAmount: number;
  currency: string;
  reversalOfId?: string | null;
  createdByUser?: User;
  postedAt: string;
  entries: LedgerEntry[];
}

export interface CreateLedgerEntryItem {
  accountCode: string;
  entryType: EntryType;
  amount: number;
  description?: string;
}

export interface CreateTransactionPayload {
  description: string;
  currency?: string;
  entries: CreateLedgerEntryItem[];
}

export interface ReversalPayload {
  reason: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityName: string;
  entityId: string;
  userId?: string;
  userEmail: string;
  ipAddress?: string;
  payloadBefore?: string | null;
  payloadAfter: string;
  previousHash: string;
  currentHash: string;
  createdAt: string;
}

export interface AuditChainVerification {
  valid: boolean;
  totalLogsChecked: number;
  lastValidHash: string;
  brokenLogId?: string | null;
  brokenIndex?: number | null;
  message: string;
  verifiedAt: string;
}

export interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  solvencyRatio: number;
  equityToAssetRatio: number;
  debtToEquityRatio: number;
  balanceSheetBalanced: boolean;
  calculatedAt: string;
}

export type ReconciliationMatchStatus = 'MATCHED' | 'PENDING' | 'VARIANCE';

export interface BankStatementFeed {
  id: string;
  bankReference: string;
  externalNetwork: 'SWIFT_GPI' | 'SEPA_INSTANT' | 'TARGET2' | 'FEDNOW';
  counterpartyName: string;
  counterpartyIban: string;
  amount: number;
  direction: 'INBOUND' | 'OUTBOUND';
  currency: string;
  valueDate: string;
  matchStatus: ReconciliationMatchStatus;
  confidenceScore: number;
  matchedTransactionId?: string | null;
  matchedTransactionRef?: string | null;
  varianceAmount?: number;
  reconciledAt?: string | null;
}

export interface ReconciliationSummary {
  totalFeedsCount: number;
  totalVolume: number;
  matchedCount: number;
  matchedVolume: number;
  pendingCount: number;
  pendingVolume: number;
  matchRatePercentage: number;
}

export type FinancialReportType = 
  | 'TRIAL_BALANCE' 
  | 'INCOME_STATEMENT' 
  | 'AUDIT_CERTIFICATE' 
  | 'BASEL3_DOSSIER';

export interface FinancialReportMetadata {
  id: string;
  type: FinancialReportType;
  title: string;
  description: string;
  generatedAt: string;
  period: string;
  currency: string;
  format: 'PDF' | 'CSV' | 'JSON';
  sha256VerificationHash: string;
  data: any;
}

