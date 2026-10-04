# Vyapar Setu (व्यापार सेतु / ವ್ಯಾಪಾರ ಸೇತು)

> **Next-Generation Pan-India Wholesale & B2B Trade Operating System**  
> Seamlessly unifies the Daily Merchant Cockpit, Wholesale Order Control Tower, Collaborative Trade Network, and Micro-Khata Ledger into one zero-latency interface.

---

## 🌟 Highlights & Key Features

- **Multilingual Support (Tri-Lingual Engine)**:
  - **English (`en`)**: 100% clean, professional corporate B2B SaaS interface without bracketed vernacular translations.
  - **Hindi (`hi`)**: Natural, culturally grounded wholesale trade terminology (`व्यापार सेतु`).
  - **Kannada (`kn`)**: Complete Kannada regional localization (`ವ್ಯಾಪಾರ ಸೇತು`).
- **Two Trade Operating Modes**:
  - **Textiles & Garments**: Roll-level piece tracking, dyeing lot (#104) consistency verification, cut-length reservations, and thaan register.
  - **Building Materials & Bulk**: Weighbridge gross/tare/net calculation, 50kg bag conversions, truck/bilty logistics, and consignment management.
- **Four Integrated Modules**:
  1. **Daily Cockpit**: Real-time receivables dashboard, aging breakdowns (0–15d, 16–30d, 30d+ overdue), voice-driven multi-lingual order logger with 2-step verification, and dead stock liquidation alerts.
  2. **Order Control Tower**: 6-stage order lifecycle pipeline (Sauda Confirmed → Credit Verified → Stock Allocated → Dispatched → Delivered & Inspected → Settled), weighbridge inspection slips, digital credit notes, and true net margin calculators with RBAC profit masking.
  3. **Trade Network**: Group buying volume pooling for mill-tier discounts, verified peer merchant stock sourcing across India (Bengaluru, Mumbai, Delhi, Surat, Hyderabad), and verifiable cryptographic Trade Credibility Passports.
  4. **Micro-Khata Ledger**: Invariant-enforced double-entry accounting (`Σ Debit === Σ Credit`), physical cash drawer denomination counter (₹500, ₹200, ₹100), automated variance detection, and downloadable PDF account statements.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Icons & UI**: Lucide React, Canvas Confetti
- **Testing & Invariant Verification**: Node.js automated test harness (`verify_all_modules.mjs`) verifying 14 domain invariants.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/murtuza-alii/Vyapar_Setu.git
cd Vyapar_Setu/frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Verify Invariant Test Suite
```bash
node verify_all_modules.mjs
```

### 4. Build for Production
```bash
npm run build
```
