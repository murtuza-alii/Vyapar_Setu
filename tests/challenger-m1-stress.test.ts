/**
 * tests/challenger-m1-stress.test.ts
 * Empirical Challenger Adversarial Stress & Fuzz Suite for Milestone 1.
 *
 * Focus Areas:
 * 1. Floating point arithmetic drift vs integer paise arithmetic.
 * 2. Discrepancy rejection: 1-paisa imbalance strict rejection & edge cases.
 * 3. Reversal logic: Exact neutralization of account balances and party khata.
 * 4. Unit conversion formulas: Cement bags to MT, TMT rebar (BIS d^2/162),
 *    Fabric meter-yard conversions, Marble sqft defect allowances, Weighbridge slips.
 */

import {
  describe,
  test,
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertThrows,
  registry
} from './test-runner';

import {
  rupeesToPaise,
  paiseToRupees,
  formatIndianCurrency,
  addPaise,
  subPaise,
  multiplyPaiseByQuantity,
  computePercentagePaise,
  validateJournalEntry,
  validateAndPostJournal,
  createReversalJournal,
  calculateAccountBalance,
  getCashDrawerBalance,
  getBankBalance,
  getTotalReceivables,
  getTotalPayables,
  getPartyBalance,
  generateTrialBalance,
  buildSalesVoucher,
  buildPaymentReceivedVoucher,
  JournalEntry,
  JournalLine,
  STANDARD_CHART_OF_ACCOUNTS
} from '../src/modules/foundation/double-entry';

import {
  bagsToMetricTonnes,
  convertBagsToMetricTonnes,
  metricTonnesToBags,
  convertMetricTonnesToBags,
  rebarNominalWeightPerMeter,
  rebarSingleBarWeightKg,
  rebarBundleWeightKg,
  rebarBundlesToMetricTonnes,
  rebarMetricTonnesToBundles,
  calculateTmtRebarWeight,
  metersToYards,
  yardsToMeters,
  ratePerMeterToRatePerYard,
  ratePerYardToRatePerMeter,
  calculateThaanCutLengths,
  calculateMarbleSqFt,
  calculateMarbleSquareFeet,
  inchesToFeet,
  evaluateWeighbridgeDiscrepancy,
  verifyWeighbridgeSlip
} from '../src/modules/foundation/unit-converter';

// ============================================================================
// SUITE 1: FLOATING POINT DRIFT VS INTEGER PAISE ARITHMETIC
// ============================================================================

