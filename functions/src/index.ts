import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import nodemailer from "nodemailer";
import { authorizeDownload, buildUploadNotification } from "./policy.js";

initializeApp();

const smtpUser = defineSecret("SMTP_USER");
const smtpPass = defineSecret("SMTP_PASS");
const staffNotificationEmails = defineSecret("STAFF_NOTIFICATION_EMAILS");
const portalBaseUrl = defineSecret("PORTAL_BASE_URL");
const safeId = /^[A-Za-z0-9_-]+$/;
const allowedOrigins = new Set(["https://www.vassllc.org", "https://vassllc.org", "https://vass2.giltunnel.org"]);

function allowCors(request: Parameters<Parameters<typeof onRequest>[0]>[0], response: Parameters<Parameters<typeof onRequest>[0]>[1]) {
  const origin = request.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Vary", "Origin");
  }
  response.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

export const downloadDocument = onRequest({ region: "us-central1", cors: false }, async (request, response) => {
  allowCors(request, response);
  if (request.method === "OPTIONS") {
    response.status(204).send("");
    return;
  }
  if (request.method !== "POST") {
    response.status(405).json({ error: "Request not allowed." });
    return;
  }

  try {
    const bearer = request.get("authorization") ?? "";
    if (!bearer.startsWith("Bearer ")) throw new Error("unauthorized");
    const decoded = await getAuth().verifyIdToken(bearer.slice(7), true);
    const familyId = String(request.body?.familyId ?? "");
    const documentId = String(request.body?.documentId ?? "");
    if (!safeId.test(familyId) || !safeId.test(documentId)) throw new Error("invalid-request");

    const authorized = authorizeDownload(
      { uid: decoded.uid, staff: decoded.staff === true, emailVerified: decoded.email_verified === true },
      familyId
    );
    if (!authorized) throw new Error("unauthorized");

    const db = getFirestore();
    const snapshot = await db.doc(`families/${familyId}/documents/${documentId}`).get();
    if (!snapshot.exists || snapshot.get("status") !== "available") throw new Error("not-found");
    const storagePath = String(snapshot.get("storagePath") ?? "");
    if (storagePath !== `families/${familyId}/documents/${documentId}`) throw new Error("invalid-record");

    const [contents] = await getStorage().bucket().file(storagePath).download();
    await db.collection("activity").add({
      action: "download",
      familyId,
      documentId,
      actorUid: decoded.uid,
      actorRole: decoded.staff === true ? "staff" : "parent",
      createdAt: FieldValue.serverTimestamp()
    });

    const rawName = String(snapshot.get("displayName") ?? "document");
    const safeName = rawName.replace(/[\r\n"\\]/g, "_").slice(0, 180);
    response.set("Content-Type", String(snapshot.get("mimeType") ?? "application/octet-stream"));
    response.set("Content-Disposition", `inline; filename="${safeName}"`);
    response.set("Cache-Control", "private, no-store");
    response.status(200).send(contents);
  } catch {
    response.status(403).json({ error: "Document access was not authorized." });
  }
});

export const notifyStaffOfParentUpload = onObjectFinalized(
  { region: "us-central1", secrets: [smtpUser, smtpPass, staffNotificationEmails, portalBaseUrl] },
  async (event) => {
    const match = event.data.name.match(/^families\/([A-Za-z0-9_-]+)\/documents\/([A-Za-z0-9_-]+)$/);
    if (!match) return;
    const [, familyId, documentId] = match;
    const actorUid = String(event.data.metadata?.uploadedByUid ?? "");
    if (!safeId.test(actorUid)) return;
    const actorRole = actorUid === familyId ? "parent" : "staff";
    const db = getFirestore();
    await db.collection("activity").add({
      action: "upload",
      familyId,
      documentId,
      actorUid,
      actorRole,
      createdAt: FieldValue.serverTimestamp()
    });

    if (actorRole !== "parent") return;
    const recipients = staffNotificationEmails.value().split(",").map((value) => value.trim()).filter(Boolean);
    if (!recipients.length) return;
    const message = buildUploadNotification(portalBaseUrl.value());
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser.value(), pass: smtpPass.value() }
    });
    await transporter.sendMail({ from: smtpUser.value(), to: recipients, ...message });
  }
);
