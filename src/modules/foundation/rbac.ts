/**
 * src/modules/foundation/rbac.ts
 * Multi-Tier Role-Based Access Control (RBAC) & Financial Redaction Engine:
 * - 4 Discrete Roles: MUKHIYA (Owner), MUNIM (Accountant), GODOWN (Warehouse), PARTNER (External)
 * - Permission predicate matrix
 * - Structural field-level sanitizers stripping costs, selling rates, and margins for warehouse staff
 */
import { UserRole, Party } from '../../types/common';
import { DealCard, PickingSlip } from '../../types/order-tower';

/**
 * Granular Permission Keys across Vyapar Setu.
 */
export type PermissionKey =
  // Financial & Margins
  | 'VIEW_FINANCIAL_MARGINS'
  | 'VIEW_PURCHASE_COSTS'
  | 'VIEW_SELLING_RATES'
  | 'APPROVE_LOSS_MAKING_DEAL'
  | 'APPROVE_CREDIT_OVERRIDE'
  
  // Accounting & Ledgers
  | 'VIEW_GENERAL_LEDGER'
  | 'CREATE_JOURNAL_VOUCHER'
  | 'POST_REVERSAL_ENTRY'
  | 'VIEW_BANK_BALANCES'
  | 'RECORD_CASH_CLOSING_GALLA'
  | 'VIEW_OWNER_CAPITAL_DRAWINGS'
  | 'MODIFY_CHART_OF_ACCOUNTS'
  
  // Deal Tower Operations
  | 'CREATE_WHOLESALE_DEAL'
  | 'EDIT_COMMERCIAL_TERMS'
  | 'APPROVE_CREDIT_STAGE'
  | 'RESERVE_INVENTORY_STOCK'
  | 'GENERATE_PICKING_SLIP'
  | 'EXECUTE_PICKING_VERIFICATION'
  | 'DISPATCH_CONSIGNMENT_BILTY'
  | 'RECONCILE_DELIVERY_SHORTAGE'
  | 'SETTLE_DEAL_MARGIN'
  
  // Network & RFQ
  | 'CREATE_RFQ_INDENT'
  | 'AWARD_SUPPLIER_QUOTE'
  | 'BROKER_PEER_STOCK_LOCK'
  | 'COMMIT_GROUP_BUYING_POOL'
  | 'EXPORT_TRADE_PASSPORT';

/**
 * Declarative Role Permission Matrix.
 */
export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<PermissionKey>> = {
  MUKHIYA: new Set<PermissionKey>([
    'VIEW_FINANCIAL_MARGINS',
    'VIEW_PURCHASE_COSTS',
    'VIEW_SELLING_RATES',
    'APPROVE_LOSS_MAKING_DEAL',
    'APPROVE_CREDIT_OVERRIDE',
    'VIEW_GENERAL_LEDGER',
    'CREATE_JOURNAL_VOUCHER',
    'POST_REVERSAL_ENTRY',
    'VIEW_BANK_BALANCES',
    'RECORD_CASH_CLOSING_GALLA',
    'VIEW_OWNER_CAPITAL_DRAWINGS',
    'MODIFY_CHART_OF_ACCOUNTS',
    'CREATE_WHOLESALE_DEAL',
    'EDIT_COMMERCIAL_TERMS',
    'APPROVE_CREDIT_STAGE',
    'RESERVE_INVENTORY_STOCK',
    'GENERATE_PICKING_SLIP',
    'EXECUTE_PICKING_VERIFICATION',
    'DISPATCH_CONSIGNMENT_BILTY',
    'RECONCILE_DELIVERY_SHORTAGE',
    'SETTLE_DEAL_MARGIN',
    'CREATE_RFQ_INDENT',
    'AWARD_SUPPLIER_QUOTE',
    'BROKER_PEER_STOCK_LOCK',
    'COMMIT_GROUP_BUYING_POOL',
    'EXPORT_TRADE_PASSPORT',
  ]),

  MUNIM: new Set<PermissionKey>([
    'VIEW_FINANCIAL_MARGINS',
    'VIEW_PURCHASE_COSTS',
    'VIEW_SELLING_RATES',
    'VIEW_GENERAL_LEDGER',
    'CREATE_JOURNAL_VOUCHER',
    'POST_REVERSAL_ENTRY',
    'VIEW_BANK_BALANCES',
    'RECORD_CASH_CLOSING_GALLA',
    'CREATE_WHOLESALE_DEAL',
    'EDIT_COMMERCIAL_TERMS',
    'RESERVE_INVENTORY_STOCK',
    'GENERATE_PICKING_SLIP',
    'EXECUTE_PICKING_VERIFICATION',
    'DISPATCH_CONSIGNMENT_BILTY',
    'RECONCILE_DELIVERY_SHORTAGE',
    'CREATE_RFQ_INDENT',
    'AWARD_SUPPLIER_QUOTE',
    'BROKER_PEER_STOCK_LOCK',
    'COMMIT_GROUP_BUYING_POOL',
    'EXPORT_TRADE_PASSPORT',
  ]),

  GODOWN: new Set<PermissionKey>([
    'RESERVE_INVENTORY_STOCK',
    'EXECUTE_PICKING_VERIFICATION',
    'DISPATCH_CONSIGNMENT_BILTY',
    // Zero financial permissions: cannot view rates, costs, margins, ledgers, or customer dues
  ]),

  PARTNER: new Set<PermissionKey>([
    'CREATE_RFQ_INDENT',
    // External partners access only their scoped shared tracking URLs
  ]),
};

