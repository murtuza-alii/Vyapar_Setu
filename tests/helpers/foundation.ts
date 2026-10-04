/**
 * Vyapar Setu (व्यापार सेतु) - Foundation Reference Contracts & Domain Engine
 * 
 * Provides authentic, requirement-derived business logic and contracts for:
 * - Feature 1: Mode A Textiles (Multi-attribute SKU matrix, variable cut lengths, reservation locks)
 * - Feature 2: Mode B Building Materials (Unit conversions: Bags <-> MT, TMT d^2/162, Marble sqft, Weighbridge slips)
 * - Feature 3: Double-Entry Accounting Invariant Engine & Integer Paise Arithmetic
 * - Feature 4: Offline-First Storage Engine & Outbox Sync Queue (UUIDs, CRUD, sync states)
 * - Feature 5: Multi-Tier RBAC & Godown Redaction Filters
 * - Feature 6: Indian Wholesale Cluster Mock Seed Engine (Jaipur, Surat, Bhilwara, Kishangarh, Udaipur)
 */

import { randomUUID } from 'node:crypto';

// ============================================================================
// FEATURE 1: DUAL TRADE SCHEMA - MODE A TEXTILES
// ============================================================================

export type FabricGrade = 'Fresh-A' | 'Seconds';
export type ReservationStatus = 'AVAILABLE' | 'RESERVED' | 'DISPATCHED' | 'SOLD';

export interface TextileThaan {
  id: string;
  skuId: string;
  lotNo: string;
  thaanNo: string;
  meters: number;
  initialMeters: number;
  widthInches: number; // Panna (44", 58", etc.)
  shadeCode: string;
  fabricGrade: FabricGrade;
  isCutPiece: boolean;
  status: ReservationStatus;
  reservedForDealId?: string;
}

export interface TextileSKU {
  id: string;
  designNo: string;
  fabricName: string;
  widthInches: number;
  shadeName: string;
  shadeCode: string;
  fabricGrade: FabricGrade;
  lotNo: string;
  costRatePaise: number;
  wholesaleRatePaise: number;
  totalMeters: number;
  thaanList: TextileThaan[];
  deadStockDays: number;
}

export function calculateThaanCutLengths(thaans: TextileThaan[]): {
  totalMeters: number;
  count: number;
  avgMeters: number;
} {
  if (!thaans || thaans.length === 0) {
    return { totalMeters: 0, count: 0, avgMeters: 0 };
  }
  let sum = 0;
  for (const t of thaans) {
    if (t.meters < 0) {
      throw new Error(`Invalid negative thaan meter length: ${t.meters}`);
    }
    sum += t.meters;
  }
  const roundedSum = Math.round(sum * 100) / 100;
  return {
    totalMeters: roundedSum,
    count: thaans.length,
    avgMeters: Math.round((roundedSum / thaans.length) * 100) / 100,
  };
}

export function lockThaanReservation(thaan: TextileThaan, dealId: string): {
  success: boolean;
  updatedThaan: TextileThaan;
  error?: string;
} {
  if (!dealId || dealId.trim() === '') {
    return { success: false, updatedThaan: thaan, error: 'Deal ID is mandatory for reservation lock' };
  }
  if (thaan.status === 'RESERVED' && thaan.reservedForDealId !== dealId) {
    return {
      success: false,
      updatedThaan: thaan,
      error: `Thaan ${thaan.thaanNo} is already reserved for deal ${thaan.reservedForDealId}`,
    };
  }
  if (thaan.status === 'DISPATCHED' || thaan.status === 'SOLD') {
    return {
      success: false,
      updatedThaan: thaan,
      error: `Thaan ${thaan.thaanNo} cannot be reserved because it is ${thaan.status}`,
    };
  }

  const updated: TextileThaan = {
    ...thaan,
    status: 'RESERVED',
    reservedForDealId: dealId,
  };
  return { success: true, updatedThaan: updated };
}

