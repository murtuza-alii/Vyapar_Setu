/**
 * src/types/trade-schemas.ts
 * Dual Trade Schemas: Mode A (Textiles & Fabrics) & Mode B (Building Materials & Bulk Commodities).
 */
import { CurrencyPaisa, UUID, AuditMetadata } from './common';

// ============================================================================
// MODE A: TEXTILES & FABRICS DOMAIN MODELS
// ============================================================================

/**
 * Fabric Quality Grade.
 */
export type FabricGrade = 
  | 'GRADE_A_FRESH'      // Flawless first-quality mill fabric
  | 'GRADE_B_SECONDS'    // Minor slub/dye imperfection, sold at discount
  | 'CUT_PIECE_FENT'     // Remnants and short cut lengths (< 10 meters)
  | 'Fresh-A'            // Alias for standard testing
  | 'Seconds';           // Alias for standard testing

/**
 * Thaan (Cloth Roll) Reservation and Lifecycle Status.
 */
export type ThaanReservationStatus = 
  | 'AVAILABLE'    // In godown, free to be quoted or sold
  | 'SOFT_LOCKED'  // Temporarily held (e.g. 15-min Vyapar Circle phone negotiation)
  | 'RESERVED'     // Hard-locked to a confirmed Sauda / Deal Card
  | 'PICKED'       // Picked by godown staff, awaiting packing
  | 'DISPATCHED'   // Loaded on truck with Challan & Bilty
  | 'SOLD';        // Consignment accepted and settled at destination

export type ReservationStatus = ThaanReservationStatus;

/**
 * Discrete Physical Thaan Piece Entity.
 * Represents an individual cloth roll with exact non-uniform continuous length.
 */
export interface TextileThaanPiece {
  id: UUID;
  skuId: UUID;
  barcode?: string;            // Scannable barcode / QR on roll tag
  thaanNumber: string;         // Serial # e.g. "T-042"
  lotNumber: string;           // Mill Dyeing Batch, e.g. "LOT-8821"
  
  // Exact Continuous Cut Lengths
  currentLengthMeters: number; // e.g. 21.80 meters
  initialLengthMeters: number; // e.g. 100.00 meters before cutting
  isCutPiece: boolean;         // true if created from parent thaan cut
  parentThaanId?: UUID;        // Reference to original uncut roll if split
  
  // Fabric Physical Attributes
  widthPannaInches: number;    // Fabric width: 44", 54", 58"
  shadeCode: string;           // e.g. "SH-14"
  shadeName: string;           // e.g. "Royal Navy"
  designNumber: string;        // e.g. "D-104", "Cambric Print 82"
  fabricGrade: FabricGrade;
  
  // Packaging & Storage
  baleNumber?: string;         // Shipping bale / gathri mark (e.g. "BALE-07")
  godownLocation?: {
    rack: string;
    shelf: string;
    bin: string;
  };
  
  // Atomic Reservation Controls
  reservationStatus: ThaanReservationStatus;
  reservedDealId?: UUID;
  reservedAt?: string;
  lockExpiresAt?: string;      // Auto-unlock timestamp for SOFT_LOCKED state
  
  audit?: AuditMetadata;
}

/**
 * Compatible representation of a Textile Thaan for inventory and test runners.
 */
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

/**
 * Textile SKU Catalog Master.
 */
export interface TextileSKU {
  id: UUID;
  designNumber?: string;
  designNo?: string;           // Alias e.g. "D-104"
  fabricName: string;          // e.g. "Pure Cotton 60x60 Cambric"
  fabricComposition?: string;  // e.g. "100% Cotton", "PV 65:35", "Rayon 14kg"
  widthPannaInches?: number;   // Standard Width (Panna)
  widthInches?: number;        // Standard Width (Panna)
  shadeCode: string;           // Color code
  shadeName: string;           // Color name
  fabricGrade: FabricGrade;
  lotNumber?: string;
  lotNo?: string;              // Dye bath lot
  
  // Financial Rates (in paise per meter)
  costRatePerMeterPaisa?: CurrencyPaisa;
  costRatePaise?: CurrencyPaisa;
  wholesaleRatePerMeterPaisa?: CurrencyPaisa;
  wholesaleRatePaise?: CurrencyPaisa;
  minFloorRatePerMeterPaisa?: CurrencyPaisa;
  
  // Aggregated Inventory Counts
  totalMetersOnHand?: number;
  totalMeters?: number;
  availableMeters?: number;
  reservedMeters?: number;
  totalThaansOnHand?: number;
  availableThaansCount?: number;
  thaanList?: TextileThaan[] | TextileThaanPiece[];
  
