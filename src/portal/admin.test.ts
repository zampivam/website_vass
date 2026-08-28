import { describe, expect, it } from "vitest";
import { buildProgressReportMetadata, resolveAdminAccess } from "./admin";

describe("admin route access", () => {
  it("shows sign-in while signed out and the dashboard only for staff", () => {
    expect(resolveAdminAccess({ loading: false, uid: null, staff: false })).toBe("login");
    expect(resolveAdminAccess({ loading: false, uid: "staff-1", staff: true })).toBe("dashboard");
  });

  it("redirects an authenticated non-staff user to the parent view", () => {
    expect(resolveAdminAccess({ loading: false, uid: "parent-1", staff: false })).toBe("redirect-parent");
  });

  it("does not make an access decision before fresh claims finish loading", () => {
    expect(resolveAdminAccess({ loading: true, uid: null, staff: false })).toBe("loading");
  });
});

describe("staff progress reports", () => {
  it("assigns a staff report to exactly one family with no filename in its path", () => {
    const metadata = buildProgressReportMetadata({
      familyId: "familyUid123",
      documentId: "documentId456",
      displayName: "Quarterly Progress.pdf",
      mimeType: "application/pdf",
      size: 4096,
      staffUid: "staffUid789"
    });

    expect(metadata).toMatchObject({
      familyId: "familyUid123",
      documentType: "progress_report",
      uploadedByUid: "staffUid789",
      uploadedByRole: "staff",
      storagePath: "families/familyUid123/documents/documentId456"
    });
    expect(metadata.storagePath).not.toContain("Quarterly");
  });
});
