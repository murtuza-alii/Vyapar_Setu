/**
 * tests/adversarial-m1-challenge.test.ts
 * Empirical Adversarial Test Harness for Vyapar Setu Milestone 1
 * 
 * Conducts stress testing across 4 core challenge vectors:
 * 1. RBAC Information Leakage & Redaction Bypass (Godown / Partner leakages)
 * 2. Storage Fallback Resilience (Headless Node, QuotaExceeded, corrupt IndexedDB)
 * 3. Outbox Queue Ordering, Deduplication, & Exponential Backoff calculations
 * 4. Thaan/Lot Reservation Race Conditions & Double-Allocation Locking
 */

import {
  describe,
  test,
  assertEqual,
  assertNotEqual,
  assertTrue,
  assertFalse,
  assertDeepEqual,
  assertThrows,
  assertDefined,
  assertNull,
  assertCloseTo,
  assertBetween,
  assertLength,
} from './test-runner.js';

import {
  redactDealForGodown,
  redactDealForRole,
  redactInventoryForGodown,
  redactPartyForRole,
  canViewFinancialMargins,
  canApproveCreditOverride,
  canViewCostPricing,
  canModifyInventory,
  canPostDoubleEntryLedger,
  hasPermission,
  ROLE_PERMISSIONS,
} from '../src/modules/foundation/rbac';

import {
  createStorageAdapter,
  MemoryStorageDriver,
  LocalStorageDriver,
  IndexedDBDriver,
  storage,
} from '../src/db/storage';

import {
  OutboxQueue,
  outbox,
} from '../src/db/outbox';

import {
  lockThaanReservation,
  releaseThaanReservation,
  TextileThaan,
} from './helpers/foundation';

import { Party, UserRole } from '../src/types/common';
import { DealCard } from '../src/types/order-tower';
import { TextileSKU } from '../src/types/trade-schemas';

