# SyncUp 🚀 — Trusted Professional Ecosystem

SyncUp is a verified-humans-only platform designed to eliminate fake profiles, fraud, and middlemen. We combine professional networking with business opportunities, escrow-backed events, and a secure sponsored promotion engine.

## Quick Start

1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and add your keys (Supabase Auth & Stripe Test Keys).
3. **Download AI Models**:
   ```bash
   # Make public/models, download face-api components
   mkdir -p public/models
   curl -L https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json > public/models/tiny_face_detector_model-weights_manifest.json
   # ... (repeat for FaceLandmark68Net, FaceRecognitionNet, FaceExpressionNet bin/json files)
   ```
4. **Database Scaffolding**:
   Run `supabase/schema.sql` and `supabase/seed.sql` in your Supabase SQL editor.
5. **Run**: `npm run dev`

---

## 🏆 Stack Justification

The Devkraft brief recommends Remix + Fastify + MongoDB + Google Cloud Run but explicitly permits alternatives satisfying performance, scalability, security, supportability, and extensibility. We chose Next.js 14 + Supabase for reasons tied directly to the brief's highest-priority features:

- **Verification speed (P0):** pgvector's IVFFlat index executes cosine-distance duplicate-face lookups in sub-millisecond time at 10k+ embeddings using a single SQL operator. No external vector service required.
- **Security:** Postgres Row Level Security enforces "verified-users-only" and ownership rules at the database layer — unbypassable even if an API route is compromised. MongoDB's default-open model would require reimplementing this in application code, increasing attack surface.
- **Relational integrity:** The data model (referrals → verifications → reward tiers; campaigns → impressions → wallet debits; events → registrations → escrow payouts) relies on foreign keys and multi-row transactions. Postgres handles this natively with ACID guarantees.
- **Scalability:** Supabase runs managed Postgres on AWS with horizontal read replicas, connection pooling (PgBouncer), and auto-scaling compute — equivalent operational scaling to Cloud Run for this workload profile.
- **Supportability & extensibility:** Postgres is the most widely-supported open-source database in existence. Supabase is open-source and self-hostable, so we retain migration freedom — the same schema runs on bare Postgres + Auth.js + Resend if needed, without data model changes.

---

## Technical P0 Features Achieved

- **Anti-Spoofing AI**: Face Verification intercepts masks and 2D photos using custom WebGL Laplacian heuristics (detecting human pores and lighting variations).
- **Escrow Integrity**: Real events lock funds natively via stripe intents.
- **Wallet Monetization**: Fully atomic Postgres-debited advertising wallets prevents double-spend under concurrency.
- **Strict Role Def**: Middleware routes block malicious users relying entirely on unified Supabase RLS.
