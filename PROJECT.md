# Project: Vyapar Setu (व्यापार सेतु)
### Unified Wholesale Business Cockpit & Collaborative Trade Operating System

---

## 1. Architecture

### 1.1 Architectural Overview
Vyapar Setu is a local-first, mobile-optimized progressive web application and business cockpit built for traditional Indian wholesale and distribution enterprises (Textiles & Building Materials). It integrates three operational pillars atop a resilient common foundation:

```
+----------------------------------------------------------------------------------------------------+
|                                      VYAPAR SETU FRONTEND CORE                                     |
+----------------------------------------------------------------------------------------------------+
|  [Pillar 1: Vyapar Saathi]           [Pillar 2: Vyapar Control Tower]     [Pillar 3: Vyapar Network] |
|  - Morning Executive Briefing        - Specialized Industry Modes         - Structured RFQ Engine    |
|  - Udhari Aging Radar (0-15/15-30/30+) (Mode A: Textiles, Mode B: Bulk)   - Inter-Peer Sourcing Pass |
|  - Cash/Bank & Galla Tally           - 6-Stage Wholesale Deal Lifecycle   - Group Buying (Samoohik)  |
|  - Hinglish Multimodal Voice NLP     - Challan, Bilty & Weighbridge Slips - Trade Reputation Passport|
|  - Micro-Khata with UPI Reminders    - True Net Margin Calculator         - "The Textile Deal" Demo  |
+----------------------------------------------------------------------------------------------------+
|                               COMMON FOUNDATION & DATA INFRASTRUCTURE                               |
|  - Dual Trade Schema Engine (Textile Fabric/Lot Matrix vs Building Materials Multi-Unit Engine)    |
|  - Offline-First Storage Engine (IndexedDB / LocalStorage Fallback) with Outbox Sync Queue          |
|  - Double-Entry Accounting Invariant Engine (Zero-Discrepancy Ledger, Immutable Journals)         |
|  - Multi-Tier Role-Based Access Control (Owner / Munim-ji / Godown Dispatcher / Partner)            |
|  - Indian Wholesale Market Seed Engine (Jaipur, Surat, Bhilwara, Kishangarh, Udaipur)              |
+----------------------------------------------------------------------------------------------------+
```

### 1.2 Tech Stack
- **Framework**: Vite + React 18/19 with TypeScript
- **Styling**: Tailwind CSS with custom Indian wholesale palette (Dark Slate, Deep Indigo, Amber Gold, Emerald Surplus, Ruby Risk)
- **Icons**: Lucide React
- **Client Storage**: Local-first database store (IndexedDB with local storage fallback)
- **Math & Precision**: Integer paise financial arithmetic (avoiding floating point errors)
- **Audio / NLP**: Web Speech API integration + client-side rule-based Hinglish/Hindi parser
- **Testing**: Node/TypeScript-based standalone E2E & unit test runner

---

## 2. Code Layout

