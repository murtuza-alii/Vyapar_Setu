/**
 * src/types/order-tower.ts
 * 6-Stage Wholesale Deal Card Lifecycle, Picking Slips, Logistics Bilties, & Net Margin Calculation.
 */
import { CurrencyPaisa, UUID, IndustryMode, AuditMetadata } from './common';
import { WeighbridgeSlip } from './trade-schemas';

/**
 * 6 Deterministic Wholesale Deal Lifecycle Stages.
 */
export type DealStage = 
  | 'STAGE_1_QUOTATION_CONFIRMED'  // Rate & payment terms locked
  | 'STAGE_2_CREDIT_VERIFIED'      // Credit limit verified & advance logged
  | 'STAGE_3_STOCK_PICKING'        // Rolls/Bags reserved & picking slip issued
  | 'STAGE_4_DISPATCHED_TRANSIT'   // Truck loaded, bilty & challan recorded
  | 'STAGE_5_DELIVERED_RECONCILED' // Delivery confirmed, shortage/damage notes issued
  | 'STAGE_6_MARGIN_AUDITED';      // True net margin calculated & posted to ledger

/**
 * Commercial Pricing Terms locked at Stage 1 (Sauda).
 */
export interface CommercialTerms {
  creditDays: number;              // e.g. 15, 30 days
  cashDiscountPercent: number;     // e.g. 2.0%
  cashDiscountGraceDays: number;   // e.g. Paid within 7 days
  deliveryTerms: 'EX_GODOWN' | 'FOR_DESTINATION';
  brokerageRate?: number;          // e.g. 1.0% or ₹5/meter
  brokerageType?: 'PERCENTAGE' | 'PER_UNIT';
  brokerPartyId?: UUID;
  brokerName?: string;
}

/**
 * Deal Line Item (Polymorphic across Textile & Building Materials).
 */
export interface DealLineItem {
  id: UUID;
  skuId: UUID;
  itemName: string;
  itemDetails: string;             // Shade/Lot or Spec
  industryMode: IndustryMode | string;
  
  // Ordered Quantities
  orderedQuantity: number;
  unit: string;                    // "meters", "thaans", "bags", "MT", "sqft", "bundles"
  
  // Commercial Rates (in paise)
  unitSellingRatePaisa?: CurrencyPaisa;
  unitLandedCostPaisa?: CurrencyPaisa;
  subtotalPaisa?: CurrencyPaisa;
  
  // Specific Dimension Links
  allocatedThaanIds?: UUID[];      // Mode A: Specific cloth roll IDs
  lotNumber?: string;
  pannaInches?: number;
  shadeCode?: string;
}

/**
 * Stage 2: Credit & Advance Verification Result.
 */
export interface CreditVerificationResult {
  checkedAt?: string;
  authorizedCreditLimitPaisa: CurrencyPaisa;
  currentOutstandingReceivablePaisa: CurrencyPaisa;
  proposedExposurePaisa: CurrencyPaisa;
  isOverdueAgingBlocked: boolean;  // true if party has >30 days unpaid bills
  approvalStatus: 'AUTO_APPROVED' | 'OWNER_OVERRIDE_APPROVED' | 'BLOCKED';
  
  // Owner Override details
  ownerOverrideByUserId?: UUID;
  ownerOverridePinEntered?: boolean;
  ownerOverrideReason?: string;
  
  // Advance Payment details
  advancePaidPaisa: CurrencyPaisa;
  advancePaymentMode?: 'CASH' | 'UPI' | 'CHEQUE' | 'RTGS_NEFT';
  advanceReferenceNumber?: string;
  advanceVoucherId?: UUID;
}

/**
 * Stage 3: Picking Slip Item (for Warehouse Staff).
 * NOTE: Rate, Cost, and Subtotal are completely omitted for GODOWN role!
 */
export interface PickingSlipItem {
  lineItemId: UUID;
  skuId: UUID;
  itemName: string;
  lotNumber?: string;
  designNumber?: string;
  shadeCode?: string;
  pannaInches?: number;
  unit: string;
  quantityToPick: number;
  pickedQuantity: number;
  rackLocation?: string;
  thaanIdsToPick?: UUID[];
  isPickedVerified: boolean;
}

/**
 * Stage 3: Digital Picking Slip Master.
 */
export interface PickingSlip {
  slipNumber: string;              // e.g. "PICK-2026-0412"
  dealId: UUID;
  assignedPickerId: UUID;
  assignedPickerName: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  items: PickingSlipItem[];
  generatedAt: string;
  completedAt?: string;
  pickerNotes?: string;
}

/**
 * Stage 4: Vehicle Dispatch Challan & Transporter Bilty.
 */
export interface DispatchBiltyManifest {
  challanNumber: string;           // e.g. "DC-2026-TXT-089"
  challanDate: string;
  ewayBillNumber?: string;         // Mandatory if consignment > ₹50,000
  
  transporterName: string;         // e.g. "Somnath Roadlines, Jaipur"
  transporterPhone: string;
  transporterGstin?: string;
  biltyNumber: string;             // Lorry Receipt (LR) number
  biltyDate: string;
  
  truckNumber: string;             // Indian RTO plate e.g. "RJ-14-GA-4521"
  driverName: string;
  driverPhone: string;             // 10-digit mobile
  
