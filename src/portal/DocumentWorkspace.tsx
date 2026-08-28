import React from "react";
import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { Download, Eye, FileUp } from "lucide-react";
import { db, documentDownloadUrl, storage } from "../firebase";
import { buildDocumentMetadata, buildDownloadRequest, buildStoragePath } from "./documents";
import { safePortalError, validateDocument } from "./policy";
import type { PortalDocument } from "./types";

type DocumentWorkspaceProps = {
  user: User;
  familyId: string;
};

const documentTypes = [
  ["diagnostic_report", "Diagnostic or evaluation report"],
  ["insurance_card", "Insurance card"],
  ["referral", "Referral or prescription"],
  ["iep_or_504", "IEP, 504 plan, or school document"],
  ["custody_or_guardianship", "Custody or guardianship document"],
  ["prior_treatment", "Prior treatment record"],
  ["other", "Other requested document"]
];

export function DocumentWorkspace({ user, familyId }: DocumentWorkspaceProps) {
  const [documents, setDocuments] = React.useState<PortalDocument[]>([]);
  const [documentType, setDocumentType] = React.useState("diagnostic_report");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    const documentsQuery = query(
      collection(db, "families", familyId, "documents"),
      orderBy("uploadedAt", "desc")
    );
    return onSnapshot(
      documentsQuery,
      (snapshot) => {
        setDocuments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as PortalDocument)));
      },
      () => setStatus("Documents are temporarily unavailable. Please try again later.")
    );
  }, [familyId]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!file) {
      setStatus("Choose a document to upload.");
      return;
    }

    const validation = validateDocument(file);
    if (!validation.ok) {
      setStatus(validation.reason === "file-too-large" ? "Files must be 10 MB or smaller." : "Use a PDF, JPG, PNG, or DOCX file.");
      return;
    }

    setLoading(true);
    setStatus("");
    const metadataRef = doc(collection(db, "families", familyId, "documents"));
    const storagePath = buildStoragePath(familyId, metadataRef.id);
    const storageRef = ref(storage, storagePath);

    try {
      const metadata = buildDocumentMetadata({
        familyId,
        documentId: metadataRef.id,
        displayName: file.name,
        documentType,
        mimeType: file.type,
        size: file.size,
        uploadedByUid: user.uid,
        uploadedByRole: "parent"
      });

      await setDoc(metadataRef, {
        ...metadata,
        status: "pending",
        createdAt: serverTimestamp(),
        uploadedAt: null
      });
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { familyId, documentId: metadataRef.id, uploadedByUid: user.uid }
      });
      await updateDoc(metadataRef, { status: "available", uploadedAt: serverTimestamp() });
      setFile(null);
      setStatus("Document uploaded securely.");
      form.reset();
    } catch (error) {
      await Promise.allSettled([deleteObject(storageRef), deleteDoc(metadataRef)]);
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(item: PortalDocument, disposition: "view" | "download") {
    setLoading(true);
    setStatus("");
    const previewWindow = disposition === "view" ? window.open("", "_blank") : null;
    if (previewWindow) previewWindow.opener = null;

    try {
      const token = await user.getIdToken();
      const response = await fetch(documentDownloadUrl, buildDownloadRequest(token, familyId, item.id));
      if (!response.ok) throw new Error("Download request failed");
      const blobUrl = URL.createObjectURL(await response.blob());

      if (previewWindow) {
        previewWindow.location.href = blobUrl;
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = item.displayName;
        link.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      previewWindow?.close();
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="document-workspace">
      <form className="portal-form" onSubmit={handleUpload}>
        <div className="portal-form__heading">
          <FileUp aria-hidden="true" />
          <div>
            <h3>Upload requested documents</h3>
            <p>PDF, JPG, PNG, or DOCX. Maximum 10 MB per file.</p>
          </div>
        </div>
        <div className="form-row">
          <label>
            Document type
            <select value={documentType} onChange={(event) => setDocumentType(event.target.value)}>
              {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label>
            File
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
          </label>
        </div>
        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload securely"}
        </button>
      </form>

      <div className="document-list" aria-live="polite">
        <h3>Your documents</h3>
        {documents.length === 0 ? <p>No documents have been uploaded yet.</p> : documents.map((item) => (
          <article className="document-row" key={item.id}>
            <div>
              <strong>{item.displayName}</strong>
              <span>{item.uploadedAt ? item.uploadedAt.toDate().toLocaleString() : "Finishing upload..."}</span>
            </div>
            {item.status === "available" ? (
              <div className="document-actions">
                <button type="button" onClick={() => handleDownload(item, "view")} disabled={loading}>
                  <Eye aria-hidden="true" /> View
                </button>
                <button type="button" onClick={() => handleDownload(item, "download")} disabled={loading}>
                  <Download aria-hidden="true" /> Download
                </button>
              </div>
            ) : <span className="status-pill">Processing</span>}
          </article>
        ))}
      </div>
      {status ? <p className="portal-status" role="status">{status}</p> : null}
    </div>
  );
}
