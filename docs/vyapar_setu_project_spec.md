# Vyapar Setu (व्यापार सेतु)
### Unified Wholesale Business Cockpit & Collaborative Trade Operating System

---

## 1. Executive Summary & Vision

**Vyapar Setu** is an all-in-one, mobile-first wholesale operating system and collaborative business cockpit designed specifically for family-run, traditional wholesale and distribution enterprises across Tier-2/Tier-3 hubs (such as Rajasthan’s textile markets in Surat/Jaipur/Bhilwara or building materials hubs in Kishangarh/Udaipur/Jodhpur).

Traditional wholesalers operate in high-volume, credit-heavy environments where critical business interactions are fragmented across paper bahi-khatas (ledgers), WhatsApp chats, phone calls, physical slips (*parchis*), and transport bilties (consignment notes).

Vyapar Setu synthesizes three distinct product evolutionary stages into one unified architecture:
1. **Daily Operational Cockpit (*Vyapar Saathi*)**: Zero-friction voice/multilingual ledger, daily dues, cash-flow visibility, and "What needs my attention today?" actionable dashboard.
2. **Deep Wholesale Order Execution (*Vyapar Control Tower*)**: Industry-specialized bulk deal lifecycle tracking (lot/roll dimensions, batch tracking, vehicle dispatch, bilty tracking, loading slips, credit limits, and real margin calculations).
3. **Collaborative Trade & Credit Network (*Vyapar Network*)**: Inter-merchant peer restocking, supplier catalog RFQs, aggregated group purchasing (*Samoohik Kharid*), and verified trade-reputation passports.

---

## 2. Core Personas & Problem Space

### Target Personas
1. **The Set-ji / Firm Owner (Mukhiya)**:
   - Needs instant clarity on cash in hand, high-risk credit accounts, today's payables vs receivables, and warehouse inventory valuation.
   - Demands bilingual/Hindi voice inputs, simple WhatsApp-shareable statements, and fraud-resistant staff audit trails.
2. **The Munim-ji / Accountant / Order Desk**:
   - Manages price quotes, custom discounts, partial payments, returns (*maal wapsi*), freight splits, and payment reminders.
   - Needs rapid keyboard/touch entry and auto-reconciliation.
3. **The Field Staff / Warehouse Dispatch Manager**:
   - Manages physical roll cuts, lot picking, truck loading, weight bridge slips, driver bilty details, and dispatch status updates.
4. **The Downstream Retailer / Upstream Mill Partner**:
   - Retailer wants instant digital catalog access, live order dispatch tracking, and transparent ledger statements.
   - Mill/Supplier wants aggregated advance demand commitments and predictable payment timelines.

---

## 3. Unified Product Architecture & Three-Pillar Synergy

```
+-----------------------------------------------------------------------------------+
|                            VYAPAR SETU PLATFORM CORE                              |
+-----------------------------------------------------------------------------------+
|  [Pillar 1: Daily Cockpit]      [Pillar 2: Order Tower]    [Pillar 3: Trade Net]  |
|  - Voice & Hinglish Quick Log   - Lot / Batch / Ton Matrix - RFQ & Digital PO     |
|  - Cash/Bank/Khata Dues Radar   - Deal Card Lifecycle Flow - Group Buying Pools   |
|  - Smart Notification Engine    - Transporter / Bilty Log  - Trade Reputation Pass|
|  - WhatsApp Bill & Khata Link   - Net Deal Margin Engine   - Inter-Peer Stock Pass|
+-----------------------------------------------------------------------------------+
|                      COMMON FOUNDATION & DATA INFRASTRUCTURE                      |
|  - Dual Trade Schema Engine (Textile Fabric/Lot vs Bulk Building Materials)       |
|  - Offline-First PWA / Android Engine (WatermelonDB / SQLite sync)                |
|  - Multi-tier Access Controls (Owner vs Munim vs Dispatcher vs Transporter)       |
|  - Vernacular Voice-to-Action Parser (Hindi, Marwari, Gujarati, English)          |
+-----------------------------------------------------------------------------------+
```

---

## 4. Deep Feature Specifications by Pillar

### Pillar 1: The Daily Cockpit (*Vyapar Saathi*)
*Focus: Cognitive relief for the business owner — answering "What needs my attention today?" in under 10 seconds.*

- **Morning Executive Briefing**:
  - **Udhari Radar**: Total overdue receivables grouped by age (0-15 days, 15-30 days, 30+ days critical).
  - **Payables Forecast**: Supplier bills, recurring loan/chiti commitments due today.
  - **Orders in Transit**: Inbound raw material shipments and outbound customer deliveries pending transit confirmation.
  - **Low Stock & Blocked Capital Alerts**: Items with dead stock (>60 days unchurned) or below reorder threshold.
