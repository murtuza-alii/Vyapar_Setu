export type TradeMode = 'TEXTILE' | 'BUILDING_MATERIALS';

export type Language = 'en' | 'hi' | 'kn';

export type UserRole = 'OWNER' | 'MUNIM' | 'GODOWN_DISPATCH';

export type AgingBucket = '0_15' | '15_30' | '30_PLUS';

export type DealStage = 
  | 'SAUDA_CONFIRMED'
  | 'CREDIT_VERIFIED'
  | 'STOCK_PICKING'
  | 'DISPATCHED'
  | 'DELIVERED_CHECK'
  | 'SETTLED';

export interface Party {
  id: string;
  name: string;
  phone: string;
  city: string;
  tradeType: 'RETAILER' | 'SUPPLIER' | 'BOTH';
  currentBalance: number; // Positive = Receivable (Lena Hai), Negative = Payable (Dena Hai)
  creditLimit: number;
  creditDays: number;
  aging: {
    days0_15: number;
    days15_30: number;
    days30_plus: number;
  };
  lastPaymentDate: string;
  upiId?: string;
}

export interface TextileThaan {
  id: string;
  lotNo: string;
  meters: number;
  isReserved: boolean;
  reservedForDealId?: string;
  shadeCode: string;
  grade: 'Fresh-A' | 'Seconds';
}

export interface TextileItem {
  id: string;
  designNo: string;
  fabricName: string;
  widthInches: number; // Panna
  shadeName: string;
  shadeCode: string;
  costRatePerMeter: number;
  wholesaleRatePerMeter: number;
  totalMeters: number;
  thaanList: TextileThaan[];
  deadStockDays: number;
}

export interface BuildingMaterialItem {
  id: string;
  itemCode: string;
  name: string;
  gradeOrSpec: string;
  baseUnit: 'TONNES' | 'BAGS' | 'SQ_FT' | 'BUNDLES';
  stockOnHand: number;
  reorderLevel: number;
  costRate: number;
  wholesaleRate: number;
  unitWeightKg?: number; // e.g. 50kg per cement bag
  piecesPerBundle?: number;
  deadStockDays: number;
}

export interface DealItem {
  id: string;
  name: string;
  details: string;
  quantity: number;
  unit: string;
  rate: number;
  landedCost: number;
  subtotal: number;
}

export interface DispatchDetails {
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  transporterName: string;
  biltyNo: string;
  freightTerms: 'PAID' | 'TO_PAY';
  freightAmount: number;
  weighbridgeGrossKg?: number;
  weighbridgeTareKg?: number;
  weighbridgeNetKg?: number;
  weighbridgeSlipNo?: string;
  biltyPhotoUrl?: string;
  dispatchedAt?: string;
}

export interface DeliveryCheck {
  deliveredQty: number;
  acceptedQty: number;
  damagedQty: number;
  shortageQty: number;
  damageReason?: string;
  creditNoteIssued: number;
  isConfirmed: boolean;
}

export interface MarginAudit {
  grossRevenue: number;
  landedCost: number;
  freightCost: number;
  hamaliCost: number;
  cashDiscount: number;
  dalaliBrokerage: number;
  netProfit: number;
  netMarginPercent: number;
  profitBand: 'HEALTHY' | 'THIN' | 'LOSS';
}

export interface DealCard {
  id: string;
  dealNumber: string;
  title: string;
  tradeMode: TradeMode;
  partyId: string;
  partyName: string;
  partyCity: string;
  partyPhone: string;
  createdAt: string;
  stage: DealStage;
  items: DealItem[];
  totalAmount: number;
  advanceReceived: number;
  balanceDue: number;
  paymentTerms: string; // e.g. "15 Days Net, 2% CD in 7 days"
  dispatch: DispatchDetails;
  delivery: DeliveryCheck;
  margin: MarginAudit;
  notes: string;
}

export interface VoiceParsedTransaction {
  partyName: string;
  transactionType: 'SALE' | 'PURCHASE' | 'PAYMENT_RECEIVED' | 'PAYMENT_MADE';
  tradeMode: TradeMode;
  itemName: string;
  lotOrGrade: string;
  quantity: number;
  unit: string;
  rate: number;
  totalAmount: number;
  cashPaidOrReceived: number;
  balanceDue: number;
  logisticsNote?: string;
  rawTranscript: string;
  confidence: number;
}

export interface PeerMerchant {
  id: string;
  businessName: string;
  ownerName: string;
  city: string;
  mandiArea: string;
  reputationScore: number;
  availableStockPreview: string[];
  contactPhone: string;
  isAllied: boolean;
}

export interface GroupBuyingPool {
  id: string;
  title: string;
  manufacturer: string;
  commodityName: string;
  targetVolume: number;
  pledgedVolume: number;
  unit: string;
  currentTierPrice: number;
  nextTierPrice: number;
  nextTierVolumeRequirement: number;
  daysRemaining: number;
  participantsCount: number;
  userPledgeQuantity?: number;
  status: 'OPEN' | 'LOCKED' | 'ORDERED';
}

export interface TradePassport {
  merchantName: string;
  gstin: string;
  tradeHub: string;
  establishedYear: number;
  overallScore: number;
  tierGrade: 'A+' | 'A' | 'B+';
  metrics: {
    onTimeSettlementRatio: number; // percentage e.g. 98.4
    disputeRate: number; // e.g. 0.2
    completedDealsVolumeCr: number; // in Crores
    yearsInCircle: number;
    defaultIncidents: number;
  };
  verificationHash: string;
  lastAuditedDate: string;
}