```
e:/manipal hackathon/
├── docs/                                  # Project specifications & architecture references
├── src/
│   ├── types/                             # Unified TypeScript domain definitions
│   │   ├── common.ts                      # RBAC, Party, Currency, Base Entity types
│   │   ├── trade-schemas.ts               # Dual trade schemas: Textile SKU vs Bulk Commodities
│   │   ├── ledger.ts                      # Double-entry ledger, Khata, Galla, Dues types
│   │   ├── order-tower.ts                 # Deal cards, dispatches, bilty, margin types
│   │   └── network.ts                     # RFQ, Peer sourcing, Group buying, Passport types
│   ├── db/                                # Local-first database & persistence
│   │   ├── storage.ts                     # IndexedDB / LocalStorage adapter & repository
│   │   ├── outbox.ts                      # Optimistic sync queue & action logger
│   │   └── seed-data.ts                   # Realistic Indian wholesale cluster mock seeds
│   ├── modules/
│   │   ├── foundation/                    # Common Foundation
│   │   │   ├── rbac.ts                    # RBAC engine & permission guards
│   │   │   ├── double-entry.ts            # Mathematical double-entry ledger invariants
│   │   │   └── unit-converter.ts          # Textile & Building materials conversion engine
│   │   ├── cockpit/                       # Pillar 1: Vyapar Saathi
│   │   │   ├── morning-briefing.tsx       # Morning briefing & executive summary
│   │   │   ├── udhari-radar.tsx           # Aging receivables radar & alerts
│   │   │   ├── voice-nlp-parser.ts        # Hinglish/Hindi speech & text parser
│   │   │   ├── voice-assistant-modal.tsx  # Interactive draft transaction confirmation
│   │   │   ├── micro-khata.tsx            # Unified ledger, Lena/Dena, partial settlements
│   │   │   ├── galla-tally.tsx            # Physical cash drawer denomination counter
│   │   │   └── whatsapp-reminders.ts      # UPI dynamic links & WhatsApp text generator
│   │   ├── order-tower/                   # Pillar 2: Vyapar Control Tower
│   │   │   ├── industry-mode-selector.tsx # Toggle between Textile & Building Materials
│   │   │   ├── textile-inventory.tsx      # Thaan/Lot matrix, design/shade, reservation locks
│   │   │   ├── bulk-materials.tsx         # Bag/Ton/SqFt/Bundle converter & weighbridge slips
│   │   │   ├── deal-card-board.tsx        # 6-Stage Deal Lifecycle Kanban / list
│   │   │   ├── deal-detail-modal.tsx      # Stage-by-stage deal transitions & validations
│   │   │   ├── dispatch-bilty-tracker.tsx # Challan, transporter bilty, vehicle logger
│   │   │   └── margin-calculator.tsx      # True Net Deal Margin engine & guardrails
│   │   └── network/                       # Pillar 3: Vyapar Network
│   │       ├── rfq-engine.tsx             # Indent creation & landed-cost quote comparison
│   │       ├── peer-sourcing.tsx          # Vyapar Circle directory & 15-min soft lock sourcing
│   │       ├── group-buying.tsx           # Samoohik Kharid consortiums & tiered curves
│   │       ├── reputation-passport.tsx    # 5-factor credit score & cryptographic PDF/QR
│   │       └── textile-deal-demo.tsx      # Interactive 5-step end-to-end "The Textile Deal" walk-through
│   ├── components/                        # Reusable UI widgets
│   │   ├── layout/                        # Navigation, Header, RoleSwitcher, OfflineBanner
│   │   └── ui/                            # Cards, Badges, Modals, Buttons, Sliders, Tables
│   ├── App.tsx                            # Main App entry & tab/route coordinator
│   ├── main.tsx                           # React DOM bootstrap
│   └── index.css                          # Tailwind CSS imports & custom variables
├── tests/                                 # E2E & Unit test suite (managed by E2E track)
│   ├── test-runner.ts                     # Standalone CLI test runner
│   ├── tier1-feature-coverage.test.ts     # Tier 1 tests (5+ per feature)
│   ├── tier2-boundary-corner.test.ts      # Tier 2 tests (boundary & edge cases)
│   ├── tier3-cross-feature.test.ts        # Tier 3 tests (pairwise combinations)
│   └── tier4-real-world.test.ts           # Tier 4 tests (realistic wholesale workflows)
├── package.json                           # Scripts and dependencies
├── tsconfig.json                          # TypeScript configuration
├── vite.config.ts                         # Vite configuration
└── tailwind.config.js                     # Tailwind theme configuration
```

---

## 3. Feature Inventory