- **Multimodal Entry (Hinglish/Hindi Voice Assistant)**:
  - Speech-to-text NLP parser: *"Sharma Cloth Store ko 50 meter Chanderi Silk diya 120 rupaye dar se, 2000 cash baki udhari"* immediately parses into a draft transaction with structured confirmation before writing to ledger.
- **Micro-Khata Ledger Engine**:
  - Customer & Supplier unified accounts (handling parties that both buy and supply).
  - Partial payments tracker with real-time balance reconciliation and automatic 1-click WhatsApp payment reminders with UPI deep links.
  - Multi-account cash drawer and bank balance tally.

---

### Pillar 2: Deep Wholesale Order Execution (*Vyapar Control Tower*)
*Focus: End-to-end deal lifecycle with trade-grade product schemas and full dispatch visibility.*

- **Specialized Industry Configuration Engine**:
  - **Mode A: Textile & Fabric Merchants**:
    - Multi-attribute SKU matrix: Design Number, Color Code / Shade, Width (Panna), Fabric Grade, Lot/Thaan Number, Meter/Yard length per piece.
    - Piece/Thaan Reservation: Lock individual rolls/lots to a specific customer order so they cannot be sold twice.
  - **Mode B: Building Materials & Bulk Commodities**:
    - Multi-unit conversion: Metric Tonnes, Bags (50kg cement), Square Feet (marble/granite slabs), Bundles (TMT rebar).
    - Dispatch logistics attributes: Truck number, Driver phone, Weighbridge gross/tare slips, Transporter bilty reference.
- **The Wholesale "Deal Card" Lifecycle**:
  1. **Quotation / Sauda Confirmation**: Rate negotiation, locked payment terms (e.g., 30 days net, 2% cash discount if paid in 7 days).
  2. **Advance & Credit Verification**: Automatic check against the retailer’s authorized credit limit before locking inventory.
  3. **Stock Reservation & Picking Slip**: Digital picking list for the godown boy/munim.
  4. **Packaging & Vehicle Dispatch (Challan / Bilty)**: Recording transport partner, bilty number, vehicle registration, and photo attachment of weighbridge/loading slip.
  5. **Split/Partial Delivery & Transit Tracking**: Live delivery status tracking; ability to mark partial acceptance (e.g., 450 bags delivered out of 500, 50 bags damaged/short).
  6. **True Net Deal Margin Calculator**:
     - *Revenue* − *(Landed Purchase Cost + Loading/Hamali + Transport/Freight + Cash Discounts + Brokerage/Dalali)* = **Net Profit Per Deal**.

---

### Pillar 3: Collaborative Trade & Supply Network (*Vyapar Network*)
*Focus: Trusted peer-to-peer ecosystem unlocking purchasing leverage and resilient fulfillment.*

- **Structured RFQ & Mill/Supplier Inquiries**:
  - Create standardized digital indent/order inquiries sent directly to mills or primary distributors with single-click quotation comparison.
- **Inter-Merchant Stock Sharing (Peer Sourcing)**:
  - If a trusted wholesaler is out of stock on a specific marble lot or fabric shade requested by a loyal customer, they can query registered partner merchants in their local Vyapar circle to broker or transfer stock without losing the client.
- **Aggregated Group Buying (*Samoohik Kharid*)**:
  - Micro-consortiums: Wholesalers band together on high-volume standard commodities (e.g., standard grey fabric yarn, 43-grade cement, TMT rebars) to achieve factory-gate tier pricing from large manufacturers.
  - Each business maintains independent billing, logistics drop-offs, and credit terms while leveraging pooled purchasing volume.
- **Private Trade Reputation Passport**:
  - Secure, merchant-controlled reputation score calculated on verified metrics: On-time settlement ratio, dispute rate, volume handled.
  - Merchants can export a tamper-proof cryptographic PDF or QR summary to present to banks, NBFCs, or new primary mills for better credit terms.

---

## 5. Technical Architecture & Tech Stack

