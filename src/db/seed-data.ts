/**
 * src/db/seed-data.ts
 * Authentic Indian Wholesale Market Seed Engine:
 * - Real-world commercial datasets covering 5 Rajasthani & Gujarati industrial clusters:
 *   1. Jaipur: Pure Cotton Cambric 60x60, Dabu handblock prints, Johari Bazaar & Sanganer
 *   2. Surat: Poly-georgette greige, digital prints, Ring Road & Millennium Market
 *   3. Bhilwara: PV suiting, 40s cotton yarn, Gandhi Nagar & Pur Road
 *   4. Kishangarh: Makrana white marble slabs, black granite, Madanganj
 *   5. Udaipur: UltraTech 43-Grade cement bags, Kamdhenu TMT steel, Sukher Industrial Area
 * - 100% mathematically balanced opening vouchers (sum Debit - sum Credit === 0)
 */
import { IStorageAdapter, storage } from './storage';
import { JournalEntry, toPaise, validateJournalEntry } from '../modules/foundation/double-entry';
import { TextileSKU } from '../types/trade-schemas';
import { BuildingMaterialSKU } from '../types/trade-schemas';

export interface SeedSummary {
  wholesalersCount: number;
  partiesCount: number;
  inventoryItemsCount: number;
  dealsCount: number;
  journalEntriesCount: number;
  isLedgerBalanced: boolean;
}

export interface ClusterParty {
  id: string;
  name: string;
  city: string;
  tradeHub: string;
  tradeType: 'RETAILER' | 'SUPPLIER' | 'BOTH' | 'CUSTOMER' | 'TRANSPORTER';
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
  materialsInventory: BuildingMaterialSKU[];
  initialJournalEntries: JournalEntry[];
}

export const SEED_WHOLESALERS = [
  {
    id: 'merch_jpr_01',
    businessName: 'M/s Khandelwal Block Prints & Textiles',
    shortName: 'Khandelwal Prints',
    ownerName: 'Ramesh-ji Khandelwal (Mukhiya)',
    munimName: 'Radhey Shyam Sharma',
    city: 'Jaipur',
    mandiArea: 'Johari Bazaar & Sanganer',
    gstin: '08AABCK1420F1Z2',
    phone: '+919829014201',
    tradeMode: 'TEXTILE',
    initialCapitalPaise: toPaise(5000000) // ₹50 Lakhs
  },
  {
    id: 'merch_srt_02',
    businessName: 'Laxmipati Synthetics Pvt Ltd',
    shortName: 'Laxmipati Synthetics',
    ownerName: 'Suresh Patel',
    munimName: 'Hasmukh Bhai',
    city: 'Surat',
    mandiArea: 'Millennium Textile Market, Ring Road',
    gstin: '24AAACL5588G1ZQ',
    phone: '+919825055881',
    tradeMode: 'TEXTILE',
    initialCapitalPaise: toPaise(8500000) // ₹85 Lakhs
  },
  {
    id: 'merch_bhl_03',
    businessName: 'Bhilwara Poly-Suiting Traders',
    shortName: 'Bhilwara Poly-Suiting',
    ownerName: 'Mohanlal Jain',
    munimName: 'Kantilal Verma',
    city: 'Bhilwara',
    mandiArea: 'Gandhi Nagar Textile Mandi',
    gstin: '08AAAPB7892K1Z9',
    phone: '+919414078921',
    tradeMode: 'TEXTILE',
    initialCapitalPaise: toPaise(4000000) // ₹40 Lakhs
  },
  {
    id: 'merch_ksg_04',
    businessName: 'Maruti Granite & Marbles',
    shortName: 'Maruti Marbles',
    ownerName: 'Kailash Choudhary',
    munimName: 'Bhawani Singh',
    city: 'Kishangarh',
    mandiArea: 'Madanganj Marble Cluster',
    gstin: '08AAAGM3344D1ZB',
    phone: '+919828033441',
    tradeMode: 'BUILDING_MATERIALS',
    initialCapitalPaise: toPaise(6500000) // ₹65 Lakhs
  },
  {
    id: 'merch_udr_05',
    businessName: 'Shree Ram Building Materials & Cement',
    shortName: 'Shree Ram Materials',
    ownerName: 'Bansilal Meena',
    munimName: 'Dinesh Chandra',
    city: 'Udaipur',
    mandiArea: 'Sukher Industrial Area',
    gstin: '08AABSR9911C1ZX',
    phone: '+919413099111',
    tradeMode: 'BUILDING_MATERIALS',
    initialCapitalPaise: toPaise(4500000) // ₹45 Lakhs
  }
];

