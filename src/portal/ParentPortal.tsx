import React from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, sendEmailVerification, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { ClipboardList, FileUp, LockKeyhole, ShieldCheck } from "lucide-react";
import { auth, db } from "../firebase";
import { AuthPanel } from "./AuthPanel";
import { DocumentWorkspace } from "./DocumentWorkspace";
import {
  normalizeChildIntake,
  normalizeFamilyIntake,
  validateIntake,
  type ChildIntakeInput,
  type FamilyIntakeInput
} from "./intake";
import { safePortalError } from "./policy";

const emptyFamily: FamilyIntakeInput = {
  caregiverFirstName: "",
  caregiverLastName: "",
  relationship: "Parent or guardian",
  phone: "",
  preferredContact: "phone",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "VA",
  postalCode: ""
};

const emptyChild: ChildIntakeInput = {
  firstName: "",
  lastName: "",
  preferredName: "",
  dateOfBirth: "",
  school: "",
  grade: "",
  diagnosisStatus: "diagnosed",
  primaryLanguage: "English",
  requestedServices: ["aba_therapy"],
  insuranceStatus: "insured",
  insuranceProvider: "",
  memberId: "",
  groupNumber: "",
  subscriberName: "",
  subscriberRelationship: "Parent or guardian"
};

const serviceOptions = [
  ["aba_therapy", "Autism and ABA therapy"],
  ["assessment", "Assessment"],
  ["behavior_consultation", "Behavior consultation"],
  ["caregiver_training", "Caregiver training"],
  ["school_planning", "School planning or transition support"]
];

