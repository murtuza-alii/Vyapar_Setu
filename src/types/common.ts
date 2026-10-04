/**
 * src/types/common.ts
 * Fundamental platform primitives, RBAC roles, Party entities, and currency representation.
 */

/**
 * Currency represented strictly as an integer in Indian Paise.
 * 1 INR = 100 paise (e.g., ₹1,250.50 is stored as 125050).
 * Eliminates IEEE 754 floating-point drift in double-entry accounting.
 */
export type CurrencyPaisa = number;

/**
 * Unique identifier representation (UUID v4 or deterministic entity ID).
 */
export type UUID = string;

/**
 * 4 Core Roles in Vyapar Setu wholesale hierarchy.
 * - MUKHIYA: Firm Owner / Set-ji (Unrestricted access, overrides, margins, capital)
 * - MUNIM: Chief Accountant / Order Desk (Ledgers, vouchers, billing, reminders)
 * - GODOWN: Warehouse & Dispatch Manager (Picking, packing, bilty, weighbridge; NO MARGINS/PRICES)
 * - PARTNER: External Retailer / Mill / Transporter (Scoped portal tracking, own khata only)
 */
export type UserRole = 'MUKHIYA' | 'MUNIM' | 'GODOWN' | 'PARTNER';

/**
 * Active industry operational mode.
 */
export type IndustryMode = 'TEXTILE' | 'BUILDING_MATERIALS';

/**
 * Counterparty commercial role.
 * Wholesalers frequently buy from and sell to the same counterparty (reciprocal trading).
 */
export type PartyRole = 'CUSTOMER' | 'SUPPLIER' | 'BOTH' | 'TRANSPORTER';

/**
 * Standard Indian Postal Address and Mandi location details.
 */
export interface PostalAddress {
  addressLine1: string;
  addressLine2?: string;
  mandiArea?: string; // e.g. "Johari Bazaar", "Madanganj", "Millennium Market"
  city: string;       // e.g. "Jaipur", "Surat", "Bhilwara", "Kishangarh", "Udaipur"
  state: string;      // e.g. "Rajasthan", "Gujarat"
  pincode: string;
}

/**
 * Bank Account specifications for RTGS/NEFT settlement and reconciliation.
 */
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  accountType: 'CURRENT' | 'SAVINGS' | 'CASH_CREDIT_OD';
}

/**
 * Party Entity (Customer, Supplier, Reciprocal Both, or Transporter).
 */
export interface Party {
  id: UUID;
  businessName: string;
  contactPerson: string;
  phone: string; // Normalized E.164 format (+91...)
  email?: string;
  gstin?: string; // 15-character Indian GSTIN
  pan?: string;   // 10-character PAN
  address: PostalAddress;
  role: PartyRole;
  tradeModePreference: IndustryMode;
  
  // Credit & Exposure Controls
  creditLimitPaisa: CurrencyPaisa;
  creditPeriodDays: number; // e.g. 15, 30, 45 days
  
  // Unified Reciprocal Khata Balances
  // Positive = Net Lena Hai (Receivable), Negative = Net Dena Hai (Payable)
  currentBalancePaisa: CurrencyPaisa;
  totalReceivablePaisa: CurrencyPaisa; // Maal Diya
  totalPayablePaisa: CurrencyPaisa;    // Maal Liya
  
  // Payment Integrations
  upiVpa?: string; // e.g. "sharmacloth@okicici"
  bankDetails?: BankDetails;
  
  // Metadata & Audit
  isActive: boolean;
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  syncStatus: 'LOCAL_PENDING' | 'SYNCED' | 'CONFLICT';
}

/**
 * Audit Metadata appended to mutating business entities.
 */
export interface AuditMetadata {
  createdByUserId: UUID;
  createdByUserRole: UserRole;
  createdAt: string;
  updatedByUserId?: UUID;
  updatedAt?: string;
  version: number; // For optimistic concurrency locking
}

/**
 * Aging Bracket Keys for Udhari Radar.
 */
export type AgingBracketKey = 'BRACKET_0_15' | 'BRACKET_15_30' | 'BRACKET_30_PLUS';

/**
 * Standard Operation Result Envelope.
 */
export interface OperationResult<T = void> {
  success: boolean;
  data?: T;
  errorCode?: string;
  errorMessage?: string;
}