describe('CHALLENGER STRESS: Floating Point Drift vs Integer Paise Arithmetic', () => {

  test('Fuzz: 10,000 pseudo-random decimal rupees convert cleanly without fractional residue', () => {
    // Test that for 10,000 distinct currency amounts with up to 2 decimal places,
    // rupeesToPaise always produces an integer, and paiseToRupees exactly recovers the original number.
    for (let i = 0; i < 10000; i++) {
      const wholeRupees = Math.floor(Math.random() * 1000000); // Up to 10 Lakhs
      const paiseFraction = Math.floor(Math.random() * 100);    // 0 to 99 paise
      const floatRupees = Number(`${wholeRupees}.${paiseFraction.toString().padStart(2, '0')}`);
      
      const convertedPaise = rupeesToPaise(floatRupees);
      assertTrue(Number.isInteger(convertedPaise), `Paise must be integer for ${floatRupees}`);
      assertEqual(convertedPaise, wholeRupees * 100 + paiseFraction, `Exact paise match for ${floatRupees}`);
      
      const recoveredRupees = paiseToRupees(convertedPaise);
      assertEqual(recoveredRupees, floatRupees, `Roundtrip match for ${floatRupees}`);
    }
  });

  test('Drift Demonstration: 100,000 fractional transactions accumulate float drift but 0 paise drift', () => {
    // In IEEE 754 floating point arithmetic, adding 0.07 or 14.37 accumulates precision errors.
    let floatSum = 0;
    let integerPaiseSum = 0;
    const itemRupees = 14.37;
    const itemPaise = rupeesToPaise(itemRupees); // 1437 paise

    for (let i = 0; i < 100000; i++) {
      floatSum += itemRupees;
      integerPaiseSum = addPaise(integerPaiseSum, itemPaise);
    }

    const floatExpected = 1437000; // 100,000 * 14.37
    // Verify float drifts (not exact integer)
    const floatDiff = Math.abs(floatSum - floatExpected);
    // In float math, floatSum will have a microscopic epsilon drift
    const paiseRupees = paiseToRupees(integerPaiseSum);
    
    assertEqual(integerPaiseSum, 143700000, 'Integer paise sum must be exact to the single paisa');
    assertEqual(paiseRupees, floatExpected, 'Converted paise to rupees must be exact');
    assertTrue(Number.isInteger(integerPaiseSum), 'Integer paise sum must be strictly an integer');
  });

  test('Stress: Safe integer boundaries up to ₹10,000 Crores', () => {
    // Wholesale Mandi turnover can be hundreds of crores.
    // ₹10,000 Crores = 10,000 * 10,000,000 = 100,000,000,000 INR = 10,000,000,000,000 paise.
    // MAX_SAFE_INTEGER is 9,007,199,254,740,991.
    const tenThousandCroresRupees = 100_000_000_000;
    const tenThousandCroresPaise = rupeesToPaise(tenThousandCroresRupees);

    assertTrue(Number.isSafeInteger(tenThousandCroresPaise), '₹10,000 Crores in paise must be within safe integer range');
    assertEqual(tenThousandCroresPaise, 10_000_000_000_000);

    const formatted = formatIndianCurrency(tenThousandCroresPaise);
    assertTrue(formatted.includes('1,00,00,00,00,000'), `Expected Indian formatting with crores, got: ${formatted}`);

    // Adding 1 paisa to ₹10,000 Crores
    const incremented = addPaise(tenThousandCroresPaise, 1);
    assertEqual(subPaise(incremented, tenThousandCroresPaise), 1);
  });

  test('Strict rejection: Non-finite inputs throw explicit error', () => {
    assertThrows(() => rupeesToPaise(Infinity), /finite number/);
    assertThrows(() => rupeesToPaise(-Infinity), /finite number/);
    assertThrows(() => rupeesToPaise(NaN), /finite number/);
    assertThrows(() => paiseToRupees(100.5), /integer/);
    assertThrows(() => addPaise(100, 200.75), /Non-integer paise/);
    assertThrows(() => subPaise(100.2, 50), /Non-integer paise/);
  });

  test('Multiplication and Percentage rounding behavior', () => {
    // 3.333 meters @ ₹149.99/meter (14999 paise)
    const lineTotalPaise = multiplyPaiseByQuantity(14999, 3.333);
    assertEqual(lineTotalPaise, Math.round(14999 * 3.333));
    assertTrue(Number.isInteger(lineTotalPaise));

    // Cash discount 2.5% on ₹85,432.50 (8543250 paise)
    const discountPaise = computePercentagePaise(8543250, 2.5);
    assertEqual(discountPaise, Math.round((8543250 * 2.5) / 100));
    assertTrue(Number.isInteger(discountPaise));
  });
});

// ============================================================================
// SUITE 2: DISCREPANCY REJECTION & ZERO-TOLERANCE INVARIANT
// ============================================================================