export function releaseThaanReservation(thaan: TextileThaan, dealId: string): {
  success: boolean;
  updatedThaan: TextileThaan;
  error?: string;
} {
  if (thaan.status !== 'RESERVED') {
    return {
      success: false,
      updatedThaan: thaan,
      error: `Thaan ${thaan.thaanNo} is not currently reserved (status: ${thaan.status})`,
    };
  }
  if (thaan.reservedForDealId && thaan.reservedForDealId !== dealId) {
    return {
      success: false,
      updatedThaan: thaan,
      error: `Cannot release thaan reserved for different deal ${thaan.reservedForDealId}`,
    };
  }

  const updated: TextileThaan = {
    ...thaan,
    status: 'AVAILABLE',
    reservedForDealId: undefined,
  };
  return { success: true, updatedThaan: updated };
}

export function validateTextileSKU(sku: Partial<TextileSKU>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!sku.designNo || sku.designNo.trim() === '') errors.push('Design number is required');
  if (!sku.shadeCode || sku.shadeCode.trim() === '') errors.push('Shade code is required');
  if (!sku.lotNo || sku.lotNo.trim() === '') errors.push('Lot number is required');
  if (!sku.widthInches || sku.widthInches <= 0) errors.push('Width (Panna) must be greater than 0 inches');
  if (sku.costRatePaise !== undefined && sku.costRatePaise < 0) errors.push('Cost rate cannot be negative');
  if (sku.wholesaleRatePaise !== undefined && sku.wholesaleRatePaise < 0) errors.push('Wholesale rate cannot be negative');
  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// FEATURE 2: DUAL TRADE SCHEMA - MODE B BUILDING MATERIALS
// ============================================================================

export type BulkCommodityType = 'CEMENT' | 'STEEL_TMT' | 'MARBLE_GRANITE' | 'SAND_AGGREGATE';
export type BulkUnit = 'TONNES' | 'BAGS' | 'SQ_FT' | 'BUNDLES';

export interface BuildingMaterialItem {
  id: string;
  itemCode: string;
  name: string;
  commodityType: BulkCommodityType;
  baseUnit: BulkUnit;
  stockOnHand: number;
  reorderLevel: number;
  costRatePaise: number;
  wholesaleRatePaise: number;
  unitWeightKg?: number; // e.g. 50kg for cement bag
  piecesPerBundle?: number; // e.g. for TMT steel
  deadStockDays: number;
}

export interface WeighbridgeSlip {
  slipNumber: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  stationName: string;
  timestamp: string;
  vehicleNo: string;
}

export function convertBagsToMetricTonnes(bags: number, bagWeightKg: number = 50): number {
  if (bags < 0) throw new Error('Bags quantity cannot be negative');
  const totalKg = bags * bagWeightKg;
  return Math.round((totalKg / 1000) * 10000) / 10000;
}

export function convertMetricTonnesToBags(metricTonnes: number, bagWeightKg: number = 50): number {
  if (metricTonnes < 0) throw new Error('Metric tonnes quantity cannot be negative');
  const totalKg = metricTonnes * 1000;
  return Math.round(totalKg / bagWeightKg);
}

/**
 * BIS Indian Standard TMT Rebar Weight Formula:
 * Nominal weight per meter w = d^2 / 162 (in kg/m)
 * Standard length per piece is 12 meters.
 */
export function calculateTmtRebarWeight(
  diameterMm: number,
  lengthMeters: number = 12,
  pieceCount: number = 1
): {
  weightPerMeterKg: number;
  singlePieceWeightKg: number;
  totalWeightKg: number;
  totalWeightTonnes: number;
} {
  if (diameterMm <= 0) throw new Error('Rebar diameter must be positive');
  if (lengthMeters <= 0) throw new Error('Length must be positive');
  if (pieceCount <= 0) throw new Error('Piece count must be positive');

  // Nominal weight per meter in kg: d^2 / 162
  const weightPerMeterKg = (diameterMm * diameterMm) / 162;
  const singlePieceWeightKg = weightPerMeterKg * lengthMeters;
  const totalWeightKg = singlePieceWeightKg * pieceCount;
  const totalWeightTonnes = totalWeightKg / 1000;

  return {
    weightPerMeterKg: Math.round(weightPerMeterKg * 10000) / 10000,
    singlePieceWeightKg: Math.round(singlePieceWeightKg * 100) / 100,
    totalWeightKg: Math.round(totalWeightKg * 100) / 100,
    totalWeightTonnes: Math.round(totalWeightTonnes * 10000) / 10000,
  };
}