  packageCount: number;            // e.g. 40 bales or 400 bags
  packageType: 'BALES' | 'BAGS' | 'BUNDLES' | 'SLABS' | 'BOXES';
  
  freightTerms: 'PAID' | 'TO_PAY' | 'BILLED_TO_ACCOUNT';
  freightPaisa: CurrencyPaisa;     // Freight charges in paise
  
  weighbridgeSlip?: WeighbridgeSlip; // Dharam Kanta slip if bulk commodities
  biltyPhotoUrl?: string;          // Photo of physical LR copy
  loadingSlipPhotoUrl?: string;
  
  transitStatus: 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED_HUB' | 'DELIVERED' | 'DELAYED' | 'DISPUTED';
  dispatchedAt: string;
  estimatedArrivalDate?: string;
}

/**
 * Stage 5: Delivery Acceptance & Shortage/Damage Reconciliation.
 */
export interface DeliveryReconciliation {
  reconciledAt?: string;
  status: 'IN_TRANSIT' | 'ACCEPTED_FULL' | 'ACCEPTED_WITH_SHORTAGE' | 'REJECTED';
  
  orderedQuantity: number;
  dispatchedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  shortageQuantity: number;
  damagedQuantity: number;
  
  defectReason?: 'TRANSIT_WATER_DAMAGE' | 'LEAKAGE' | 'SHORTAGE_THEFT' | 'FABRIC_WEAVING_SLUB';
  responsibleParty?: 'TRANSPORTER' | 'SUPPLIER_MILL' | 'SELLER' | 'BUYER';
  
  creditNoteIssuedPaisa: CurrencyPaisa; // Credit note issued to buyer
  debitNoteIssuedPaisa: CurrencyPaisa;  // Debit note issued to transporter
  creditNoteNumber?: string;
  debitNoteNumber?: string;
  podPhotoUrl?: string;                 // Proof of Delivery photo
  reconciliationNotes?: string;
}

/**
 * Profitability Band Classification for True Net Margins.
 */
export type ProfitabilityBand = 
  | 'HEALTHY_PROFIT'       // Net Margin >= 5.0%
  | 'THIN_MARGIN_WARNING'  // Net Margin between 0.0% and 5.0%
  | 'LOSS_DEAL_ALERT';     // Net Margin < 0.0% ("घाटे का सौदा")

/**
 * Stage 6: True Net Deal Margin Breakdown.
 * Math: Revenue - (COGS + Hamali + Freight + CashDiscount + Dalali + Packaging + Losses)
 */
export interface TrueNetMarginBreakdown {
  grossRevenuePaisa: CurrencyPaisa;
  
  // Real Wholesale Cost Deductions
  landedCogsPaisa: CurrencyPaisa;
  loadingHamaliExpensePaisa: CurrencyPaisa;    // Pelledari / Loading labor
  outboundFreightExpensePaisa: CurrencyPaisa;  // Freight absorbed by seller
  cashDiscountAllowedPaisa: CurrencyPaisa;     // Cash discount incentive
  dalaliBrokerageExpensePaisa: CurrencyPaisa;  // Broker cut
  packagingMaterialExpensePaisa: CurrencyPaisa;// Hessian bales, gunny bags
  unrecoveredShortageLossPaisa: CurrencyPaisa; // Value of damaged goods absorbed
  
  totalDeductionsPaisa: CurrencyPaisa;
  trueNetProfitPaisa: CurrencyPaisa;           // Revenue - Deductions
  netMarginPercentage: number;                 // (Profit / Revenue) * 100
  
  profitBand: ProfitabilityBand;
  hurdleRatePercent?: number;                  // Wholesaler target (e.g. 4.0%)
  requiresMukhiyaSignoff: boolean;             // true if LOSS_DEAL_ALERT
  mukhiyaSignoffByUserId?: UUID;
  mukhiyaSignoffReason?: string;
}

export type DealMarginBreakdown = TrueNetMarginBreakdown;

/**
 * Wholesale Deal Card Aggregate Entity.
 * Tracks the complete 6-stage lifecycle of a wholesale sauda.
 */
export interface DealCard {
  id: UUID;
  dealNumber: string;              // e.g. "SAUDA-2026-0892"
  tradeMode: IndustryMode | string;
  partyId: UUID;
  partyName: string;
  partyCity: string;
  partyPhone: string;
  stage: DealStage | string;
  
  commercialTerms?: CommercialTerms;
  items: DealLineItem[];
  
  // Financial Overview
  subtotalPaisa?: CurrencyPaisa;
  taxPaisa?: CurrencyPaisa;
  totalDealAmountPaisa?: CurrencyPaisa;
  advanceReceivedPaisa?: CurrencyPaisa;
  balanceDuePaisa?: CurrencyPaisa;
  
  // Stage Data Payloads
  creditVerification?: CreditVerificationResult;
  pickingSlip?: PickingSlip;
  dispatchManifest?: DispatchBiltyManifest;
  deliveryReconciliation?: DeliveryReconciliation;
  marginAudit?: TrueNetMarginBreakdown;
  
  notes?: string;
  audit?: AuditMetadata;
  syncStatus?: 'LOCAL_PENDING' | 'SYNCED' | 'CONFLICT';
}
