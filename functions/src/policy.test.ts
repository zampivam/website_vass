import { describe, expect, it } from "vitest";
import { authorizeDownload, buildActivityRecord, buildUploadNotification } from "./policy.js";

describe("server download authorization", () => {
  it("allows staff or the verified owning parent and denies every other user", () => {
    expect(authorizeDownload({ uid: "staff-1", staff: true, emailVerified: true }, "family-2")).toBe(true);
    expect(authorizeDownload({ uid: "family-2", staff: false, emailVerified: true }, "family-2")).toBe(true);
    expect(authorizeDownload({ uid: "family-1", staff: false, emailVerified: true }, "family-2")).toBe(false);
    expect(authorizeDownload({ uid: "family-2", staff: false, emailVerified: false }, "family-2")).toBe(false);
  });
});

describe("privacy-safe notifications", () => {
  it("contains only fixed upload copy and the constant admin link", () => {
    expect(buildUploadNotification("https://vass2.giltunnel.org")).toEqual({
      subject: "New parent portal upload",
      text: "A new document was uploaded. Log in to view.\n\nhttps://vass2.giltunnel.org/admin",
      html: '<p>A new document was uploaded. Log in to view.</p><p><a href="https://vass2.giltunnel.org/admin">Open the staff portal</a></p>'
    });
  });
});

describe("pseudonymous activity records", () => {
  it("stores only opaque IDs, action, role, and time", () => {
    const createdAt = new Date("2026-08-27T12:00:00.000Z");
    expect(
      buildActivityRecord({
        action: "download",
        familyId: "family-2",
        documentId: "document-3",
        actorUid: "staff-1",
        actorRole: "staff",
        createdAt
      })
    ).toEqual({
      action: "download",
      familyId: "family-2",
      documentId: "document-3",
      actorUid: "staff-1",
      actorRole: "staff",
      createdAt
    });
  });
});