Every single feature discovered during the survey phase across all three pillars and common foundation is cataloged and assigned to a specific milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dual Trade Schema: Mode A Textiles | Multi-attribute SKU (Design No, Shade, Width/Panna, Grade, Lot No, variable Thaan cut lengths, Thaan reservation lock). | M1 | spec_miner_survey_1 & 2 |
| 2 | Dual Trade Schema: Mode B Building Materials | Multi-unit conversion (MT, 50kg Bags, Sq Ft marble, TMT Rebar $d^2/162$ bundles) + weighbridge slips. | M1 | spec_miner_survey_1 & 2 |
| 3 | Double-Entry Accounting Invariant Engine | Mathematical balance invariant ($\sum Debit - \sum Credit = 0$), integer paise currency representation, immutable journal vouchers. | M1 | spec_miner_survey_1 |
| 4 | Offline-First Storage Engine & Outbox Sync Queue | IndexedDB / LocalStorage persistence, UUID generator, optimistic updates, outbox mutation queue, and offline connectivity status banner. | M1 | spec_miner_survey_1 & explorer_3 |
| 5 | Multi-Tier Role-Based Access Control (RBAC) | 4 discrete roles (Owner `MUKHIYA`, Accountant `MUNIM`, Godown Dispatcher `GODOWN`, Partner `PARTNER`) with godown margin/pricing redaction. | M1 | spec_miner_survey_1 |
| 6 | Indian Wholesale Cluster Mock Seed Engine | Pre-seeded realistic businesses, inventory, deals, ledgers for Jaipur, Surat, Bhilwara, Kishangarh, Udaipur. | M1 | explorer_survey_3 |
| 7 | Morning Executive Briefing Cockpit | 10-second executive scan: today's collections, payables, transit orders, and blocked capital. | M2 | spec_miner_survey_1 |
| 8 | Udhari Radar (Aging Receivables) | 3-tier aging buckets (0-15 days, 15-30 days warning, 30+ days critical overdue) with party-level drilldowns. | M2 | spec_miner_survey_1 |
| 9 | Payables Forecast Engine | Due dates for supplier invoices, recurring loans, and chiti commitments contrasted against liquid cash. | M2 | spec_miner_survey_1 |
| 10 | Orders in Transit & Stock Health Alerts | Live tracking of inbound supplier shipments and outbound deliveries + dead stock (>60 days) and reorder threshold alerts. | M2 | spec_miner_survey_1 |
| 11 | Hinglish/Hindi Multimodal Voice NLP Parser | Speech-to-text audio and text query parser extracting Intent (Sale, Purchase, Payment, Expense) and Entities (Party, SKU, Qty, Unit, Rate, Cash, Credit). | M2 | spec_miner_survey_1 |
| 12 | Zero-Blind-Write Interactive Draft Card | Structured preview modal with editable fields before committing parsed voice transactions to double-entry ledger. | M2 | spec_miner_survey_1 |
| 13 | Unified Customer & Supplier Micro-Khata | Single unified ledger account for reciprocal trade parties with net balance display ("Lena Hai" vs "Dena Hai"). | M2 | spec_miner_survey_1 |
| 14 | Partial Payments & Settlement Engine | FIFO automatic knock-off and invoice-level matching with Kasaar (cash discount) and adjustment support. | M2 | spec_miner_survey_1 |
| 15 | 1-Click WhatsApp Payment Reminders & UPI Links | Configurable tone WhatsApp message templates (Gentle, Standard, Firm) with dynamic NPCI UPI links and QR codes. | M2 | spec_miner_survey_1 |
| 16 | Physical Cash Drawer (Galla) Denomination Tally | Indian Rupee currency note counter (₹2000, ₹500, ₹200, ₹100, ₹50, ₹20, ₹10) with physical vs ledger variance alerts. | M2 | spec_miner_survey_1 |
| 17 | Bank Balance Reconciliation | Multi-account bank balance tracking and liquid asset summary (Galla Cash + Bank). | M2 | spec_miner_survey_1 |
| 18 | Specialized Industry Mode Selector & Config | Active mode switcher (Mode A: Textiles vs Mode B: Building Materials) adapting schemas, units, and dispatch workflows. | M3 | spec_miner_survey_2 |
| 19 | Textile Thaan/Lot Matrix & Piece Reservation | Discrete lot inventory with individual cut thaan meter lengths, piece allocation, and hard locks preventing double-selling. | M3 | spec_miner_survey_2 |
| 20 | Bulk Commodities Unit Conversion & Weighbridge Log | Real-time conversions (Bags to MT, Sq Ft, TMT rebar $d^2/162$) and Dharam Kanta weighbridge gross/tare/net slip verification. | M3 | spec_miner_survey_2 |
| 21 | Wholesale Deal Lifecycle: Stage 1 Quotation / Sauda | Locked negotiated rates, payment terms (net days, cash discount % if paid in N days), delivery terms (Ex-godown vs FOR). | M3 | spec_miner_survey_2 |
| 22 | Wholesale Deal Lifecycle: Stage 2 Credit & Advance | Automatic check against authorized credit limit + 30-day overdue aging; Set-ji PIN override; upfront advance logger. | M3 | spec_miner_survey_2 |
| 23 | Wholesale Deal Lifecycle: Stage 3 Picking Slip | Digital picking list for godown boy with strict pricing/margin redaction; discrete roll/lot marking. | M3 | spec_miner_survey_2 |
| 24 | Wholesale Deal Lifecycle: Stage 4 Vehicle Dispatch | Challan creation, transporter bilty (LR number), truck registration, driver phone, E-Way Bill checks, and WhatsApp delivery slip. | M3 | spec_miner_survey_2 |
| 25 | Wholesale Deal Lifecycle: Stage 5 Split/Partial Delivery | Multi-truck split deliveries, transit shortage vs damage recording with auto-generated Credit/Debit notes. | M3 | spec_miner_survey_2 |
| 26 | Wholesale Deal Lifecycle: Stage 6 True Net Deal Margin | Exact margin calculation: Revenue - (COGS + Hamali + Outbound Freight + Cash Discount + Brokerage/Dalali + Packaging) = Net Profit, with color guardrails. | M3 | spec_miner_survey_2 |
| 27 | Margin Profitability Guardrails & Ledger Posting | Profit warnings (Green >=5%, Amber 0-5%, Red <0% "घाटे का सौदा" requiring owner sign-off) and automatic posting to double-entry ledger. | M3 | spec_miner_survey_2 |
| 28 | Structured RFQ & Mill Inquiries Engine | Digital indent creation for textile & building materials, supplier broadcast, and automated RFQ issuance. | M4 | explorer_survey_3 |
| 29 | Normalized Landed Cost Comparison Matrix | Side-by-side supplier quotation comparison calculating Landed Cost ($Unit \times (1+GST) + Freight - Discount$) with automated badges (Lowest Price, Fastest Dispatch, Best Credit, Recommended). | M4 | explorer_survey_3 |
| 30 | 1-Click Purchase Order Generation & WhatsApp Send | Automated conversion of accepted RFQ quote into official PO (`PO-2026-TXT-XXX`) with 1-click WhatsApp dispatch. | M4 | explorer_survey_3 |
| 31 | Inter-Merchant Peer Sourcing (Vyapar Circle) | Trusted merchant network directory with dual discovery (shared catalog search vs "Khabar / SOS" flash broadcast). | M4 | explorer_survey_3 |
| 32 | 15-Minute Soft Reservation Lock | Temporary lock on peer inventory during customer phone negotiation to eliminate double-selling. | M4 | explorer_survey_3 |
| 33 | Brokered Margin Split & Micro-Khata Contra Posting | Wholesale transfer rate vs referral cut calculation and automated contra-entry balancing in counterparties' Micro-Khata ledgers. | M4 | explorer_survey_3 |
| 34 | Aggregated Group Buying (*Samoohik Kharid*) Pools | Micro-consortium campaigns for standard commodities (grey fabric yarn, 43-grade cement, TMT rebars) with dynamic tiered volume pricing curves. | M4 | explorer_survey_3 |
| 35 | Independent Billing & Multi-Drop Logistics Pooling | Enforces individual merchant billing per GSTIN and separate drop-off points while enjoying pooled manufacturer pricing. | M4 | explorer_survey_3 |
| 36 | Private Trade Reputation Passport Engine | 5-dimensional credit algorithm (OTSR 40%, DRR 25%, TVVI 20%, PVS 15% -> 300-900 score) with merchant privacy controls (Public / Counterparty / Bank Audit). | M4 | explorer_survey_3 |
| 37 | Cryptographic Verification Digest & QR / PDF Dossier | SHA-256 integrity hash, mobile-scannable verification QR, and exportable bank-ready dossier ("Vyapar Sakh Patra"). | M4 | explorer_survey_3 |
| 38 | "The Textile Deal" Interactive End-to-End Demo Journey | Guided 5-step walkthrough executing Ramesh-ji's full journey (Morning Scan -> Voice Sauda -> Peer Stock Sourcing -> Dispatch Challan/Bilty -> Margin Audit & Reputation). | M4 | spec_miner_survey_1 & docs |
| 39 | Global Navigation, Role Switcher & Cockpit Shell | Unified responsive app shell with mobile bottom nav, desktop bento grid, global quick actions, role selector, and theme support. | M4 | explorer_survey_3 |
| 40 | End-to-End Test Suite Verification & Hardening | Complete test harness passing 100% of Tiers 1-4 tests, followed by adversarial Tier 5 coverage hardening. | M5 | orchestrator |

