# Firebase Parent and Staff Portal Design

## Goal

Replace the existing Supabase-backed portal with a Firebase portal where parents manage only their own family intake and documents, while staff with the Firebase custom claim `staff: true` can review all families, upload progress reports, and see a privacy-minimized activity log.

## Services and boundaries

- Firebase Authentication provides email/password and Google sign-in. Email/password accounts must verify their email before accessing family records.
- Cloud Firestore stores parent profiles, child intake information, document metadata, and pseudonymous activity events.
- Cloud Storage stores uploaded files under a family-owned path.
- Cloud Functions sends constant-content staff notifications and provides an authenticated, audited file-download endpoint.
- Cloudflare continues to serve the static React application at `vass2.giltunnel.org` and does not process or store portal records.
- Firebase Analytics, Realtime Database, and Crashlytics are not initialized or used.

## Routes and access

- The public website remains available at `/`.
- The existing parent portal remains linked from the public site. Its intake and documents workspace appears only after Firebase sign-in.
- `/admin` shows staff sign-in when signed out. After sign-in, the route reads a fresh ID token and requires `staff: true`.
- A signed-in user without the staff claim is redirected to `/#portal`.
- UI checks are convenience checks only. Firestore rules, Storage rules, and the download function independently enforce authorization.

## Authentication

- Parents may create an email/password account or sign in with Google.
- Email/password registration sends a Firebase verification email. Unverified email/password users cannot read or write family data.
- Google accounts are accepted as verified accounts.
- Password reset is available from the login form.
- Staff accounts use either sign-in method but require the separately assigned `staff: true` custom claim.
- `scripts/manage-staff.mjs` grants or revokes the claim by email using the Firebase Admin SDK. It reads credentials through Application Default Credentials or `GOOGLE_APPLICATION_CREDENTIALS`; no credential is committed.

## Data model

### `families/{familyId}`

`familyId` is the parent Firebase Auth UID. The document stores parent or caregiver name, relationship, phone, preferred contact method, mailing address, intake status, and timestamps. The authenticated parent can read and update only this document; staff can read all families.

### `families/{familyId}/children/{childId}`

Stores the child's legal and preferred names, date of birth, school and grade, primary language, diagnosis status, requested services, and insurance fields. A parent can access children only under their own UID path. Staff can read all children.

### `families/{familyId}/documents/{documentId}`

Stores a display filename, Storage path, MIME type, size, document category, uploader UID and role, upload timestamp, and availability status. Parents can create metadata only for their own family and cannot claim to be staff. Staff can create progress-report metadata for any family.

### `activity/{activityId}`

Written only by Cloud Functions. Stores action (`upload` or `download`), pseudonymous family/document/actor IDs, actor role, and timestamp. It stores no names, filenames, addresses, insurance information, or clinical content. Only staff can read it.

## File paths and downloads

- Files are stored at `families/{familyId}/documents/{documentId}`. The path contains no names or filenames.
- Parent writes require `request.auth.uid == familyId` and a verified email. Staff writes require `request.auth.token.staff == true`.
- Client-side Storage reads are denied. All downloads use one constant Cloud Function URL with IDs in the POST body, never the URL.
- The download function verifies the Firebase ID token, permits only the owning parent or staff, writes the activity event, and streams the file with private/no-store headers.

## Notifications

When a parent document becomes available, a Firestore-triggered Cloud Function emails configured staff recipients with the fixed message: `A new document was uploaded. Log in to view.` and a link to `/admin`. The subject and body contain no parent name, child name, filename, category, or clinical content. Staff-uploaded progress reports do not trigger this notification.

Email transport uses the organization's Google Workspace SMTP account through Cloud Functions. SMTP credentials and recipient addresses are configured as Cloud Functions secrets and never committed.

## Security rules

- `isStaff()` checks `request.auth.token.staff == true`.
- `isVerifiedParent(familyId)` requires authentication, matching UID, and a verified email.
- Firestore family, child, and document rules repeat those checks at every applicable path.
- Parents cannot list the top-level `families` collection or read `activity`.
- Document creates validate immutable ownership fields and allowed file metadata. Parents cannot write `uploadedByRole: "staff"` or a different uploader UID.
- Activity writes are denied to all client SDKs.
- Storage paths contain only UIDs/document IDs, validate content type and a 10 MB maximum, and permit writes only to the owning parent or staff. Client reads are denied so audited downloads cannot be bypassed.
- All unmatched Firestore and Storage paths are denied.

## Admin dashboard

The dashboard lists families and their document metadata, provides audited downloads, permits staff progress-report uploads assigned to a selected family, and shows recent upload/download activity. Family names and filenames are joined in the authenticated UI and are not copied into activity records.

## Error and logging policy

User-facing errors are generic and do not echo file names, health information, insurance information, or Firebase response bodies. Cloud Functions log only constant operational messages. PHI does not appear in URLs, email, console logs, Cloud Function logs, analytics, or source control.

## Testing and release

- Unit tests cover authorization decisions, intake/document validation, route access, and notification content.
- The production build must pass without initializing prohibited Firebase products.
- Firestore and Storage rules must be deployed to `website-e8b0a` and verified with two parent accounts and one staff account before real records are accepted.
- The browser verification uses the Cloudflare URL, never localhost.

## Current deployment blockers

The Firebase project is currently on Spark, so Storage and Cloud Functions cannot be deployed. The signed-in Editor also cannot create/manage Firestore in this project. Andrea must upgrade to Blaze, create or authorize creation of Firestore and Storage, and grant the roles needed to deploy rules and Functions. Real family information must not be entered until the organization has confirmed its Google Cloud BAA and production security responsibilities.

## Non-goals

- No staff account-management UI; custom claims are managed by the Node script.
- No billing, scheduling, clinical notes, messaging, electronic signatures, or EHR integration.
- No Realtime Database, Analytics, Crashlytics, public file URLs, filenames in URLs, or PHI in notifications/logs.