// ============================================================================
// SUITE 1: RBAC INFORMATION LEAKAGE & FINANCIAL REDACTION BYPASS
// ============================================================================
describe('Adversarial Suite 1: RBAC Information Leakage & Redaction Bypass', () => {

  test('ADV-RBAC-01: Leakage Check - Godown & Partner Party object sanitization', () => {
    const sensitiveParty: Party = {
      id: 'pty-leak-01',
      businessName: 'Agrawal Fabrics & Sarees',
      contactPerson: 'Mukesh Agrawal',
      phone: '+919829011111',
      address: {
        addressLine1: 'Shop 42, Purohit Ji Ka Katla',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302002',
      },
      role: 'CUSTOMER',
      tradeModePreference: 'TEXTILE',
      creditLimitPaisa: 50000000,          // ₹5,00,000 (CONFIDENTIAL)
      creditPeriodDays: 30,
      currentBalancePaisa: 32500000,       // ₹3,25,000 dues (CONFIDENTIAL)
      totalReceivablePaisa: 40000000,      // (CONFIDENTIAL)
      totalPayablePaisa: 7500000,          // (CONFIDENTIAL)
      bankDetails: {                       // (CONFIDENTIAL BANK INFO)
        bankName: 'HDFC Bank',
        accountNumber: '50200012345678',
        ifscCode: 'HDFC0000123',
        branchName: 'M.I. Road, Jaipur',
        accountType: 'CURRENT',
      },
      upiVpa: 'agrawalfabrics@okhdfcbank', // (CONFIDENTIAL)
      gstin: '08ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      isActive: true,
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
      syncStatus: 'SYNCED',
    };

    // Test GODOWN redaction
    const godownView = redactPartyForRole(sensitiveParty, 'GODOWN') as any;
    assertEqual(godownView.creditLimitPaisa, undefined, 'Godown must NOT see creditLimitPaisa');
    assertEqual(godownView.currentBalancePaisa, undefined, 'Godown must NOT see currentBalancePaisa');
    assertEqual(godownView.totalReceivablePaisa, undefined, 'Godown must NOT see totalReceivablePaisa');
    assertEqual(godownView.totalPayablePaisa, undefined, 'Godown must NOT see totalPayablePaisa');
    assertEqual(godownView.bankDetails, undefined, 'Godown must NOT see bankDetails');
    assertEqual(godownView.upiVpa, undefined, 'Godown must NOT see upiVpa');

    // Test PARTNER redaction
    const partnerView = redactPartyForRole(sensitiveParty, 'PARTNER') as any;
    assertEqual(partnerView.creditLimitPaisa, undefined, 'Partner must NOT see internal creditLimitPaisa');
    assertEqual(partnerView.currentBalancePaisa, undefined, 'Partner must NOT see internal dues');
    assertEqual(partnerView.bankDetails, undefined, 'Partner must NOT see internal bankDetails');
  });

  test('ADV-RBAC-02: Leakage Check - CreditVerification dues inside DealCard', () => {
    // A wholesale deal at Stage 2 or 3 contains CreditVerification details
    const dealWithCredit: DealCard = {
      id: 'deal-credit-leak-01',
      dealNumber: 'SAUDA-2026-LEAK-01',
      tradeMode: 'TEXTILE',
      partyId: 'pty-01',
      partyName: 'Rajputana Textiles',
      partyCity: 'Jaipur',
      partyPhone: '+919829000001',
      stage: 'STAGE_3_STOCK_PICKING',
      subtotalPaisa: 5000000,
      taxPaisa: 250000,
      totalDealAmountPaisa: 5250000,
      advanceReceivedPaisa: 1000000,
      balanceDuePaisa: 4250000,
      items: [
        {
          id: 'item-1',
          skuId: 'sku-1',
          itemName: 'Cotton Cambric 60x60',
          itemDetails: 'Shade SH-01',
          industryMode: 'TEXTILE',
          orderedQuantity: 100,
          unit: 'meters',
          unitSellingRatePaisa: 5000,
          unitLandedCostPaisa: 3800,
          subtotalPaisa: 500000,
        },
      ],
      marginAudit: {
        grossRevenuePaisa: 500000,
        landedCogsPaisa: 380000,
        loadingHamaliExpensePaisa: 2000,
        outboundFreightExpensePaisa: 5000,
        cashDiscountAllowedPaisa: 10000,
        dalaliBrokerageExpensePaisa: 5000,
        packagingMaterialExpensePaisa: 3000,
        unrecoveredShortageLossPaisa: 0,
        totalDeductionsPaisa: 405000,
        trueNetProfitPaisa: 95000,
        netMarginPercentage: 19.0,
        profitBand: 'HEALTHY_PROFIT',
        requiresMukhiyaSignoff: false,
      },
      // SENSITIVE CREDIT VERIFICATION & DUES DATA
      creditVerification: {
        authorizedCreditLimitPaisa: 50000000,
        currentOutstandingReceivablePaisa: 38500000, // ₹3,85,000 outstanding dues!
        proposedExposurePaisa: 43750000,
        isOverdueAgingBlocked: false,
        approvalStatus: 'AUTO_APPROVED',
        advancePaidPaisa: 1000000,
      },
    };

    const redacted = redactDealForGodown(dealWithCredit);

    // Primary totals and margins must be deleted
    assertEqual(redacted.subtotalPaisa, undefined, 'subtotalPaisa must be stripped');
    assertEqual(redacted.totalDealAmountPaisa, undefined, 'totalDealAmountPaisa must be stripped');
    assertEqual(redacted.marginAudit, undefined, 'marginAudit must be stripped');
    assertEqual(redacted.items[0].unitSellingRatePaisa, undefined, 'unitSellingRatePaisa must be stripped');
    assertEqual(redacted.items[0].unitLandedCostPaisa, undefined, 'unitLandedCostPaisa must be stripped');

    // EMPIRICAL CHALLENGE: Did creditVerification leak customer outstanding dues?
    const leakedDues = redacted.creditVerification?.currentOutstandingReceivablePaisa;
    console.log(`    [CHALLENGE OBSERVATION] creditVerification after redactDealForGodown:`, 
      redacted.creditVerification ? `EXISTS (leaked outstanding dues: ${leakedDues} paise)` : 'CLEANLY REDACTED');
    
    // STRICT INVARIANT: Godown staff must NEVER access customer outstanding dues or credit limits
    assertEqual(
      redacted.creditVerification?.currentOutstandingReceivablePaisa, 
      undefined, 
      'VULNERABILITY CONFIRMED: Customer outstanding receivables leaked to Godown staff via creditVerification'
    );
  });

  test('ADV-RBAC-03: Leakage Check - Textile SKU minFloorRatePerMeterPaisa', () => {
    const rawInventoryItem: any = {
      id: 'sku-fl-01',
      designNo: 'JPR-D-88',
      fabricName: 'Chanderi Silk Saree Greige',
      costRatePaise: 12000,
      wholesaleRatePaise: 16000,
      minFloorRatePaisa: 14000,
      minFloorRatePerMeterPaisa: 14000, // Specific alias in TextileSKU
      totalMeters: 500,
    };

    const sanitizedList = redactInventoryForGodown([rawInventoryItem]);
    const item = sanitizedList[0];

    assertEqual(item.costRatePaise, undefined, 'costRatePaise stripped');
    assertEqual(item.wholesaleRatePaise, undefined, 'wholesaleRatePaise stripped');
    assertEqual(item.minFloorRatePaisa, undefined, 'minFloorRatePaisa stripped');

    // EMPIRICAL CHALLENGE: Does minFloorRatePerMeterPaisa survive?
    const leakedFloor = item.minFloorRatePerMeterPaisa;
    console.log(`    [CHALLENGE OBSERVATION] minFloorRatePerMeterPaisa after redactInventoryForGodown:`,
      leakedFloor !== undefined ? `LEAKED (${leakedFloor} paise)` : 'CLEANLY REDACTED');

    // STRICT INVARIANT: Godown staff must NOT see minimum floor rate per meter
    assertEqual(
      item.minFloorRatePerMeterPaisa,
      undefined,
      'VULNERABILITY CONFIRMED: minFloorRatePerMeterPaisa leaked to Godown staff'
    );
  });

  test('ADV-RBAC-04: Predicate Guards - Absolute denial for GODOWN and PARTNER', () => {
    const roles: UserRole[] = ['GODOWN', 'PARTNER'];
    for (const r of roles) {
      assertFalse(canViewFinancialMargins(r), `${r} must NOT view financial margins`);
      assertFalse(canViewCostPricing(r), `${r} must NOT view cost pricing`);
      assertFalse(canApproveCreditOverride(r), `${r} must NOT approve credit overrides`);
      assertFalse(canPostDoubleEntryLedger(r), `${r} must NOT post to double entry ledger`);
      assertFalse(hasPermission(r, 'VIEW_FINANCIAL_MARGINS'), `${r} lacks VIEW_FINANCIAL_MARGINS`);
      assertFalse(hasPermission(r, 'VIEW_PURCHASE_COSTS'), `${r} lacks VIEW_PURCHASE_COSTS`);
      assertFalse(hasPermission(r, 'VIEW_SELLING_RATES'), `${r} lacks VIEW_SELLING_RATES`);
      assertFalse(hasPermission(r, 'VIEW_BANK_BALANCES'), `${r} lacks VIEW_BANK_BALANCES`);
    }
  });
});

