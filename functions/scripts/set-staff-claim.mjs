import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const [action, email] = process.argv.slice(2);
if (!["grant", "revoke"].includes(action) || !email) {
  console.error("Usage: node scripts/set-staff-claim.mjs <grant|revoke> <email>");
  process.exit(1);
}

initializeApp({ credential: applicationDefault() });
const auth = getAuth();
const user = await auth.getUserByEmail(email);
const nextClaims = { ...(user.customClaims ?? {}) };

if (action === "grant") nextClaims.staff = true;
else delete nextClaims.staff;

await auth.setCustomUserClaims(user.uid, nextClaims);
console.log(`Staff access ${action === "grant" ? "granted" : "revoked"}. The user must sign in again.`);
