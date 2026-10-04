/**
 * src/modules/foundation/unit-converter.ts
 * Authentic Indian Wholesale Conversion & Measurement Engine:
 * - Cement: 50kg Bags <-> Metric Tonnes
 * - Rebar: BIS 1786 nominal weight formula (d^2 / 162 kg/m), single bar & bundle weights
 * - Fabric: Linear meters <-> yards (0.9144 factor), cut roll summaries
 * - Marble & Granite: Gangsaw slab sq ft, defect deductions (ft & inch formulas)
 * - Weighbridge: Dharam Kanta gross - tare certification & tolerance verification (±1.5%)
 */

/**
 * Standard TMT Rebar pieces per bundle mapping per Indian rolling mill standard.
 */
export const TMT_PIECES_PER_BUNDLE: Record<number, number> = {
  8: 10,
  10: 7,
  12: 5,
  16: 3,
  20: 2,
  25: 1,
  32: 1,
};

/**
 * Standard commercial bar length in meters.
 */
export const STANDARD_REBAR_LENGTH_METERS = 12.0;

/**
 * Conversion factor between Yards and Meters.
 * 1 Yard = exactly 0.9144 Meters.
 */
export const METERS_PER_YARD = 0.9144;

/**
 * Standard Cement bag weight in kg.
 */
export const STANDARD_CEMENT_BAG_KG = 50.0;

// ============================================================================
// 1. CEMENT / BAG / METRIC TONNE CONVERSIONS
// ============================================================================

/**
 * Converts 50kg cement bags to Metric Tonnes.
 * Formula: MT = (bags * bagWeightKg) / 1000.
 */
export function bagsToMetricTonnes(bags: number, bagWeightKg = STANDARD_CEMENT_BAG_KG): number {
  if (bags < 0 || bagWeightKg <= 0) {
    throw new Error('Bag count and bag weight must be positive numbers');
  }
  const mt = (bags * bagWeightKg) / 1000.0;
  return Number(mt.toFixed(4));
}

export function convertBagsToMetricTonnes(bags: number, bagWeightKg = STANDARD_CEMENT_BAG_KG): number {
  if (bags < 0) throw new Error('Bags quantity cannot be negative');
  const totalKg = bags * bagWeightKg;
  return Math.round((totalKg / 1000) * 10000) / 10000;
}

/**
 * Converts Metric Tonnes to cement bags.
 * Returns integer bags and remainder in kg.
 */
export function metricTonnesToBags(
  mt: number, 
  bagWeightKg = STANDARD_CEMENT_BAG_KG
): { fullBags: number; exactBags: number; remainderKg: number } {
  if (mt < 0 || bagWeightKg <= 0) {
    throw new Error('Metric Tonnes and bag weight must be positive numbers');
  }
  const totalKg = mt * 1000.0;
  const exactBags = totalKg / bagWeightKg;
  const fullBags = Math.floor(exactBags);
  const remainderKg = Number((totalKg - fullBags * bagWeightKg).toFixed(2));
  return { fullBags, exactBags: Number(exactBags.toFixed(2)), remainderKg };
}

export function convertMetricTonnesToBags(metricTonnes: number, bagWeightKg = STANDARD_CEMENT_BAG_KG): number {
  if (metricTonnes < 0) throw new Error('Metric tonnes quantity cannot be negative');
  const totalKg = metricTonnes * 1000;
  return Math.round(totalKg / bagWeightKg);
}

// ============================================================================
// 2. TMT STEEL REBAR (d^2 / 162) CALCULATIONS
// ============================================================================

/**
 * Computes BIS nominal weight per meter of TMT rebar using the standard d^2 / 162 formula.
 * @param diameterMm Nominal diameter (e.g. 8, 10, 12, 16, 20, 25, 32 mm)
 * @returns Nominal weight in kg per meter (rounded to 4 decimal places)
 */
export function rebarNominalWeightPerMeter(diameterMm: number): number {
  if (diameterMm <= 0) {
    throw new Error('Rebar diameter must be positive');
  }
  const weightPerMeter = (diameterMm * diameterMm) / 162.0;
  return Number(weightPerMeter.toFixed(4));
}

