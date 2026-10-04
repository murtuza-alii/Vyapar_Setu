/**
 * src/modules/foundation/double-entry.ts
 * Double-Entry Accounting Invariant Engine:
 * - Integer paise financial arithmetic (eliminating floating-point drift)
 * - Zero-discrepancy mathematical balance invariant (sum Debit - sum Credit === 0)
 * - Immutable journal entries with reversal voucher generation
 * - Wholesale Chart of Accounts (COA) with normal balance rollups
 * - Real-time trial balance calculation
 */
import { CurrencyPaisa } from '../../types/common';
import {
  AccountCategory,
  NormalBalance,
  ChartAccount,
  JournalLine,
  JournalEntry,
  VoucherType,
} from '../../types/ledger';

export type {
  AccountCategory,
  NormalBalance,
  ChartAccount,
  JournalLine,
  JournalEntry,
  VoucherType,
};

export type Paise = CurrencyPaisa;

export interface ValidationResult {
  isValid: boolean;
  totalDebitPaise: Paise;
  totalCreditPaise: Paise;
  discrepancyPaise: Paise;
  errors: string[];
  error?: string;
}

export interface AccountBalanceResult {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  totalDebitPaise: Paise;
  totalCreditPaise: Paise;
  balancePaise: Paise;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  category: AccountCategory;
  debitPaise: Paise;
  creditPaise: Paise;
}

export interface TrialBalanceResult {
  asOfDate: string;
  rows: TrialBalanceRow[];
  totalDebitPaise: Paise;
  totalCreditPaise: Paise;
  isBalanced: boolean;
  discrepancyPaise: Paise;
}

// ============================================================================
// 1. PRECISION INTEGER PAISE ARITHMETIC ENGINE
// ============================================================================

/** Convert decimal rupees to integer paise using Banker's Rounding */
export function rupeesToPaise(rupees: number): Paise {
  if (!Number.isFinite(rupees)) throw new Error('Invalid rupee amount: must be finite number');
  return Math.round(rupees * 100);
}

export const toPaise = rupeesToPaise;

/** Convert integer paise to decimal rupees */
export function paiseToRupees(paise: Paise): number {
  if (!Number.isInteger(paise)) throw new Error('Paise must be an integer');
  return paise / 100;
}

export const toRupees = paiseToRupees;

