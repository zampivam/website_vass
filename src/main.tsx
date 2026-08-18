import React from "react";
import ReactDOM from "react-dom/client";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileUp,
  HeartHandshake,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
  Baby,
  GraduationCap,
  MessageSquare
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "./supabase";
import "./styles.css";

type PortalView = "login" | "signup";
type PortalTab = "request" | "documents";
type ServiceCard = {
  icon: React.ReactNode;
  title: string;
  copy: string;
  audience?: string;
  detail?: string;
  featured?: boolean;
};

const siteLogo = "/images/vass-positive-change-logo.png";
const heroImage = "/images/vass-hero-therapy-room.jpg";
const consultImage = "/images/vass-founder-andrea-meeting.jpg";

const serviceCards: ServiceCard[] = [
  {
    icon: <Baby aria-hidden="true" />,
    title: "Early Childhood Development Program",
    copy: "For children ages 2–4, we build communication, play, and everyday skills through familiar routines."
  },
  {
    icon: <GraduationCap aria-hidden="true" />,
    title: "Pre-Kindergarten Readiness",
    copy: "Support with classroom routines, peer interaction, and the small skills that make the transition to school easier."
  },
  {
    icon: <MessageSquare aria-hidden="true" />,
    title: "Functional Communication & Language",
    copy: "Helping children communicate needs, choices, and ideas in ways that work for them."
  },
  {
    icon: <Sparkles aria-hidden="true" />,
    title: "Child-Led Play Sessions",
    copy: "Purposeful, child-led play that uses your child’s interests to build meaningful new skills."
  },
  {
    icon: <UsersRound aria-hidden="true" />,
    title: "Family & Sibling Training",
    copy: "Practical coaching for the people who know your child best, at home and in the community."
  },
  {
    icon: <ClipboardList aria-hidden="true" />,
    title: "Assessment & Care Planning",
    copy: "Clear assessment, collaborative planning, and ABA support shaped around your family’s day-to-day life."
  },
  {
    icon: <HeartHandshake aria-hidden="true" />,
    title: "Behavior Consultation & School Planning",
    audience: "For families and caregivers",
    copy: "Meet one-on-one with a licensed behavior analyst for individualized guidance on the steps to begin therapy services, special education planning, and transitions within your child’s school.",
    detail: "Consultations are available remotely or at our Harrisonburg and Woodstock locations.",
    featured: true
  }
];

const steps = [
  "Create a secure parent account",
  "Request a meeting, assessment, or consultation",
  "Upload diagnostic or new client intake forms",
  "Coordinate next steps with the clinical team"
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#top" aria-label="Virginia Autism Spectrum Services home">
      <img className="brand__logo" src={siteLogo} alt="Virginia Autism Spectrum Services" />
      <span className="brand__words">
        <span className="brand__name">Virginia Autism Spectrum Services</span>
        {!compact && (
          <span className="brand__meta">
            <span className="brand__tagline">Welcome to Positive Change</span>
            <span className="brand__place">Harrisonburg, VA</span>
          </span>
        )}
      </span>
    </a>
  );
}