/**
 * Computes nominal weight of a single TMT rebar of specified length.
 * @param diameterMm Nominal diameter in mm
 * @param lengthMeters Bar length in meters (default: 12.0m)
 */
export function rebarSingleBarWeightKg(
  diameterMm: number, 
  lengthMeters = STANDARD_REBAR_LENGTH_METERS
): number {
  const wPerMeter = rebarNominalWeightPerMeter(diameterMm);
  return Number((wPerMeter * lengthMeters).toFixed(3));
}

/**
 * Computes theoretical weight of one standard bundle of TMT rebars.
 */
export function rebarBundleWeightKg(
  diameterMm: number, 
  customPiecesPerBundle?: number,
  lengthMeters = STANDARD_REBAR_LENGTH_METERS
): number {
  const pieces = customPiecesPerBundle ?? TMT_PIECES_PER_BUNDLE[diameterMm] ?? 1;
  const singleBarWeight = rebarSingleBarWeightKg(diameterMm, lengthMeters);
  return Number((singleBarWeight * pieces).toFixed(3));
}

/**
 * Converts TMT rebar bundle count to Metric Tonnes.
 */
export function rebarBundlesToMetricTonnes(
  diameterMm: number,
  bundleCount: number,
  customPiecesPerBundle?: number,
  lengthMeters = STANDARD_REBAR_LENGTH_METERS
): number {
  if (bundleCount < 0) {
    throw new Error('Bundle count cannot be negative');
  }
  const bundleWeightKg = rebarBundleWeightKg(diameterMm, customPiecesPerBundle, lengthMeters);
  const totalKg = bundleCount * bundleWeightKg;
  return Number((totalKg / 1000.0).toFixed(4));
}

/**
 * Converts requested Metric Tonnes into full bundles and loose bars.
 */