```
+--------------------------------------------------------------------+
|                         CLIENT LAYER                               |
|   Flutter / React Native (Android First) + Offline-Ready PWA       |
|   - Voice Parser: Whisper Web / On-Device Android Speech API       |
|   - Offline DB: WatermelonDB / SQLite with CRDT Local Sync         |
+--------------------------------------------------------------------+
                                 |  (REST / WebSocket / gRPC Sync)
+--------------------------------------------------------------------+
|                         BACKEND SERVICES                           |
|   Node.js / Go microservices or modular monolith                   |
|   - Auth & RBAC (Owner, Munim, Godown Manager, Partner)            |
|   - Deal Engine (State Machine for Orders & Bilty Dispatches)      |
|   - Accounting Ledger (Double-Entry Bookkeeping Invariant)         |
|   - Network & RFQ Orchestrator (Group buying pool engine)          |
+--------------------------------------------------------------------+
                                 |
+--------------------------------------------------------------------+
|                         DATA & STORAGE                             |
|   - PostgreSQL (Transactional ledger, relational orders & audits)  |
|   - Redis (Active sessions, real-time dispatch updates, cache)     |
|   - S3-compatible Object Store (Bilty photos, bills, audio clips)  |
+--------------------------------------------------------------------+
```

### Key Technical Pillars:
1. **Offline-First Synchronization**: Wholesale godowns often experience intermittent basement mobile connectivity. All billing, stock movements, and ledger operations execute locally and synchronize seamlessly via conflict-free operational transforms once connected.
2. **Double-Entry Invariant Accounting**: Guarantees zero ledger discrepancies. Every sale, purchase, freight surcharge, and partial repayment creates atomic debit and credit entries.
3. **Role-Based Access Control (RBAC)**: Godown staff can view loading slips and verify lot counts without seeing customer pricing, historical ledgers, or business profit margins.

---

## 6. End-to-End Demo Workflow: "The Textile Deal"

A realistic end-to-end user journey showing all three pillars working in harmony:

1. **Morning Cockpit Scan**:
   - Ramesh-ji opens Vyapar Setu. The dashboard flags ₹3,20,000 in customer collections due today and 1 shipment of Rayon Fabric arriving from Surat.
2. **Order Intake via Voice**:
   - A retailer calls from Sikar. Ramesh-ji taps the voice button: *"Mahalaxmi Textiles, 40 thaan Cotton Cambric Lot 104, 180 rupaye meter, delivery via Somnath Transport."*
   - The app parses the voice input into a draft deal card.
3. **Control Tower Execution**:
   - Stock check reveals 30 thaan available in Lot 104.
   - Using the **Vyapar Network**, Ramesh-ji pings an allied dealer nearby, securing the remaining 10 thaan at ₹162/meter.
   - Advance of ₹15,000 logged via UPI. 40 thaan reserved in godown.
   - Godown Munim receives picking slip, packs the rolls, enters truck number (`RJ-14-GA-4521`), snaps the transporter bilty, and hits "Dispatched".
4. **Automated WhatsApp Share & Margin Audit**:
   - Retailer receives a branded delivery slip and live tracking link on WhatsApp.
   - Vyapar Setu calculates the exact margin: Revenue (₹2,16,000) minus Purchase Cost (₹1,94,400) minus Transport & Loading (₹4,200) = **₹17,400 Clean Profit**.
5. **Nightly Closing & Reputation Building**:
   - Delivery confirmed by transporter; remaining balance automatically transitions to Accounts Receivable due in 15 days.
   - Deal settlement feeds the merchant's Private Trade Reputation Score.

---

## 7. Implementation Roadmap & Phased Rollout

| Phase | Milestone | Duration | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundational Cockpit (Vyapar Saathi)** | Weeks 1–4 | Voice/Hinglish logger, double-entry khata, dues radar, WhatsApp reminders, offline SQLite sync. |
| **Phase 2** | **Trade Order Tower (Textiles & Materials)** | Weeks 5–8 | Lot/Dimension matrix, deal cards, dispatch bilty tracker, loading slips, true margin calculator. |
| **Phase 3** | **Trade Partner Network (Vyapar Network)** | Weeks 9–12 | Supplier RFQ engine, peer stock sharing, group buying pools, trade reputation passport. |
| **Phase 4** | **Pilot Deployment & Hardening** | Weeks 13–16 | Field trials with 25 pilot wholesale merchants across Jaipur & Bhilwara; usability & sync optimizations. |

---

## 8. Success Metrics & Value Proposition

- **70% Reduction in Daily Mental Load**: Owners see receivables, stock alerts, and dispatch bottlenecks in a single unified view.
- **Zero Double-Selling / Stock Mismatches**: Lot reservation locks rolls and commodity inventory during transit.
- **10x Faster Dispute Resolution**: Transporter bilty photos, weighbridge slips, and WhatsApp confirmations eliminate disputes over missing or delayed goods.
- **Lower Purchase Costs via Group Buying**: Up to 4–8% volume discount savings on mill orders through collaborative purchasing pools.