// ============================================================================
// RBAC PREDICATE FUNCTIONS
// ============================================================================

export function hasPermission(role: UserRole, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

/**
 * Guard: Can role view True Net Deal Margin and profitability breakdown?
 * Invariant: False for GODOWN and PARTNER.
 */
export function canViewFinancialMargins(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

/**
 * Guard: Can role approve a customer order when credit limit is breached?
 * Invariant: True ONLY for MUKHIYA.
 */
export function canApproveCreditOverride(role: UserRole): boolean {
  return role === 'MUKHIYA';
}

/**
 * Guard: Can role view purchase and landed cost pricing?
 * Invariant: False for GODOWN and PARTNER.
 */
export function canViewCostPricing(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

/**
 * Guard: Can role update inventory counts and allocate lots?
 * Invariant: True for MUKHIYA, MUNIM, and GODOWN.
 */
export function canModifyInventory(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM' || role === 'GODOWN';
}

/**
 * Guard: Can role post double-entry vouchers to the general ledger?
 * Invariant: True for MUKHIYA and MUNIM.
 */
export function canPostDoubleEntryLedger(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

/**
 * Guard: Can role authorize a loss-making deal ("घाटे का सौदा")?
 * Invariant: True ONLY for MUKHIYA.
 */
export function canApproveLossDeal(role: UserRole): boolean {
  return role === 'MUKHIYA';
}

/**
 * Guard: Can role modify Chart of Accounts or Owner Equity accounts?
 * Invariant: True ONLY for MUKHIYA.
 */
export function canModifyChartOfAccounts(role: UserRole): boolean {
  return role === 'MUKHIYA';
}

/**
 * Guard: Can role record daily cash drawer closing?
 * Invariant: True for MUKHIYA and MUNIM.
 */
export function canRecordCashClosing(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

/**
 * Guard: Can role dispatch a vehicle consignment?
 * Invariant: True for MUKHIYA, MUNIM, and GODOWN.
 */
export function canDispatchConsignment(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM' || role === 'GODOWN';
}

/**
 * Guard: Can role create new wholesale deals?
 * Invariant: True for MUKHIYA and MUNIM.
 */
export function canCreateDeal(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

// ============================================================================
// GODOWN FINANCIAL REDACTION FILTERS
// ============================================================================

/**
 * Structurally redacts financial fields from a DealCard for GODOWN role.
 * Removes pricing, rates, subtotals, margins, advance, and customer dues.
 */
export function redactDealForGodown(deal: any): any {
  if (!deal) return deal;
  const cloned = JSON.parse(JSON.stringify(deal));

  // Remove commercial/financial totals
  delete cloned.subtotalPaisa;
  delete cloned.taxPaisa;
  delete cloned.totalDealAmountPaisa;
  delete cloned.totalAmount;
  delete cloned.advanceReceivedPaisa;
  delete cloned.advanceReceived;
  delete cloned.balanceDuePaisa;
  delete cloned.balanceDue;
  delete cloned.marginAudit;
  delete cloned.margin;
  delete cloned.commercialTerms;
  delete cloned.paymentTerms;

  // Mask item costs and selling rates
  if (Array.isArray(cloned.items)) {
    cloned.items = cloned.items.map((item: any) => {
      const sanitized = { ...item };
      delete sanitized.unitSellingRatePaisa;
      delete sanitized.unitLandedCostPaisa;
      delete sanitized.subtotalPaisa;
      delete sanitized.rate;
      delete sanitized.landedCost;
      delete sanitized.subtotal;
      return sanitized;
    });
  }

  return cloned;
}

/**
 * Structurally redacts financial fields from a DealCard based on UserRole.
 */
export function redactDealForRole(deal: DealCard, role: UserRole): any {
  if (role === 'MUKHIYA' || role === 'MUNIM') {
    return deal;
  }
  return redactDealForGodown(deal);
}

/**
 * Strips purchasing and selling prices from inventory items for GODOWN role.
 */
export function redactInventoryForGodown(items: any[]): any[] {
  if (!items) return [];
  return items.map(item => {
    const sanitized = JSON.parse(JSON.stringify(item));
    delete sanitized.costRatePaise;
    delete sanitized.costRatePerMeterPaisa;
    delete sanitized.costRatePaisa;
    delete sanitized.wholesaleRatePaise;
    delete sanitized.wholesaleRatePerMeterPaisa;
    delete sanitized.wholesaleRatePaisa;
    delete sanitized.minFloorRatePaisa;
    delete sanitized.costRate;
    delete sanitized.wholesaleRate;
    return sanitized;
  });
}

/**
 * Redacts financial and credit limit fields from a Party record for GODOWN role.
 */
export function redactPartyForRole(party: Party, role: UserRole): Partial<Party> {
  if (role === 'MUKHIYA' || role === 'MUNIM') {
    return party;
  }

  return {
    id: party.id,
    businessName: party.businessName,
    contactPerson: party.contactPerson,
    phone: party.phone,
    address: party.address,
    role: party.role,
    tradeModePreference: party.tradeModePreference,
    isActive: party.isActive,
  };
}
