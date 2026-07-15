# Task List: Fable Hood ($FOOD) TDD Implementation
*Senior Software Engineer (20+ Years Exp) Step-by-Step Verification Roadmap*

---

## [x] Phase 1: Project Setup & Infrastructure
- [x] Initialize Next.js 14 project using App Router and TypeScript.
- [x] Configure Tailwind CSS v4 and import fonts (Space Grotesk, Inter, JetBrains Mono).
- [x] Install Web3 dependencies (`viem`, `wagmi`, `@wagmi/core`, `@turnkey/api-key-stamper`).
- [x] Install database and API orchestration packages (`@supabase/supabase-js`, `drizzle-orm`, `@upstash/ratelimit`, `@upstash/redis`, `@anthropic-ai/sdk`).
- [x] Set up environment variables locally (`.env.local`) with placeholders for Supabase, Helius, Anthropic, and L2 RPC Nodes.
- [x] **Verification Point (Uji Coba)**: Run `npm run dev` and perform compile check.
  - *Expected Outcome*: Next.js starts without TS compile errors, CSS loads correctly, and node libraries initialize successfully.

## [x] Phase 2: Database Schema & Migration (Supabase + Drizzle)
- [x] Create Drizzle schemas matching `/src/db/schema.ts` for SQL tables:
  - [x] `wallet_profiles` (reputation indices, launches, avg_extraction, etc.)
  - [x] `wallet_sessions` (siwe nonces, creation logs, and session expiry check)
  - [x] `scans` (token address checksum as PK, findings array, raw UAIM metadata JSON, scanned_at)
- [x] Run migrations to provision Supabase PostgreSQL tables.
- [x] Verify Row-Level Security (RLS) policies on Supabase to ensure public reads but authenticated session edits only.
- [x] **Verification Point (Uji Coba)**: Run a seeding script to insert mockup rows into each table and query them back using Drizzle.
  - *Expected Outcome*: Records are successfully saved, foreign key constraints hold, and RLS blocks non-signed requests.

## [x] Phase 3: SIWE Replay-Resistant Wallet Login
- [x] Build `/api/auth/nonce` endpoint that generates a secure, cryptographically random nonce and saves it to the database with a 5-minute expiration window.
- [x] Build `/api/auth/verify` endpoint:
  - [x] Recovers the signer's address from the SIWE message signature.
  - [x] Validates the nonce matches the database cache and is not expired.
  - [x] Generates an active record in `wallet_sessions` table with a custom session token.
- [x] Implement Phantom EVM provider hook (`window.phantom?.ethereum`) to trigger signature prompts on the client.
- [x] **Verification Point (Uji Coba)**: Trigger a wallet sign-in, recover signer address, and check session insertion. Repeat sign-in with the exact same signature.
  - *Expected Outcome*: First signature generates active session token in database. Reusing the old signature/nonce throws `NONCE_EXPIRED` or `INVALID_NONCE` rejection.

## [x] Phase 4: Robinhood L2 RPC Sandbox & Explorer Integration
- [x] Implement the RPC client matching `RobinhoodChainClient` adapter:
  - [x] Set up connection wrapper supporting dynamic L2 Fallback RPC node list.
  - [x] Implement `eth_getCode` parser to inspect raw contract bytecode.
  - [x] Implement `eth_call` execution routines to simulate buy/sell transactions on dry-runs.
- [x] Construct mock honeypot detection wrapper matching the `000` address signature.
- [x] Integrate indexer query adapters to fetch transaction histories (imitating Blockscout explorer adapters).
- [x] **Verification Point (Uji Coba)**:
  - [x] Scan mock honeypot address (ends with `000`) and a normal clean contract.
  - [x] Disrupt connection to main RPC node during a dry-run fetch.
  - *Expected Outcome*: Alamat `000` throws revert `HONEYPOT_DETECTED_TRANSFER_BLOCKED`. Clean contract runs successfully. If primary RPC fails, client switches to fallback node in under 2 seconds without client error.

