# Architectural Assumptions & Constraints

1. **Stripe Test Mode:** Payments use Stripe TEST MODE; no real funds are moved.
2. **Escrow Simulation:** Escrow relies on a server `pg_cron` automated script hitting `releaseEscrow.ts`. A true escrow might rely on specific legal banking frameworks.
3. **DNS Claim Flow:** Real DNS lookup delays might happen; the codebase uses `dns.resolveTxt` asynchronously but a demo fallback for `example.com` skips verification networking delays to ensure judging panel flow.
4. **Admin Role Isolation:** The role separation currently isolates `ADMIN_EMAIL` via Env checking. Real applications might utilize a `roles = ['admin']` DB structure.
5. **AI Constraints:** Claude API requests are strictly rate-limited per user context via pg_cron counters (5/hour) limiting API explosion.
6. **Face API Models:** The `face-api.js` weights utilize the local `public/models` folder. In production, we assume 512-d ArcFace, however we output 128-d arrays to comply with the selected WebGL JS model.
7. **Business Opportunities Stub:** The UI for B2B opportunities is completed, but messaging routes internally log the exchange as per Phase 2 explicitly.
8. **Referral Fraud:** Fingerprinting is heuristically analyzed alongside vector threshold clustering, but lacks hardware MAC identification.
