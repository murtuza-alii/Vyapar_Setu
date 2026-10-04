/**
 * src/types/network.ts
 * Pillar 3: Structured RFQs, Quote Matrix, POs, Vyapar Circle Peer Sourcing, Group Buying & Reputation.
 */
import { CurrencyPaisa, UUID, IndustryMode, AuditMetadata } from './common';

/**
 * Status of a Standardized Digital Indent / RFQ.
 */
export type RfqStatus = 
  | 'DRAFT'
  | 'OPEN_BROADCAST'
  | 'QUOTES_RECEIVED'
  | 'AWARDED'
  | 'EXPIRED'
  | 'CANCELLED';

/**
 * Digital Indent / RFQ Form.
 */
export interface RfqIndent {
  id: UUID;
  rfqNumber: string;               // e.g. "RFQ-2026-TXT-014"
  category: IndustryMode | string;
  itemName: string;                // e.g. "Cotton Cambric 60x60", "UltraTech 43-Grade"
  specifications: string;          // Fabric GSM, Width or Cement Grade
  targetQuantity: number;
  targetUnit: string;              // "meters", "thaans", "bags", "MT"
  deliveryTerms: 'EX_MILL' | 'FOR_DESTINATION';
  advancePaymentPercent: number;   // e.g. 10%, 20%
  requestedCreditDays: number;     // e.g. 30 days
  targetDispatchDate: string;
  status: RfqStatus;
  
  broadcastScope: 'PREFERRED_MILLS_ONLY' | 'ALL_VERIFIED_CLUSTER_MILLS';
  preferredSupplierIds?: UUID[];
  
  quotesCount: number;
  awardedQuoteId?: UUID;
  generatedPurchaseOrderId?: UUID;
  
  audit?: AuditMetadata;
}

/**
 * Automated Evaluator Badge for Normalized Quote Comparison.
 */
export type QuoteEvaluatorBadge = 
  | 'LOWEST_LANDED_PRICE'  // Minimum effective cost per unit
  | 'FASTEST_DISPATCH'     // Minimum delivery lead days
  | 'BEST_CREDIT_TERMS'    // Longest credit window or highest cash discount
  | 'RECOMMENDED';         // Weighted multi-factor score

/**
 * Supplier Structured Quotation.
 */
export interface SupplierQuote {
  id: UUID;
  rfqId: UUID;
  supplierPartyId: UUID;
  supplierName: string;
  supplierCity: string;
  
  // Rate Breakdown (in paise)
  unitRateExMillPaisa: CurrencyPaisa;
  gstRatePercent: number;          // 5%, 18%, 28%
  estimatedFreightPerUnitPaisa: CurrencyPaisa;
  
  // Normalized Landed Cost Calculations
  landedCostPerUnitPaisa: CurrencyPaisa;      // Unit * (1+GST) + Freight
  effectiveLandedCostPaisa: CurrencyPaisa;   // Landed - CashDiscount
  
  minOrderQuantity: number;
  leadTimeDays: number;
  creditDaysOffered: number;
  cashDiscountPercent: number;
  cashDiscountDays: number;
  
  validUntil: string;
  evaluatorBadges: QuoteEvaluatorBadge[];
  quoteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  
  notes?: string;
  audit?: AuditMetadata;
}

/**
 * Digital Purchase Order (PO) generated upon awarding an RFQ.
 */
export interface DigitalPurchaseOrder {
  id: UUID;
  poNumber: string;                // e.g. "PO-2026-TXT-091"
  rfqId: UUID;
  quoteId: UUID;
  supplierPartyId: UUID;
  supplierName: string;
  totalOrderAmountPaisa: CurrencyPaisa;
  advancePayablePaisa: CurrencyPaisa;
  deliveryTerms: string;
  expectedDeliveryDate: string;
  status: 'ISSUED' | 'ACKNOWLEDGED_BY_MILL' | 'IN_PRODUCTION' | 'DISPATCHED';
  whatsappSentAt?: string;
  audit?: AuditMetadata;
}

/**
 * Inter-Merchant Peer Sourcing (Vyapar Circle) Peer Record.
 */
export interface VyaparCirclePeer {
  id: UUID;
  merchantId: UUID;
  businessName: string;
  ownerName: string;
  mandiArea: string;               // e.g. "Johari Bazaar, Jaipur"
  city: string;
  reputationScore: number;         // 300 to 900
  phone: string;
  isAllied: boolean;
  catalogSharingPermission: 'OPT_IN_SHARED_CATALOG' | 'BLIND_INQUIRY_ONLY';
  activeStockListingsCount: number;
}

