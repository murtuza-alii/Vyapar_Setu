/**
 * Tier 4 - Real-World Application Scenarios Test Suite (Vyapar Setu E2E Test Infra)
 * 
 * Tests multi-step end-to-end realistic wholesale business workflows:
 * - Scenario 1: Jaipur Textile Merchant Onboarding & Order Fulfillment
 * - Scenario 2: Kishangarh Marble Gangsaw Dispatch & Weighbridge Verification
 * - Scenario 3: Bhilwara Suiting Concurrency & Thaan Reservation Conflict Resolution
 * - Scenario 4: Basement Godown Offline Transaction Booking & Outbox Sync Flush
 * - Scenario 5: "The Textile Deal" 5-Step Foundational Journey
 */

import {
  describe,
  test,
  assertEqual,
  assertTrue,
  assertFalse,
  assertDefined,
  assertNull,
  assertCloseTo,
  assertLength,
} from './test-runner.js';

import {
  TextileThaan,
  calculateThaanCutLengths,
  lockThaanReservation,
  releaseThaanReservation,
  calculateMarbleSquareFeet,
  verifyWeighbridgeSlip,
  rupeesToPaise,
  validateJournalEntry,
  validateAndPostJournal,
  JournalEntry,
  InMemoryStorageAdapter,
  redactDealForGodown,
  generateClusterSeedData,
} from './helpers/foundation.js';

