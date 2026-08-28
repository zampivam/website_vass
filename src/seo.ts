import type { JobOpening } from "./jobs";

export const SITE_URL = "https://www.vassllc.org";

function setMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element!.setAttribute(key, value));
}

function setCanonical(path: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = `${SITE_URL}${path}`;
}

function setJsonLd(id: string, value: unknown) {
  document.getElementById(id)?.remove();
  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.text = JSON.stringify(value).replace(/</g, "\\u003c");
  document.head.appendChild(script);
}

function applyBase(title: string, description: string, path: string) {
  document.title = title;
  setMeta('meta[name="description"]', { name: "description", content: description });
  setMeta('meta[property="og:title"]', { property: "og:title", content: title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: description });
  setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  setMeta('meta[property="og:url"]', { property: "og:url", content: `${SITE_URL}${path}` });
  setMeta('meta[property="og:image"]', { property: "og:image", content: `${SITE_URL}/images/vass-hero-therapy-room.jpg` });
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  setCanonical(path);
}

export function applyHomeSeo() {
  applyBase(
    "Autism & ABA Therapy in Harrisonburg and Woodstock, VA | VASS",
    "Virginia Autism Spectrum Services provides individualized autism and ABA therapy, caregiver consultation, and school-planning support in Harrisonburg and Woodstock, Virginia.",
    "/"
  );
  setJsonLd("vass-local-business", {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Virginia Autism Spectrum Services LLC",
    url: SITE_URL,
    logo: `${SITE_URL}/images/vass-positive-change-logo.png`,
    image: `${SITE_URL}/images/vass-hero-therapy-room.jpg`,
    telephone: "+1-540-208-7822",
    email: "admin@vassllc.org",
    address: [
      { "@type": "PostalAddress", streetAddress: "1320 S Main Street", addressLocality: "Harrisonburg", addressRegion: "VA", postalCode: "22801", addressCountry: "US" },
      { "@type": "PostalAddress", streetAddress: "1066 Hisey Avenue, Suite 102", addressLocality: "Woodstock", addressRegion: "VA", postalCode: "22664", addressCountry: "US" }
    ],
    areaServed: ["Harrisonburg, Virginia", "Rockingham County, Virginia", "Woodstock, Virginia", "Shenandoah County, Virginia", "Page County, Virginia", "Staunton, Virginia", "Augusta County, Virginia"]
  });
}

export function applyJobSeo(job: JobOpening) {
  const path = `/jobs/${job.slug}`;
  const description = `${job.summary} Learn about responsibilities, qualifications, locations, and how to apply with Virginia Autism Spectrum Services.`;
  applyBase(`${job.title} | Careers at VASS`, description, path);
  setJsonLd("vass-job-posting", {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [...job.overview, ...job.responsibilities, ...job.qualifications].map((item) => `<p>${item}</p>`).join(""),
    datePosted: "2026-08-27",
    directApply: false,
    hiringOrganization: {
      "@type": "Organization",
      name: "Virginia Autism Spectrum Services LLC",
      sameAs: SITE_URL,
      logo: `${SITE_URL}/images/vass-positive-change-logo.png`
    },
    applicantLocationRequirements: { "@type": "Country", name: "United States" },
    jobLocation: job.slug === "behavior-therapist" ? [
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Harrisonburg", addressRegion: "VA", addressCountry: "US" } },
      { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Staunton", addressRegion: "VA", addressCountry: "US" } },
      { "@type": "Place", address: { "@type": "PostalAddress", addressRegion: "VA", addressCountry: "US" } }
    ] : [{ "@type": "Place", address: { "@type": "PostalAddress", addressRegion: "VA", addressCountry: "US" } }]
  });
}