---

## 4. Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Common Foundation & Data Engine | Project scaffolding (Vite + React + TS + Tailwind), core type models, dual trade schemas (Textile & Bulk), double-entry invariant engine, local storage adapter & outbox sync queue, RBAC system, and Indian wholesale market seed engine. | none | PLANNED |
| M2 | Daily Operational Cockpit (*Vyapar Saathi*) & Micro-Khata | Morning executive briefing, Udhari Radar (aging brackets 0-15d, 15-30d, 30+d), Payables forecast, Orders in transit & stock alerts, Hinglish voice NLP parser with interactive draft card, Micro-khata unified ledger, partial payments settlement, WhatsApp payment reminders with UPI QR, Galla cash denomination counter, and bank reconciliation. | M1 | PLANNED |
| M3 | Deep Wholesale Order Execution (*Vyapar Control Tower*) | Industry mode switcher (Textile Mode A vs Building Materials Mode B), textile thaan/lot matrix with reservation locks, bulk commodities converter with weighbridge slip verification, 6-stage Deal Lifecycle Kanban/board, stage transitions & credit checks, dispatch bilty & E-Way Bill logger, partial/split delivery with shortage debit/credit notes, and True Net Deal Margin Calculator with guardrails. | M1, M2 | PLANNED |
| M4 | Collaborative Trade & Supply Network (*Vyapar Network*) & Integration | Structured RFQ & landed cost comparison matrix, 1-click PO with WhatsApp dispatch, peer stock sharing with 15-min soft lock and contra-entry balancing, Samoohik Kharid group buying pools with tiered curves and independent billing, Trade Reputation Passport with SHA-256 digest & QR/PDF dossier, "The Textile Deal" interactive 5-step guided journey, and unified Cockpit shell with RBAC switcher. | M1, M2, M3 | PLANNED |
| M5 | E2E Testing Verification & Adversarial Hardening | Comprehensive verification of 100% E2E test suite (Tiers 1-4) published by E2E Testing Track, followed by Phase 2 adversarial coverage hardening (Tier 5). | M1, M2, M3, M4, TEST_READY | PLANNED |