describe('Tier 4 - Real-World Application Workflows', () => {
  test('Scenario 1: Jaipur Textile Merchant Onboarding & Morning Order Fulfillment', async () => {
    // Step 1: Initialize local storage with Jaipur cluster seed
    const storage = new InMemoryStorageAdapter();
    const jaipurSeed = generateClusterSeedData('JAIPUR');
    
    for (const p of jaipurSeed.parties) {
      await storage.put('parties', p);
    }
    for (const sku of jaipurSeed.textileInventory) {
      await storage.put('inventory', sku);
    }

    // Step 2: Customer 'Mahalaxmi Cloth Emporium' places order for 2 thaans of Cotton Cambric (LOT-JPR-881)
    const party = await storage.get<any>('parties', 'pty-jpr-01');
    assertDefined(party);
    assertEqual(party.name, 'Mahalaxmi Cloth Emporium');

    const sku = await storage.get<any>('inventory', 'sku-jpr-01');
    assertDefined(sku);
    assertEqual(sku.thaanList.length, 2);

    // Step 3: Munim locks both thaans for Deal #DEAL-JPR-2026-001
    const dealId = 'DEAL-JPR-2026-001';
    const lock1 = lockThaanReservation(sku.thaanList[0], dealId);
    const lock2 = lockThaanReservation(sku.thaanList[1], dealId);
    assertTrue(lock1.success && lock2.success, 'Both thaans must be successfully locked');

    // Step 4: Calculate exact cut length meters: 30.5m + 29.8m = 60.3m
    const pickedThaans: TextileThaan[] = [lock1.updatedThaan, lock2.updatedThaan];
    const cutSummary = calculateThaanCutLengths(pickedThaans);
    assertEqual(cutSummary.totalMeters, 60.3);

    // Step 5: Compute order financial value: 60.3m @ ₹185/m = ₹11,155.50 = 1,115,550 paise
    const ratePaise = sku.wholesaleRatePaise; // 18,500 paise
    const totalOrderPaise = Math.round(cutSummary.totalMeters * ratePaise);
    assertEqual(totalOrderPaise, 1115550);

    // Step 6: Post double-entry sale voucher (Debit Customer AR, Credit Fabric Revenue)
    const saleVoucher: JournalEntry = {
      id: 'jv-jpr-sale-01',
      voucherNumber: 'JV-2026-JPR-002',
      date: '2026-10-04',
      narration: `Sale of 60.3m Cotton Cambric to ${party.name}`,
      referenceDealId: dealId,
      referencePartyId: party.id,
      lines: [
        {
          id: 'jl-1',
          accountCode: '1200-AR',
          accountName: `AR - ${party.name}`,
          debitPaise: totalOrderPaise,
          creditPaise: 0,
        },
        {
          id: 'jl-2',
          accountCode: '4010-SALES-TEXTILE',
          accountName: 'Fabric Sales Revenue',
          debitPaise: 0,
          creditPaise: totalOrderPaise,
        },
      ],
    };

    const postResult = validateAndPostJournal(saleVoucher);
    assertTrue(postResult.success);
    assertEqual(postResult.entry!.lines[0].debitPaise, 1115550);
    assertEqual(postResult.entry!.lines[1].creditPaise, 1115550);
  });

  test('Scenario 2: Kishangarh Marble Gangsaw Dispatch & Weighbridge Verification', async () => {
    // Step 1: Wholesaler receives order for 50 slabs of 18mm Morwad White Marble
    // Slab dimensions: 72 inches length x 48 inches height (24.0 sqft per slab)
    // Slabs count: 50. Total gross: 1,200 sqft. Defect allowance: 35 sqft. Net: 1,165 sqft.
    const marbleCalc = calculateMarbleSquareFeet(72, 48, 50, 35);
    assertEqual(marbleCalc.netSqFt, 1165.0);

    // Rate: ₹65/sqft. Total value: 1,165 * ₹65 = ₹75,725 = 7,572,500 paise
    const ratePaise = rupeesToPaise(65);
    const invoiceTotalPaise = marbleCalc.netSqFt * ratePaise;
    assertEqual(invoiceTotalPaise, 7572500);

    // Step 2: Truck loads at gangsaw yard and drives onto Dharam Kanta weighbridge
    // Empty truck tare = 14,200 kg. Gross weight = 24,700 kg -> Net weight = 10,500 kg (10.5 MT)
    const weighbridgeSlip = verifyWeighbridgeSlip(24700, 14200, 10500, 0.5);
    assertTrue(weighbridgeSlip.isValid);
    assertEqual(weighbridgeSlip.netWeightKg, 10500);

    // Step 3: Godown Dispatcher prepares picking slip with financial redaction
    const commercialDeal = {
      id: 'deal-ksg-101',
      dealNumber: 'SO-MRB-2026-042',
      customerName: 'Rajasthan Builders',
      totalAmount: 75725,
      margin: {
        grossRevenue: 75725,
        landedCost: 55920,
        netProfit: 19805,
      },
      items: [
        {
          id: 'item-1',
          name: 'Morwad White Marble Slabs 18mm',
          quantity: 50,
          rate: 65,
          subtotal: 75725,
        },
      ],
    };

    const redactedSlip = redactDealForGodown(commercialDeal);
    assertNull(redactedSlip.totalAmount ?? null);
    assertNull(redactedSlip.margin ?? null);
    assertNull(redactedSlip.items[0].rate ?? null);
    assertEqual(redactedSlip.items[0].quantity, 50); // Picker only sees physical quantity!
  });

  test('Scenario 3: Bhilwara Suiting Concurrency & Thaan Reservation Conflict Resolution', () => {
    // Step 1: Catalog has roll T-301 available (50m Charcoal Suiting)
    const thaan: TextileThaan = {
      id: 'th-bhl-301',
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
    };

    // Step 2: Munim A locks roll for Buyer 1 (Deal A)
    const lockDealA = lockThaanReservation(thaan, 'DEAL-A-101');
    assertTrue(lockDealA.success);
    assertEqual(lockDealA.updatedThaan.status, 'RESERVED');

    // Step 3: Munim B simultaneously attempts to lock roll for Buyer 2 (Deal B)
    const lockDealB = lockThaanReservation(lockDealA.updatedThaan, 'DEAL-B-202');
    assertFalse(lockDealB.success, 'Concurrent reservation on same roll MUST fail');
    assertTrue(lockDealB.error!.includes('already reserved for deal DEAL-A-101'));

    // Step 4: Buyer 1 cancels transaction -> Munim A releases reservation
    const releaseDealA = releaseThaanReservation(lockDealA.updatedThaan, 'DEAL-A-101');
    assertTrue(releaseDealA.success);
    assertEqual(releaseDealA.updatedThaan.status, 'AVAILABLE');

    // Step 5: Munim B can now successfully lock the roll for Buyer 2
    const retryDealB = lockThaanReservation(releaseDealA.updatedThaan, 'DEAL-B-202');
    assertTrue(retryDealB.success, 'Subsequent lock succeeds after release');
    assertEqual(retryDealB.updatedThaan.status, 'RESERVED');
    assertEqual(retryDealB.updatedThaan.reservedForDealId, 'DEAL-B-202');
  });

  test('Scenario 4: Basement Godown Offline Transaction Booking & Outbox Sync Flush', async () => {
    const storage = new InMemoryStorageAdapter();

    // Step 1: Wholesaler books cash transaction while completely offline in basement
    const offlineAction = await storage.enqueueOutboxAction({
      entityType: 'PAYMENT',
      operation: 'CREATE',
      payload: {
        receiptNumber: 'RCP-OFFLINE-77',
        partyId: 'pty-offline-1',
        amountPaise: 2500000, // ₹25,000 cash
        accountCode: '1010-CASH',
      },
    });

    assertDefined(offlineAction.id);
    assertEqual(offlineAction.syncStatus, 'PENDING');

    // Step 2: Munim steps outside godown into network reception -> Outbox sync worker triggers
    const pendingActions = await storage.getOutboxActions('PENDING');
    assertLength(pendingActions, 1);

    // Step 3: Sync worker marks status as SYNCING
    const inFlight = pendingActions[0];
    inFlight.syncStatus = 'SYNCING';
    await storage.updateOutboxAction(inFlight);

    // Step 4: Remote API confirms receipt -> marked as SYNCED
    inFlight.syncStatus = 'SYNCED';
    await storage.updateOutboxAction(inFlight);

    // Step 5: Verify outbox queue state
    const remainingPending = await storage.getOutboxActions('PENDING');
    assertLength(remainingPending, 0);

    const completed = await storage.getOutboxActions('SYNCED');
    assertLength(completed, 1);
    assertEqual(completed[0].id, offlineAction.id);
  });

  test('Scenario 5: "The Textile Deal" 5-Step Foundational Journey Walkthrough', () => {
    // Step 1: Morning Briefing: Ramesh-ji checks receivables
    const partyBalancePaise = 32000000; // ₹3,20,000 receivable
    assertTrue(partyBalancePaise > 0);

    // Step 2: Retailer calls for 40 thaans Cotton Cambric Lot 104 @ ₹180/m
    const ratePerMeterPaise = rupeesToPaise(180);
    assertEqual(ratePerMeterPaise, 18000);

    // Step 3: Stock reservation locks discrete thaans in godown
    const sampleThaan: TextileThaan = {
      id: 'th-lot104-01',
      skuId: 'sku-lot104',
      lotNo: 'LOT-104',
      thaanNo: 'T-01',
      meters: 30.0,
      initialMeters: 30.0,
      widthInches: 44,
      shadeCode: 'WHT-01',
      fabricGrade: 'Fresh-A',
      isCutPiece: false,
      status: 'AVAILABLE',
    };
    const locked = lockThaanReservation(sampleThaan, 'DEAL-RAMESH-01');
    assertTrue(locked.success);

    // Step 4: Advance received ₹15,000 logged via double-entry
    const advanceVoucher: JournalEntry = {
      id: 'jv-adv-01',
      voucherNumber: 'JV-ADV-2026-001',
      date: '2026-10-04',
      narration: 'Advance received for Cotton Cambric Sauda via UPI',
      lines: [
        {
          id: 'jl-1',
          accountCode: '1020-BANK-UPI',
          accountName: 'Bank UPI Current A/c',
          debitPaise: 1500000, // ₹15,000
          creditPaise: 0,
        },
        {
          id: 'jl-2',
          accountCode: '1200-AR-ADVANCE',
          accountName: 'Customer Advance Liability',
          debitPaise: 0,
          creditPaise: 1500000,
        },
      ],
    };

    const val = validateJournalEntry(advanceVoucher);
    assertTrue(val.isValid);
    assertEqual(val.discrepancyPaise, 0);

    // Step 5: True Net Deal Margin Foundation:
    // Revenue (₹2,16,000) - COGS (₹1,94,400) - Freight & Hamali (₹4,200) = ₹17,400 Clean Profit
    const revenuePaise = rupeesToPaise(216000);
    const cogsPaise = rupeesToPaise(194400);
    const logisticsPaise = rupeesToPaise(4200);
    const netProfitPaise = revenuePaise - cogsPaise - logisticsPaise;

    assertEqual(netProfitPaise, rupeesToPaise(17400)); // ₹17,400 Profit
    const netMarginPercent = (netProfitPaise / revenuePaise) * 100;
    assertCloseTo(netMarginPercent, 8.055, 0.01); // Healthy > 5% margin
  });
});
