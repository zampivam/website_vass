import type { Timestamp } from "firebase/firestore";

export type FamilyRecord = {
  id: string;
  caregiverFirstName: string;
  caregiverLastName: string;
  relationship: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone";
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  intakeStatus: "draft" | "submitted";
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

export type PortalDocument = {
  id: string;
  familyId: string;
  documentId: string;
  displayName: string;
  documentType: string;
  mimeType: string;
  size: number;
  storagePath: string;
  uploadedByUid: string;
  uploadedByRole: "parent" | "staff";
  status: "pending" | "available";
  uploadedAt?: Timestamp;
};

export type ActivityRecord = {
  id: string;
  action: "upload" | "download";
  familyId: string;
  documentId: string;
  actorUid: string;
  actorRole: "parent" | "staff";
  createdAt?: Timestamp;
};