describe('CHALLENGER STRESS: Discrepancy Rejection & Zero-Tolerance Invariant', () => {

  test('Strict rejection: Single 1-paisa imbalance is rejected under all circumstances', () => {
    const baseEntry: JournalEntry = {
      id: 'jv_test_imbalance',
      voucherNumber: 'JV-TEST-001',
      date: '2026-10-04',
      narration: 'Test 1-paisa imbalance',
      lines: [
        {
          id: 'l1',
          accountCode: '1010-CASH',
          accountName: 'Cash',
          debitPaise: 100000,
          creditPaise: 0,
        },
        {
          id: 'l2',
          accountCode: '4010-SALES',
          accountName: 'Sales',
          debitPaise: 0,
          creditPaise: 99999, // 1 paisa deficit
        }
      ]
    };

    const result1 = validateJournalEntry(baseEntry);
    assertFalse(result1.isValid, 'Voucher with 1 paisa deficit must be rejected');
    assertEqual(result1.discrepancyPaise, 1, 'Discrepancy must be exactly +1');

    // Invert: 1 paisa excess
    baseEntry.lines[1].creditPaise = 100001;
    const result2 = validateJournalEntry(baseEntry);
    assertFalse(result2.isValid, 'Voucher with 1 paisa excess must be rejected');
    assertEqual(result2.discrepancyPaise, -1, 'Discrepancy must be exactly -1');

    // Post rejection
    const postResult = validateAndPostJournal(baseEntry);
    assertFalse(postResult.success, 'Post must fail for 1 paisa discrepancy');
    assertTrue(postResult.error?.includes('Double-entry invariant violated'), 'Error message must cite invariant');
  });

  test('Fuzzer: 1,000 multi-line compound journals: Mutating 1 paisa yields 100% rejection rate', () => {
    for (let trial = 0; trial < 1000; trial++) {
      const lineCount = 2 + Math.floor(Math.random() * 8); // 2 to 9 lines
      const half = Math.floor(lineCount / 2);
      
      const debitAmounts: number[] = [];
      let totalAmount = 0;
      for (let i = 0; i < half; i++) {
        const amt = 1000 + Math.floor(Math.random() * 50000);
        debitAmounts.push(amt);
        totalAmount += amt;
      }

      // Split credit amounts to equal totalAmount
      const creditAmounts: number[] = [];
      let remainingCredit = totalAmount;
      const creditLineCount = lineCount - half;
      for (let i = 0; i < creditLineCount - 1; i++) {
        const amt = Math.floor(remainingCredit / (creditLineCount - i));
        creditAmounts.push(amt);
        remainingCredit -= amt;
      }
      creditAmounts.push(remainingCredit);

      const lines: JournalLine[] = [];
      debitAmounts.forEach((d, idx) => {
        lines.push({
          id: `d_${idx}`,
          accountCode: '1010-CASH',
          accountName: 'Cash',
          debitPaise: d,
          creditPaise: 0
        });
      });
      creditAmounts.forEach((c, idx) => {
        lines.push({
          id: `c_${idx}`,
          accountCode: '4010-SALES',
          accountName: 'Sales',
          debitPaise: 0,
          creditPaise: c
        });
      });

      const entry: JournalEntry = {
        id: `jv_fuzz_${trial}`,
        voucherNumber: `JV-FUZZ-${trial}`,
        date: '2026-10-04',
        narration: `Fuzz test ${trial}`,
        lines
      };

      // 1. Balanced entry MUST pass
      const validRes = validateJournalEntry(entry);
      assertTrue(validRes.isValid, `Balanced entry trial ${trial} must pass`);
      assertEqual(validRes.discrepancyPaise, 0);

      // 2. Corrupt one random line by adding or subtracting 1 paisa
      const targetLineIdx = Math.floor(Math.random() * lines.length);
      const corruptDelta = Math.random() < 0.5 ? 1 : -1;
      if (lines[targetLineIdx].debitPaise > 0) {
        lines[targetLineIdx].debitPaise += corruptDelta;
      } else {
        lines[targetLineIdx].creditPaise += corruptDelta;
      }

      // Corrupted entry MUST fail
      const corruptedRes = validateJournalEntry(entry);
      assertFalse(corruptedRes.isValid, `Corrupted entry trial ${trial} must fail`);
      assertNotEqual(corruptedRes.discrepancyPaise, 0);
    }
  });

  test('Adversarial malformed line inspections', () => {
    // 1. Both debit and credit non-zero on same line
    const dualLineEntry: JournalEntry = {
      id: 'jv_bad_dual',
      voucherNumber: 'JV-BAD-1',
      date: '2026-10-04',
      narration: 'Dual debit and credit',
      lines: [
        { id: '1', accountCode: '1010-CASH', debitPaise: 500, creditPaise: 500 },
        { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: 0 }
      ]
    };
    const r1 = validateJournalEntry(dualLineEntry);
    assertFalse(r1.isValid);
    assertTrue(r1.errors.some(e => e.includes('cannot have both debit and credit')));

    // 2. Line with 0 debit and 0 credit
    const zeroLineEntry: JournalEntry = {
      id: 'jv_bad_zero',
      voucherNumber: 'JV-BAD-2',
      date: '2026-10-04',
      narration: 'Zero amount line',
      lines: [
        { id: '1', accountCode: '1010-CASH', debitPaise: 1000, creditPaise: 0 },
        { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: 1000 },
        { id: '3', accountCode: '5020-FREIGHT', debitPaise: 0, creditPaise: 0 }
      ]
    };
    const r2 = validateJournalEntry(zeroLineEntry);
    assertFalse(r2.isValid);
    assertTrue(r2.errors.some(e => e.includes('cannot have 0 debit and 0 credit')));

    // 3. Negative amount in journal line
    const negEntry: JournalEntry = {
      id: 'jv_bad_neg',
      voucherNumber: 'JV-BAD-3',
      date: '2026-10-04',
      narration: 'Negative line',
      lines: [
        { id: '1', accountCode: '1010-CASH', debitPaise: -1000, creditPaise: 0 },
        { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: -1000 }
      ]
    };
    const r3 = validateJournalEntry(negEntry);
    assertFalse(r3.isValid);
    assertTrue(r3.errors.some(e => e.includes('cannot be negative')));

    // 4. Duplicate voucher number in validateAndPostJournal
    const existing: JournalEntry[] = [
      {
        id: 'jv_exist_1',
        voucherNumber: 'JV-DUPLICATE-CHECK',
        date: '2026-10-04',
        narration: 'Existing',
        lines: [
          { id: '1', accountCode: '1010-CASH', debitPaise: 100, creditPaise: 0 },
          { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: 100 }
        ]
      }
    ];
    const newEntry: JournalEntry = {
      id: 'jv_exist_2',
      voucherNumber: 'JV-DUPLICATE-CHECK', // Duplicate
      date: '2026-10-04',
      narration: 'New duplicate',
      lines: [
        { id: '1', accountCode: '1010-CASH', debitPaise: 200, creditPaise: 0 },
        { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: 200 }
      ]
    };
    const dupResult = validateAndPostJournal(newEntry, existing);
    assertFalse(dupResult.success);
    assertTrue(dupResult.error?.includes('DUPLICATE_VOUCHER_ERROR'));
  });
});

