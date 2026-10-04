/**
 * src/types/ledger.ts
 * Double-Entry Accounting Structures, Chart of Accounts, Journal Entries, Micro-Khata & Cash Tallies.
 */
import { CurrencyPaisa, UUID, AuditMetadata, AgingBracketKey } from './common';

/**
 * 5 Standard Accounting Account Classifications.
 */
export type AccountType = 
  | 'ASSET' 
  | 'LIABILITY' 
  | 'EQUITY' 
  | 'REVENUE' 
  | 'EXPENSE';

export type AccountCategory = AccountType;
export type NormalBalance = 'DEBIT' | 'CREDIT';

/**
 * Wholesale Chart of Account Entity.
 */
export interface ChartOfAccount {
  id?: UUID;
  code: string;               // e.g. "1010-CASH", "1200-AR", "4010-SALES"
  name: string;               // Account display name
  type?: AccountType;
  category?: AccountCategory;
  normalBalance: NormalBalance;
  currentBalancePaisa?: CurrencyPaisa;
  isSystemStandard?: boolean;  // Locked against deletion
  isActive?: boolean;
  parentAccountId?: UUID;
  description?: string;
}

export type ChartAccount = ChartOfAccount;

/**
 * Individual Debit/Credit Line Item inside a Journal Voucher.
 */
export interface JournalLineItem {
  id: UUID;
  accountId?: UUID;
  accountCode: string;
  accountName: string;
  debitPaise: CurrencyPaisa;  // Must be >= 0 integer paise
  creditPaise: CurrencyPaisa; // Must be >= 0 integer paise
  narration?: string;
  partyId?: UUID;             // Linked party for AR/AP sub-ledger
  dealId?: UUID;              // Linked wholesale deal card
}

export type JournalLine = JournalLineItem;

/**
 * Voucher Types in Wholesale Accounting.
 */
export type VoucherType = 
  | 'SALES_INVOICE'
  | 'PURCHASE_BILL'
  | 'PAYMENT_VOUCHER'
  | 'RECEIPT_VOUCHER'
  | 'CONTRA_VOUCHER'
  | 'JOURNAL_ADJUSTMENT'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'SALES'
  | 'PURCHASE'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'CONTRA'
  | 'JOURNAL'
  | 'REVERSAL'
  | 'GALLA_ADJUSTMENT';

/**
 * Atomic Journal Voucher Transaction.
 * INVARIANT: sum(lines.debitPaise) === sum(lines.creditPaise).
 * Entries are immutable; corrections require a reversal voucher.
 */
export interface JournalEntry {
  id: UUID;
  voucherNumber: string;      // e.g. "JV-2026-10-0042"
  voucherType?: VoucherType;
  date: string;               // ISO 8601 transaction date
  narration: string;
  
  lines: JournalLineItem[];
  totalDebitPaise?: CurrencyPaisa;
  totalCreditPaise?: CurrencyPaisa;
  
  referenceDealId?: UUID;
  referencePartyId?: UUID;
  
  // Immutability & Reversal Controls
  isReversed?: boolean;
  isImmutable?: boolean;
  reversalEntryId?: UUID;
  reversalVoucherId?: UUID;
  originalVoucherId?: UUID;
  reversedByVoucherNumber?: string;
  reversalReason?: string;
  
  createdAt?: string;
  createdBy?: string;
  audit?: AuditMetadata;
  syncStatus?: 'LOCAL_PENDING' | 'SYNCED' | 'CONFLICT';
}

/**
 * Unified Micro-Khata Statement Row for Customer/Supplier Ledger.
 */
export interface MicroKhataStatementRow {
  id: UUID;
  date: string;
  voucherNumber: string;
  voucherType: VoucherType;
  description: string;
  debitPaisa: CurrencyPaisa;  // Maal Diya (Goods Sold) / Payment Made
  creditPaisa: CurrencyPaisa; // Maal Liya (Goods Bought) / Payment Received
  runningBalancePaisa: CurrencyPaisa; // >0: Lena Hai, <0: Dena Hai
  dealId?: UUID;
}

/**
 * Udhari Radar Aging Bracket Breakdown.
 */
export interface UdhariAgingBracket {
  bracketKey: AgingBracketKey;
  label: string;              // "0-15 Days (Current)", "15-30 Days (Due)", "30+ Days (Critical)"
  minDays: number;
  maxDays?: number;
  totalReceivablePaisa: CurrencyPaisa;
  partyCount: number;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH';
  parties: {
    partyId: UUID;
    partyName: string;
    phone: string;
    city: string;
    amountDuePaisa: CurrencyPaisa;
    oldestInvoiceDate: string;
    agingDays: number;
    creditLimitPaisa: CurrencyPaisa;
  }[];
}

/**
 * Payables Forecast Commitment Item.
 */
export interface PayablesForecastItem {
  id: UUID;
  payableType: 'SUPPLIER_INVOICE' | 'CHITI_COMMITMENT' | 'LOAN_EMI' | 'FREIGHT_PAYOUT';
  payeeName: string;
  payeePartyId?: UUID;
  dueDate: string;
  amountPaisa: CurrencyPaisa;
  isRecurring: boolean;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  notes?: string;
}

/**
 * Physical Cash Drawer (Galla) Denomination Tally.
 */
export interface GallaDenominationTally {
  id: UUID;
  date: string; // ISO Date YYYY-MM-DD
  openingBalancePaisa: CurrencyPaisa;
  cashInflowsPaisa: CurrencyPaisa;
  cashOutflowsPaisa: CurrencyPaisa;
  calculatedSystemBalancePaisa: CurrencyPaisa;
  
  // Indian Rupee Currency Note Counts
  physicalCounts: {
    notes500: number; // ₹500
    notes200: number; // ₹200
    notes100: number; // ₹100
    notes50: number;  // ₹50
    notes20: number;  // ₹20
    notes10: number;  // ₹10
    coinsPaisa: CurrencyPaisa; // Loose coins
  };
  
  totalPhysicalCashPaisa: CurrencyPaisa;
  variancePaisa: CurrencyPaisa; // Physical - Calculated (<0: Shortage, >0: Excess)
  closingStatus: 'MATCHED' | 'SHORTAGE' | 'EXCESS';
  closingNotes?: string;
  
  verifiedByUserId: UUID;
  audit?: AuditMetadata;
}
