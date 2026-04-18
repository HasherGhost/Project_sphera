# Sphera 🌐 — The True Professional Ecosystem

Sphera is a verified-humans-only platform designed to eliminate fake profiles, bots, and fraud in the professional world. We combine high-integrity networking with business opportunities, escrow-backed events, and an AI-powered verification engine.

Sphera has evolved into a minimalist, premium ecosystem where every interaction is backed by verified identity.

## 🚀 Core Value Proposition

- **Zero-Bot Environment**: Camera-based liveness verification ensures every profile belongs to a real human.
- **Trust-First Networking**: Professional social feed where "Trust Signals" replace vanity metrics.
- **Secure Business**: Escrow-backed event registrations and verified company ownership.
- **Monetized Growth**: A robust credits-based promotion system for verified professionals and businesses.

---

## 🛠️ Stack Justification

Sphera is built on a high-performance stack chosen for security, scalability, and integrity: **Next.js 14 + Supabase**.

- **Biometric Integrity (P0)**: uses `face-api.js` for client-side anti-spoofing and `pgvector` for sub-millisecond duplicate-face lookups at scale.
- **Security & RLS**: Postgres Row Level Security (RLS) enforces "verified-users-only" rules at the database layer, ensuring unbypassable data protection.
- **Escrow Reliability**: Multi-row ACID transactions handle the complex relationships between referrals, events, and reward tiers natively.
- **Wallet Monetization**: Fully atomic Postgres-debited advertising wallets prevent double-spending in the promotion engine.

---

## 🏗️ Project Structure

The project encompasses a full-stack application and a new minimalist frontend suite:

- **`/app`**: Next.js 14 App Router containing the dashboard, verification flows, and event management.
- **`/backend`**: Server actions for face verification, escrow handling, and company claims.
- **`/database`**: SQL schemas for the underlying Postgres/Supabase architecture, including `pgvector` implementations.
- **Root HTML Files**: The new **Sphera** minimalist frontend suite (`feed.html`, `network.html`, `event.html`, etc.) — designed for premium, lightweight professional interaction.
- **`/frontend`**: Supporting React components for the Next.js ecosystem.

---

## ✨ Technical P0 Features

### 1. Anti-Spoofing AI
Face Verification intercepts masks and 2D photos using custom WebGL Laplacian heuristics, detecting human pores and lighting variations to ensure liveness.

### 2. Event Escrow Integrity
Real-world events utilize Stripe manual-capture intents. Funds are held in escrow and only captured/released upon successful event completion or verification.

### 3. Promotion Engine
A fully integrated ad-wallet system. Users can redeem coupons for credits and use them to boost posts, events, or company profiles. Every impression is atomically debited from the campaign budget.

### 4. Company Ownership Claims
Domain-based verification flow allows founders and business owners to claim their professional profiles by matching authenticated email domains with corporate records.

---

## 📥 Getting Started

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and add your keys:
    - `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` (for admin actions)
    - `STRIPE_SECRET_KEY` (for escrow)
3.  **AI Models**:
    Ensure `face-api.js` weights are located in `public/models`.
4.  **Database**:
    Execute `database/schema.sql` and `database/seed.sql` in your Supabase SQL editor.
5.  **Run**:
    ```bash
    npm run dev
    ```

---

## 🗺️ Roadmap & Features

- [x] Liveness Verification
- [x] Trusted Professional Feed
- [x] Stripe Escrow Integration
- [x] Credits-Based Promo Engine
- [x] Company Verification Flow
- [x] Responsive "Sphera" Minimalist UI
- [ ] Post-Event Payout Automation
- [ ] Referral Milestone Rewards
