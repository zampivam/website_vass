export type UploaderRole = "parent" | "staff";

export type DocumentMetadataInput = {
  familyId: string;
  documentId: string;
  displayName: string;
  documentType: string;
  mimeType: string;
  size: number;
  uploadedByUid: string;
  uploadedByRole: UploaderRole;
};

const SAFE_ID = /^[A-Za-z0-9_-]+$/;

function assertSafeId(value: string): void {
  if (!value || !SAFE_ID.test(value)) {
    throw new Error("Invalid document identifier.");
  }
}

export function buildStoragePath(familyId: string, documentId: string): string {
  assertSafeId(familyId);
  assertSafeId(documentId);
  return `families/${familyId}/documents/${documentId}`;
}

export function buildDocumentMetadata(input: DocumentMetadataInput) {
  return {
    familyId: input.familyId,
    documentId: input.documentId,
    displayName: input.displayName,
    documentType: input.documentType,
    mimeType: input.mimeType,
    size: input.size,
    storagePath: buildStoragePath(input.familyId, input.documentId),
    uploadedByUid: input.uploadedByUid,
    uploadedByRole: input.uploadedByRole,
    status: "available" as const
  };
}

export function buildDownloadRequest(token: string, familyId: string, documentId: string): RequestInit {
  assertSafeId(familyId);
  assertSafeId(documentId);
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ familyId, documentId })
  };
}