/**
 * Marble Slab Area Calculation:
 * Dimensions in inches: (Length * Height) / 144 = Sq Ft per slab
 * Total billable Sq Ft = (Sq Ft per slab * Slabs Count) - Defect Allowance Sq Ft
 */
export function calculateMarbleSquareFeet(
  lengthInches: number,
  heightInches: number,
  slabsCount: number,
  defectAllowanceSqFt: number = 0
): {
  sqFtPerSlab: number;
  grossSqFt: number;
  netSqFt: number;
} {
  if (lengthInches <= 0 || heightInches <= 0) throw new Error('Slab dimensions must be positive');
  if (slabsCount <= 0) throw new Error('Slab count must be positive');
  if (defectAllowanceSqFt < 0) throw new Error('Defect allowance cannot be negative');

  const sqFtPerSlab = (lengthInches * heightInches) / 144;
  const grossSqFt = sqFtPerSlab * slabsCount;
  if (defectAllowanceSqFt > grossSqFt) {
    throw new Error('Defect allowance cannot exceed total gross area');
  }
  const netSqFt = grossSqFt - defectAllowanceSqFt;

  return {
    sqFtPerSlab: Math.round(sqFtPerSlab * 100) / 100,
    grossSqFt: Math.round(grossSqFt * 100) / 100,
    netSqFt: Math.round(netSqFt * 100) / 100,
  };
}

/**
 * Dharam Kanta Weighbridge Slip Verification:
 * Net = Gross - Tare
 */
export function verifyWeighbridgeSlip(
  grossWeightKg: number,
  tareWeightKg: number,
  expectedNetKg?: number,
  tolerancePercent: number = 0.5
): {
  netWeightKg: number;
  variancePercent: number;
  isValid: boolean;
  error?: string;
} {
  if (grossWeightKg <= tareWeightKg) {
    throw new Error(`Gross weight (${grossWeightKg}kg) must be strictly greater than Tare weight (${tareWeightKg}kg)`);
  }
  const netWeightKg = grossWeightKg - tareWeightKg;

  if (expectedNetKg !== undefined && expectedNetKg > 0) {
    const diff = Math.abs(netWeightKg - expectedNetKg);
    const variancePercent = (diff / expectedNetKg) * 100;
    const isValid = variancePercent <= tolerancePercent;
    return {
      netWeightKg,
      variancePercent: Math.round(variancePercent * 100) / 100,
      isValid,
      error: isValid ? undefined : `Weight variance ${variancePercent.toFixed(2)}% exceeds allowable tolerance of ${tolerancePercent}%`,
    };
  }

  return {
    netWeightKg,
    variancePercent: 0,
    isValid: true,
  };
}

// ============================================================================
// FEATURE 3: DOUBLE-ENTRY ACCOUNTING INVARIANT & INTEGER PAISE ARITHMETIC
// ============================================================================

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  debitPaise: number;
  creditPaise: number;
  narration?: string;
  partyId?: string;
}

export interface JournalEntry {
  id: string;
  voucherNumber: string;
  date: string;
  narration: string;
  lines: JournalLine[];
  referenceDealId?: string;
  referencePartyId?: string;
  isImmutable?: boolean;
}

export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) throw new Error('Invalid rupee amount: must be finite number');
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number): number {
  if (!Number.isInteger(paise)) throw new Error('Paise must be an integer');
  return paise / 100;
}

export function formatIndianCurrency(paise: number): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const paiseRem = absPaise % 100;
  const paiseStr = paiseRem.toString().padStart(2, '0');
  
  // Indian number comma grouping (lakhs, crores)
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