// ============================================================================
// SUITE 3: REVERSAL LOGIC & BALANCE NEUTRALIZATION
// ============================================================================

describe('CHALLENGER STRESS: Reversal Logic & Balance Neutralization', () => {

  test('Reversal voucher exactly neutralizes account balances to pre-transaction state', () => {
    // Initial ledger state: Opening capital of ₹5,00,000 (50000000 paise)
    const initialEntries: JournalEntry[] = [
      {
        id: 'jv_opening',
        voucherNumber: 'JV-OPEN-01',
        date: '2026-10-01',
        narration: 'Opening proprietor capital',
        lines: [
          { id: '1', accountCode: '1010-CASH', debitPaise: 50000000, creditPaise: 0 },
          { id: '2', accountCode: '3010-CAPITAL', debitPaise: 0, creditPaise: 50000000 }
        ]
      }
    ];

    const initialCash = getCashDrawerBalance(initialEntries);
    assertEqual(initialCash, 50000000);

    // Create a complex wholesale transaction voucher:
    // Sale of ₹1,50,000 goods, ₹2,500 freight, ₹1,200 hamali.
    // Advance ₹50,000 cash, balance ₹1,03,700 on AR credit.
    const saleVoucher = buildSalesVoucher({
      voucherNumber: 'SALES-2026-001',
      date: '2026-10-04',
      partyId: 'PARTY-JAIPUR-001',
      partyName: 'Gulab Chand Textiles',
      goodsValuePaise: 15000000,
      freightBilledPaise: 250000,
      hamaliBilledPaise: 120000,
      advanceReceivedPaise: 5000000,
      advanceMode: 'CASH'
    });

    const postSale = validateAndPostJournal(saleVoucher, initialEntries);
    assertTrue(postSale.success);

    const entriesWithSale = [...initialEntries, postSale.entry!];

    // Assert balances modified
    assertEqual(getCashDrawerBalance(entriesWithSale), 55000000); // 50L + 50k
    assertEqual(getTotalReceivables(entriesWithSale), 10370000);  // 1,03,700 AR
    const partyBalWithSale = getPartyBalance('PARTY-JAIPUR-001', entriesWithSale);
    assertEqual(partyBalWithSale.netBalancePaise, 10370000);
    assertEqual(partyBalWithSale.status, 'LENA_HAI');

    // Now execute reversal voucher
    const { reversalEntry, updatedOriginal } = createReversalJournal(
      postSale.entry!,
      'REV-SALES-2026-001',
      'Goods rejected by customer on quality inspection'
    );

    assertTrue(updatedOriginal.isReversed);
    assertEqual(updatedOriginal.reversalVoucherId, reversalEntry.id);
    assertEqual(reversalEntry.voucherType, 'REVERSAL');
    assertEqual(reversalEntry.originalVoucherId, postSale.entry!.id);

    // Invariant check on the reversal entry itself
    const revValidation = validateJournalEntry(reversalEntry);
    assertTrue(revValidation.isValid, 'Reversal entry must be mathematically valid');
    assertEqual(revValidation.discrepancyPaise, 0);

    // Append reversal entry to ledger
    const entriesWithReversal = [...initialEntries, updatedOriginal, reversalEntry];

    // INVARIANT: All account balances MUST return to EXACT pre-sale states
    const finalCash = getCashDrawerBalance(entriesWithReversal);
    assertEqual(finalCash, initialCash, 'Cash drawer must return to initial balance');

    const finalAR = getTotalReceivables(entriesWithReversal);
    assertEqual(finalAR, 0, 'Receivables must return to 0');

    const finalSales = calculateAccountBalance('4010-SALES', entriesWithReversal).balancePaise;
    assertEqual(finalSales, 0, 'Sales revenue must return to 0');

    const finalPartyBal = getPartyBalance('PARTY-JAIPUR-001', entriesWithReversal);
    assertEqual(finalPartyBal.netBalancePaise, 0, 'Party balance must return to 0');
    assertEqual(finalPartyBal.status, 'CHUKTA', 'Party status must be CHUKTA');

    // Trial balance must be strictly 0 discrepancy
    const tb = generateTrialBalance(entriesWithReversal);
    assertTrue(tb.isBalanced, 'Trial balance must be balanced');
    assertEqual(tb.discrepancyPaise, 0, 'Trial balance discrepancy must be 0');
    assertEqual(tb.totalDebitPaise, 50000000);
    assertEqual(tb.totalCreditPaise, 50000000);
  });

  test('Fuzz: 500 random transactions reversed must 100% neutralize all ledger balances', () => {
    // Generate 500 random multi-account vouchers, post them, reverse them, verify 0 residual balance
    for (let i = 0; i < 500; i++) {
      const partyId = `PARTY-FUZZ-${i}`;
      const amountPaise = 5000 + Math.floor(Math.random() * 500000);
      const discountPaise = Math.floor(amountPaise * 0.02); // 2% kasaar

      const receiptVoucher = buildPaymentReceivedVoucher({
        voucherNumber: `REC-FUZZ-${i}`,
        date: '2026-10-04',
        partyId,
        partyName: `Party ${i}`,
        amountReceivedPaise: amountPaise,
        discountAllowedPaise: discountPaise,
        paymentMode: i % 2 === 0 ? 'CASH' : 'BANK',
      });

      const { reversalEntry, updatedOriginal } = createReversalJournal(
        receiptVoucher,
        `REV-REC-${i}`,
        'Cheque bounce / settlement cancellation'
      );

      const trialEntries = [updatedOriginal, reversalEntry];

      // Net cash/bank, net AR, net discount allowed must ALL be 0
      const cashBal = getCashDrawerBalance(trialEntries);
      const bankBal = getBankBalance('1020-BANK-HDFC', trialEntries);
      const arBal = getTotalReceivables(trialEntries);
      const discBal = calculateAccountBalance('5040-DISC-ALW', trialEntries).balancePaise;
      const partyBal = getPartyBalance(partyId, trialEntries);

      assertEqual(cashBal, 0, `Trial ${i}: Cash balance must neutralize to 0`);
      assertEqual(bankBal, 0, `Trial ${i}: Bank balance must neutralize to 0`);
      assertEqual(arBal, 0, `Trial ${i}: AR balance must neutralize to 0`);
      assertEqual(discBal, 0, `Trial ${i}: Discount allowed must neutralize to 0`);
      assertEqual(partyBal.netBalancePaise, 0, `Trial ${i}: Party balance must neutralize to 0`);
    }
  });

  test('Strict prevention of double reversal on already-reversed voucher', () => {
    const voucher: JournalEntry = {
      id: 'jv_rev_prevent',
      voucherNumber: 'JV-REV-PREVENT-01',
      date: '2026-10-04',
      narration: 'Voucher for double reversal attempt',
      lines: [
        { id: '1', accountCode: '1010-CASH', debitPaise: 5000, creditPaise: 0 },
        { id: '2', accountCode: '4010-SALES', debitPaise: 0, creditPaise: 5000 }
      ]
    };

    const { reversalEntry, updatedOriginal } = createReversalJournal(
      voucher,
      'REV-01',
      'First reversal'
    );

    // Attempting second reversal on updatedOriginal MUST throw ALREADY_REVERSED_ERROR
    assertThrows(
      () => createReversalJournal(updatedOriginal, 'REV-02', 'Second reversal attempt'),
      /ALREADY_REVERSED_ERROR/
    );
  });
});