/**
 * 15-Minute Soft Reservation Lock Ticket.
 */
export interface SoftLockTicket {
  id: UUID;
  peerMerchantId: UUID;
  requesterMerchantId: UUID;
  skuId: UUID;
  itemName: string;
  lockedQuantity: number;
  unit: string;
  thaanIds?: UUID[];               // Mode A discrete rolls
  
  wholesaleTransferRatePaisa: CurrencyPaisa;
  referralCutPaisa?: CurrencyPaisa; // If brokered model
  
  lockAcquiredAt: string;
  lockExpiresAt: string;           // Strictly 15 minutes from acquired
  isExpired: boolean;
  isReleased: boolean;
  isConvertedToDeal: boolean;
  associatedDealId?: UUID;
}

/**
 * Aggregated Group Buying (Samoohik Kharid) Tier Definition.
 */
export interface GroupBuyingTier {
  tierName: 'BASE' | 'SILVER' | 'GOLD' | 'FACTORY_GATE';
  minVolumeRequired: number;
  unitPricePaisa: CurrencyPaisa;
  savingsPercentage: number;
}

/**
 * Aggregated Group Buying Campaign Pool.
 */
export interface GroupBuyingPool {
  id: UUID;
  poolCode: string;                // e.g. "POOL-CEM-04"
  title: string;                   // e.g. "UltraTech 43-Grade PPC Cement Pool"
  commodityCategory: IndustryMode | string;
  commodityName: string;
  manufacturer: string;
  targetVolume: number;
  pledgedVolume: number;
  unit: string;                    // "bags", "MT", "meters"
  
  tiers: GroupBuyingTier[];
  currentTierIndex: number;
  currentUnitPricePaisa: CurrencyPaisa;
  nextTierUnitPricePaisa?: CurrencyPaisa;
  nextTierRemainingVolume?: number;
  
  tokenAdvancePercent: number;     // e.g. 10%
  poolExpiryDate: string;
  status: 'OPEN' | 'TARGET_REACHED' | 'LOCKED_ORDERED' | 'CANCELLED';
  participantsCount: number;
  
  audit?: AuditMetadata;
}

/**
 * Wholesaler's Individual Commitment to a Group Buying Pool.
 * Enforces Independent Billing & Multi-Drop Logistics.
 */
export interface PoolCommitment {
  id: UUID;
  poolId: UUID;
  participantMerchantId: UUID;
  participantBusinessName: string;
  participantGstin: string;
  pledgedQuantity: number;
  tokenAdvancePaisa: CurrencyPaisa;
  
  dropLocationType: 'GODOWN_DIRECT' | 'CONSORTIUM_HUB_DROP';
  deliveryAddress: string;
  
  independentInvoiceStatus: 'PENDING' | 'INVOICED_BY_MILL';
  millGstInvoiceNumber?: string;
  audit?: AuditMetadata;
}

/**
 * 5-Factor Trade Reputation Passport Metrics.
 */
export interface PassportMetrics {
  onTimeSettlementRatioPercent: number; // OTSR (Weight: 40%) Target: >= 92%
  disputeReturnRatePercent: number;     // DRR  (Weight: 25%) Target: <= 2.0%
  tradeVolumeVelocityIndex: number;     // TVVI (Weight: 20%) Normalized 0-100
  peerCircleVouchingScore: number;      // PVS  (Weight: 15%) Normalized 0-100
  compositeVyaparScore: number;         // VCS: 300 to 900
  
  completedDealsVolumeCr: number;       // Turnover in ₹ Crores
  totalTransactedDeals: number;
  defaultIncidentsCount: number;
}

/**
 * Tamper-Proof Private Trade Reputation Passport.
 */
export interface TradeReputationPassport {
  id: UUID;
  merchantId: UUID;
  merchantName: string;
  gstin: string;
  udyamRegistrationNumber?: string;
  mandiCluster: string;
  establishedYear: number;
  
  tierGrade: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';
  metrics: PassportMetrics;
  
  // Cryptographic Digest: SHA256(GSTIN + VCS + OTSR + Timestamp + Salt)
  verificationDigest: string;
  verificationQrUrl: string;
  
  // Merchant Privacy Knobs
  privacyLevel: 'PUBLIC_SUMMARY' | 'VERIFIED_COUNTERPARTY' | 'BANK_AUDIT_MODE';
  lastAuditedDate: string;
}
