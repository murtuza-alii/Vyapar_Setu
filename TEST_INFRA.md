# E2E Test Infra: Vyapar Setu (व्यापार सेतु)

## 1. Test Philosophy
- **Opaque-Box & Requirement-Driven**: Tests derive strictly from user requirements in `ORIGINAL_REQUEST.md`, `docs/vyapar_setu_project_spec.md`, and `PROJECT.md § Feature Inventory`.
- **Zero Coupling to Implementation Internals**: Exercises the system via public APIs, public contracts, and user interactions.
- **Progressive Testability**: Verification does not depend on features more complex than the feature under test. Tier 1 tests give pass/fail signals with early foundations.
- **Methodology**: Systematic 4-tier design:
  - **Tier 1 - Feature Coverage**: $\ge 5$ test cases per feature covering representative happy-path equivalence classes.
  - **Tier 2 - Boundary & Corner Cases**: $\ge 5$ test cases per feature covering zero, negative, maximum limits, edge cases, and invalid inputs.
  - **Tier 3 - Cross-Feature Combinations**: Pairwise interaction tests covering state, data flow, and control flow transitions.
  - **Tier 4 - Real-World Application Scenarios**: Multi-step realistic wholesale workflows (e.g. "The Textile Deal", Building materials split dispatch, Inter-merchant peer sourcing).

## 2. Feature Inventory & Coverage Mapping
All 40 features from `PROJECT.md` are mapped:
- Features 1–6 (Common Foundation): Dual schemas, double-entry ledger invariants, offline storage, RBAC, Seed data.
- Features 7–17 (Pillar 1 Cockpit): Morning briefing, Udhari radar, payables forecast, transit & dead stock, Hinglish voice NLP parser, draft card, micro-khata, partial payments, WhatsApp reminders with UPI, Galla cash tally, bank reconciliation.
- Features 18–27 (Pillar 2 Control Tower): Industry mode selector, textile lot matrix & reservation locks, bulk units & weighbridge slips, 6-stage deal lifecycle, dispatch bilty & E-Way bills, partial/split delivery notes, true net margin equation & guardrails.
- Features 28–39 (Pillar 3 Network & Cockpit Shell): RFQ landed cost matrix, 1-click PO, peer sourcing with 15-min soft lock, Samoohik Kharid group buying pools, trade reputation passport, "The Textile Deal" demo flow, cockpit UI shell.
- Feature 40 (Verification & Hardening): E2E full pass & adversarial coverage hardening.

## 3. Test Architecture
- **Runner Command**: `npx tsx tests/test-runner.ts`
- **Output Format**: Structured CLI output with pass/fail summary, exit code 0 on complete pass, exit code 1 on any failure.
- **Directory Layout**:
  ```
  tests/
  ├── test-runner.ts                 # CLI runner executing all test suites
  ├── tier1-feature-coverage.test.ts # Tier 1 test suite
  ├── tier2-boundary-corner.test.ts  # Tier 2 test suite
  ├── tier3-cross-feature.test.ts    # Tier 3 test suite
  └── tier4-real-world.test.ts       # Tier 4 test suite
  ```

## 4. Minimum Coverage Thresholds
- **Tier 1**: $\ge 5 \times 39 \approx 195+$ tests (covering all features in isolation)
- **Tier 2**: $\ge 5 \times 39 \approx 195+$ tests (boundary & edge conditions)
- **Tier 3**: $\ge 40+$ tests (cross-feature pairwise combinations)
- **Tier 4**: $\ge 8+$ comprehensive realistic application workflow scenarios
- **Total Suite**: $430+$ tests