// ============================================================================
// SUITE 2: STORAGE FALLBACK RESILIENCE & EDGE CASES
// ============================================================================
describe('Adversarial Suite 2: Storage Fallback Resilience', () => {

  test('ADV-STR-01: Headless Node Environment - Auto-selection of MemoryStorageDriver', async () => {
    // In tsx/Node runtime, window and indexedDB do not exist
    const adapter = createStorageAdapter();
    assertEqual(adapter.getDriverName(), 'memory', 'Adapter must auto-select memory driver in Node');

    // Full CRUD lifecycle verification
    await adapter.put('test_col', { id: 'item-101', name: 'Cotton Cambric', qty: 50 });
    const fetched = await adapter.get<any>('test_col', 'item-101');
    assertDefined(fetched);
    assertEqual(fetched.name, 'Cotton Cambric');

    // Update
    await adapter.put('test_col', { id: 'item-101', name: 'Cotton Cambric Dyed', qty: 45 });
    const updated = await adapter.get<any>('test_col', 'item-101');
    assertEqual(updated.name, 'Cotton Cambric Dyed');
    assertEqual(updated.qty, 45);

    // Delete
    await adapter.delete('test_col', 'item-101');
    const deleted = await adapter.get<any>('test_col', 'item-101');
    assertNull(deleted);
  });

  test('ADV-STR-02: Storage Immutability - Mutations to fetched objects do not corrupt store', async () => {
    const mem = new MemoryStorageDriver();
    const original = { id: 'item-imm-1', data: { price: 100, tags: ['a', 'b'] } };
    await mem.put('imm_test', original);

    // Fetch and mutate returned object
    const fetched = await mem.get<any>('imm_test', 'item-imm-1');
    assertDefined(fetched);
    fetched.data.price = 999999;
    fetched.data.tags.push('c');

    // Re-fetch should have untouched original values
    const reFetched = await mem.get<any>('imm_test', 'item-imm-1');
    assertEqual(reFetched.data.price, 100, 'Original price in store must remain 100');
    assertLength(reFetched.data.tags, 2, 'Original tags length must remain 2');
  });

  test('ADV-STR-03: LocalStorageDriver Resilience when storage quota exceeded or unavailable', async () => {
    // Create LocalStorageDriver without global window/localStorage
    const lsDriver = new LocalStorageDriver();
    assertEqual(lsDriver.getDriverName(), 'localstorage');

    // Should fall back cleanly to memory driver without throwing
    await lsDriver.put('fallback_col', { id: 'item-fb-1', val: 42 });
    const fetched = await lsDriver.get<any>('fallback_col', 'item-fb-1');
    assertDefined(fetched, 'LocalStorageDriver must retrieve item from memoryFallback');
    assertEqual(fetched.val, 42);

    const all = await lsDriver.getAll<any>('fallback_col');
    assertLength(all, 1);
  });

  test('ADV-STR-04: IndexedDBDriver Graceful Fallback when indexedDB is undefined', async () => {
    const idbDriver = new IndexedDBDriver();
    assertEqual(idbDriver.getDriverName(), 'indexeddb');

    // Putting into idbDriver in headless environment must fall back without throwing unhandled rejection
    let didThrow = false;
    try {
      await idbDriver.put('idb_col', { id: 'idb-1', name: 'Test' });
      const item = await idbDriver.get<any>('idb_col', 'idb-1');
      assertDefined(item, 'Item must be stored and retrieved via memoryFallback');
      assertEqual(item.name, 'Test');
    } catch (err: any) {
      didThrow = true;
      console.log(`    [CHALLENGE OBSERVATION] IndexedDBDriver threw: ${err.message}`);
    }
    assertFalse(didThrow, 'IndexedDBDriver must not throw fatal unhandled errors in headless mode');
  });
});