export const SEED_PARTIES = [
  // Jaipur Cluster Parties
  {
    id: 'pty_jpr_01',
    name: 'Sharma Cloth Store',
    contactPerson: 'Mahesh Sharma',
    phone: '+919829022331',
    city: 'Jaipur',
    mandi: 'Purohit Ji Ka Katla',
    role: 'CUSTOMER',
    creditLimitPaise: toPaise(500000), // ₹5 Lakhs
    creditDays: 30,
    currentReceivablePaise: toPaise(185000),
    currentPayablePaise: 0,
    aging: {
      days0_15: toPaise(85000),
      days15_30: toPaise(60000),
      days30_plus: toPaise(40000)
    },
    upiId: 'sharmacloth@okaxis'
  },
  {
    id: 'pty_jpr_02',
    name: 'Mewar Cotton Mills',
    contactPerson: 'Sanjay Chechani',
    phone: '+919414011221',
    city: 'Bhilwara',
    mandi: 'Pur Road',
    role: 'SUPPLIER',
    creditLimitPaise: toPaise(1000000),
    creditDays: 45,
    currentReceivablePaise: 0,
    currentPayablePaise: toPaise(320000),
    aging: {
      days0_15: toPaise(200000),
      days15_30: toPaise(120000),
      days30_plus: 0
    },
    upiId: 'mewarcotton@icici'
  },
  {
    id: 'pty_jpr_03',
    name: 'Jaipur Golden Transport Co',
    contactPerson: 'Harbans Singh',
    phone: '+919829088771',
    city: 'Jaipur',
    mandi: 'Transport Nagar',
    role: 'TRANSPORTER',
    creditLimitPaise: toPaise(100000),
    creditDays: 15,
    currentReceivablePaise: 0,
    currentPayablePaise: toPaise(14500),
    aging: { days0_15: toPaise(14500), days15_30: 0, days30_plus: 0 }
  },

  // Surat Cluster Parties
  {
    id: 'pty_srt_01',
    name: 'Ambika Fashion Hub',
    contactPerson: 'Pravin Bhai',
    phone: '+919825044551',
    city: 'Surat',
    mandi: 'Surat Textile Market',
    role: 'BOTH',
    creditLimitPaise: toPaise(800000),
    creditDays: 30,
    currentReceivablePaise: toPaise(340000),
    currentPayablePaise: toPaise(120000),
    aging: {
      days0_15: toPaise(220000),
      days15_30: toPaise(120000),
      days30_plus: 0
    },
    upiId: 'ambikafashion@hdfcbank'
  },

  // Kishangarh & Udaipur Parties
  {
    id: 'pty_ksg_01',
    name: 'Udaipur Stone World',
    contactPerson: 'Gopal Soni',
    phone: '+919828066771',
    city: 'Udaipur',
    mandi: 'Sukher',
    role: 'CUSTOMER',
    creditLimitPaise: toPaise(1200000),
    creditDays: 45,
    currentReceivablePaise: toPaise(480000),
    currentPayablePaise: 0,
    aging: {
      days0_15: toPaise(250000),
      days15_30: toPaise(150000),
      days30_plus: toPaise(80000)
    },
    upiId: 'udaipurstone@sbi'
  },
  {
    id: 'pty_udr_01',
    name: 'UltraTech Regional Cement Depot',
    contactPerson: 'Alok Gupta',
    phone: '+919413055441',
    city: 'Chittorgarh',
    mandi: 'Nimbahera Cement Zone',
    role: 'SUPPLIER',
    creditLimitPaise: toPaise(2500000),
    creditDays: 21,
    currentReceivablePaise: 0,
    currentPayablePaise: toPaise(640000),
    aging: {
      days0_15: toPaise(640000),
      days15_30: 0,
      days30_plus: 0
    },
    upiId: 'ultratechdepot@icici'
  }
];