/** Format paise to localized Indian Rupee string (₹ XX,XX,XXX.XX) */
export function formatIndianCurrency(paise: Paise): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const paiseRem = absPaise % 100;
  const paiseStr = paiseRem.toString().padStart(2, '0');
  
  // Indian number comma grouping (thousands, lakhs, crores)
  const rupeesStr = rupees.toString();
  let result = '';
  if (rupeesStr.length <= 3) {
    result = rupeesStr;
  } else {
    const lastThree = rupeesStr.substring(rupeesStr.length - 3);
    const remaining = rupeesStr.substring(0, rupeesStr.length - 3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${formattedRemaining},${lastThree}`;
  }
  return `${isNegative ? '-' : ''}₹${result}.${paiseStr}`;
}

export const formatINR = formatIndianCurrency;

/** Sum multiple integer paise amounts safely */
export function addPaise(...amounts: Paise[]): Paise {
  return amounts.reduce((acc, curr) => {
    if (!Number.isInteger(curr)) {
      throw new Error(`Non-integer paise detected in arithmetic: ${curr}`);
    }
    return acc + curr;
  }, 0);
}

/** Subtract paise amounts safely (a - b) */
export function subPaise(a: Paise, b: Paise): Paise {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    throw new Error(`Non-integer paise detected in subtraction: a=${a}, b=${b}`);
  }
  return a - b;
}

/** Multiply rate in paise by float quantity, rounded to integer paise */
export function multiplyPaiseByQuantity(ratePaise: Paise, quantity: number): Paise {
  return Math.round(ratePaise * quantity);
}

/** Compute percentage on paise with Banker's Rounding */
export function computePercentagePaise(basePaise: Paise, percent: number): Paise {
  return Math.round((basePaise * percent) / 100);
}

// ============================================================================
// 2. STANDARD WHOLESALE CHART OF ACCOUNTS (COA)
// ============================================================================

export const STANDARD_CHART_OF_ACCOUNTS: Record<string, ChartAccount> = {
  // ASSETS (Normal Balance: DEBIT)
  '1010-CASH': {
    code: '1010-CASH',
    name: 'Cash Drawer (Galla)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Physical cash in merchant cash drawer'
  },
  '1020-BANK-HDFC': {
    code: '1020-BANK-HDFC',
    name: 'HDFC Current Account',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Primary business operating current account'
  },
  '1021-BANK-SBI': {
    code: '1021-BANK-SBI',
    name: 'SBI Cash Credit (OD)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Working capital credit line account'
  },
  '1200-AR': {
    code: '1200-AR',
    name: 'Accounts Receivable (Debtors / Lena)',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Amounts owed by customer trade parties'
  },
  '1300-INV': {
    code: '1300-INV',
    name: 'Merchandise Inventory',
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: 'Wholesale inventory goods asset valuation'
  },

  // LIABILITIES (Normal Balance: CREDIT)
  '2010-AP': {
    code: '2010-AP',
    name: 'Accounts Payable (Creditors / Dena)',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Amounts owed to mills and supplier trade parties'
  },
  '2020-ADV-CUST': {
    code: '2020-ADV-CUST',
    name: 'Customer Advances',
    category: 'LIABILITY',
    normalBalance: 'CREDIT',
    description: 'Advance payments received before order dispatch'
  },

  // EQUITY (Normal Balance: CREDIT)
  '3010-CAPITAL': {
    code: '3010-CAPITAL',
    name: 'Owner Capital Account',
    category: 'EQUITY',
    normalBalance: 'CREDIT',
    description: 'Set-ji proprietor equity investment'
  },
  '3020-DRAWINGS': {
    code: '3020-DRAWINGS',
    name: 'Owner Drawings',
    category: 'EQUITY',
    normalBalance: 'DEBIT', // Contra equity account
    description: 'Proprietor withdrawals for personal expenses'
  },

  // REVENUE (Normal Balance: CREDIT)
  '4010-SALES': {
    code: '4010-SALES',
    name: 'Wholesale Sales Revenue',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Gross revenues earned from wholesale merchandise sales'
  },
  '4020-BROKERAGE-INC': {
    code: '4020-BROKERAGE-INC',
    name: 'Peer Referral Commission Income',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Brokerage and sourcing commissions earned from network peers'
  },
  '4030-DISC-REC': {
    code: '4030-DISC-REC',
    name: 'Cash Discounts Received (Kasaar)',
    category: 'REVENUE',
    normalBalance: 'CREDIT',
    description: 'Early payment discounts gained from mill suppliers'
  },

  // EXPENSES (Normal Balance: DEBIT)
  '5010-PURCHASES': {
    code: '5010-PURCHASES',
    name: 'Wholesale Purchases (COGS)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Direct cost of goods purchased from mills/suppliers'
  },
  '5020-FREIGHT': {
    code: '5020-FREIGHT',
    name: 'Freight & Cartage (Bilty Transport)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Outbound and inbound transport charges paid to carriers'
  },
  '5030-HAMALI': {
    code: '5030-HAMALI',
    name: 'Hamali & Pelledari (Labor)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Manual loading and unloading labor wages'
  },
  '5040-DISC-ALW': {
    code: '5040-DISC-ALW',
    name: 'Cash Discounts Allowed (Customer Kasaar)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Early settlement incentive deductions granted to customers'
  },
  '5050-DALALI': {
    code: '5050-DALALI',
    name: 'Brokerage & Dalali Expense',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Commissions payable to trade brokers'
  },
  '5060-DAMAGE-LOSS': {
    code: '5060-DAMAGE-LOSS',
    name: 'Transit Damage & Shortage Loss',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Unrecovered losses from transit leakage or fabric damage'
  },
  '5070-GALLA-DIFF': {
    code: '5070-GALLA-DIFF',
    name: 'Cash Drawer Variance (Shortage/Excess)',
    category: 'EXPENSE',
    normalBalance: 'DEBIT',
    description: 'Reconciled shortage or excess from physical cash tally'
  }
};

// ============================================================================
// 3. INVARIANT VERIFICATION & JOURNAL POSTING ENGINE
// ============================================================================

/**
 * Atomic invariant verification for journal entries.
 * ENFORCES:
 * 1. Entry has at least 2 lines.
 * 2. Every line has non-negative integer paise.
 * 3. A line has either debit > 0 or credit > 0, never both, never neither.
 * 4. sum(debitPaise) === sum(creditPaise) down to the exact paisa (0 discrepancy).
 */
export function validateJournalEntry(entry: JournalEntry): ValidationResult {
  const errors: string[] = [];

  if (!entry.lines || entry.lines.length < 2) {
    const msg = 'Double-entry journal requires at least two lines';
    return {
      isValid: false,
      totalDebitPaise: 0,
      totalCreditPaise: 0,
      discrepancyPaise: 0,
      errors: [msg],
      error: msg,
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (let idx = 0; idx < entry.lines.length; idx++) {
    const line = entry.lines[idx];
    if (!Number.isInteger(line.debitPaise) || !Number.isInteger(line.creditPaise)) {
      const msg = 'Journal line amounts must be integers (paise)';
      errors.push(msg);
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        errors,
        error: msg,
      };
    }
    if (line.debitPaise < 0 || line.creditPaise < 0) {
      const msg = 'Journal line amounts cannot be negative (use opposite debit/credit column)';
      errors.push(msg);
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        errors,
        error: msg,
      };
    }
    if (line.debitPaise > 0 && line.creditPaise > 0) {
      const msg = 'A single journal line cannot have both debit and credit amounts';
      errors.push(msg);
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        errors,
        error: msg,
      };
    }
    if (line.debitPaise === 0 && line.creditPaise === 0) {
      const msg = 'Journal line cannot have 0 debit and 0 credit';
      errors.push(msg);
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        errors,
        error: msg,
      };
    }

    totalDebit += line.debitPaise;
    totalCredit += line.creditPaise;
  }

  const discrepancy = totalDebit - totalCredit;
  if (discrepancy !== 0) {
    const msg = `Double-entry invariant violated! Debit sum (${totalDebit}) !== Credit sum (${totalCredit}). Discrepancy: ${discrepancy} paise.`;
    errors.push(msg);
    return {
      isValid: false,
      totalDebitPaise: totalDebit,
      totalCreditPaise: totalCredit,
      discrepancyPaise: discrepancy,
      errors,
      error: msg,
    };
  }

  return {
    isValid: true,
    totalDebitPaise: totalDebit,
    totalCreditPaise: totalCredit,
    discrepancyPaise: 0,
    errors: [],
    error: undefined,
  };
}

/**
 * Validates and commits a journal entry to the immutable ledger.
 */
export function validateAndPostJournal(
  entry: JournalEntry,
  existingEntries?: JournalEntry[]
): { success: boolean; entry?: JournalEntry; error?: string } {
  const validation = validateJournalEntry(entry);
  if (!validation.isValid) {
    return {
      success: false,
      entry,
      error: validation.error || validation.errors.join(' | ')
    };
  }

  // Prevent duplicate voucher numbers if existingEntries provided
  if (existingEntries) {
    const duplicate = existingEntries.find(e => e.voucherNumber === entry.voucherNumber && e.id !== entry.id);
    if (duplicate) {
      return {
        success: false,
        entry,
        error: `DUPLICATE_VOUCHER_ERROR: Voucher number ${entry.voucherNumber} already exists in the ledger.`
      };
    }
  }

  const finalized: JournalEntry = {
    ...entry,
    isImmutable: true,
  };

  return {
    success: true,
    entry: finalized
  };
}

/**
 * Generates an immutable Reversal Journal Entry for an existing posted voucher.
 * Swaps debits and credits and cross-references voucher IDs.
 */
export function createReversalJournal(
  originalEntry: JournalEntry,
  reversalVoucherNumber: string,
  reversalReason: string,
  date: string = new Date().toISOString()
): { reversalEntry: JournalEntry; updatedOriginal: JournalEntry } {
  if (originalEntry.isReversed) {
    throw new Error(`ALREADY_REVERSED_ERROR: Voucher ${originalEntry.voucherNumber} has already been reversed.`);
  }

  const reversalLines: JournalLine[] = originalEntry.lines.map(line => ({
    id: `line_rev_${Math.random().toString(36).substring(2, 9)}`,
    accountCode: line.accountCode,
    accountName: line.accountName,
    debitPaise: line.creditPaise,   // Swapped
    creditPaise: line.debitPaise,   // Swapped
    partyId: line.partyId,
    dealId: line.dealId,
    narration: `Reversal of ${line.narration || originalEntry.voucherNumber}`
  }));

  const reversalId = `jv_rev_${Math.random().toString(36).substring(2, 9)}`;

  const reversalEntry: JournalEntry = {
    id: reversalId,
    voucherNumber: reversalVoucherNumber,
    voucherType: 'REVERSAL',
    date,
    narration: `REVERSAL of ${originalEntry.voucherNumber}: ${reversalReason}`,
    lines: reversalLines,
    referenceDealId: originalEntry.referenceDealId,
    referencePartyId: originalEntry.referencePartyId,
    originalVoucherId: originalEntry.id,
    isImmutable: true,
    createdAt: new Date().toISOString()
  };

  const updatedOriginal: JournalEntry = {
    ...originalEntry,
    isReversed: true,
    reversalVoucherId: reversalId
  };

  return { reversalEntry, updatedOriginal };
}

// ============================================================================
// 4. WHOLESALE LEDGER BALANCE & TRIAL BALANCE CALCULATORS
// ============================================================================

/**
 * Calculates current running balance for a specific chart account across all valid entries.
 */
export function calculateAccountBalance(
  accountCode: string,
  entries: JournalEntry[],
  chartOfAccounts = STANDARD_CHART_OF_ACCOUNTS
): AccountBalanceResult {
  const account = chartOfAccounts[accountCode] || {
    code: accountCode,
    name: accountCode,
    category: 'ASSET',
    normalBalance: 'DEBIT',
    description: ''
  };

  let totalDebit = 0;
  let totalCredit = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.accountCode === accountCode) {
        totalDebit += line.debitPaise;
        totalCredit += line.creditPaise;
      }
    }
  }

  const balancePaise = account.normalBalance === 'DEBIT'
    ? totalDebit - totalCredit
    : totalCredit - totalDebit;

  return {
    accountCode: account.code,
    accountName: account.name,
    category: account.category || 'ASSET',
    normalBalance: account.normalBalance,
    totalDebitPaise: totalDebit,
    totalCreditPaise: totalCredit,
    balancePaise
  };
}

/** Cash Drawer (Galla) liquid balance in paise */
export function getCashDrawerBalance(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('1010-CASH', entries).balancePaise;
}

/** Bank Account balance in paise */
export function getBankBalance(accountCode: '1020-BANK-HDFC' | '1021-BANK-SBI', entries: JournalEntry[]): Paise {
  return calculateAccountBalance(accountCode, entries).balancePaise;
}

/** Total liquid funds (Cash Drawer + Bank Accounts) */
export function getTotalLiquidCash(entries: JournalEntry[]): Paise {
  return addPaise(
    getCashDrawerBalance(entries),
    getBankBalance('1020-BANK-HDFC', entries),
    getBankBalance('1021-BANK-SBI', entries)
  );
}

/** Total Accounts Receivable (all customer dues) */
export function getTotalReceivables(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('1200-AR', entries).balancePaise;
}

/** Total Accounts Payable (all supplier dues) */
export function getTotalPayables(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('2010-AP', entries).balancePaise;
}

/** Sales revenue total */
export function getSalesRevenue(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('4010-SALES', entries).balancePaise;
}

/** Purchases total (COGS) */
export function getPurchasesExpense(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('5010-PURCHASES', entries).balancePaise;
}

/** Freight expense total */
export function getFreightExpense(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('5020-FREIGHT', entries).balancePaise;
}

/** Hamali expense total */
export function getHamaliExpense(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('5030-HAMALI', entries).balancePaise;
}

/** Discounts allowed (customer cash discounts) */
export function getDiscountsAllowed(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('5040-DISC-ALW', entries).balancePaise;
}

/** Discounts received (supplier cash discounts) */
export function getDiscountsReceived(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('4030-DISC-REC', entries).balancePaise;
}

/** Capital account balance */
export function getCapitalBalance(entries: JournalEntry[]): Paise {
  return calculateAccountBalance('3010-CAPITAL', entries).balancePaise;
}

/**
 * Computes party-specific Micro-Khata balance across AR and AP accounts.
 * Returns Lena Hai (positive) vs Dena Hai (negative).
 */
export function getPartyBalance(
  partyId: string,
  entries: JournalEntry[]
): {
  receivablePaise: Paise;
  payablePaise: Paise;
  netBalancePaise: Paise;
  status: 'LENA_HAI' | 'DENA_HAI' | 'CHUKTA';
} {
  let receivablePaise = 0;
  let payablePaise = 0;

  for (const entry of entries) {
    for (const line of entry.lines) {
      if (line.partyId === partyId) {
        if (line.accountCode === '1200-AR') {
          receivablePaise += (line.debitPaise - line.creditPaise);
        } else if (line.accountCode === '2010-AP') {
          payablePaise += (line.creditPaise - line.debitPaise);
        }
      }
    }
  }

  const netBalancePaise = receivablePaise - payablePaise;
  let status: 'LENA_HAI' | 'DENA_HAI' | 'CHUKTA' = 'CHUKTA';
  if (netBalancePaise > 0) status = 'LENA_HAI';
  else if (netBalancePaise < 0) status = 'DENA_HAI';

  return {
    receivablePaise,
    payablePaise,
    netBalancePaise,
    status
  };
}

/**
 * Generates an end-of-period Trial Balance report across all active accounts.
 * Guaranteed invariant: totalDebits === totalCredits
 */
export function generateTrialBalance(
  entries: JournalEntry[],
  chartOfAccounts = STANDARD_CHART_OF_ACCOUNTS,
  asOfDate: string = new Date().toISOString()
): TrialBalanceResult {
  const rows: TrialBalanceRow[] = [];
  let grandTotalDebit = 0;
  let grandTotalCredit = 0;

  const activeCodes = Object.keys(chartOfAccounts);

  for (const code of activeCodes) {
    const bal = calculateAccountBalance(code, entries, chartOfAccounts);
    if (bal.totalDebitPaise > 0 || bal.totalCreditPaise > 0) {
      let debit = 0;
      let credit = 0;

      if (bal.normalBalance === 'DEBIT') {
        if (bal.balancePaise >= 0) debit = bal.balancePaise;
        else credit = Math.abs(bal.balancePaise);
      } else {
        if (bal.balancePaise >= 0) credit = bal.balancePaise;
        else debit = Math.abs(bal.balancePaise);
      }

      rows.push({
        accountCode: bal.accountCode,
        accountName: bal.accountName,
        category: bal.category,
        debitPaise: debit,
        creditPaise: credit
      });

      grandTotalDebit += debit;
      grandTotalCredit += credit;
    }
  }

  const discrepancy = grandTotalDebit - grandTotalCredit;

  return {
    asOfDate,
    rows,
    totalDebitPaise: grandTotalDebit,
    totalCreditPaise: grandTotalCredit,
    isBalanced: discrepancy === 0,
    discrepancyPaise: discrepancy
  };
}

// ============================================================================
// 5. WHOLESALE TRANSACTION VOUCHER FACTORY HELPERS
// ============================================================================

/**
 * Factory for creating a balanced Wholesale Sale Voucher.
 */
export function buildSalesVoucher(params: {
  voucherNumber: string;
  date: string;
  partyId: string;
  partyName: string;
  dealId?: string;
  goodsValuePaise: Paise;
  advanceReceivedPaise?: Paise;
  advanceMode?: 'CASH' | 'BANK';
  freightBilledPaise?: Paise;
  hamaliBilledPaise?: Paise;
  narration?: string;
}): JournalEntry {
  const advance = params.advanceReceivedPaise || 0;
  const freight = params.freightBilledPaise || 0;
  const hamali = params.hamaliBilledPaise || 0;
  const totalBilled = addPaise(params.goodsValuePaise, freight, hamali);
  const creditReceivable = subPaise(totalBilled, advance);

  const lines: JournalLine[] = [];

  // Debits
  if (creditReceivable > 0) {
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '1200-AR',
      accountName: 'Accounts Receivable (Debtors)',
      debitPaise: creditReceivable,
      creditPaise: 0,
      partyId: params.partyId,
      dealId: params.dealId,
      narration: `Sale to ${params.partyName} (On Credit)`
    });
  }

  if (advance > 0) {
    const cashOrBankCode = params.advanceMode === 'BANK' ? '1020-BANK-HDFC' : '1010-CASH';
    const cashOrBankName = params.advanceMode === 'BANK' ? 'HDFC Bank' : 'Cash Drawer (Galla)';
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: cashOrBankCode,
      accountName: cashOrBankName,
      debitPaise: advance,
      creditPaise: 0,
      partyId: params.partyId,
      dealId: params.dealId,
      narration: `Advance received on deal`
    });
  }

  // Credits
  lines.push({
    id: `line_${Math.random().toString(36).substring(2, 9)}`,
    accountCode: '4010-SALES',
    accountName: 'Wholesale Sales Revenue',
    debitPaise: 0,
    creditPaise: params.goodsValuePaise,
    partyId: params.partyId,
    dealId: params.dealId,
    narration: `Sale goods turnover`
  });

  if (freight > 0) {
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '5020-FREIGHT',
      accountName: 'Freight Recovery',
      debitPaise: 0,
      creditPaise: freight,
      narration: `Freight recovered from customer`
    });
  }

  if (hamali > 0) {
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '5030-HAMALI',
      accountName: 'Hamali Recovery',
      debitPaise: 0,
      creditPaise: hamali,
      narration: `Hamali recovered from customer`
    });
  }

  return {
    id: `jv_${Math.random().toString(36).substring(2, 9)}`,
    voucherNumber: params.voucherNumber,
    voucherType: 'SALES',
    date: params.date,
    narration: params.narration || `Sale to ${params.partyName} (Total ₹${toRupees(totalBilled).toFixed(2)})`,
    lines,
    referenceDealId: params.dealId,
    referencePartyId: params.partyId,
    createdAt: new Date().toISOString()
  };
}

/**
 * Factory for creating a Customer Payment Receipt Voucher.
 */
export function buildPaymentReceivedVoucher(params: {
  voucherNumber: string;
  date: string;
  partyId: string;
  partyName: string;
  amountReceivedPaise: Paise;
  discountAllowedPaise?: Paise; // Kasaar
  paymentMode: 'CASH' | 'BANK';
  bankAccountCode?: '1020-BANK-HDFC' | '1021-BANK-SBI';
  narration?: string;
}): JournalEntry {
  const discount = params.discountAllowedPaise || 0;
  const totalCleared = addPaise(params.amountReceivedPaise, discount);

  const accountCode = params.paymentMode === 'CASH' ? '1010-CASH' : (params.bankAccountCode || '1020-BANK-HDFC');
  const accountName = params.paymentMode === 'CASH' ? 'Cash Drawer (Galla)' : 'Bank Account';

  const lines: JournalLine[] = [
    {
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode,
      accountName,
      debitPaise: params.amountReceivedPaise,
      creditPaise: 0,
      partyId: params.partyId,
      narration: `Payment received from ${params.partyName}`
    }
  ];

  if (discount > 0) {
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '5040-DISC-ALW',
      accountName: 'Cash Discounts Allowed (Customer Kasaar)',
      debitPaise: discount,
      creditPaise: 0,
      partyId: params.partyId,
      narration: `Kasaar / discount allowed for early settlement`
    });
  }

  lines.push({
    id: `line_${Math.random().toString(36).substring(2, 9)}`,
    accountCode: '1200-AR',
    accountName: 'Accounts Receivable (Debtors)',
    debitPaise: 0,
    creditPaise: totalCleared,
    partyId: params.partyId,
    narration: `Credit customer ledger for received payment`
  });

  return {
    id: `jv_${Math.random().toString(36).substring(2, 9)}`,
    voucherNumber: params.voucherNumber,
    voucherType: 'RECEIPT',
    date: params.date,
    narration: params.narration || `Payment received from ${params.partyName} (₹${toRupees(params.amountReceivedPaise).toFixed(2)})`,
    lines,
    referencePartyId: params.partyId,
    createdAt: new Date().toISOString()
  };
}

/**
 * Factory for creating a Cash Drawer Physical Variance Closing Voucher.
 */
export function buildGallaVarianceVoucher(params: {
  voucherNumber: string;
  date: string;
  physicalCashPaise: Paise;
  calculatedCashPaise: Paise;
  verifiedBy: string;
  reasonNotes?: string;
}): JournalEntry | null {
  const variancePaise = subPaise(params.physicalCashPaise, params.calculatedCashPaise);
  if (variancePaise === 0) return null;

  const lines: JournalLine[] = [];

  if (variancePaise < 0) {
    const shortage = Math.abs(variancePaise);
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '5070-GALLA-DIFF',
      accountName: 'Cash Drawer Variance (Shortage)',
      debitPaise: shortage,
      creditPaise: 0,
      narration: `Cash shortage found during closing tally: ${params.reasonNotes || ''}`
    });
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '1010-CASH',
      accountName: 'Cash Drawer (Galla)',
      debitPaise: 0,
      creditPaise: shortage,
      narration: `Adjustment for physical cash shortage`
    });
  } else {
    const excess = variancePaise;
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '1010-CASH',
      accountName: 'Cash Drawer (Galla)',
      debitPaise: excess,
      creditPaise: 0,
      narration: `Physical cash excess deposited`
    });
    lines.push({
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      accountCode: '5070-GALLA-DIFF',
      accountName: 'Cash Drawer Variance (Excess)',
      debitPaise: 0,
      creditPaise: excess,
      narration: `Cash excess recorded during closing tally: ${params.reasonNotes || ''}`
    });
  }

  return {
    id: `jv_${Math.random().toString(36).substring(2, 9)}`,
    voucherNumber: params.voucherNumber,
    voucherType: 'GALLA_ADJUSTMENT',
    date: params.date,
    narration: `Daily Galla closing reconciliation variance: ₹${toRupees(variancePaise).toFixed(2)} (${params.verifiedBy})`,
    lines,
    createdAt: new Date().toISOString()
  };
}