export function ParentPortal() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"intake" | "documents">("intake");
  const [family, setFamily] = React.useState<FamilyIntakeInput>(emptyFamily);
  const [child, setChild] = React.useState<ChildIntakeInput>(emptyChild);
  const [childId, setChildId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  React.useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setAuthLoading(false);
  }), []);

  React.useEffect(() => {
    if (!user?.emailVerified) return;
    let active = true;

    async function loadIntake() {
      try {
        const familySnapshot = await getDoc(doc(db, "families", user!.uid));
        const childSnapshot = await getDocs(query(collection(db, "families", user!.uid, "children"), limit(1)));
        if (!active) return;

        if (familySnapshot.exists()) {
          const data = familySnapshot.data() as FamilyIntakeInput;
          setFamily({ ...emptyFamily, ...data });
        }
        if (!childSnapshot.empty) {
          const firstChild = childSnapshot.docs[0];
          setChildId(firstChild.id);
          setChild({ ...emptyChild, ...(firstChild.data() as ChildIntakeInput) });
        }
      } catch (error) {
        if (active) setStatus(safePortalError(error));
      }
    }

    void loadIntake();
    return () => { active = false; };
  }, [user]);

  function updateFamily<Key extends keyof FamilyIntakeInput>(key: Key, value: FamilyIntakeInput[Key]) {
    setFamily((current) => ({ ...current, [key]: value }));
  }

  function updateChild<Key extends keyof ChildIntakeInput>(key: Key, value: ChildIntakeInput[Key]) {
    setChild((current) => ({ ...current, [key]: value }));
  }

  function toggleService(value: string) {
    setChild((current) => ({
      ...current,
      requestedServices: current.requestedServices.includes(value)
        ? current.requestedServices.filter((item) => item !== value)
        : [...current.requestedServices, value]
    }));
  }

  async function saveIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const errors = validateIntake(family, child);
    if (errors.length) {
      setStatus(errors.join(" "));
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const normalizedFamily = normalizeFamilyIntake(family);
      const normalizedChild = normalizeChildIntake(child);
      const batch = writeBatch(db);
      const familyRef = doc(db, "families", user.uid);
      const nextChildRef = childId
        ? doc(db, "families", user.uid, "children", childId)
        : doc(collection(db, "families", user.uid, "children"));

      batch.set(familyRef, {
        ...normalizedFamily,
        email: user.email ?? "",
        intakeStatus: "submitted",
        updatedAt: serverTimestamp()
      }, { merge: true });
      batch.set(nextChildRef, {
        ...normalizedChild,
        updatedAt: serverTimestamp()
      }, { merge: true });
      await batch.commit();
      setChildId(nextChildRef.id);
      setFamily(normalizedFamily);
      setChild(normalizedChild);
      setStatus("Intake information saved securely.");
    } catch (error) {
      setStatus(safePortalError(error));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return <section className="portal-section" id="portal"><div className="portal-shell portal-loading">Checking your secure session...</div></section>;
  }

  return (
    <section className="portal-section" id="portal">
      <div className="portal-intro">
        <LockKeyhole aria-hidden="true" />
        <h2>Parent document portal</h2>
        <p>Sign in before entering family information or sharing documents with the VASS team.</p>
      </div>

      {!user ? <div className="portal-shell portal-shell--auth"><AuthPanel /></div> : !user.emailVerified ? (
        <div className="portal-shell portal-shell--auth">
          <div className="verification-panel">
            <ShieldCheck aria-hidden="true" />
            <h3>Verify your email first</h3>
            <p>Family information and documents stay locked until your email address is verified.</p>
            <button className="button button--primary" type="button" onClick={() => sendEmailVerification(user)}>
              Resend verification email
            </button>
            <button className="button button--secondary" type="button" onClick={() => signOut(auth)}>Sign out</button>
          </div>
        </div>
      ) : (
        <div className="portal-shell portal-shell--workspace">
          <div className="portal-workspace__top">
            <div>
              <p>Signed in as</p>
              <strong>{user.email}</strong>
            </div>
            <button className="button button--secondary" type="button" onClick={() => signOut(auth)}>Sign out</button>
          </div>
          <div className="tab-list" role="tablist" aria-label="Parent portal sections">
            <button type="button" role="tab" aria-selected={tab === "intake"} className={tab === "intake" ? "active" : ""} onClick={() => setTab("intake")}>
              <ClipboardList aria-hidden="true" /> Intake information
            </button>
            <button type="button" role="tab" aria-selected={tab === "documents"} className={tab === "documents" ? "active" : ""} onClick={() => setTab("documents")}>
              <FileUp aria-hidden="true" /> Documents
            </button>
          </div>

          {tab === "intake" ? (
            <form className="portal-form intake-form" onSubmit={saveIntake}>
              <fieldset>
                <legend>Parent or caregiver</legend>
                <div className="form-row">
                  <label>First name<input value={family.caregiverFirstName} onChange={(e) => updateFamily("caregiverFirstName", e.target.value)} required /></label>
                  <label>Last name<input value={family.caregiverLastName} onChange={(e) => updateFamily("caregiverLastName", e.target.value)} required /></label>
                </div>
                <div className="form-row">
                  <label>Relationship to child<input value={family.relationship} onChange={(e) => updateFamily("relationship", e.target.value)} required /></label>
                  <label>Phone<input type="tel" value={family.phone} onChange={(e) => updateFamily("phone", e.target.value)} required /></label>
                </div>
                <label>Preferred contact method<select value={family.preferredContact} onChange={(e) => updateFamily("preferredContact", e.target.value as "email" | "phone")}><option value="phone">Phone</option><option value="email">Email</option></select></label>
              </fieldset>

              <fieldset>
                <legend>Mailing address</legend>
                <label>Street address<input value={family.addressLine1} onChange={(e) => updateFamily("addressLine1", e.target.value)} required /></label>
                <label>Apartment, suite, or unit<input value={family.addressLine2} onChange={(e) => updateFamily("addressLine2", e.target.value)} /></label>
                <div className="form-row form-row--address">
                  <label>City<input value={family.city} onChange={(e) => updateFamily("city", e.target.value)} required /></label>
                  <label>State<input maxLength={2} value={family.state} onChange={(e) => updateFamily("state", e.target.value)} required /></label>
                  <label>Postal code<input inputMode="numeric" value={family.postalCode} onChange={(e) => updateFamily("postalCode", e.target.value)} required /></label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Child information</legend>
                <div className="form-row">
                  <label>Legal first name<input value={child.firstName} onChange={(e) => updateChild("firstName", e.target.value)} required /></label>
                  <label>Legal last name<input value={child.lastName} onChange={(e) => updateChild("lastName", e.target.value)} required /></label>
                </div>
                <div className="form-row">
                  <label>Preferred name<input value={child.preferredName} onChange={(e) => updateChild("preferredName", e.target.value)} /></label>
                  <label>Date of birth<input type="date" value={child.dateOfBirth} onChange={(e) => updateChild("dateOfBirth", e.target.value)} required /></label>
                </div>
                <div className="form-row">
                  <label>School or program<input value={child.school} onChange={(e) => updateChild("school", e.target.value)} /></label>
                  <label>Grade<input value={child.grade} onChange={(e) => updateChild("grade", e.target.value)} /></label>
                </div>
                <div className="form-row">
                  <label>Primary language<input value={child.primaryLanguage} onChange={(e) => updateChild("primaryLanguage", e.target.value)} required /></label>
                  <label>Diagnosis status<select value={child.diagnosisStatus} onChange={(e) => updateChild("diagnosisStatus", e.target.value as ChildIntakeInput["diagnosisStatus"])}><option value="diagnosed">Diagnosed</option><option value="seeking_assessment">Seeking assessment</option><option value="unsure">Unsure</option></select></label>
                </div>
                <div className="checkbox-group">
                  <span>Services you would like to discuss</span>
                  {serviceOptions.map(([value, label]) => (
                    <label key={value}><input type="checkbox" checked={child.requestedServices.includes(value)} onChange={() => toggleService(value)} />{label}</label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend>Insurance</legend>
                <label>Coverage status<select value={child.insuranceStatus} onChange={(e) => updateChild("insuranceStatus", e.target.value as ChildIntakeInput["insuranceStatus"])}><option value="insured">Insured</option><option value="self_pay">Self-pay</option><option value="unsure">Unsure</option></select></label>
                {child.insuranceStatus === "insured" ? <>
                  <div className="form-row">
                    <label>Insurance provider<input value={child.insuranceProvider} onChange={(e) => updateChild("insuranceProvider", e.target.value)} required /></label>
                    <label>Member ID<input value={child.memberId} onChange={(e) => updateChild("memberId", e.target.value)} required /></label>
                  </div>
                  <div className="form-row">
                    <label>Group number<input value={child.groupNumber} onChange={(e) => updateChild("groupNumber", e.target.value)} /></label>
                    <label>Subscriber name<input value={child.subscriberName} onChange={(e) => updateChild("subscriberName", e.target.value)} required /></label>
                  </div>
                  <label>Subscriber relationship<input value={child.subscriberRelationship} onChange={(e) => updateChild("subscriberRelationship", e.target.value)} /></label>
                </> : null}
              </fieldset>

              <button className="button button--primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Save intake information"}</button>
            </form>
          ) : <DocumentWorkspace user={user} familyId={user.uid} />}
          {status ? <p className="portal-status" role="status">{status}</p> : null}
        </div>
      )}
    </section>
  );
}