export const SEED_INVENTORY_ITEMS = [
  // Textile Mode A (Discrete Thaans)
  {
    id: 'sku_txt_01',
    merchantId: 'merch_jpr_01',
    tradeMode: 'TEXTILE',
    designNo: 'D-101-CAMBRIC',
    fabricName: 'Pure Cotton Cambric 60x60',
    widthInches: 44, // Panna
    shadeName: 'Royal Indigo',
    shadeCode: 'IND-01',
    fabricGrade: 'Fresh-A',
    lotNo: 'LOT-JPR-101',
    costRatePaise: toPaise(95),
    wholesaleRatePaise: toPaise(120),
    totalMeters: 93.3,
    deadStockDays: 14,
    thaanList: [
      { id: 'th_01', skuId: 'sku_txt_01', lotNo: 'LOT-JPR-101', thaanNo: 'T-01', meters: 22.4, initialMeters: 22.4, widthInches: 44, shadeCode: 'IND-01', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' },
      { id: 'th_02', skuId: 'sku_txt_01', lotNo: 'LOT-JPR-101', thaanNo: 'T-02', meters: 24.1, initialMeters: 24.1, widthInches: 44, shadeCode: 'IND-01', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' },
      { id: 'th_03', skuId: 'sku_txt_01', lotNo: 'LOT-JPR-101', thaanNo: 'T-03', meters: 21.8, initialMeters: 21.8, widthInches: 44, shadeCode: 'IND-01', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' },
      { id: 'th_04', skuId: 'sku_txt_01', lotNo: 'LOT-JPR-101', thaanNo: 'T-04', meters: 25.0, initialMeters: 25.0, widthInches: 44, shadeCode: 'IND-01', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' }
    ]
  },
  {
    id: 'sku_txt_02',
    merchantId: 'merch_jpr_01',
    tradeMode: 'TEXTILE',
    designNo: 'D-204-DABU',
    fabricName: 'Bagru Handblock Dabu Print',
    widthInches: 44,
    shadeName: 'Kashish Grey',
    shadeCode: 'KSH-22',
    fabricGrade: 'Fresh-A',
    lotNo: 'LOT-BGR-204',
    costRatePaise: toPaise(135),
    wholesaleRatePaise: toPaise(175),
    totalMeters: 80.5,
    deadStockDays: 68, // Flags >60 days dead stock alert in Cockpit!
    thaanList: [
      { id: 'th_05', skuId: 'sku_txt_02', lotNo: 'LOT-BGR-204', thaanNo: 'T-05', meters: 40.0, initialMeters: 40.0, widthInches: 44, shadeCode: 'KSH-22', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' },
      { id: 'th_06', skuId: 'sku_txt_02', lotNo: 'LOT-BGR-204', thaanNo: 'T-06', meters: 40.5, initialMeters: 40.5, widthInches: 44, shadeCode: 'KSH-22', fabricGrade: 'Fresh-A', isCutPiece: false, status: 'AVAILABLE' }
    ]
  },

  // Building Materials Mode B (Bulk / Multi-Unit)
  {
    id: 'sku_mat_01',
    merchantId: 'merch_udr_05',
    tradeMode: 'BUILDING_MATERIALS',
    itemCode: 'CEM-UT-43',
    name: 'UltraTech 43-Grade PPC Cement',
    commodityType: 'CEMENT',
    baseUnit: 'BAGS',
    stockOnHand: 480, // bags
    reorderLevel: 200,
    costRatePaise: toPaise(310),
    wholesaleRatePaise: toPaise(355),
    unitWeightKg: 50,
    deadStockDays: 8
  },
  {
    id: 'sku_mat_02',
    merchantId: 'merch_udr_05',
    tradeMode: 'BUILDING_MATERIALS',
    itemCode: 'TMT-KMD-12',
    name: 'Kamdhenu Fe 550D TMT Rebar 12mm',
    commodityType: 'STEEL_TMT',
    baseUnit: 'BUNDLES',
    diameterMm: 12,
    piecesPerBundle: 5,
    nominalWeightPerMeterKg: 0.8889, // 12^2 / 162
    stockOnHand: 150, // bundles
    reorderLevel: 50,
    costRatePaise: toPaise(2850),
    wholesaleRatePaise: toPaise(3200),
    deadStockDays: 22
  },
  {
    id: 'sku_mat_03',
    merchantId: 'merch_ksg_04',
    tradeMode: 'BUILDING_MATERIALS',
    itemCode: 'MRB-MAK-DUNGRI',
    name: 'Makrana White Dungri Marble Slabs (18mm)',
    commodityType: 'MARBLE_GRANITE',
    baseUnit: 'SQ_FT',
    gangsawBlockId: 'BLK-MAK-09',
    stockOnHand: 1250, // sq ft
    reorderLevel: 400,
    costRatePaise: toPaise(180),
    wholesaleRatePaise: toPaise(240),
    deadStockDays: 45
  }
];

/**
 * 100% Mathematically Balanced Opening & Historical Journal Vouchers.
 * Every voucher satisfies: sum(debitPaise) === sum(creditPaise).
 */
export const SEED_JOURNAL_ENTRIES: JournalEntry[] = [
  // 1. Opening Capital Voucher:
  // Ramesh-ji introduces ₹50,00,000 capital:
  // Dr Cash Drawer: ₹2,00,000
  // Dr HDFC Bank: ₹35,00,000
  // Dr Merchandise Inventory: ₹13,00,000
  // Cr Capital Account: ₹50,00,000
  {
    id: 'jv_seed_001',
    voucherNumber: 'JV-2026-OP-001',
    voucherType: 'JOURNAL',
    date: '2026-09-01T10:00:00.000Z',
    narration: 'Opening balance setup: Ramesh-ji proprietor capital contribution',
    lines: [
      {
        id: 'ln_001_1',
        accountCode: '1010-CASH',
        accountName: 'Cash Drawer (Galla)',
        debitPaise: toPaise(200000), // ₹2,00,000
        creditPaise: 0,
        narration: 'Opening physical cash in Galla'
      },
      {
        id: 'ln_001_2',
        accountCode: '1020-BANK-HDFC',
        accountName: 'HDFC Current Account',
        debitPaise: toPaise(3500000), // ₹35,00,000
        creditPaise: 0,
        narration: 'Opening current account balance'
      },
      {
        id: 'ln_001_3',
        accountCode: '1300-INV',
        accountName: 'Merchandise Inventory',
        debitPaise: toPaise(1300000), // ₹13,00,000
        creditPaise: 0,
        narration: 'Opening godown stock valuation'
      },
      {
        id: 'ln_001_4',
        accountCode: '3010-CAPITAL',
        accountName: 'Owner Capital Account',
        debitPaise: 0,
        creditPaise: toPaise(5000000), // ₹50,00,000
        narration: 'Proprietor initial equity investment'
      }
    ],
    createdAt: '2026-09-01T10:00:00.000Z'
  },

  // 2. Mill Raw Purchase Voucher:
  // Purchase from Mewar Cotton Mills: ₹4,00,000 + Freight ₹12,000 + Hamali ₹3,000
  // Advance paid by Bank: ₹95,000
  // Payable balance: ₹3,20,000 to Mewar Cotton Mills
  {
    id: 'jv_seed_002',
    voucherNumber: 'PUR-2026-09-014',
    voucherType: 'PURCHASE',
    date: '2026-09-10T14:30:00.000Z',
    narration: 'Purchase of 60x60 Cambric Grey Fabric from Mewar Cotton Mills (LR #4812)',
    lines: [
      {
        id: 'ln_002_1',
        accountCode: '5010-PURCHASES',
        accountName: 'Wholesale Purchases (COGS)',
        debitPaise: toPaise(400000),
        creditPaise: 0,
        partyId: 'pty_jpr_02',
        narration: 'Grey fabric thaan lots'
      },
      {
        id: 'ln_002_2',
        accountCode: '5020-FREIGHT',
        accountName: 'Freight & Cartage (Bilty Transport)',
        debitPaise: toPaise(12000),
        creditPaise: 0,
        narration: 'Bilty freight paid'
      },
      {
        id: 'ln_002_3',
        accountCode: '5030-HAMALI',
        accountName: 'Hamali & Pelledari (Labor)',
        debitPaise: toPaise(3000),
        creditPaise: 0,
        narration: 'Godown unloading hamali labor'
      },
      {
        id: 'ln_002_4',
        accountCode: '1020-BANK-HDFC',
        accountName: 'HDFC Current Account',
        debitPaise: 0,
        creditPaise: toPaise(95000),
        partyId: 'pty_jpr_02',
        narration: 'Advance transfer via RTGS'
      },
      {
        id: 'ln_002_5',
        accountCode: '2010-AP',
        accountName: 'Accounts Payable (Creditors / Dena)',
        debitPaise: 0,
        creditPaise: toPaise(320000),
        partyId: 'pty_jpr_02',
        narration: 'Net payable on 45 days credit'
      }
    ],
    referencePartyId: 'pty_jpr_02',
    createdAt: '2026-09-10T14:30:00.000Z'
  },

  // 3. Wholesale Customer Sale Voucher:
  // Sale to Sharma Cloth Store: ₹2,16,000
  // Advance received via UPI/Bank: ₹31,000
  // Balance on Credit: ₹1,85,000 (matches pty_jpr_01 current balance!)
  {
    id: 'jv_seed_003',
    voucherNumber: 'SL-2026-09-088',
    voucherType: 'SALES',
    date: '2026-09-20T11:15:00.000Z',
    narration: 'Sale of Cambric & Dabu Prints to Sharma Cloth Store (Challan #CH-88)',
    lines: [
      {
        id: 'ln_003_1',
        accountCode: '1200-AR',
        accountName: 'Accounts Receivable (Debtors / Lena)',
        debitPaise: toPaise(185000),
        creditPaise: 0,
        partyId: 'pty_jpr_01',
        narration: 'Credit balance due from Sharma Cloth Store'
      },
      {
        id: 'ln_003_2',
        accountCode: '1020-BANK-HDFC',
        accountName: 'HDFC Current Account',
        debitPaise: toPaise(31000),
        creditPaise: 0,
        partyId: 'pty_jpr_01',
        narration: 'Immediate UPI advance received'
      },
      {
        id: 'ln_003_3',
        accountCode: '4010-SALES',
        accountName: 'Wholesale Sales Revenue',
        debitPaise: 0,
        creditPaise: toPaise(216000),
        partyId: 'pty_jpr_01',
        narration: 'Gross wholesale sales revenue'
      }
    ],
    referencePartyId: 'pty_jpr_01',
    createdAt: '2026-09-20T11:15:00.000Z'
  },

  // 4. Cash Collection with Kasaar (Discount Allowed):
  // Sharma Cloth Store makes partial cash settlement:
  // Cash Received in Galla: ₹24,500
  // Kasaar (Cash discount allowed): ₹500
  // Credit AR: ₹25,000
  {
    id: 'jv_seed_004',
    voucherNumber: 'RCP-2026-09-102',
    voucherType: 'RECEIPT',
    date: '2026-09-28T16:00:00.000Z',
    narration: 'Cash payment with ₹500 kasaar from Sharma Cloth Store',
    lines: [
      {
        id: 'ln_004_1',
        accountCode: '1010-CASH',
        accountName: 'Cash Drawer (Galla)',
        debitPaise: toPaise(24500),
        creditPaise: 0,
        partyId: 'pty_jpr_01',
        narration: 'Cash collected in shop'
      },
      {
        id: 'ln_004_2',
        accountCode: '5040-DISC-ALW',
        accountName: 'Cash Discounts Allowed (Customer Kasaar)',
        debitPaise: toPaise(500),
        creditPaise: 0,
        partyId: 'pty_jpr_01',
        narration: 'Kasaar incentive discount'
      },
      {
        id: 'ln_004_3',
        accountCode: '1200-AR',
        accountName: 'Accounts Receivable (Debtors / Lena)',
        debitPaise: 0,
        creditPaise: toPaise(25000),
        partyId: 'pty_jpr_01',
        narration: 'Cleared against invoice #SL-2026-09-088'
      }
    ],
    referencePartyId: 'pty_jpr_01',
    createdAt: '2026-09-28T16:00:00.000Z'
  }
];

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

/**
 * Main Database Seeder Function.
 */
export async function seedInitialDatabase(
  adapter: IStorageAdapter = storage,
  force: boolean = false
): Promise<SeedSummary> {
  const meta = await adapter.get<{ id: string; isSeeded: boolean }>('settings', 'seed_meta');

  if (meta && meta.isSeeded && !force) {
    const wholesalers = await adapter.getAll('merchants');
    const parties = await adapter.getAll('parties');
    const inventory = await adapter.getAll('inventory_items');
    const journals = await adapter.getAll<JournalEntry>('journal_entries');

    return {
      wholesalersCount: wholesalers.length,
      partiesCount: parties.length,
      inventoryItemsCount: inventory.length,
      dealsCount: 0,
      journalEntriesCount: journals.length,
      isLedgerBalanced: true
    };
  }

  // Verify that all seed journals satisfy the double-entry invariant before committing!
  for (const entry of SEED_JOURNAL_ENTRIES) {
    const validation = validateJournalEntry(entry);
    if (!validation.isValid) {
      throw new Error(`CRITICAL_SEED_ERROR: Unbalanced journal in seed dataset: ${validation.errors.join(' | ')}`);
    }
  }

  // Populate collections
  await adapter.putMany('merchants', SEED_WHOLESALERS);
  await adapter.putMany('parties', SEED_PARTIES);
  await adapter.putMany('inventory_items', SEED_INVENTORY_ITEMS);
  await adapter.putMany('journal_entries', SEED_JOURNAL_ENTRIES);

  // Set seed status
  await adapter.put('settings', {
    id: 'seed_meta',
    isSeeded: true,
    seededAt: new Date().toISOString(),
    version: '1.0.0'
  });

  return {
    wholesalersCount: SEED_WHOLESALERS.length,
    partiesCount: SEED_PARTIES.length,
    inventoryItemsCount: SEED_INVENTORY_ITEMS.length,
    dealsCount: 0,
    journalEntriesCount: SEED_JOURNAL_ENTRIES.length,
    isLedgerBalanced: true
  };
}