## [x] Phase 5: x402 Token Gating & Payment SLA
- [x] Implement balance verification query for token $FOOD (x402 protocol) using `publicClient.readContract` at the exact block timestamp (using 0.05 ETH threshold).
- [x] Build EVM transaction generator for micro-payments:
  - [x] Set up `eth_sendTransaction` pipeline to transfer `0.05 ETH` fallback fees.
  - [x] Implement receipt polling mechanism that polls node status for 60 seconds with `getTransactionReceipt`.
- [x] Build a React modal screen that blocks scans if gating checks fail, offering x402 validation or micro-payment options.
- [x] **Verification Point (Uji Coba)**:
  - [x] Trigger scan with wallet holding < minimum 0.05 ETH threshold.
  - [x] Complete the `0.05 ETH` fallback fee checkout and watch transaction validation status.
  - *Expected Outcome*: Access is blocked initially. Once payment is sent, transaction receipt polling confirms status and details of scan are unlocked.

## [x] Phase 6: Anthropic Claude Cognitive Audit API
- [x] Create `/api/scan` route handler (API endpoint).
- [x] Implement input string sanitization: Validate contract address matching regex `^0x[a-fA-F0-9]{40}$` and convert to checksum EIP-55 format.
- [x] Build data normalizer to assemble the contract context (bytecode, creator profile, block state) into a UAIM draft.
- [x] Hook up `@anthropic-ai/sdk` Claude instance:
  - [x] Setup structured system prompt to force output JSON adhering strictly to the `ScanResult` interface.
  - [x] Handle AI response parsing errors gracefully with safe fallback JSON.
- [x] **Verification Point (Uji Coba)**: POST request to `/api/scan` with invalid inputs, followed by a valid EVM contract address.
  - *Expected Outcome*: Malicious characters or wrong formats return HTTP 400. Valid address returns structured audit JSON (score, risk level, findings array) parsed correctly.

## [x] Phase 7: Caching & Rate-Limiting Security Layer
- [x] Configure Upstash Redis client interface.
- [x] Implement `@upstash/ratelimit` on the `/api/scan` route:
  - [x] Restrict requests based on IP addresses and logged-in EVM wallet profiles (e.g. limit to 5 scans per minute per user).
- [x] Configure Cache Lookup pipeline inside `/api/scan`:
  - [x] Check `scans` table first. If contract exists and `scanned_at` is under 15 minutes old, return cache.
  - [x] If cache is stale or user clicks "Force Re-scan" (triggering billing validation), execute full node simulations and AI evaluations.
- [x] **Verification Point (Uji Coba)**: Spam `/api/scan` endpoint 10 times in a row. Trigger a scan for the same address after 2 minutes.
  - *Expected Outcome*: Requests 6+ throw HTTP 429 (Too Many Requests). Second scan loading speed is immediate, loading directly from the `scans` database cache table.

## [x] Phase 8: Frontend UI & Page Transitions
- [x] Build landing layout wrapper (`landing-view`) with a Light Theme Off-White style (`#fafbf9`).
- [x] Build custom mascot SVG indicators and reticle sweep loops.
- [x] Build the dark console dashboard (`forensics-view`, `#050806`) containing:
  - [x] Input console screen.
  - [x] Loading progress terminal writing out simulations dynamically.
  - [x] Outcome report details (safety score gauges, safety pills, risk list).
- [x] Write global layout state handlers to transition styles by toggling `.dark-mode` on the `body` element.
- [x] **Verification Point (Uji Coba)**: Click "Start Forensic Scan" and check transitions. Verify layout colors.
  - *Expected Outcome*: Theme transitions without layout shifting or flash of unstyled content. Dark mode matches console theme `#050806`, light matches `#fafbf9`.

## [x] Phase 9: Testing & Forensic Hardening
- [x] Run overall automated test suites.
- [x] Verify that cash checkouts correctly update database profiles and cache records.
- [x] Perform cross-browser tests on Phantom wallet EVM prompts.
- [x] **Verification Point (Uji Coba)**: Run `npm run test` or cypress/jest suites.
  - *Expected Outcome*: 100% pass on SIWE, gateway checks, sandbox mocks, and caching rules.
