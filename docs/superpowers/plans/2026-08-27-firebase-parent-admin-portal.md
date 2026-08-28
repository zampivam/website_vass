# Firebase Parent and Staff Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Firebase-authenticated parent records portal and custom-claim-protected staff dashboard with server-enforced family isolation, audited downloads, and privacy-safe upload notifications.

**Architecture:** The React/Vite site uses Firebase Auth, Firestore, and Storage directly for authentication, intake, metadata, and uploads. Cloud Functions owns email notifications, activity writes, and authenticated file streaming; Firestore and Storage rules deny cross-family access independently of the UI.

**Tech Stack:** React 18, TypeScript, Vite, Firebase Web SDK, Firebase Admin SDK, Firebase Functions v2, Nodemailer, Vitest, Cloudflare Workers static assets.

**Spec:** `docs/superpowers/specs/2026-08-27-firebase-parent-admin-portal-design.md`

## Global Constraints

- Use an 8-point spacing system and preserve the existing VASS visual theme.
- Use only Firebase Auth, Firestore, Cloud Storage, and Cloud Functions for portal backend behavior.
- Do not initialize Realtime Database, Analytics, or Crashlytics.
- Keep PHI out of logs, URLs, email, source control, and generic error messages.
- Keep service-account and SMTP credentials out of the repository.
- Do not host or test the website on localhost; browser verification uses `vass2.giltunnel.org`.

---

### Task 1: Firebase client foundation and domain contracts

**Files:**
- Create: `src/firebase.ts`
- Create: `src/portal/types.ts`
- Create: `src/portal/policy.ts`
- Create: `src/portal/policy.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces `auth`, `db`, `storage`, `googleProvider`, `canAccessAdmin`, `canAccessFamily`, document validation, and privacy-safe error mapping.

- [ ] Write failing Vitest tests for staff claims, verified parents, cross-family denial, allowed document types/sizes, and generic error output.
- [ ] Run the focused tests and confirm they fail because the policy module does not exist.
- [ ] Add Firebase/Vitest dependencies and implement the minimum client/config and pure policy helpers.
- [ ] Run focused tests and confirm they pass.

### Task 2: Firebase parent authentication and intake

**Files:**
- Create: `src/portal/AuthPanel.tsx`
- Create: `src/portal/ParentPortal.tsx`
- Create: `src/portal/intake.ts`
- Create: `src/portal/intake.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/styles.css`
- Delete: `src/supabase.ts`

**Interfaces:**
- Consumes Firebase client exports and policy helpers.
- Produces email/password registration, verification, reset, Google sign-in, parent profile/child intake save, and sign-out UI.

- [ ] Write failing tests for normalization and required professional intake fields.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement AuthPanel and intake helpers/components, keeping family records hidden until authentication and verification succeed.
- [ ] Replace Supabase portal imports and copy with Firebase equivalents.
- [ ] Run focused tests and the TypeScript build.

### Task 3: Parent document workflow and audited download client

**Files:**
- Create: `src/portal/documents.ts`
- Create: `src/portal/documents.test.ts`
- Create: `src/portal/DocumentWorkspace.tsx`
- Modify: `src/portal/ParentPortal.tsx`

**Interfaces:**
- Produces UID/document-ID-only Storage paths, metadata writes, document listing, and POST-based authenticated download calls.

- [ ] Write failing tests proving paths never contain filenames/PHI and reject invalid type/size.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement parent uploads, metadata, listings, and blob downloads through the constant Functions endpoint.
- [ ] Run focused tests and build.

### Task 4: Custom-claim admin route and dashboard

**Files:**
- Create: `src/portal/AdminPortal.tsx`
- Create: `src/portal/AdminDashboard.tsx`
- Create: `src/portal/admin.ts`
- Create: `src/portal/admin.test.ts`
- Modify: `src/main.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Produces `/admin` route gating, family/document listing, staff downloads, progress-report uploads, and activity display.

- [ ] Write failing tests for `/admin` staff/non-staff route decisions and staff progress-report metadata.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement the route gate and dashboard with fresh token claims.
- [ ] Run focused tests and build.

### Task 5: Server-enforced Firebase rules

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `firestore.rules`
- Create: `storage.rules`
- Create: `firestore.indexes.json`
- Create: `tests/rules-source.test.ts`

**Interfaces:**
- Enforces `staff: true`, verified-parent ownership, immutable ownership metadata, no client activity writes, validated uploads, audited-download-only reads, and deny-all fallbacks.

- [ ] Write failing source-contract tests for every required rule guard and deny-all fallback.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement Firestore and Storage rules plus required indexes/config.
- [ ] Run focused tests and Firebase rules validation when project permissions permit.

### Task 6: Cloud Functions notifications, activity, and downloads

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/src/policy.ts`
- Create: `functions/src/policy.test.ts`
- Create: `functions/src/index.ts`

**Interfaces:**
- Produces `onParentDocumentAvailable` and `downloadDocument` Functions.
- Consumes `SMTP_USER`, `SMTP_PASS`, `STAFF_NOTIFICATION_EMAILS`, and `PORTAL_BASE_URL` parameters/secrets.

- [ ] Write failing tests proving notification subject/body contain only fixed copy/link and authorization permits only staff or owning parent.
- [ ] Run focused tests and confirm expected failures.
- [ ] Implement Firestore upload trigger, pseudonymous activity writes, SMTP email, bearer-token verification, POST-body identifiers, private/no-store streaming, and constant log messages.
- [ ] Compile and run Functions tests.

### Task 7: Staff-claim administration and credential hygiene

**Files:**
- Create: `scripts/manage-staff.mjs`
- Create: `.gitignore`
- Create: `docs/firebase-operations.md`

**Interfaces:**
- Produces `node scripts/manage-staff.mjs grant|revoke email@example.com` using Application Default Credentials.

- [ ] Add credential/service-account/secret patterns to `.gitignore` without deleting user files.
- [ ] Implement the grant/revoke script with no credential values or user data logged beyond the requested email.
- [ ] Document owner-only Blaze, Firestore, Storage, Auth provider, authorized-domain, secret, claim, and deployment steps.

### Task 8: Verification, Cloudflare release, and source backup

**Files:**
- Modify as needed from verification findings.

**Interfaces:**
- Produces a tested static bundle and, when owner prerequisites permit, deployed Firebase rules/Functions and a live Cloudflare portal.

- [ ] Run all unit tests, Functions tests, TypeScript compilation, and production build without starting a local server.
- [ ] Enable email/password and Google providers and add authorized production domains when browser permissions allow.
- [ ] Deploy Firestore rules, Storage rules, indexes, and Functions when Blaze/owner roles allow; otherwise record the exact external blockers.
- [ ] Deploy the static application with `wrangler.production.jsonc`.
- [ ] Verify `/`, parent login, Google login control, `/admin` gate, responsive layout, and absence of console errors at `https://vass2.giltunnel.org`.
- [ ] Confirm no credential or `.env.local` file is tracked, then commit and push source to `zampivam/website_vass`.
