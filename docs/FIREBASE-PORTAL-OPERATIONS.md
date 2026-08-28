# Firebase portal operations

## Production prerequisites

- Upgrade project `website-e8b0a` to a plan that supports Cloud Storage and Cloud Functions.
- Execute a Business Associate Agreement and confirm every enabled Firebase/Google Cloud service is covered before collecting protected health information.
- Enable Email/Password and Google in Firebase Authentication.
- Add `vassllc.org` and `www.vassllc.org` to Authentication > Settings > Authorized domains.
- Create Firestore and Cloud Storage in the chosen US region.

## Deploy security and functions

From the repository root, authenticate the Firebase CLI to the owner's project, then deploy rules, indexes, and functions:

```text
firebase deploy --only firestore:rules,firestore:indexes,storage,functions
```

Configure these Functions secrets when prompted or before deployment:

- `SMTP_USER`: Google Workspace mailbox used to send notifications.
- `SMTP_PASS`: Google Workspace app password for that mailbox.
- `STAFF_NOTIFICATION_EMAILS`: comma-separated staff recipients, such as `admin@vassllc.org`.
- `PORTAL_BASE_URL`: `https://www.vassllc.org`.

The notification contains only the fixed statement “A new document was uploaded. Log in to view.” and a portal link.

## Grant or revoke staff access

Never commit a service-account JSON file. Use Application Default Credentials or set `GOOGLE_APPLICATION_CREDENTIALS` to a credential stored outside this repository, then run from `functions`:

```text
node scripts/set-staff-claim.mjs grant staff@example.com
node scripts/set-staff-claim.mjs revoke staff@example.com
```

The user must sign out and back in after a claim changes.

## Security model

- Firestore parents are limited to `/families/{their uid}` and its child/document records. Staff access requires the custom claim `staff: true`.
- Storage objects use opaque IDs at `/families/{family uid}/documents/{document id}`. Direct reads are denied for everyone; the download Function verifies the ID token and ownership/staff claim before returning bytes.
- Uploads accept only PDF, JPG, PNG, and DOCX files up to 10 MB.
- Activity records are readable only by staff and writable only by trusted server code.
- No Realtime Database, Analytics, or Crashlytics SDK is initialized.
