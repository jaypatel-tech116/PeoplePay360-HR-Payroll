# PeoplePay360 — Strategic Product & Engineering Roadmap

*Prepared for Odoo Hackathon 2026 Presentation*

---

## Executive Vision
**PeoplePay360** bridges modern HR operational workflows with automated, formula-driven salary calculation and statutory compliance. While the current release delivers end-to-end integration across Employee Masters, Working Schedules, Overlap-Guarded Contracts, Bi-directional Attendance, Atomic Leave Balances, Sequenced Formula Engines, and Two-Step Payrun Wizards, the roadmap outlines high-impact enhancements for enterprise deployment.

---

## Milestone 1: Hardware Biometrics & Geofenced Self-Service (Q4 2026)
1. **IoT Biometric Terminal Connectors:**
   - Direct socket/REST listeners for ZKTeco, Anviz, and Suprema biometric terminals.
   - Real-time event ingestion to stream clock-in/out records directly into the `attendances` table without batch CSV imports.
2. **Geofenced Mobile Self-Service (PWA / React Native):**
   - GPS-bounded shift check-ins with facial liveness verification for remote and field employees.
   - Offline punch caching with cryptographically signed timestamp verification upon network reconnect.

---

## Milestone 2: Multi-Jurisdiction Statutory Tax Engine (Q1 2027)
1. **Jurisdiction-Aware Rule Packs:**
   - Pre-built, versioned rule sets for Indian Statutory Payroll:
     * Employee Provident Fund (EPF & EPS limits)
     * Employee State Insurance (ESIC ceiling)
     * State-wise Professional Tax (PT slabs for Maharashtra, Karnataka, Gujarat, etc.)
     * New vs. Old Income Tax Regime slabs with Section 80C/80D declarations.
   - Modular support for international payroll (US W-2 / FICA, UK PAYE, UAE WPS).
2. **Automated Tax Declaration & Proof Verification:**
   - Employee portal to upload rent receipts, 80C investment proofs, and home loan certificates.
   - OCR-assisted validation with automatic adjustment of TDS percentage rules in real time.

---

## Milestone 3: Direct Banking & Payment Gateway Batches (Q2 2027)
1. **Direct Bank Settlement Protocol:**
   - Generation of ISO 20022 and NACHA direct debit/credit payout files upon Payrun "Mark Paid".
   - Direct API integration with partner corporate banking APIs (ICICI Corporate Banking API, HDFC E-Net, RazorpayX) for instant salary disbursement.
2. **Instant Payout Webhooks:**
   - Webhook receivers updating individual payslip transaction IDs (`UTR` numbers) with payout acknowledgment notifications sent via SMS and WhatsApp.

---

## Milestone 4: AI-Driven Workforce Optimization & Anomaly Detection (Q3 2027)
1. **Predictive Shift & Overtime Scheduling:**
   - Machine learning models analyzing historical demand and shift fatigue to suggest optimal working schedules and avoid excessive overtime.
2. **Payroll Anomaly & Fraud Detection:**
   - Algorithmic audits alerting payroll managers to sudden variance in wage spikes, irregular attendance clustering, or ghost employee indicators before batch validation.

---

*PeoplePay360 — Engineered for compliance, operational continuity, and seamless scale.*