---

## 5. Interface Contracts

### 5.1 Common Foundation (`M1`) ↔ Cockpit (`M2`), Order Tower (`M3`), Network (`M4`)
- **Storage & Outbox**:
  ```typescript
  export interface IStorageAdapter {
    get<T>(collection: string, id: string): Promise<T | null>;
    getAll<T>(collection: string, query?: Record<string, any>): Promise<T[]>;
    put<T extends { id: string }>(collection: string, item: T): Promise<void>;
    delete(collection: string, id: string): Promise<void>;
    enqueueOutboxAction(action: OutboxAction): Promise<void>;
    getOutboxActions(): Promise<OutboxAction[]>;
  }
  ```
- **Double-Entry Invariant Engine**:
  ```typescript
  export interface JournalEntry {
    id: string;
    voucherNumber: string;
    date: string;
    narration: string;
    referenceDealId?: string;
    referencePartyId?: string;
    lines: JournalLine[]; // Must satisfy: sum(debitPaise) === sum(creditPaise)
  }
  export function validateAndPostJournal(entry: JournalEntry): { success: boolean; error?: string };
  ```
- **RBAC**:
  ```typescript
  export type UserRole = 'MUKHIYA' | 'MUNIM' | 'GODOWN' | 'PARTNER';
  export function canViewFinancialMargins(role: UserRole): boolean; // false for GODOWN, PARTNER
  export function canApproveCreditOverride(role: UserRole): boolean; // true only for MUKHIYA
  ```

### 5.2 Order Tower (`M3`) ↔ Micro-Khata Ledger (`M2`) & Inventory (`M1`)
- **Inventory Locking**:
  ```typescript
  export function lockThaanReservation(thaanId: string, dealId: string): boolean;
  export function releaseThaanReservation(thaanId: string, dealId: string): void;
  ```
- **Deal Settlement & Margin Posting**:
  ```typescript
  export function postDealMarginToLedger(deal: DealCard, margin: DealMarginBreakdown): JournalEntry;
  ```

### 5.3 Vyapar Network (`M4`) ↔ Order Tower (`M3`) & Cockpit (`M2`)
- **Peer Sourcing Soft Lock**:
  ```typescript
  export function acquirePeerSoftLock(peerId: string, skuId: string, qty: number, durationMinutes: 15): SoftLockTicket;
  ```
- **Reputation Metrics Ingestion**:
  ```typescript
  export function computeReputationScore(partyId: string): ReputationPassport;
  ```

---

## 6. Verification & Quality Standards
- **Integrity Guarantee**: Zero tolerance for dummy implementations, mock stubs in core logic, or hardcoded test bypasses. All business calculations (margin equations, double-entry invariants, conversion formulas, reputation math) must execute authentic algorithms.
- **Strict Gating**: Every milestone must pass build compilation, unit/module tests, independent Reviewer approvals, Challenger stress-testing, and Forensic Auditor verification.
