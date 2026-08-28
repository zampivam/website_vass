export type ServerAuthFacts = {
  uid: string;
  staff: boolean;
  emailVerified: boolean;
};

export type ActivityInput = {
  action: "upload" | "download";
  familyId: string;
  documentId: string;
  actorUid: string;
  actorRole: "parent" | "staff";
  createdAt: Date;
};

export function authorizeDownload(auth: ServerAuthFacts, familyId: string): boolean {
  if (!auth.uid) return false;
  if (auth.staff) return true;
  return auth.emailVerified && auth.uid === familyId;
}

export function buildUploadNotification(portalBaseUrl: string) {
  const adminUrl = `${portalBaseUrl.replace(/\/$/, "")}/admin`;
  return {
    subject: "New parent portal upload",
    text: `A new document was uploaded. Log in to view.\n\n${adminUrl}`,
    html: `<p>A new document was uploaded. Log in to view.</p><p><a href="${adminUrl}">Open the staff portal</a></p>`
  };
}

export function buildActivityRecord(input: ActivityInput): ActivityInput {
  return {
    action: input.action,
    familyId: input.familyId,
    documentId: input.documentId,
    actorUid: input.actorUid,
    actorRole: input.actorRole,
    createdAt: input.createdAt
  };
}
