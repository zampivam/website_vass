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
import { ParentPortal } from "./portal/ParentPortal";
import { AdminPortal } from "./portal/AdminPortal";
import { JobDetailPage, jobOpenings } from "./jobs";
import { applyHomeSeo } from "./seo";
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
        <h3>Private document access</h3>
        <p>
          The portal is designed so each family can access only its own records, while authorized staff access requires a separate
          verified role. Production use begins only after VASS completes its compliance and Firebase account setup.
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
  return (
    <section className="jobs-section" id="jobs">
      <div className="jobs-shell">
        <div className="jobs-intro">
          <span className="jobs-eyebrow">Careers at VASS</span>
          <h2>Join a team that enjoys helping children grow through everyday moments.</h2>
          <p>
            We welcome dependable professionals who respect families, enjoy working with children, and want to build useful skills through thoughtful ABA care.
          </p>
        </div>

        <div className="jobs-grid jobs-grid--openings">
          {jobOpenings.map((job) => (
            <article className="jobs-card jobs-card--opening" key={job.slug}>
              <span className="jobs-card__meta">Now accepting applications</span>
              <h3>{job.title}</h3>
              <p>{job.summary}</p>
              <a className="text-link" href={`/jobs/${job.slug}`}>
                View position
                <ArrowRight aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
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
              "The portal uses authenticated access and private document storage. VASS must complete its Firebase production, billing, and HIPAA configuration before collecting protected health information."
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
  React.useEffect(() => applyHomeSeo(), []);
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
        <ParentPortal />
        <LocationAndFaq />
      </main>
      <Footer />
    </>
  );
}

function Route() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path === "/admin") return <AdminPortal />;
  const job = jobOpenings.find((item) => path === `/jobs/${item.slug}`);
  if (job) return <JobDetailPage job={job} />;
  return <App />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Route />
  </React.StrictMode>
);