// ============================================================================
// SUITE 3: OUTBOX QUEUE ORDERING, DEDUPLICATION, & BACKOFF
// ============================================================================
describe('Adversarial Suite 3: Outbox Queue Ordering, Deduplication, & Backoff', () => {

  test('ADV-OUT-01: Deduplication Challenge - Multiple identical mutation enqueues', async () => {
    const memStore = new MemoryStorageDriver();
    const queue = new OutboxQueue(memStore);

    // Enqueue identical mutation twice
    const action1 = await queue.enqueue({
      collection: 'deals',
      entityId: 'deal-dedup-1',
      entityType: 'DEAL',
      operation: 'UPDATE',
      payload: { stage: 'STAGE_3_STOCK_PICKING', pickerId: 'usr-42' },
    });

    const action2 = await queue.enqueue({
      collection: 'deals',
      entityId: 'deal-dedup-1',
      entityType: 'DEAL',
      operation: 'UPDATE',
      payload: { stage: 'STAGE_3_STOCK_PICKING', pickerId: 'usr-42' },
    });

    const stats = await queue.getStats();
    console.log(`    [CHALLENGE OBSERVATION] Outbox pending count after duplicate enqueues: ${stats.pendingCount}`);
    
    // Check whether both actions were enqueued with distinct IDs
    assertNotEqual(action1.id, action2.id, 'Actions received distinct IDs');
  });

  test('ADV-OUT-02: Queue Ordering Challenge - Chronological FIFO dependency processing', async () => {
    const memStore = new MemoryStorageDriver();
    const queue = new OutboxQueue(memStore);

    const executionLog: string[] = [];

    // Enqueue 5 ordered actions
    for (let i = 1; i <= 5; i++) {
      await queue.enqueue({
        collection: 'inventory',
        entityId: `item-${i}`,
        operation: 'UPDATE',
        payload: { step: i },
      });
    }

    // Process with mock sync handler
    const result = await queue.processQueue(async (action) => {
      executionLog.push(action.payload.step);
      return true;
    });

    assertEqual(result.processed, 5, 'All 5 actions must be processed');
    assertEqual(result.succeeded, 5, 'All 5 actions must succeed');
    assertDeepEqual(executionLog, [1, 2, 3, 4, 5], 'Actions must be executed in exact FIFO insertion order');
  });

  test('ADV-OUT-03: Exponential Backoff & Retry Bounds Calculation', async () => {
    const memStore = new MemoryStorageDriver();
    const queue = new OutboxQueue(memStore);

    // Enqueue an action destined to fail
    await queue.enqueue({
      collection: 'payments',
      entityId: 'pay-fail-1',
      operation: 'CREATE',
      payload: { amountPaisa: 50000 },
      maxRetries: 3,
    });

    // Attempt 1 -> Failure
    const res1 = await queue.processQueue(async () => {
      throw new Error('Connection refused (ETIMEDOUT)');
    });
    assertEqual(res1.failed, 1);

    const eligibleImmediately = await queue.getEligibleActions();
    assertEqual(eligibleImmediately.length, 0, 'Failed action must not be immediately eligible due to backoff delay');

    const actions = await memStore.getAll<any>('outbox');
    const failedAction = actions[0];
    assertEqual(failedAction.retryCount, 1);
    assertEqual(failedAction.syncStatus, 'FAILED');
    assertDefined(failedAction.nextRetryTimestamp);

    const delay = failedAction.nextRetryTimestamp - failedAction.timestamp;
    // For retryCount = 1: base = 1000 * 2^1 = 2000ms. Jitter: 2000 * 0.2 = ±400ms -> [1600ms, 2400ms]
    console.log(`    [CHALLENGE OBSERVATION] Backoff delay calculated for retry 1: ${delay}ms`);
    assertBetween(delay, 1500, 2600, 'Retry 1 delay should be approximately 2000ms (±20% jitter)');
  });

  test('ADV-OUT-04: Offline State Guard - Zero mutations dispatched when offline', async () => {
    const memStore = new MemoryStorageDriver();
    const queue = new OutboxQueue(memStore);
    queue.setOnlineStatus(false);
    assertFalse(queue.getOnlineStatus(), 'Queue must report offline');

    await queue.enqueue({
      collection: 'orders',
      entityId: 'ord-off-1',
      operation: 'CREATE',
      payload: { test: true },
    });

    let syncAttempted = false;
    const res = await queue.processQueue(async () => {
      syncAttempted = true;
      return true;
    });

    assertFalse(syncAttempted, 'No network sync should be attempted when offline');
    assertEqual(res.processed, 0, 'Processed count must be 0 when offline');

    // Come back online
    queue.setOnlineStatus(true);
    const resOnline = await queue.processQueue(async () => {
      syncAttempted = true;
      return true;
    });
    assertTrue(syncAttempted, 'Sync should proceed once back online');
    assertEqual(resOnline.succeeded, 1, 'Action succeeded after reconnect');
  });
});

