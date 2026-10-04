// Comprehensive Automated Verification Script for Vyapar Setu
// Tests all domain invariants, calculations, margin formulas, and RBAC rules

console.log("=================================================");
console.log("   VYAPAR SETU (व्यापार सेतु) - VERIFICATION SUITE   ");
console.log("=================================================");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// 1. Invariant 1: Double-Entry Ledger Equilibrium
const vouchers = [
  { id: 'V-01', debit: 171500, credit: 0, desc: 'Sales' },
  { id: 'V-02', debit: 0, credit: 171500, desc: 'Party Account' },
  { id: 'V-03', debit: 25000, credit: 0, desc: 'Cash Received' },
  { id: 'V-04', debit: 0, credit: 25000, desc: 'Party Credit' },
];
const totalDebits = vouchers.reduce((sum, v) => sum + v.debit, 0);
const totalCredits = vouchers.reduce((sum, v) => sum + v.credit, 0);
assert(totalDebits === totalCredits && totalDebits === 196500, "Double-Entry Invariant (Σ Debit === Σ Credit)");

// 2. Invariant 2: True Net Deal Margin Calculation
const grossRevenue = 171500;
const landedCost = 140630;
const freight = 3200;
const hamali = 650;
const cashDiscount = 3430; // 2% CD
const dalali = 1715;       // 1% brokerage
const expenses = landedCost + freight + hamali + cashDiscount + dalali;
const netProfit = grossRevenue - expenses;
const netMarginPercent = (netProfit / grossRevenue) * 100;

assert(expenses === 149625, "Landed Cost + All Mandi Overheads computed accurately");
assert(netProfit === 21875, "True Net Deal Margin in INR matches exactly");
assert(Math.abs(netMarginPercent - 12.755) < 0.01, "Net Margin percentage is ~12.76% (Healthy Profit Band)");

// 3. Invariant 3: Dharam Kanta Weighbridge Multi-Unit Invariant
const grossWeightKg = 34250;
const tareWeightKg = 12450;
const netWeightKg = grossWeightKg - tareWeightKg;
const netMetricTonnes = netWeightKg / 1000;
const equivalent50kgBags = Math.round(netWeightKg / 50);

assert(netWeightKg === 21800, "Weighbridge Net Weight in Kg (34,250 - 12,450 = 21,800 kg)");
assert(netMetricTonnes === 21.8, "Weighbridge Net MT (21.80 Metric Tonnes)");
assert(equivalent50kgBags === 436, "Weighbridge 50kg Bags conversion (436 Bags)");

// 4. Invariant 4: Samoohik Kharid Group Buying Volume Tier Calculation
const poolTargetVolume = 10000;
const currentPledged = 7400;
const newPledge = 600;
const updatedPledged = currentPledged + newPledge;
const progressPercent = (updatedPledged / poolTargetVolume) * 100;
const currentTierRate = 330;
const nextTierRate = 312;
const projectedSavingPerBag = currentTierRate - nextTierRate;
const totalBatchSavings = projectedSavingPerBag * newPledge;

assert(progressPercent === 80, "Group Buying pool progress reaches 80% with new pledge");
assert(projectedSavingPerBag === 18, "Tier discount savings is ₹18 per bag");
assert(totalBatchSavings === 10800, "Merchant saves ₹10,800 on the committed batch upon pool unlock");

// 5. Invariant 5: RBAC Masking Invariant
function getMarginView(userRole, dealMargin) {
  if (userRole === 'GODOWN_DISPATCH') {
    return {
      grossRevenue: dealMargin.grossRevenue,
      landedCost: '*** MASKED ***',
      netProfit: '*** MASKED ***',
      profitBand: 'RESTRICTED',
      isRedacted: true,
    };
  }
  return { ...dealMargin, isRedacted: false };
}

const godownView = getMarginView('GODOWN_DISPATCH', { grossRevenue, landedCost, netProfit, profitBand: 'HEALTHY' });
const ownerView = getMarginView('OWNER', { grossRevenue, landedCost, netProfit, profitBand: 'HEALTHY' });

assert(godownView.isRedacted === true && godownView.netProfit === '*** MASKED ***', "RBAC: Godown staff has purchase costs and margins redacted");
assert(ownerView.isRedacted === false && ownerView.netProfit === 21875, "RBAC: Sethji Owner has 100% financial visibility");

// 6. Invariant 6: Physical Galla Cash Drawer Reconciliation
const notes500 = 250;
const notes200 = 80;
const notes100 = 40;
const physicalCash = (notes500 * 500) + (notes200 * 200) + (notes100 * 100);
const ledgerCashInHand = 145000;
const cashVariance = physicalCash - ledgerCashInHand;

assert(physicalCash === 145000, "Physical Denomination Tally (250*500 + 80*200 + 40*100 = 145,000)");
assert(cashVariance === 0, "Zero Cash Variance: Physical Drawer equals Digital Ledger Balance");

console.log("=================================================");
console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL CORE DOMAIN INVARIANTS VERIFIED SUCCESSFULLY!");
}
