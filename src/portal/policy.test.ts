import { describe, expect, it } from "vitest";
import {
  canAccessAdmin,
  canAccessFamily,
  safePortalError,
  validateDocument
} from "./policy";

describe("portal authorization policy", () => {
  it("denies the admin route when the staff claim is missing", () => {
    expect(canAccessAdmin({ uid: "parent-1", emailVerified: true, staff: false })).toBe(false);
  });

  it("allows the admin route only for an authenticated staff claimant", () => {
    expect(canAccessAdmin({ uid: "staff-1", emailVerified: true, staff: true })).toBe(true);
    expect(canAccessAdmin({ uid: "", emailVerified: true, staff: true })).toBe(false);
  });

  it("allows a verified parent to access only their own family", () => {
    const parent = { uid: "parent-1", emailVerified: true, staff: false };
    expect(canAccessFamily(parent, "parent-1")).toBe(true);
    expect(canAccessFamily(parent, "parent-2")).toBe(false);
  });

  it("denies family records to an unverified password account", () => {
    expect(canAccessFamily({ uid: "parent-1", emailVerified: false, staff: false }, "parent-1")).toBe(false);
  });

  it("allows staff to access any family without weakening parent isolation", () => {
    expect(canAccessFamily({ uid: "staff-1", emailVerified: true, staff: true }, "parent-2")).toBe(true);
  });
});

describe("document policy", () => {
  it("accepts supported files at or below 10 MB", () => {
    expect(validateDocument({ type: "application/pdf", size: 10 * 1024 * 1024 })).toEqual({ ok: true });
    expect(validateDocument({ type: "image/jpeg", size: 1 })).toEqual({ ok: true });
  });

  it("rejects unsupported file types and oversized files", () => {
    expect(validateDocument({ type: "application/x-msdownload", size: 100 })).toEqual({
      ok: false,
      reason: "unsupported-type"
    });
    expect(validateDocument({ type: "application/pdf", size: 10 * 1024 * 1024 + 1 })).toEqual({
      ok: false,
      reason: "file-too-large"
    });
  });
});

describe("privacy-safe errors", () => {
  it("does not expose upstream messages that may contain private information", () => {
    const upstream = new Error("Upload failed for Child Name insurance-card.jpg");
    expect(safePortalError(upstream)).toBe("We could not complete that request. Please try again or contact VASS.");
  });
});
