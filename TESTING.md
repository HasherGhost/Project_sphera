# Testing Strategy

We employ a 3-tier testing hierarchy targeting the highest value compliance vectors of the Devkraft hackathon brief.

## 1. Unit Tests (Vitest)
Unit tests operate entirely in memory.
- **Coverage**: Mathematical foundations.
- **Targets**:
  - `faceMatch.test.ts`: Verifies edge behaviors of Cosine similarities (0 divergence identicals, 1.0 orthogonal, boundary acceptance <0.4 distance logic).
  - `promotionBilling.test.ts`: Verifies budget decrements, LAUNCH60 coupon arithmetic, and cap enforcements.
  
## 2. Integration Tests (Vitest + Local Supabase Instance)
Tests spanning cross-API boundaries that touch PostgreSQL directly.
- **RLS Checks**: Running unauthorized API requests and asserting 401s across protected schema insert triggers.
- **Action Mutations**: Sending dummy POSTs to `createCampaign.ts` to ensure database decrements run properly within ACID constraints.

## 3. End-to-End (E2E Playwright)
Automates browser level compliance against user flow logic.
- **How to mock Webcam in CI**: Playwright is configured via `chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-video-capture=/fixtures/sample-face.y4m'] })` effectively passing a fake human video stream into the Chromium test runner to test the WebGL Face Detection loop without manual oversight.
- **Coverage Check**:
  - User Sign up -> Trigger WebCam -> Ensure redirect fails if skipped.

## How to Run Locally
1. `npm run test` (Executes Vitest)
2. `npm run test:e2e` (Executes Playwright cluster)