function Header() {
  const [open, setOpen] = React.useState(false);
  const nav = [
    ["Services", "#services"],
    ["About", "#about"],
    ["Jobs", "#jobs"],
    ["Parent Portal", "#portal"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"]
  ];

  return (
    <header className="site-header">
      <div className="utility-bar">
        <a href="tel:+15402087822">
          <Phone size={15} aria-hidden="true" />
          540-208-7822
        </a>
        <a href="https://www.google.com/maps/search/?api=1&query=1320%20S%20Main%20Street%20Harrisonburg%20VA%2022801">
          <MapPin size={15} aria-hidden="true" />
          Harrisonburg, VA
        </a>
      </div>
      <nav className="nav-shell" aria-label="Main navigation">
        <BrandMark />
        <button className="nav-toggle" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          <span className="sr-only">Toggle navigation</span>
        </button>
        <div className={`nav-links ${open ? "nav-links--open" : ""}`}>
          {nav.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <a className="nav-cta" href="#portal" onClick={() => setOpen(false)}>
            Get started
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__image" aria-hidden="true">
        <img src={heroImage} alt="" />
      </div>
      <div className="hero__content">
        <div className="hero__copy">
          <h1>Autism & ABA Therapy</h1>
          <p>
            Individualized ABA support for children and families in Harrisonburg and Woodstock, from a locally owned practice
            that takes the time to understand your child.
          </p>
          <div className="hero__approach">
            <strong>Natural environment teaching</strong>
            <p>We build skills during play, daily routines, and real-life moments—so therapy fits naturally into your child’s world.</p>
          </div>
          <div className="hero__actions">
            <a className="button button--primary" href="#portal">
              Parent portal
              <ArrowRight aria-hidden="true" />
            </a>
            <a className="button button--secondary" href="tel:+15402087822">
              Call 540-208-7822
            </a>
          </div>
        </div>
        <aside className="hero-card" aria-label="Practice highlights">
          <p>Founder-led care</p>
          <strong>25 years</strong>
          <span>ABA, special education, and autism support experience</span>
        </aside>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section section--light" id="services">
      <div className="section__intro">
        <h2>Care that works in real life</h2>
        <p>
          We start with your child, your routines, and your goals. Our team offers <strong>in-home services</strong> so learning can happen where life happens.
        </p>
        <div className="inhome-banner">
          <Home aria-hidden="true" />
          <span>In-Home Services Offered</span>
        </div>
      </div>
      <div className="service-grid">
        {serviceCards.map((card) => (
          <article className={`service-card ${card.featured ? "service-card--featured" : ""}`} key={card.title}>
            <span className="service-card__icon">{card.icon}</span>
            <div className="service-card__body">
              {card.audience ? <span className="service-card__eyebrow">{card.audience}</span> : null}
              <h3>{card.title}</h3>
              <p>{card.copy}</p>
              {card.detail ? <p className="service-card__detail">{card.detail}</p> : null}
            </div>
            {card.featured ? (
              <a className="service-card__action" href="#portal">
                Request a consultation
                <ArrowRight aria-hidden="true" />
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Milestones() {
  return (
    <section className="milestones">
      <div className="milestones__content">
        <h2>A straightforward path into care</h2>
        <p>
          Getting started should be straightforward. Use the portal to request a meeting or assessment and share the documents
          our clinical team needs before your first appointment.
        </p>
        <div className="step-list">
          {steps.map((step, index) => (
            <div className="step" key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="milestones__panel">
        <ShieldCheck aria-hidden="true" />
        <h3>HIPAA-compliant storage</h3>
        <p>
          Documents are kept in private storage with authenticated access and row-level security, so only the appropriate family
          and clinical team members can access them.
        </p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="about" id="about">
      <div className="about__media">
        <img src={consultImage} alt="A clinician meeting with parents in a calm pediatric therapy room" />
      </div>
      <div className="about__copy">
        <h2>BCBA Founder-Director</h2>
        <p>
          Andrea is a Board Certified Behavior Analyst and Licensed Behavior Analyst with 25 years of experience across ABA,
          special education, and autism support.
        </p>
        <p>
          She founded Virginia Autism Spectrum Services in 2014 as one of the first BCBA-owned ABA agencies in the Shenandoah
          Valley. Her work remains rooted in ethical practice, clear communication, and plans that make sense for each family.
        </p>
        <div className="credential-list">
          <span>
            <CheckCircle2 aria-hidden="true" />
            BCBA certified since 2009
          </span>
          <span>
            <CheckCircle2 aria-hidden="true" />
            Licensed Behavior Analyst in Virginia
          </span>
          <span>
            <CheckCircle2 aria-hidden="true" />
            Master of Science in Autism and Special Education
          </span>
        </div>
      </div>
    </section>
  );
}

function MulticulturalCare() {
  const clientCountries = [
    { name: "USA", code: "us" },
    { name: "Ukraine", code: "ua" },
    { name: "Cameroon", code: "cm" },
    { name: "El Salvador", code: "sv" },
    { name: "Honduras", code: "hn" },
    { name: "Ethiopia", code: "et" }
  ];

  return (
    <section className="multicultural-section">
      <div className="multicultural-content">
        <h2>Care that respects your family’s culture and language</h2>
        <p>
          Good care begins with listening. We support families from many cultural backgrounds through bilingual English/Spanish
          therapists, language tools, and translation services when needed.
        </p>
        <div className="flags-showcase">
          <p className="flags-title">Families we are honored to serve include:</p>
          <div className="flags-grid">
            {clientCountries.map((country) => (
              <div className="flag-item" key={country.name}>
                <img
                  className="flag-img"
                  src={`https://flagcdn.com/w80/${country.code}.png`}
                  srcSet={`https://flagcdn.com/w160/${country.code}.png 2x`}
                  alt={`${country.name} Flag`}
                  loading="lazy"
                />
                <span>{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Jobs() {
  const hiringPoints = [
    "Work with children and families in a relationship-based, play-centered setting.",
    "Collaborate with licensed behavior analysts who value clear communication and ethical care.",
    "Support meaningful progress in homes, schools, and community routines."
  ];

  const jobAreas = [
    {
      title: "Who we look for",
      copy: "We welcome interest from people who enjoy working with children, communicate well with families, and bring patience, warmth, and professionalism to their work."
    },
    {
      title: "What to expect",
      copy: "Openings may vary by location and service needs, but we value team members who are dependable, coachable, and committed to thoughtful, individualized support."
    },
    {
      title: "How to apply",
      copy: "Send your resume and a short note of interest to our team. If there is a fit, we will follow up about next steps."
    }
  ];

  return (
    <section className="jobs-section" id="jobs">
      <div className="jobs-shell">
        <div className="jobs-intro">
          <span className="jobs-eyebrow">Careers at VASS</span>
          <h2>Join a team that enjoys helping children grow through everyday moments.</h2>
          <p>
            We are always glad to hear from thoughtful people who care about children, respect families, and want to do meaningful work in autism and ABA therapy.
          </p>
          <div className="jobs-points">
            {hiringPoints.map((point) => (
              <span key={point}>
                <CheckCircle2 aria-hidden="true" />
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="jobs-grid">
          {jobAreas.map((item) => (
            <article className="jobs-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
          <article className="jobs-card jobs-card--cta">
            <h3>Apply by email</h3>
            <p>Please include your resume, your location, and a brief introduction about your experience working with children or families.</p>
            <a className="button button--primary" href="mailto:admin@vassllc.org?subject=VASS%20Employment%20Inquiry">
              Apply now
              <ArrowRight aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

function SecurePortal() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [portalView, setPortalView] = React.useState<PortalView>("login");
  const [portalTab, setPortalTab] = React.useState<PortalTab>("request");
  const [authForm, setAuthForm] = React.useState({ email: "", password: "", parentName: "", phone: "" });
  const [childForm, setChildForm] = React.useState({
    firstName: "",
    lastInitial: "",
    diagnosisStatus: "diagnosed",
    school: "",
    primaryLanguage: "English",
    translatorNeeded: false
  });
  const [requestForm, setRequestForm] = React.useState({
    requestType: "assessment",
    preferredContact: "phone",
    preferredTimes: "",
    message: ""
  });
  const [documentForm, setDocumentForm] = React.useState({
    documentType: "diagnostic_report",
    file: null as File | null
  });
  const [status, setStatus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function handleAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setStatus("Supabase is not configured for this environment yet.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      if (portalView === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: { data: { parent_name: authForm.parentName } }
        });
        if (error) throw error;

        const userId = data.session?.user.id;
        if (userId) {
          const { error: profileError } = await supabase.from("parent_profiles").upsert({
            user_id: userId,
            parent_name: authForm.parentName,
            preferred_phone: authForm.phone,
            relationship_to_child: "Parent or guardian",
            communication_preference: "phone"
          });
          if (profileError) throw profileError;
        }
        setStatus(
          data.session
            ? "Account created and signed in."
            : "Account created. Please check your email if confirmation is enabled, then log in."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password
        });
        if (error) throw error;
        setStatus("Signed in.");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !session?.user) {
      setStatus("Please sign in before submitting a request.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const childPayload = {
        parent_user_id: session.user.id,
        first_name: childForm.firstName,
        last_initial: childForm.lastInitial,
        diagnosis_status: childForm.diagnosisStatus,
        school_or_program: childForm.school,
        primary_language: childForm.primaryLanguage,
        translator_needed: childForm.translatorNeeded
      };

      const { data: child, error: childError } = await supabase.from("children").insert(childPayload).select("id").single();
      if (childError) throw childError;

      const { error: requestError } = await supabase.from("service_requests").insert({
        parent_user_id: session.user.id,
        child_id: child.id,
        request_type: requestForm.requestType,
        preferred_contact: requestForm.preferredContact,
        preferred_times: requestForm.preferredTimes,
        message: requestForm.message
      });
      if (requestError) throw requestError;

      setStatus("Request submitted securely. The VASS team can review it in Supabase.");
      setChildForm({
        firstName: "",
        lastInitial: "",
        diagnosisStatus: "diagnosed",
        school: "",
        primaryLanguage: "English",
        translatorNeeded: false
      });
      setRequestForm({ requestType: "assessment", preferredContact: "phone", preferredTimes: "", message: "" });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const selectedFile = documentForm.file;

    if (!supabase || !session?.user || !selectedFile) {
      setStatus("Please sign in and choose a file before uploading.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const filePath = `${session.user.id}/general/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("care-documents").upload(filePath, selectedFile, {
        cacheControl: "0",
        upsert: false
      });
      if (uploadError) throw uploadError;

      const { error: rowError } = await supabase.from("documents").insert({
        parent_user_id: session.user.id,
        document_type: documentForm.documentType,
        file_name: selectedFile.name,
        file_path: filePath,
        file_type: selectedFile.type,
        file_size: selectedFile.size
      });
      if (rowError) throw rowError;

      setStatus("Document uploaded to the private care-documents bucket.");
      setDocumentForm({ documentType: "diagnostic_report", file: null });
      form.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="portal-section" id="portal">
      <div className="portal-intro">
        <LockKeyhole aria-hidden="true" />
        <h2>A simple, secure way to get started</h2>
        <p>
          Create an account to request a meeting or assessment and securely share diagnostic reports or intake forms with our team.
        </p>
      </div>

      <div className="portal-shell">
        {!isSupabaseConfigured ? (
          <div className="portal-alert">
            <ShieldCheck aria-hidden="true" />
            <p>Supabase environment variables are required before the portal can transmit family information.</p>
          </div>
        ) : null}

        {!session ? (
          <form className="portal-form" onSubmit={handleAuth}>
            <div className="segmented" aria-label="Portal account mode">
              <button
                className={portalView === "login" ? "active" : ""}
                type="button"
                onClick={() => setPortalView("login")}
              >
                Log in
              </button>
              <button
                className={portalView === "signup" ? "active" : ""}
                type="button"
                onClick={() => setPortalView("signup")}
              >
                Sign up
              </button>
            </div>
            {portalView === "signup" ? (
              <div className="form-row">
                <label>
                  Parent or guardian name
                  <input
                    value={authForm.parentName}
                    onChange={(event) => setAuthForm({ ...authForm, parentName: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={authForm.phone}
                    onChange={(event) => setAuthForm({ ...authForm, phone: event.target.value })}
                    type="tel"
                    required
                  />
                </label>
              </div>
            ) : null}
            <div className="form-row">
              <label>
                Email
                <input
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  type="email"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Password
                <input
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  type="password"
                  autoComplete={portalView === "login" ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
              </label>
            </div>
            <button className="button button--primary" type="submit" disabled={loading}>
              {loading ? "Working..." : portalView === "login" ? "Log in securely" : "Create account"}
            </button>
          </form>
        ) : (
          <div className="portal-workspace">
            <div className="portal-workspace__top">
              <div>
                <p>Signed in as</p>
                <strong>{session.user.email}</strong>
              </div>
              <button className="button button--secondary" type="button" onClick={() => supabase?.auth.signOut()}>
                Sign out
              </button>
            </div>
            <div className="tab-list" role="tablist" aria-label="Parent portal tasks">
              <button
                type="button"
                role="tab"
                aria-selected={portalTab === "request"}
                className={portalTab === "request" ? "active" : ""}
                onClick={() => setPortalTab("request")}
              >
                <CalendarDays aria-hidden="true" />
                Request care
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={portalTab === "documents"}
                className={portalTab === "documents" ? "active" : ""}
                onClick={() => setPortalTab("documents")}
              >
                <FileUp aria-hidden="true" />
                Upload forms
              </button>
            </div>

            {portalTab === "request" ? (
              <form className="portal-form" onSubmit={handleRequest}>
                <div className="form-row">
                  <label>
                    Client first name
                    <input
                      value={childForm.firstName}
                      onChange={(event) => setChildForm({ ...childForm, firstName: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Last initial
                    <input
                      value={childForm.lastInitial}
                      onChange={(event) => setChildForm({ ...childForm, lastInitial: event.target.value })}
                      maxLength={1}
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Primary language spoken
                    <input
                      value={childForm.primaryLanguage}
                      onChange={(event) => setChildForm({ ...childForm, primaryLanguage: event.target.value })}
                      placeholder="English, Spanish, etc."
                      required
                    />
                  </label>
                  <label>
                    Translator needed
                    <div className="checkbox-align">
                      <input
                        type="checkbox"
                        checked={childForm.translatorNeeded}
                        onChange={(event) => setChildForm({ ...childForm, translatorNeeded: event.target.checked })}
                        style={{ width: "20px", height: "20px", cursor: "pointer", border: "1px solid var(--line)" }}
                      />
                      <span style={{ fontSize: "0.95rem", fontWeight: "650" }}>Yes, request a translator</span>
                    </div>
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Diagnosis status
                    <select
                      value={childForm.diagnosisStatus}
                      onChange={(event) => setChildForm({ ...childForm, diagnosisStatus: event.target.value })}
                    >
                      <option value="diagnosed">Diagnosed</option>
                      <option value="seeking_assessment">Seeking assessment</option>
                      <option value="unsure">Unsure</option>
                    </select>
                  </label>
                  <label>
                    School or program
                    <input
                      value={childForm.school}
                      onChange={(event) => setChildForm({ ...childForm, school: event.target.value })}
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Request type
                    <select
                      value={requestForm.requestType}
                      onChange={(event) => setRequestForm({ ...requestForm, requestType: event.target.value })}
                    >
                      <option value="assessment">Assessment</option>
                      <option value="meeting">Meeting</option>
                      <option value="records_review">Records review</option>
                      <option value="behavior_consultation">Behavior consultation</option>
                      <option value="caregiver_training">Caregiver training</option>
                      <option value="insurance_support">Insurance support</option>
                    </select>
                  </label>
                  <label>
                    Preferred contact
                    <select
                      value={requestForm.preferredContact}
                      onChange={(event) => setRequestForm({ ...requestForm, preferredContact: event.target.value })}
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                    </select>
                  </label>
                </div>
                <label>
                  Preferred meeting times
                  <input
                    value={requestForm.preferredTimes}
                    onChange={(event) => setRequestForm({ ...requestForm, preferredTimes: event.target.value })}
                    placeholder="Morning, afternoon, specific days..."
                  />
                </label>
                <label>
                  Notes for the clinical team
                  <textarea
                    value={requestForm.message}
                    onChange={(event) => setRequestForm({ ...requestForm, message: event.target.value })}
                    rows={4}
                  />
                </label>
                <button className="button button--primary" type="submit" disabled={loading}>
                  Submit request
                </button>
              </form>
            ) : (
              <form className="portal-form" onSubmit={handleDocumentUpload}>
                <div className="form-row">
                  <label>
                    Document type
                    <select
                      value={documentForm.documentType}
                      onChange={(event) => setDocumentForm({ ...documentForm, documentType: event.target.value })}
                    >
                      <option value="diagnostic_report">Diagnostic report</option>
                      <option value="new_client_intake">New client intake</option>
                      <option value="iep_or_school">IEP or school document</option>
                      <option value="insurance_card">Insurance card</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    File
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.docx"
                      onChange={(event) => setDocumentForm({ ...documentForm, file: event.target.files?.[0] ?? null })}
                      required
                    />
                  </label>
                </div>
                <button className="button button--primary" type="submit" disabled={loading}>
                  Upload securely
                </button>
              </form>
            )}
          </div>
        )}
        {status ? <p className="portal-status">{status}</p> : null}
      </div>
    </section>
  );
}

function LocationAndFaq() {
  const locations = [
    {
      city: "Harrisonburg",
      address: "1320 S Main Street, Harrisonburg, VA 22801",
      link: "https://www.google.com/maps/search/?api=1&query=1320%20S%20Main%20Street%20Harrisonburg%20VA%2022801"
    },
    {
      city: "Woodstock, VA",
      address: "1066 Hisey Avenue, Suite 102, Woodstock, VA 22664",
      link: "https://www.google.com/maps/search/?api=1&query=1066%20Hisey%20Avenue%20Suite%20102%20Woodstock%20VA%2022664",
      phone: "540-208-7822"
    },
    {
      city: "Page County",
      address: "Coming soon: New location in Page County, VA",
      isComingSoon: true
    }
  ];

  return (
    <section className="info-band" id="faq">
      <div className="info-cards">
        <div className="contact-card" id="contact">
          <h2>Contact</h2>
          <div className="contact-list">
            <a href="tel:+15402087822">
              <Phone aria-hidden="true" />
              Call or Text: 540-208-7822
            </a>
            <a href="mailto:admin@vassllc.org">
              <Mail aria-hidden="true" />
              admin@vassllc.org
            </a>
            <a href="fax:+15402087853">
              <ClipboardList aria-hidden="true" style={{ width: "16px", height: "16px" }} />
              Fax: 540-208-7853
            </a>
          </div>
        </div>

        <div className="locations-card">
          <h2>Locations</h2>
          <div className="locations-list">
            {locations.map((loc) => (
              <div key={loc.city} className="location-item">
                <MapPin aria-hidden="true" />
                <div>
                  <strong>{loc.city}</strong>
                  {loc.link ? (
                    <a href={loc.link} target="_blank" rel="noopener noreferrer">
                      {loc.address}
                    </a>
                  ) : (
                    <span>{loc.address}</span>
                  )}
                  {loc.phone ? <a className="location-phone" href="tel:+15402087822">Call or Text: {loc.phone}</a> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="faq-list">
        {[
          {
            question: "How do families get started?",
            answer:
              "Create a parent portal account, request a meeting or assessment, and upload any reports or intake forms our clinical team should review."
          },
          {
            question: "What services does VASS provide?",
            answer:
              "VASS provides ABA-focused assessment, individualized programming, behavior support planning, caregiver coaching, and collaboration across home, school, and community settings. Families and caregivers may also schedule individualized behavior consultation and school-planning support with a licensed behavior analyst."
          },
          {
            question: "How does behavior consultation work?",
            answer:
              "A licensed behavior analyst meets directly with families or caregivers to help navigate the steps involved in starting therapy, plan supports for a student’s special education needs, or prepare for school transitions. Consultations are available remotely or at our Harrisonburg and Woodstock locations."
          },
          {
            question: "Is the portal HIPAA-ready?",
            answer:
              "The website uses Supabase Auth, private storage, and row-level security patterns. Before production use with PHI, the organization must confirm its Supabase HIPAA add-on, BAA, and project security settings."
          }
        ].map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <ChevronDown aria-hidden="true" />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <BrandMark compact />
      <div>
        <p>Virginia Autism Spectrum Services LLC</p>
        <p>www.vassllc.org</p>
      </div>
      <a className="button button--footer" href="#portal">
        Start securely
      </a>
    </footer>
  );
}

function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Milestones />
        <About />
        <MulticulturalCare />
        <Jobs />
        <SecurePortal />
        <LocationAndFaq />
      </main>
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
