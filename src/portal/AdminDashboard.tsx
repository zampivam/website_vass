import React from "react";
import type { User } from "firebase/auth";
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { deleteObject, ref, uploadBytes } from "firebase/storage";
import { Download, Eye, FileUp, ShieldCheck } from "lucide-react";
import { db, documentDownloadUrl, storage } from "../firebase";
import { buildProgressReportMetadata } from "./admin";
import { buildDownloadRequest, buildStoragePath } from "./documents";
import { safePortalError, validateDocument } from "./policy";
import type { ActivityRecord, FamilyRecord, PortalDocument } from "./types";

type AdminDashboardProps = {
  user: User;
};

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [families, setFamilies] = React.useState<FamilyRecord[]>([]);
  const [documents, setDocuments] = React.useState<PortalDocument[]>([]);
  const [activity, setActivity] = React.useState<ActivityRecord[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  React.useEffect(() => {
    const unsubFamilies = onSnapshot(
      query(collection(db, "families"), orderBy("caregiverLastName")),
      (snapshot) => {
        const next = snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as FamilyRecord));
        setFamilies(next);
        setSelectedFamilyId((current) => current || next[0]?.id || "");
      },
      () => setStatus("Family records are temporarily unavailable.")
    );
    const unsubDocuments = onSnapshot(
      query(collectionGroup(db, "documents"), orderBy("uploadedAt", "desc")),
      (snapshot) => setDocuments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as PortalDocument))),
      () => setStatus("Document records are temporarily unavailable.")
    );
    const unsubActivity = onSnapshot(
      query(collection(db, "activity"), orderBy("createdAt", "desc"), limit(100)),
      (snapshot) => setActivity(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as ActivityRecord))),
      () => setStatus("Activity records are temporarily unavailable.")
    );

    return () => {
      unsubFamilies();
      unsubDocuments();
      unsubActivity();
    };
  }, []);

  function familyName(familyId: string): string {
    const family = families.find((item) => item.id === familyId);
    return family ? `${family.caregiverFirstName} ${family.caregiverLastName}`.trim() : "Family record";
  }

  function documentName(documentId: string): string {
    return documents.find((item) => item.id === documentId)?.displayName ?? "Document";
  }

  async function handleProgressUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!selectedFamilyId || !file) {
      setStatus("Choose a family and a progress report.");
      return;
    }

    const validation = validateDocument(file);
    if (!validation.ok) {
      setStatus(validation.reason === "file-too-large" ? "Files must be 10 MB or smaller." : "Use a PDF, JPG, PNG, or DOCX file.");
      return;
    }

    setLoading(true);
    setStatus("");
    const metadataRef = doc(collection(db, "families", selectedFamilyId, "documents"));
    const storagePath = buildStoragePath(selectedFamilyId, metadataRef.id);
    const storageRef = ref(storage, storagePath);

    try {
      const metadata = buildProgressReportMetadata({
        familyId: selectedFamilyId,
        documentId: metadataRef.id,
        displayName: file.name,
        mimeType: file.type,
        size: file.size,
        staffUid: user.uid
      });
      await setDoc(metadataRef, { ...metadata, status: "pending", createdAt: serverTimestamp(), uploadedAt: null });
      await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: { familyId: selectedFamilyId, documentId: metadataRef.id, uploadedByUid: user.uid }
      });
      await updateDoc(metadataRef, { status: "available", uploadedAt: serverTimestamp() });
      setFile(null);
      setStatus("Progress report added to the selected family.");
      form.reset();
    } catch (error) {
      await Promise.allSettled([deleteObject(storageRef), deleteDoc(metadataRef)]);
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleDocument(item: PortalDocument, disposition: "view" | "download") {
    setLoading(true);
    setStatus("");
    const previewWindow = disposition === "view" ? window.open("", "_blank") : null;
    if (previewWindow) previewWindow.opener = null;
    try {
      const token = await user.getIdToken(true);
      const response = await fetch(documentDownloadUrl, buildDownloadRequest(token, item.familyId, item.id));
      if (!response.ok) throw new Error("Download request failed");
      const blobUrl = URL.createObjectURL(await response.blob());
      if (previewWindow) previewWindow.location.href = blobUrl;
      else {
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
    <main className="admin-dashboard">
      <header className="admin-dashboard__header">
        <div>
          <span className="portal-kicker">VASS staff</span>
          <h1>Family document administration</h1>
          <p>Review family uploads, share progress reports, and monitor portal activity.</p>
        </div>
        <ShieldCheck aria-label="Staff access verified" />
      </header>

      <section className="admin-card">
        <h2>Upload a progress report</h2>
        <form className="admin-upload" onSubmit={handleProgressUpload}>
          <label>
            Family
            <select value={selectedFamilyId} onChange={(event) => setSelectedFamilyId(event.target.value)} required>
              <option value="">Select a family</option>
              {families.map((family) => <option key={family.id} value={family.id}>{familyName(family.id)}</option>)}
            </select>
          </label>
          <label>
            Progress report
            <input type="file" accept=".pdf,.png,.jpg,.jpeg,.docx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required />
          </label>
          <button className="button button--primary" type="submit" disabled={loading || families.length === 0}>
            <FileUp aria-hidden="true" /> {loading ? "Uploading..." : "Upload report"}
          </button>
        </form>
      </section>

      <section className="admin-card">
        <h2>Families and documents</h2>
        <div className="family-admin-list">
          {families.length === 0 ? <p>No family records are available.</p> : families.map((family) => {
            const familyDocuments = documents.filter((item) => item.familyId === family.id);
            return (
              <details key={family.id} className="family-admin-row">
                <summary>
                  <span><strong>{familyName(family.id)}</strong><small>{family.city}, {family.state}</small></span>
                  <span>{familyDocuments.length} document{familyDocuments.length === 1 ? "" : "s"}</span>
                </summary>
                <div className="family-documents">
                  {familyDocuments.length === 0 ? <p>No documents uploaded.</p> : familyDocuments.map((item) => (
                    <article className="document-row" key={item.id}>
                      <div><strong>{item.displayName}</strong><span>{item.uploadedAt ? item.uploadedAt.toDate().toLocaleString() : "Finishing upload..."}</span></div>
                      {item.status === "available" ? <div className="document-actions">
                        <button type="button" onClick={() => handleDocument(item, "view")} disabled={loading}><Eye aria-hidden="true" /> View</button>
                        <button type="button" onClick={() => handleDocument(item, "download")} disabled={loading}><Download aria-hidden="true" /> Download</button>
                      </div> : <span className="status-pill">Processing</span>}
                    </article>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="admin-card">
        <h2>Recent activity</h2>
        <div className="activity-list">
          {activity.length === 0 ? <p>No portal activity has been recorded.</p> : activity.map((item) => (
            <article key={item.id}>
              <span className={`activity-badge activity-badge--${item.action}`}>{item.action}</span>
              <div>
                <strong>{documentName(item.documentId)}</strong>
                <span>{familyName(item.familyId)} · {item.actorRole} · {item.createdAt ? item.createdAt.toDate().toLocaleString() : "Just now"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
      {status ? <p className="portal-status" role="status">{status}</p> : null}
    </main>
  );
}