  // Inventory Health & Alert Thresholds
  reorderThresholdMeters?: number;
  deadStockDays: number;       // Days since last sale movement (>60 = dead stock)
  clusterOrigin?: string;      // e.g. "Surat", "Jaipur", "Bhilwara"
  
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// MODE B: BUILDING MATERIALS & BULK COMMODITIES DOMAIN MODELS
// ============================================================================

/**
 * Bulk Commodity Category.
 */
export type CommodityType = 
  | 'CEMENT'           // OPC / PPC 50kg bags or bulk tankers
  | 'STEEL_TMT'        // Fe 500D / Fe 550D rebar bundles
  | 'MARBLE_GRANITE'   // Gangsaw slabs, blocks, tiles
  | 'AGGREGATES_SAND'  // Sand, grit, gravel in brass / metric tonnes
  | 'SAND_AGGREGATE';

export type BulkCommodityType = CommodityType;

/**
 * Commodity Physical Units.
 */
export type CommodityUnit = 
  | 'METRIC_TONNE'  // 1 MT = 1,000 kg
  | 'TONNES'
  | 'BAG_50KG'      // Standard 50kg cement bag (20 bags = 1 MT)
  | 'BAGS'
  | 'SQ_FT'         // Square feet for marble/granite slabs
  | 'BUNDLE'        // TMT steel bundle (contains standard piece count)
  | 'BUNDLES'
  | 'BRASS'         // 1 Brass = 100 cu ft (aggregates/sand)
  | 'KG';           // Kilograms

export type BulkUnit = CommodityUnit;

/**
 * Building Material SKU Catalog Master.
 */
export interface BuildingMaterialSKU {
  id: UUID;
  itemCode: string;            // e.g. "CEM-UT-43", "TMT-TATA-12MM"
  commodityType: CommodityType;
  brand?: string;              // e.g. "UltraTech", "Tata Tiscon", "Wonder Cement"
  name?: string;
  gradeOrSpec?: string;        // e.g. "43-Grade PPC", "Fe 550D", "18mm Dungri"
  baseUnit: CommodityUnit;
  
  // Financial Rates (in paise per base unit)
  costRatePaisa?: CurrencyPaisa;
  costRatePaise?: CurrencyPaisa;
  wholesaleRatePaisa?: CurrencyPaisa;
  wholesaleRatePaise?: CurrencyPaisa;
  minFloorRatePaisa?: CurrencyPaisa;
  
  // Stock Tracking
  stockOnHand: number;
  availableStock?: number;
  reservedStock?: number;
  reorderLevel: number;
  deadStockDays: number;
  
  // Dimension & Engineering Conversion Parameters
  unitWeightKg?: number;       // e.g. 50 kg for cement bag
  rebarDiameterMm?: 8 | 10 | 12 | 16 | 20 | 25 | 32;
  piecesPerBundle?: number;
  rebarPiecesPerBundle?: number;
  rebarBarLengthMeters?: number; // Standard 12.0 meters
  marbleThicknessMm?: number;  // Standard 16mm or 18mm
  gangsawBlockId?: string;
  
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BuildingMaterialItem = BuildingMaterialSKU;

/**
 * Dharam Kanta (Weighbridge) Slip Record.
 * Certified gross-tare-net scale ticket.
 */
export interface WeighbridgeSlip {
  slipNumber: string;          // Weighbridge printed receipt number
  weighbridgeName?: string;    // e.g. "Shree Karni Dharam Kanta, Kishangarh"
  stationName?: string;        // Station identifier
  vehicleNumber?: string;      // Truck registration e.g. "RJ-14-GA-4521"
  vehicleNo?: string;
  timestamp: string;           // Certified scale timestamp
  
  grossWeightKg: number;       // Loaded truck weight
  tareWeightKg: number;        // Empty truck weight
  netWeightKg: number;         // Computed: Gross - Tare (Must be > 0)
  
  billedWeightKg?: number;     // Theoretical weight on invoice
  expectedNetKg?: number;
  varianceKg?: number;         // Net - Billed
  variancePercent?: number;    // (Variance / Billed) * 100
  isWithinTolerance?: boolean; // Tolerance threshold: ±1.5%
  
  operatorName?: string;
  slipPhotoUrl?: string;       // Photo of physical paper weighbridge slip
  notes?: string;
}

/**
 * Marble Gangsaw Block and Slab Lot Registry.
 */
export interface MarbleSlabLot {
  id: UUID;
  skuId: UUID;
  gangsawBlockId: string;      // e.g. "BLOCK-MK-802" (Makrana block)
  stoneVariety: string;        // e.g. "Dungri White", "Black Galaxy Granite"
  slabCount: number;           // Total slabs in book-matched lot
  averageLengthFt: number;     // Length in feet
  averageHeightFt: number;     // Height in feet
  thicknessMm: number;         // 16mm or 18mm
  
  grossSqFt: number;           // Length * Height * Count
  naturalDefectDeductionSqFt: number; // Allowance for cracks/tapered ends
  netBillableSqFt: number;     // Gross - Deduction
  
  status: 'IN_YARD' | 'RESERVED' | 'DISPATCHED' | 'SOLD';
  yardLocation: string;        // e.g. "Yard 2, Bay C"
  audit?: AuditMetadata;
}