export function rebarMetricTonnesToBundles(
  diameterMm: number,
  targetMt: number,
  customPiecesPerBundle?: number,
  lengthMeters = STANDARD_REBAR_LENGTH_METERS
): { fullBundles: number; extraBars: number; remainderKg: number; totalWeightKg: number } {
  if (targetMt < 0) {
    throw new Error('Target Metric Tonnes cannot be negative');
  }
  const singleBarWeight = rebarSingleBarWeightKg(diameterMm, lengthMeters);
  const piecesPerBundle = customPiecesPerBundle ?? TMT_PIECES_PER_BUNDLE[diameterMm] ?? 1;
  const bundleWeightKg = singleBarWeight * piecesPerBundle;
  
  const totalKg = targetMt * 1000.0;
  const fullBundles = Math.floor(totalKg / bundleWeightKg);
  const remainingWeightAfterBundles = totalKg - fullBundles * bundleWeightKg;
  
  const extraBars = Math.floor(remainingWeightAfterBundles / singleBarWeight);
  const remainderKg = Number((remainingWeightAfterBundles - extraBars * singleBarWeight).toFixed(2));
  
  return {
    fullBundles,
    extraBars,
    remainderKg,
    totalWeightKg: totalKg,
  };
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

// ============================================================================
// 3. FABRIC METER / YARD CONVERSIONS
// ============================================================================

/**
 * Converts fabric linear meters to yards.
 * Formula: Yards = Meters / 0.9144.
 */
export function metersToYards(meters: number): number {
  if (meters < 0) throw new Error('Meters cannot be negative');
  return Number((meters / METERS_PER_YARD).toFixed(3));
}

/**
 * Converts fabric linear yards to meters.
 * Formula: Meters = Yards * 0.9144.
 */
export function yardsToMeters(yards: number): number {
  if (yards < 0) throw new Error('Yards cannot be negative');
  return Number((yards * METERS_PER_YARD).toFixed(3));
}

/**
 * Converts rate per meter to rate per yard (in paise).
 * Formula: Rate per Yard = Rate per Meter * 0.9144.
 */
export function ratePerMeterToRatePerYard(ratePerMeterPaisa: number): number {
  return Math.round(ratePerMeterPaisa * METERS_PER_YARD);
}

/**
 * Converts rate per yard to rate per meter (in paise).
 * Formula: Rate per Meter = Rate per Yard / 0.9144.
 */
export function ratePerYardToRatePerMeter(ratePerYardPaisa: number): number {
  return Math.round(ratePerYardPaisa / METERS_PER_YARD);
}

/**
 * Aggregates meters across a collection of cloth rolls (thaans).
 */
export function calculateThaanCutLengths(thaans: Array<{ meters?: number; exactMeters?: number; currentLengthMeters?: number }>): {
  totalMeters: number;
  count: number;
  avgMeters: number;
} {
  if (!thaans || thaans.length === 0) {
    return { totalMeters: 0, count: 0, avgMeters: 0 };
  }
  let sum = 0;
  for (const t of thaans) {
    const m = t.meters ?? t.exactMeters ?? t.currentLengthMeters ?? 0;
    if (m < 0) {
      throw new Error(`Invalid negative thaan meter length: ${m}`);
    }
    sum += m;
  }
  const roundedSum = Math.round(sum * 100) / 100;
  return {
    totalMeters: roundedSum,
    count: thaans.length,
    avgMeters: Math.round((roundedSum / thaans.length) * 100) / 100,
  };
}

// ============================================================================
// 4. MARBLE & GRANITE SQUARE FEET CALCULATIONS
// ============================================================================

/**
 * Calculates net billable square feet for a marble/granite slab lot.
 * Dimensions: Length (ft) * Height (ft) * Slab Count - Defect Allowance.
 */
export function calculateMarbleSqFt(
  lengthFt: number,
  heightFt: number,
  slabCount: number,
  defectDeductionSqFt = 0
): { grossSqFt: number; defectDeductionSqFt: number; netBillableSqFt: number } {
  if (lengthFt < 0 || heightFt < 0 || slabCount < 0 || defectDeductionSqFt < 0) {
    throw new Error('Marble dimensions and slab counts must be non-negative');
  }
  const grossSqFt = Number((lengthFt * heightFt * slabCount).toFixed(2));
  if (defectDeductionSqFt > grossSqFt) {
    throw new Error('Defect deduction cannot exceed gross square footage');
  }
  const netBillableSqFt = Number((grossSqFt - defectDeductionSqFt).toFixed(2));
  return { grossSqFt, defectDeductionSqFt, netBillableSqFt };
}

/**
 * Marble Slab Area Calculation from inches dimensions:
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
 * Converts inch dimensions to feet.
 */
export function inchesToFeet(inches: number): number {
  if (inches < 0) throw new Error('Inches cannot be negative');
  return Number((inches / 12.0).toFixed(4));
}

// ============================================================================
// 5. WEIGHBRIDGE DISCREPANCY & TOLERANCE ENGINE
// ============================================================================

/**
 * Evaluates Dharam Kanta weighbridge net weight vs theoretical billed cargo.
 * Invariant: Tolerance is typically ±1.5% for bulk commodities.
 */
export function evaluateWeighbridgeDiscrepancy(
  grossWeightKg: number,
  tareWeightKg: number,
  billedCargoWeightKg: number,
  maxTolerancePercent = 1.5
): {
  netWeightKg: number;
  varianceKg: number;
  variancePercent: number;
  isWithinTolerance: boolean;
  errorMessage?: string;
} {
  if (grossWeightKg <= 0 || tareWeightKg <= 0) {
    return {
      netWeightKg: 0,
      varianceKg: 0,
      variancePercent: 0,
      isWithinTolerance: false,
      errorMessage: 'Gross and Tare weights must be greater than zero',
    };
  }
  if (tareWeightKg >= grossWeightKg) {
    return {
      netWeightKg: 0,
      varianceKg: 0,
      variancePercent: 0,
      isWithinTolerance: false,
      errorMessage: 'Tare weight (empty truck) cannot be greater than or equal to Gross weight',
    };
  }
  
  const netWeightKg = grossWeightKg - tareWeightKg;
  const varianceKg = Number((netWeightKg - billedCargoWeightKg).toFixed(2));
  const variancePercent = billedCargoWeightKg > 0 
    ? Number(((varianceKg / billedCargoWeightKg) * 100).toFixed(2)) 
    : 0;
  const isWithinTolerance = Math.abs(variancePercent) <= maxTolerancePercent;

  return {
    netWeightKg,
    varianceKg,
    variancePercent,
    isWithinTolerance,
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
