import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, MapPin } from "lucide-react";
import { applyJobSeo } from "./seo";

export type JobOpening = {
  slug: string;
  title: string;
  summary: string;
  locations: string[];
  overview: string[];
  responsibilities: string[];
  qualifications: string[];
  requirements?: string[];
};

export const jobOpenings: JobOpening[] = [
  {
    slug: "behavior-therapist",
    title: "Behavior Therapist",
    summary: "Provide direct, play-centered support to children with autism and other developmental disabilities under the guidance of a BCBA.",
    locations: ["Harrisonburg and Rockingham County", "Staunton and Augusta County", "Page County", "Shenandoah County"],
    overview: [
      "Virginia Autism Spectrum Services is looking for a dedicated Behavior Therapist to support children with autism and other developmental disabilities.",
      "Our team works in a supportive, family-friendly environment and provides ongoing training, competitive compensation, and gas reimbursement."
    ],
    responsibilities: [
      "Provide direct therapy under the supervision of a Board Certified Behavior Analyst.",
      "Collect accurate session data and help the clinical team evaluate behavior and progress.",
      "Work with the clinical team to carry out individualized goals and treatment plans."
    ],
    qualifications: [
      "Working knowledge of behavior principles and positive teaching practices.",
      "Comfort working with children and adolescents ages 2 through 18.",
      "Clear communication, sound judgment, and careful attention to detail.",
      "Ability to follow clinical protocols and individualized treatment plans.",
      "Familiarity with Google Docs, Google Sheets, Microsoft Word, and Excel is preferred."
    ]
  },
  {
    slug: "bcba-lba",
    title: "Board Certified Behavior Analyst / Licensed Behavior Analyst",
    summary: "Design and oversee individualized ABA services across home, clinic, school, and community settings while supporting families and clinical staff.",
    locations: ["Virginia; travel between service settings is required"],
    overview: [
      "This role applies behavior analysis to skill acquisition, caregiver education, staff training, and behavior support in home, clinic, school, and community settings.",
      "The BCBA/LBA leads individualized service planning, clinical supervision, interdisciplinary collaboration, and clear communication with families."
    ],
    responsibilities: [
      "Design, oversee, and update individualized service plans, goals, protocols, and transition plans.",
      "Provide clinical supervision, direct billable services, consultation, and parent or caregiver training.",
      "Coordinate goals with families, schools, and other professionals while following ethical and regulatory requirements.",
      "Track progress, analyze data, and complete timely intake, daily, progress, discharge, and transition documentation."
    ],
    qualifications: [
      "Active, valid license in Behavior Analysis from the Virginia Board of Medicine.",
      "At least one year of experience working with pediatric or adolescent clients.",
      "Reliable transportation, a valid driver's license, and current automobile insurance.",
      "Ability to meet the physical requirements of community-based clinical work, including occasional running and trained physical assistance."
    ],
    requirements: [
      "Federal and state background checks, Child Protective Services registry screening, and tuberculosis screening.",
      "Required training may include Behavior Intervention, First Aid and CPR, Infection Control, Emergency Preparedness, Human Rights, and other assigned courses."
    ]
  }
];

export function JobDetailPage({ job }: { job: JobOpening }) {
  React.useEffect(() => applyJobSeo(job), [job]);
  const subject = encodeURIComponent(`Application: ${job.title}`);

  return (
    <div className="job-page">
      <header className="job-page__header">
        <a className="job-page__brand" href="/" aria-label="Virginia Autism Spectrum Services home">
          <img src="/images/vass-positive-change-logo.png" alt="Virginia Autism Spectrum Services" />
          <span>Virginia Autism Spectrum Services</span>
        </a>
        <a className="text-link" href="/#jobs"><ArrowLeft aria-hidden="true" /> All careers</a>
      </header>

      <main className="job-page__main">
        <section className="job-hero">
          <span className="jobs-eyebrow">Careers at VASS</span>
          <h1>{job.title}</h1>
          <div className="job-locations"><MapPin aria-hidden="true" /><span>{job.locations.join(" · ")}</span></div>
          {job.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <a className="button button--primary" href={`mailto:admin@vassllc.org?subject=${subject}`}>
            Apply by email <ArrowRight aria-hidden="true" />
          </a>
        </section>

        <div className="job-content">
          <section>
            <h2>Responsibilities</h2>
            <ul>{job.responsibilities.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
          </section>
          <section>
            <h2>Qualifications</h2>
            <ul>{job.qualifications.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
          </section>
          {job.requirements ? <section>
            <h2>Screening and training</h2>
            <ul>{job.requirements.map((item) => <li key={item}><CheckCircle2 aria-hidden="true" />{item}</li>)}</ul>
          </section> : null}
        </div>

        <aside className="job-apply">
          <Mail aria-hidden="true" />
          <div><h2>Interested in joining VASS?</h2><p>Email your resume, location, and a short introduction to admin@vassllc.org.</p></div>
          <a className="button button--primary" href={`mailto:admin@vassllc.org?subject=${subject}`}>Apply now</a>
        </aside>
      </main>
    </div>
  );
}
