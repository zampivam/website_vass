import { describe, expect, it } from "vitest";
import { buildDocumentMetadata, buildDownloadRequest, buildStoragePath } from "./documents";

describe("privacy-safe document paths", () => {
  it("uses only opaque family and document IDs in Storage", () => {
    expect(buildStoragePath("familyUid123", "documentId456")).toBe(
      "families/familyUid123/documents/documentId456"
    );
  });

  it("rejects path separators in identifiers", () => {
    expect(() => buildStoragePath("family/other", "documentId456")).toThrow("Invalid document identifier.");
    expect(() => buildStoragePath("familyUid123", "../document")).toThrow("Invalid document identifier.");
  });

  it("keeps the display filename in Firestore metadata but never in the Storage path", () => {
    const metadata = buildDocumentMetadata({
      familyId: "familyUid123",
      documentId: "documentId456",
      displayName: "Progress Report.pdf",
      documentType: "progress_report",
      mimeType: "application/pdf",
      size: 2048,
      uploadedByUid: "staffUid789",
      uploadedByRole: "staff"
    });

    expect(metadata.displayName).toBe("Progress Report.pdf");
    expect(metadata.storagePath).toBe("families/familyUid123/documents/documentId456");
    expect(metadata.storagePath).not.toContain("Progress Report");
  });
});

describe("audited download request", () => {
  it("uses one constant endpoint and places opaque IDs in the POST body", () => {
    const request = buildDownloadRequest("token-123", "familyUid123", "documentId456");
    expect(request).toEqual({
      method: "POST",
      headers: {
        Authorization: "Bearer token-123",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ familyId: "familyUid123", documentId: "documentId456" })
    });
  });
});
