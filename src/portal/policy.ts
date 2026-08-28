export type AuthFacts = {
  uid: string;
  emailVerified: boolean;
  staff: boolean;
};

export type DocumentCandidate = {
  type: string;
  size: number;
};

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

export function canAccessAdmin(auth: AuthFacts): boolean {
  return Boolean(auth.uid && auth.staff);
}

export function canAccessFamily(auth: AuthFacts, familyId: string): boolean {
  if (!auth.uid) return false;
  if (auth.staff) return true;
  return auth.emailVerified && auth.uid === familyId;
}

export function validateDocument(candidate: DocumentCandidate):
  | { ok: true }
  | { ok: false; reason: "unsupported-type" | "file-too-large" } {
  if (!ALLOWED_DOCUMENT_TYPES.has(candidate.type)) {
    return { ok: false, reason: "unsupported-type" };
  }
  if (candidate.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, reason: "file-too-large" };
  }
  return { ok: true };
}

export function safePortalError(_error: unknown): string {
  return "We could not complete that request. Please try again or contact VASS.";
}