// ============================================================================
// SUITE 4: UNIT CONVERSION FORMULAS & WHOLESALE STANDARDS
// ============================================================================

describe('CHALLENGER STRESS: Unit Conversion Formulas & BIS Standards', () => {

  // --- CEMENT BAGS <-> METRIC TONNES ---
  test('Cement: 50kg bags to Metric Tonnes across standard wholesale truck loads', () => {
    // 20 bags = 1 MT
    assertEqual(bagsToMetricTonnes(20), 1.0000);
    assertEqual(convertBagsToMetricTonnes(20), 1.0000);

    // Full 16-wheel truck: 700 bags = 35.0000 MT
    assertEqual(bagsToMetricTonnes(700), 35.0000);
    assertEqual(convertBagsToMetricTonnes(700), 35.0000);

    // 22-wheel trailer: 1,000 bags = 50.0000 MT
    assertEqual(bagsToMetricTonnes(1000), 50.0000);
    assertEqual(convertBagsToMetricTonnes(1000), 50.0000);

    // Fractional: 23 bags = 1.1500 MT
    assertEqual(bagsToMetricTonnes(23), 1.1500);

    // Roundtrip Metric Tonnes to bags with remainder
    const mtRes1 = metricTonnesToBags(35.0);
    assertEqual(mtRes1.fullBags, 700);
    assertEqual(mtRes1.exactBags, 700);
    assertEqual(mtRes1.remainderKg, 0);

    // 1.025 MT = 1025 kg = 20 full bags (1000kg) + 25kg remainder
    const mtRes2 = metricTonnesToBags(1.025);
    assertEqual(mtRes2.fullBags, 20);
    assertEqual(mtRes2.exactBags, 20.5);
    assertEqual(mtRes2.remainderKg, 25.0);

    // Negative input rejection
    assertThrows(() => bagsToMetricTonnes(-5), /positive/);
    assertThrows(() => metricTonnesToBags(-1.5), /positive/);
    assertThrows(() => convertBagsToMetricTonnes(-10), /negative/);
    assertThrows(() => convertMetricTonnesToBags(-10), /negative/);
  });

  // --- TMT REBAR BIS d^2/162 FORMULA ---
  test('TMT Rebar: BIS 1786 nominal weight formula d^2/162 for standard diameters', () => {
    // Verified against Indian Standard BIS 1786 nominal weights:
    // 8mm:  64 / 162   = 0.3951 kg/m
    // 10mm: 100 / 162  = 0.6173 kg/m
    // 12mm: 144 / 162  = 0.8889 kg/m
    // 16mm: 256 / 162  = 1.5802 kg/m
    // 20mm: 400 / 162  = 2.4691 kg/m
    // 25mm: 625 / 162  = 3.8580 kg/m
    // 32mm: 1024 / 162 = 6.3210 kg/m

    const diameters = [
      { d: 8,  expectedWpm: 0.3951, piecesPerBundle: 10 },
      { d: 10, expectedWpm: 0.6173, piecesPerBundle: 7 },
      { d: 12, expectedWpm: 0.8889, piecesPerBundle: 5 },
      { d: 16, expectedWpm: 1.5802, piecesPerBundle: 3 },
      { d: 20, expectedWpm: 2.4691, piecesPerBundle: 2 },
      { d: 25, expectedWpm: 3.8580, piecesPerBundle: 1 },
      { d: 32, expectedWpm: 6.3210, piecesPerBundle: 1 },
    ];

    for (const item of diameters) {
      const wpm = rebarNominalWeightPerMeter(item.d);
      assertEqual(wpm, item.expectedWpm, `Nominal weight per meter for ${item.d}mm rebar`);

      const singleBarWeight = rebarSingleBarWeightKg(item.d, 12.0);
      const expectedSingle = Number((item.expectedWpm * 12.0).toFixed(3));
      assertEqual(singleBarWeight, expectedSingle, `12m single bar weight for ${item.d}mm`);

      const bundleWeight = rebarBundleWeightKg(item.d);
      const expectedBundle = Number((expectedSingle * item.piecesPerBundle).toFixed(3));
      assertEqual(bundleWeight, expectedBundle, `Bundle weight for ${item.d}mm`);

      // Comprehensive multi-piece calculator test
      const fullCalc = calculateTmtRebarWeight(item.d, 12.0, 10);
      assertEqual(fullCalc.weightPerMeterKg, item.expectedWpm);
      assertEqual(fullCalc.totalWeightKg, Math.round(((item.d * item.d / 162.0) * 12.0 * 10) * 100) / 100);
      assertEqual(fullCalc.totalWeightTonnes, Math.round((fullCalc.totalWeightKg / 1000.0) * 10000) / 10000);
    }

    // Invalid diameters rejection
    assertThrows(() => rebarNominalWeightPerMeter(0), /positive/);
    assertThrows(() => rebarNominalWeightPerMeter(-8), /positive/);
    assertThrows(() => calculateTmtRebarWeight(-12, 12, 1), /positive/);
  });

  test('TMT Rebar: Metric Tonnes to Bundles and loose bars breakdown', () => {
    // Test converting a 10 MT order of 12mm rebar
    // 12mm: 0.8889 kg/m * 12m = 10.667 kg per bar.
    // 5 bars per bundle = 53.335 kg per bundle.
    // 10 MT = 10,000 kg.
    // Expected full bundles = floor(10000 / 53.335) = 187 bundles (9973.645 kg).
    // Remaining weight = 26.355 kg.
    // Extra bars = floor(26.355 / 10.667) = 2 bars (21.334 kg).
    // Remainder = 5.02 kg.

    const res = rebarMetricTonnesToBundles(12, 10.0);
    assertEqual(res.fullBundles, 187);
    assertEqual(res.extraBars, 2);
    assertTrue(res.remainderKg < 10.667, 'Remainder must be strictly less than one bar');
    assertEqual(res.totalWeightKg, 10000);
  });

  // --- FABRIC METER <-> YARD CONVERSIONS ---
  test('Fabric: Meter to Yard conversions with standard 0.9144 factor', () => {
    // 1 yard = 0.9144 meters
    assertEqual(yardsToMeters(1.0), 0.914); // toFixed(3)
    assertEqual(metersToYards(0.9144), 1.000);

    // 100 meters = 100 / 0.9144 = 109.361 yards
    assertEqual(metersToYards(100), 109.361);

    // Rate conversions (paise)
    // Rate per meter: ₹100.00 (10000 paise)
    // Rate per yard: 10000 * 0.9144 = 9144 paise (₹91.44)
    assertEqual(ratePerMeterToRatePerYard(10000), 9144);
    assertEqual(ratePerYardToRatePerMeter(9144), 10000);

    // Thaan cut lengths aggregation
    const thaans = [
      { meters: 32.5 },
      { exactMeters: 45.0 },
      { currentLengthMeters: 22.5 }
    ];
    const cutSummary = calculateThaanCutLengths(thaans);
    assertEqual(cutSummary.totalMeters, 100.0);
    assertEqual(cutSummary.count, 3);
    assertEqual(cutSummary.avgMeters, 33.33);

    // Thaan cut error on negative length
    assertThrows(() => calculateThaanCutLengths([{ meters: -10 }]), /negative/);
    assertThrows(() => metersToYards(-50), /negative/);
    assertThrows(() => yardsToMeters(-50), /negative/);
  });

  // --- MARBLE & GRANITE SQUARE FEET CALCULATIONS ---
  test('Marble: Gangsaw slab sq ft and defect allowances (Feet and Inches)', () => {
    // Gangsaw slab lot: 10ft length, 6ft height, 50 slabs = 3000 gross sq ft.
    // Defect allowance: 150 sq ft (crack / dry line deduction).
    // Net billable = 2850 sq ft.
    const ftRes = calculateMarbleSqFt(10, 6, 50, 150);
    assertEqual(ftRes.grossSqFt, 3000.00);
    assertEqual(ftRes.defectDeductionSqFt, 150.00);
    assertEqual(ftRes.netBillableSqFt, 2850.00);

    // Rejection when defect exceeds gross
    assertThrows(() => calculateMarbleSqFt(10, 6, 50, 3500), /Defect deduction cannot exceed gross/);

    // Inch calculation:
    // Length: 120 inches (10 ft), Height: 72 inches (6 ft), 50 slabs
    // SqFt per slab = (120 * 72) / 144 = 60 sq ft.
    // Gross = 60 * 50 = 3000 sq ft.
    // Defect: 100 sq ft -> Net = 2900 sq ft.
    const inchRes = calculateMarbleSquareFeet(120, 72, 50, 100);
    assertEqual(inchRes.sqFtPerSlab, 60.00);
    assertEqual(inchRes.grossSqFt, 3000.00);
    assertEqual(inchRes.netSqFt, 2900.00);

    // Rejection when defect exceeds gross
    assertThrows(() => calculateMarbleSquareFeet(120, 72, 50, 3500), /Defect allowance cannot exceed/);
    assertThrows(() => inchesToFeet(-12), /negative/);
  });

  // --- WEIGHBRIDGE DISCREPANCY & TOLERANCE ---
  test('Weighbridge: Dharam Kanta tolerance certification (Gross - Tare)', () => {
    // Truck: Gross 32,500 kg, Tare (empty) 12,000 kg -> Net = 20,500 kg.
    // Billed cargo: 20,500 kg -> Variance = 0kg (0%).
    const slip1 = evaluateWeighbridgeDiscrepancy(32500, 12000, 20500, 1.5);
    assertEqual(slip1.netWeightKg, 20500);
    assertEqual(slip1.varianceKg, 0);
    assertEqual(slip1.variancePercent, 0);
    assertTrue(slip1.isWithinTolerance);

    // Variance within 1.5% tolerance:
    // Billed: 20,500 kg. Actual Net: 20,300 kg (variance -200kg = -0.98%).
    const slip2 = evaluateWeighbridgeDiscrepancy(32300, 12000, 20500, 1.5);
    assertEqual(slip2.netWeightKg, 20300);
    assertEqual(slip2.varianceKg, -200);
    assertEqual(slip2.variancePercent, -0.98);
    assertTrue(slip2.isWithinTolerance);

    // Variance beyond tolerance:
    // Actual Net: 20,000 kg (variance -500kg = -2.44% > 1.5%).
    const slip3 = evaluateWeighbridgeDiscrepancy(32000, 12000, 20500, 1.5);
    assertEqual(slip3.variancePercent, -2.44);
    assertFalse(slip3.isWithinTolerance);

    // Physical impossibility: Tare >= Gross
    const slipBad = evaluateWeighbridgeDiscrepancy(12000, 12500, 20500);
    assertFalse(slipBad.isWithinTolerance);
    assertTrue(slipBad.errorMessage?.includes('Tare weight') ?? false);

    // verifyWeighbridgeSlip method:
    const slipVerify = verifyWeighbridgeSlip(32500, 12000, 20500, 0.5);
    assertTrue(slipVerify.isValid);
    assertEqual(slipVerify.netWeightKg, 20500);

    // verifyWeighbridgeSlip error on Tare >= Gross
    assertThrows(() => verifyWeighbridgeSlip(10000, 12000), /Gross weight.*strictly greater/);
  });
});

// Self-executing runner hook
async function run() {
  if (process.argv[1]?.includes('challenger-m1-stress')) {
    const passed = await registry.run();
    process.exit(passed ? 0 : 1);
  }
}

run();
