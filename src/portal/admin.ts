import { buildDocumentMetadata } from "./documents";

export type AdminAccessState = {
  loading: boolean;
  uid: string | null;
  staff: boolean;
};

export type AdminAccessDecision = "loading" | "login" | "dashboard" | "redirect-parent";

export function resolveAdminAccess(state: AdminAccessState): AdminAccessDecision {
  if (state.loading) return "loading";
  if (!state.uid) return "login";
  return state.staff ? "dashboard" : "redirect-parent";
}

export function buildProgressReportMetadata(input: {
  familyId: string;
  documentId: string;
  displayName: string;
  mimeType: string;
  size: number;
  staffUid: string;
}) {
  return buildDocumentMetadata({
    familyId: input.familyId,
    documentId: input.documentId,
    displayName: input.displayName,
    documentType: "progress_report",
    mimeType: input.mimeType,
    size: input.size,
    uploadedByUid: input.staffUid,
    uploadedByRole: "staff"
  });
}