export function validateJournalEntry(entry: JournalEntry): {
  isValid: boolean;
  totalDebitPaise: number;
  totalCreditPaise: number;
  discrepancyPaise: number;
  error?: string;
} {
  if (!entry.lines || entry.lines.length < 2) {
    return {
      isValid: false,
      totalDebitPaise: 0,
      totalCreditPaise: 0,
      discrepancyPaise: 0,
      error: 'Double-entry journal requires at least two lines',
    };
  }

  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of entry.lines) {
    if (!Number.isInteger(line.debitPaise) || !Number.isInteger(line.creditPaise)) {
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        error: 'Journal line amounts must be integers (paise)',
      };
    }
    if (line.debitPaise < 0 || line.creditPaise < 0) {
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        error: 'Journal line amounts cannot be negative (use opposite debit/credit column)',
      };
    }
    if (line.debitPaise > 0 && line.creditPaise > 0) {
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        error: 'A single journal line cannot have both debit and credit amounts',
      };
    }
    if (line.debitPaise === 0 && line.creditPaise === 0) {
      return {
        isValid: false,
        totalDebitPaise: totalDebit,
        totalCreditPaise: totalCredit,
        discrepancyPaise: 0,
        error: 'Journal line cannot have 0 debit and 0 credit',
      };
    }

    totalDebit += line.debitPaise;
    totalCredit += line.creditPaise;
  }

  const discrepancy = totalDebit - totalCredit;
  if (discrepancy !== 0) {
    return {
      isValid: false,
      totalDebitPaise: totalDebit,
      totalCreditPaise: totalCredit,
      discrepancyPaise: discrepancy,
      error: `Double-entry invariant violated! Debit sum (${totalDebit}) !== Credit sum (${totalCredit}). Discrepancy: ${discrepancy} paise.`,
    };
  }

  return {
    isValid: true,
    totalDebitPaise: totalDebit,
    totalCreditPaise: totalCredit,
    discrepancyPaise: 0,
  };
}

export function validateAndPostJournal(entry: JournalEntry): {
  success: boolean;
  entry?: JournalEntry;
  error?: string;
} {
  const validation = validateJournalEntry(entry);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }
  // Mark as immutable upon posting
  const finalized: JournalEntry = {
    ...entry,
    isImmutable: true,
  };
  return { success: true, entry: finalized };
}

// ============================================================================
// FEATURE 4: OFFLINE-FIRST STORAGE ENGINE & OUTBOX SYNC QUEUE
// ============================================================================

export interface OutboxAction {
  id: string;
  entityType: 'TRANSACTION' | 'PARTY' | 'DEAL' | 'STOCK' | 'PAYMENT';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: any;
  timestamp: number;
  syncStatus: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
  lastErrorMessage?: string;
}

export interface IStorageAdapter {
  get<T>(collection: string, id: string): Promise<T | null>;
  getAll<T>(collection: string, query?: Record<string, any>): Promise<T[]>;
  put<T extends { id: string }>(collection: string, item: T): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  enqueueOutboxAction(action: Omit<OutboxAction, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>): Promise<OutboxAction>;
  getOutboxActions(status?: OutboxAction['syncStatus']): Promise<OutboxAction[]>;
  updateOutboxAction(action: OutboxAction): Promise<void>;
  clearCollection(collection: string): Promise<void>;
}

export class InMemoryStorageAdapter implements IStorageAdapter {
  private collections = new Map<string, Map<string, any>>();
  private outbox: OutboxAction[] = [];

  private getCollectionMap(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map<string, any>());
    }
    return this.collections.get(name)!;
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const col = this.getCollectionMap(collection);
    const item = col.get(id);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  async getAll<T>(collection: string, query?: Record<string, any>): Promise<T[]> {
    const col = this.getCollectionMap(collection);
    let items = Array.from(col.values()).map(v => JSON.parse(JSON.stringify(v)));
    if (query) {
      items = items.filter(item => {
        return Object.entries(query).every(([k, v]) => item[k] === v);
      });
    }
    return items;
  }

  async put<T extends { id: string }>(collection: string, item: T): Promise<void> {
    if (!item.id) throw new Error('Item must have an id');
    const col = this.getCollectionMap(collection);
    col.set(item.id, JSON.parse(JSON.stringify(item)));
  }

  async delete(collection: string, id: string): Promise<void> {
    const col = this.getCollectionMap(collection);
    col.delete(id);
  }

  async enqueueOutboxAction(
    action: Omit<OutboxAction, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>
  ): Promise<OutboxAction> {
    const fullAction: OutboxAction = {
      ...action,
      id: randomUUID(),
      timestamp: Date.now(),
      syncStatus: 'PENDING',
      retryCount: 0,
    };
    this.outbox.push(fullAction);
    return JSON.parse(JSON.stringify(fullAction));
  }

  async getOutboxActions(status?: OutboxAction['syncStatus']): Promise<OutboxAction[]> {
    let list = this.outbox;
    if (status) {
      list = list.filter(a => a.syncStatus === status);
    }
    return JSON.parse(JSON.stringify(list));
  }

  async updateOutboxAction(action: OutboxAction): Promise<void> {
    const idx = this.outbox.findIndex(a => a.id === action.id);
    if (idx !== -1) {
      this.outbox[idx] = JSON.parse(JSON.stringify(action));
    }
  }

  async clearCollection(collection: string): Promise<void> {
    this.getCollectionMap(collection).clear();
  }
}