// ============================================================================
// SUITE 4: THAAN / LOT RESERVATION RACE CONDITIONS & CONCURRENCY
// ============================================================================
describe('Adversarial Suite 4: Thaan/Lot Reservation Concurrency & Double-Allocation', () => {

  const sampleAvailableThaan: TextileThaan = {
    id: 'th-race-01',
    skuId: 'sku-cambric-60',
    lotNo: 'LOT-JPR-901',
    thaanNo: 'T-901-A',
    meters: 32.5,
    initialMeters: 32.5,
    widthInches: 44,
    shadeCode: 'IND-01',
    fabricGrade: 'Fresh-A',
    isCutPiece: false,
    status: 'AVAILABLE',
  };

  test('ADV-RES-01: Double-Allocation Race - Two concurrent deals attempting same thaan', () => {
    const thaan = { ...sampleAvailableThaan };

    // Deal 1 and Deal 2 both observe thaan in AVAILABLE state
    const deal1Id = 'deal-ramesh-101';
    const deal2Id = 'deal-suresh-202';

    // Simulate concurrent lock attempts
    const lockResult1 = lockThaanReservation(thaan, deal1Id);
    assertTrue(lockResult1.success, 'Deal 1 lock should succeed');
    assertEqual(lockResult1.updatedThaan.reservedForDealId, deal1Id);

    // If Deal 2 tries to reserve the thaan AFTER Deal 1 has updated it:
    const lockResult2OnUpdated = lockThaanReservation(lockResult1.updatedThaan, deal2Id);
    assertFalse(lockResult2OnUpdated.success, 'Deal 2 lock on already reserved thaan MUST FAIL');
    assertDefined(lockResult2OnUpdated.error);

    // CRITICAL RACE CONDITION SIMULATION:
    // If Deal 2 had captured the un-updated snapshot `thaan` before Deal 1 committed:
    const lockResult2OnStaleSnapshot = lockThaanReservation(thaan, deal2Id);
    assertTrue(lockResult2OnStaleSnapshot.success, 'Snapshot-based locking without CAS succeeds on stale state!');
    console.log(`    [CHALLENGE OBSERVATION] Pure functional lock without CAS allows double-reservation if given stale memory snapshot.`);
  });

  test('ADV-RES-02: State Collision - Attempting reservation on SOFT_LOCKED thaan', () => {
    const softLockedThaan: TextileThaan = {
      ...sampleAvailableThaan,
      status: 'SOFT_LOCKED' as any, // 15-minute Vyapar Circle phone lock
      reservedForDealId: 'soft-lock-peer-99',
    };

    // Attempting hard lock
    const res = lockThaanReservation(softLockedThaan, 'deal-competing-01');
    console.log(`    [CHALLENGE OBSERVATION] lockThaanReservation on SOFT_LOCKED thaan result:`,
      res.success ? `ALLOWED (OVERWROTE SOFT LOCK!)` : `REJECTED (${res.error})`);

    // STRICT INVARIANT: Peer soft-lock must NOT be silently overwritten
    assertFalse(
      res.success,
      'VULNERABILITY CONFIRMED: Hard reservation lock overwrote active 15-minute soft lock!'
    );
  });

  test('ADV-RES-03: State Collision - Attempting reservation on PICKED or DISPATCHED thaan', () => {
    const dispatchedThaan: TextileThaan = {
      ...sampleAvailableThaan,
      status: 'DISPATCHED',
      reservedForDealId: 'deal-shipped-01',
    };

    const resDispatched = lockThaanReservation(dispatchedThaan, 'deal-new-02');
    assertFalse(resDispatched.success, 'Cannot reserve DISPATCHED thaan');

    const soldThaan: TextileThaan = {
      ...sampleAvailableThaan,
      status: 'SOLD',
      reservedForDealId: 'deal-sold-01',
    };

    const resSold = lockThaanReservation(soldThaan, 'deal-new-03');
    assertFalse(resSold.success, 'Cannot reserve SOLD thaan');
  });

  test('ADV-RES-04: Unauthorized Release Protection', () => {
    const reservedThaan: TextileThaan = {
      ...sampleAvailableThaan,
      status: 'RESERVED',
      reservedForDealId: 'deal-owner-88',
    };

    // Rogue deal attempts release
    const rogueRelease = releaseThaanReservation(reservedThaan, 'deal-rogue-99');
    assertFalse(rogueRelease.success, 'Rogue deal cannot release thaan reserved by another deal');
    assertDefined(rogueRelease.error);

    // Authorized deal release
    const validRelease = releaseThaanReservation(reservedThaan, 'deal-owner-88');
    assertTrue(validRelease.success, 'Authorized deal can release thaan');
    assertEqual(validRelease.updatedThaan.status, 'AVAILABLE');
    assertEqual(validRelease.updatedThaan.reservedForDealId, undefined);
  });
});

// Auto-run when executed directly
import { registry } from './test-runner.js';
if (process.argv[1]?.includes('adversarial-m1-challenge')) {
  registry.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