// ============================================================================
// FEATURE 5: MULTI-TIER ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

export type UserRole = 'MUKHIYA' | 'MUNIM' | 'GODOWN' | 'PARTNER';

export function canViewFinancialMargins(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

export function canApproveCreditOverride(role: UserRole): boolean {
  return role === 'MUKHIYA';
}

export function canViewCostPricing(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

export function canModifyInventory(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM' || role === 'GODOWN';
}

export function canPostDoubleEntryLedger(role: UserRole): boolean {
  return role === 'MUKHIYA' || role === 'MUNIM';
}

export function redactDealForGodown(deal: any): any {
  if (!deal) return deal;
  const cloned = JSON.parse(JSON.stringify(deal));

  // Remove commercial/financial totals
  delete cloned.totalAmount;
  delete cloned.advanceReceived;
  delete cloned.balanceDue;
  delete cloned.margin;
  delete cloned.paymentTerms;

  // Mask item costs and selling rates
  if (Array.isArray(cloned.items)) {
    cloned.items = cloned.items.map((item: any) => {
      const sanitized = { ...item };
      delete sanitized.rate;
      delete sanitized.landedCost;
      delete sanitized.subtotal;
      return sanitized;
    });
  }

  return cloned;
}

export function redactInventoryForGodown(items: any[]): any[] {
  if (!items) return [];
  return items.map(item => {
    const sanitized = JSON.parse(JSON.stringify(item));
    delete sanitized.costRatePaise;
    delete sanitized.wholesaleRatePaise;
    delete sanitized.costRate;
    delete sanitized.wholesaleRate;
    return sanitized;
  });
}

// ============================================================================
// FEATURE 6: INDIAN WHOLESALE CLUSTER MOCK SEED ENGINE
// ============================================================================

export interface ClusterParty {
  id: string;
  name: string;
  city: string;
  tradeHub: string;
  tradeType: 'RETAILER' | 'SUPPLIER' | 'BOTH';
  creditLimitPaise: number;
  currentBalancePaise: number; // positive = lena hai, negative = dena hai
  upiId: string;
}

export interface ClusterSeedData {
  clusterKey: string;
  clusterName: string;
  state: string;
  primaryTrade: 'TEXTILE' | 'BUILDING_MATERIALS';
  parties: ClusterParty[];
  textileInventory: TextileSKU[];
  materialsInventory: BuildingMaterialItem[];
  initialJournalEntries: JournalEntry[];
}

export function generateClusterSeedData(clusterKey: 'JAIPUR' | 'SURAT' | 'BHILWARA' | 'KISHANGARH' | 'UDAIPUR'): ClusterSeedData {
  switch (clusterKey) {
    case 'JAIPUR':
      return {
        clusterKey: 'JAIPUR',
        clusterName: 'Jaipur (Purohit Ji Ka Katla & Sanganer)',
        state: 'Rajasthan',
        primaryTrade: 'TEXTILE',
        parties: [
          {
            id: 'pty-jpr-01',
            name: 'Mahalaxmi Cloth Emporium',
            city: 'Jaipur',
            tradeHub: 'Purohit Ji Ka Katla',
            tradeType: 'RETAILER',
            creditLimitPaise: 50000000, // ₹5,00,000
            currentBalancePaise: 32000000, // ₹3,20,000
            upiId: 'mahalaxmi.cloth@okhdfcbank',
          },
          {
            id: 'pty-jpr-02',
            name: 'Sanganer Block Prints Mill',
            city: 'Jaipur',
            tradeHub: 'Sanganer RIICO',
            tradeType: 'SUPPLIER',
            creditLimitPaise: 100000000, // ₹10,00,000
            currentBalancePaise: -45000000, // ₹4,50,000 payable
            upiId: 'sanganer.prints@icici',
          },
        ],
        textileInventory: [
          {
            id: 'sku-jpr-01',
            designNo: 'JPR-SNG-402',
            fabricName: 'Cotton Cambric 60x60 Hand Block',
            widthInches: 44,
            shadeName: 'Indigo Bagru',
            shadeCode: 'IND-01',
            fabricGrade: 'Fresh-A',
            lotNo: 'LOT-JPR-881',
            costRatePaise: 14500, // ₹145/m
            wholesaleRatePaise: 18500, // ₹185/m
            totalMeters: 240,
            thaanList: [
              {
                id: 'th-jpr-01',
                skuId: 'sku-jpr-01',
                lotNo: 'LOT-JPR-881',
                thaanNo: 'T-01',
                meters: 30.5,
                initialMeters: 30.5,
                widthInches: 44,
                shadeCode: 'IND-01',
                fabricGrade: 'Fresh-A',
                isCutPiece: false,
                status: 'AVAILABLE',
              },
              {
                id: 'th-jpr-02',
                skuId: 'sku-jpr-01',
                lotNo: 'LOT-JPR-881',
                thaanNo: 'T-02',
                meters: 29.8,
                initialMeters: 29.8,
                widthInches: 44,
                shadeCode: 'IND-01',
                fabricGrade: 'Fresh-A',
                isCutPiece: false,
                status: 'AVAILABLE',
              },
            ],
            deadStockDays: 14,
          },
        ],
        materialsInventory: [],
        initialJournalEntries: [
          {
            id: 'jv-jpr-init',
            voucherNumber: 'JV-2026-JPR-001',
            date: '2026-10-01',
            narration: 'Opening balance capital injection',
            lines: [
              {
                id: 'jl-1',
                accountCode: '1010-CASH',
                accountName: 'Cash in Galla',
                debitPaise: 50000000, // ₹5,00,000
                creditPaise: 0,
              },
              {
                id: 'jl-2',
                accountCode: '3010-CAPITAL',
                accountName: "Owner's Equity Capital",
                debitPaise: 0,
                creditPaise: 50000000,
              },
            ],
          },
        ],
      };

    case 'SURAT':
      return {
        clusterKey: 'SURAT',
        clusterName: 'Surat (Ring Road Textile Market)',
        state: 'Gujarat',
        primaryTrade: 'TEXTILE',
        parties: [
          {
            id: 'pty-srt-01',
            name: 'Ambaji Synthetic Mills',
            city: 'Surat',
            tradeHub: 'Ring Road Mandi',
            tradeType: 'SUPPLIER',
            creditLimitPaise: 200000000,
            currentBalancePaise: -80000000,
            upiId: 'ambaji.syn@axis',
          },
        ],
        textileInventory: [
          {
            id: 'sku-srt-01',
            designNo: 'SRT-GEO-909',
            fabricName: 'Poly Georgette Micro Weight',
            widthInches: 58,
            shadeName: 'Rani Pink',
            shadeCode: 'RN-88',
            fabricGrade: 'Fresh-A',
            lotNo: 'LOT-SRT-402',
            costRatePaise: 8200, // ₹82/m
            wholesaleRatePaise: 11000, // ₹110/m
            totalMeters: 500,
            thaanList: [
              {
                id: 'th-srt-01',
                skuId: 'sku-srt-01',
                lotNo: 'LOT-SRT-402',
                thaanNo: 'T-101',
                meters: 100.0,
                initialMeters: 100.0,
                widthInches: 58,
                shadeCode: 'RN-88',
                fabricGrade: 'Fresh-A',
                isCutPiece: false,
                status: 'AVAILABLE',
              },
            ],
            deadStockDays: 8,
          },
        ],
        materialsInventory: [],
        initialJournalEntries: [],
      };

    case 'BHILWARA':
      return {
        clusterKey: 'BHILWARA',
        clusterName: 'Bhilwara (Textile City Suiting Mandi)',
        state: 'Rajasthan',
        primaryTrade: 'TEXTILE',
        parties: [
          {
            id: 'pty-bhl-01',
            name: 'Mewar Suiting & Shirting',
            city: 'Bhilwara',
            tradeHub: 'Gandhi Nagar Mandi',
            tradeType: 'BOTH',
            creditLimitPaise: 80000000,
            currentBalancePaise: 25000000,
            upiId: 'mewar.suiting@sbi',
          },
        ],
        textileInventory: [
          {
            id: 'sku-bhl-01',
            designNo: 'BHL-SUT-112',
            fabricName: 'PV Suiting 70/30 Matt Weave',
            widthInches: 58,
            shadeName: 'Dark Charcoal',
            shadeCode: 'CHR-09',
            fabricGrade: 'Fresh-A',
            lotNo: 'LOT-BHL-11',
            costRatePaise: 21000, // ₹210/m
            wholesaleRatePaise: 26500, // ₹265/m
            totalMeters: 150,
            thaanList: [
              {
                id: 'th-bhl-01',
                skuId: 'sku-bhl-01',
                lotNo: 'LOT-BHL-11',
                thaanNo: 'T-301',
                meters: 50.0,
                initialMeters: 50.0,
                widthInches: 58,
                shadeCode: 'CHR-09',
                fabricGrade: 'Fresh-A',
                isCutPiece: false,
                status: 'AVAILABLE',
              },
            ],
            deadStockDays: 22,
          },
        ],
        materialsInventory: [],
        initialJournalEntries: [],
      };

    case 'KISHANGARH':
      return {
        clusterKey: 'KISHANGARH',
        clusterName: 'Kishangarh (Asia Marble City)',
        state: 'Rajasthan',
        primaryTrade: 'BUILDING_MATERIALS',
        parties: [
          {
            id: 'pty-ksg-01',
            name: 'Maruti Marble & Granite Gangsaw',
            city: 'Kishangarh',
            tradeHub: 'Marble Association Industrial Zone',
            tradeType: 'SUPPLIER',
            creditLimitPaise: 150000000,
            currentBalancePaise: -35000000,
            upiId: 'maruti.marble@hdfc',
          },
        ],
        textileInventory: [],
        materialsInventory: [
          {
            id: 'mat-ksg-01',
            itemCode: 'MRB-MOR-01',
            name: 'Morwad White Marble Slabs 18mm',
            commodityType: 'MARBLE_GRANITE',
            baseUnit: 'SQ_FT',
            stockOnHand: 4200,
            reorderLevel: 1000,
            costRatePaise: 4800, // ₹48/sqft
            wholesaleRatePaise: 6500, // ₹65/sqft
            deadStockDays: 12,
          },
        ],
        initialJournalEntries: [],
      };

    case 'UDAIPUR':
      return {
        clusterKey: 'UDAIPUR',
        clusterName: 'Udaipur (Green Marble & Cement Hub)',
        state: 'Rajasthan',
        primaryTrade: 'BUILDING_MATERIALS',
        parties: [
          {
            id: 'pty-udp-01',
            name: 'Chetak Cement & Steel Depot',
            city: 'Udaipur',
            tradeHub: 'Sukher Industrial Area',
            tradeType: 'BOTH',
            creditLimitPaise: 120000000,
            currentBalancePaise: 18000000,
            upiId: 'chetak.depot@icici',
          },
        ],
        textileInventory: [],
        materialsInventory: [
          {
            id: 'mat-udp-01',
            itemCode: 'CMT-43G-01',
            name: 'Ultratech 43-Grade Portland Cement 50kg',
            commodityType: 'CEMENT',
            baseUnit: 'BAGS',
            stockOnHand: 800,
            reorderLevel: 200,
            costRatePaise: 33000, // ₹330/bag
            wholesaleRatePaise: 37500, // ₹375/bag
            unitWeightKg: 50,
            deadStockDays: 4,
          },
        ],
        initialJournalEntries: [],
      };
  }
}
