import type { Metadata } from "next";
import { getGithubSnapshot } from "@/lib/github";
import { formatRange } from "@/lib/format";
import { getPortfolioContent } from "@/lib/portfolio";
import { ResponsiveNavbar } from "@/components/site/ResponsiveNavbar";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  PortfolioContent,
  ProjectItem,
  SiteSettings,
  SkillGroup,
} from "@/lib/types";

type ProjectPalette = {
  card: string;
  text: string;
  border: string;
  pill: string;
};

const projectPalettes: Record<ProjectItem["colorVariant"], ProjectPalette> = {
  mint: {
    card: "bg-[var(--verge-mint)]",
    text: "text-black",
    border: "border-[var(--verge-mint-deep)]",
    pill: "bg-black text-[var(--verge-mint)]",
  },
  ultraviolet: {
    card: "bg-[var(--verge-ultraviolet)]",
    text: "text-white",
    border: "border-[var(--verge-ultraviolet)]",
    pill: "bg-white text-[var(--verge-ultraviolet)]",
  },
  yellow: {
    card: "bg-[var(--verge-yellow)]",
    text: "text-black",
    border: "border-[#d1b100]",
    pill: "bg-black text-[var(--verge-yellow)]",
  },
  orange: {
    card: "bg-[var(--verge-orange)]",
    text: "text-black",
    border: "border-[#dd7300]",
    pill: "bg-black text-[var(--verge-orange)]",
  },
  pink: {
    card: "bg-[var(--verge-pink)]",
    text: "text-black",
    border: "border-[#ce0f74]",
    pill: "bg-black text-[var(--verge-pink)]",
  },
  slate: {
    card: "bg-[var(--verge-slate)]",
    text: "text-white",
    border: "border-white/90",
    pill: "bg-[var(--verge-mint)] text-black",
  },
  white: {
    card: "bg-white",
    text: "text-black",
    border: "border-white",
    pill: "bg-black text-white",
  },
};

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
).replace(/\/$/, "");

type Locale = "en" | "fr";

type UiCopy = {
  profileSnapshot: string;
  languages: string;
  professionalExperience: string;
  education: string;
  caseStudies: string;
  featured: string;
  repository: string;
  live: string;
  githubOverview: string;
  publicRepos: string;
  followers: string;
  following: string;
  openGithub: string;
  topRepositories: string;
  noRepositoryDescription: string;
  mixedLanguage: string;
  responseTime: string;
  emailMe: string;
  callMe: string;
  downloadCv: string;
  contactMe: string;
  breadcrumbHome: string;
};

const uiCopyByLocale: Record<Locale, UiCopy> = {
  en: {
    profileSnapshot: "Profile Snapshot",
    languages: "Languages",
    professionalExperience: "Professional Experience",
    education: "Education",
    caseStudies: "Case Studies",
    featured: "featured",
    repository: "Repository",
    live: "Live",
    githubOverview: "GitHub Overview",
    publicRepos: "Public Repos",
    followers: "Followers",
    following: "Following",
    openGithub: "Open GitHub",
    topRepositories: "Top Repositories",
    noRepositoryDescription: "No description provided yet.",
    mixedLanguage: "Mixed",
    responseTime: "Fast response: usually within 24 hours.",
    emailMe: "Email Me",
    callMe: "Call Me",
    downloadCv: "Download CV",
    contactMe: "Contact Me",
    breadcrumbHome: "Home",
  },
  fr: {
    profileSnapshot: "Profil",
    languages: "Langues",
    professionalExperience: "Experience Professionnelle",
    education: "Formation",
    caseStudies: "Etudes de Cas",
    featured: "a la une",
    repository: "Depot",
    live: "Demo",
    githubOverview: "Apercu GitHub",
    publicRepos: "Depots Publics",
    followers: "Abonnes",
    following: "Abonnements",
    openGithub: "Voir GitHub",
    topRepositories: "Top Depots",
    noRepositoryDescription: "Description non renseignee.",
    mixedLanguage: "Mixte",
    responseTime: "Reponse rapide: en general sous 24 heures.",
    emailMe: "M'envoyer un email",
    callMe: "M'appeler",
    downloadCv: "Telecharger CV",
    contactMe: "Me contacter",
    breadcrumbHome: "Accueil",
  },
};

function localizeSite(site: SiteSettings, locale: Locale): SiteSettings {
  if (locale === "en") {
    return site;
  }

  return {
    ...site,
    role: translateEnToFr(site.role),
    heroKicker: translateEnToFr(site.heroKicker),
    heroHeadline: translateEnToFr(site.heroHeadline),
    heroDescription: translateEnToFr(site.heroDescription),
    availability: translateEnToFr(site.availability),
    location: translateEnToFr(site.location),
    landingPrimaryCtaLabel: translateEnToFr(site.landingPrimaryCtaLabel),
    landingSecondaryCtaLabel: translateEnToFr(site.landingSecondaryCtaLabel),
    aboutTitle: translateEnToFr(site.aboutTitle),
    aboutParagraphOne: translateEnToFr(site.aboutParagraphOne),
    aboutParagraphTwo: translateEnToFr(site.aboutParagraphTwo),
    timelineTitle: translateEnToFr(site.timelineTitle),
    projectsTitle: translateEnToFr(site.projectsTitle),
    skillsTitle: translateEnToFr(site.skillsTitle),
    certificationsTitle: translateEnToFr(site.certificationsTitle),
    contactTitle: translateEnToFr(site.contactTitle),
    contactDescription: translateEnToFr(site.contactDescription),
    footerText: translateEnToFr(site.footerText),
    socialLinks: site.socialLinks.map((social) => ({
      ...social,
      label: translateEnToFr(social.label),
    })),
    stats: site.stats.map((stat) => ({
      ...stat,
      label: translateEnToFr(stat.label),
    })),
    languages: site.languages.map((language) => ({
      ...language,
      language: translateEnToFr(language.language),
      level: translateEnToFr(language.level),
    })),
  };
}

const enToFrMap: Array<[string, string]> = [
  [
    "I build secure, scalable full-stack systems with measurable impact.",
    "Je construis des systemes full-stack securises et evolutifs avec un impact mesurable.",
  ],
  [
    "Engineering student at EILCO (Bac+5) with hands-on delivery across Laravel, MERN, and Spring ecosystems. I focus on clean architecture, security-first implementation, and practical performance gains.",
    "Etudiant ingenieur a l'EILCO (Bac+5), avec une experience pratique sur les ecosystemes Laravel, MERN et Spring. Je me concentre sur une architecture propre, une implementation orientee securite et des gains de performance concrets.",
  ],
  [
    "Available for a 2-month internship from April 2026 and apprenticeship from September 2026.",
    "Disponible pour un stage de 2 mois a partir d'avril 2026 et une alternance a partir de septembre 2026.",
  ],
  [
    "I enjoy building products end-to-end, from data models and API contracts to polished frontend experiences. My recent work includes student-platform systems, automation tooling, and real-time monitoring architectures.",
    "J'aime construire des produits de bout en bout, des modeles de donnees et contrats API jusqu'aux experiences frontend soignees. Mes travaux recents incluent des plateformes etudiantes, des outils d'automatisation et des architectures de monitoring en temps reel.",
  ],
  [
    "I bring a security and reliability mindset to product development: unit testing, secure auth patterns, SQL-hardening, and CI-driven workflows are part of my default approach.",
    "J'apporte un etat d'esprit securite et fiabilite au developpement produit: tests unitaires, patterns d'auth securises, durcissement SQL et workflows pilotes par la CI font partie de mon approche par defaut.",
  ],
  [
    "I'm interested in backend-heavy and full-stack opportunities where I can contribute quickly, with strong interest in AI and Data.",
    "Je suis interesse par des opportunites backend et full-stack ou je peux contribuer rapidement, avec un fort interet pour l'IA et la Data.",
  ],
  ["LET'S BUILD SOMETHING SERIOUS", "CONSTRUISONS QUELQUE CHOSE DE SOLIDE"],
  ["Let's build something serious", "Construisons quelque chose de solide"],
  ["Selected Projects", "Projets Selectionnes"],
  ["Technical Stack", "Stack Technique"],
  ["Experience & Education", "Experience & Formation"],
  ["About", "A propos"],
  ["VIEW PROJECTS", "VOIR PROJETS"],
  ["View Projects", "Voir Projets"],
  ["Open GitHub", "Voir GitHub"],
  ["In progress", "En cours"],
  ["Intern", "Stagiaire"],
  ["intern", "stagiaire"],
  ["Backend", "Backend"],
  ["Frontend", "Frontend"],
  ["Quality + Security", "Qualite + Securite"],
  ["Data + DevOps", "Data + DevOps"],
  ["APR", "AVR"],
  ["MAY", "MAI"],
  ["JUN", "JUIN"],
  ["JUL", "JUIL"],
  ["AUG", "AOUT"],
  ["SEP", "SEPT"],
  ["OCT", "OCT"],
  ["DEC", "DEC"],
  ["NOV", "NOV"],
  ["FEB", "FEV"],
  ["JAN", "JANV"],
  ["MAR", "MARS"],
  ["Open to internships and alternance", "Ouvert aux stages et a l'alternance"],
  [
    "Open for internships and alternance",
    "Ouvert aux stages et a l'alternance",
  ],
  ["Available in 2026", "Disponible en 2026"],
  ["Software Engineering", "Genie Logiciel"],
  ["Software Engineer", "Ingenieur Logiciel"],
  ["Full-Stack Developer", "Developpeur Full-Stack"],
  ["Artificial Intelligence", "Intelligence Artificielle"],
  ["Machine Learning", "Apprentissage Automatique"],
  ["Data Engineering", "Ingenierie Data"],
  ["Data Science", "Science des Donnees"],
  ["Portfolio", "Portfolio"],
  ["Official", "Officiel"],
  ["official", "officiel"],
  ["Profile Snapshot", "Profil"],
  ["Languages", "Langues"],
  ["Professional Experience", "Experience Professionnelle"],
  ["Education", "Formation"],
  ["Case Studies", "Etudes de Cas"],
  ["featured", "a la une"],
  ["Repository", "Depot"],
  ["Live", "Demo"],
  ["GitHub Overview", "Apercu GitHub"],
  ["Public Repos", "Depots Publics"],
  ["Followers", "Abonnes"],
  ["Following", "Abonnements"],
  ["Top Repositories", "Top Depots"],
  ["No description provided yet.", "Description non renseignee."],
  [
    "Fast response: usually within 24 hours.",
    "Reponse rapide: en general sous 24 heures.",
  ],
  ["Email Me", "M'envoyer un email"],
  ["Call Me", "M'appeler"],
  ["Download CV", "Telecharger CV"],
  ["Contact Me", "Me contacter"],
  ["Home", "Accueil"],
  ["Timeline", "Parcours"],
  ["Work", "Projets"],
  ["Skills", "Competences"],
  ["Certs", "Certifs"],
  ["Contact", "Contact"],
  ["Present", "En cours"],
  ["Building robust software", "Conception de logiciels robustes"],
  ["Open to", "Ouvert a"],
  ["internships", "stages"],
];

function translateEnToFr(text: string): string {
  const entries = [...enToFrMap].sort((a, b) => b[0].length - a[0].length);

  let translated = text;

  for (const [from, to] of entries) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    translated = translated.replace(new RegExp(escaped, "gi"), to);
  }

  return translated;
}

function localizeContent(
  content: PortfolioContent,
  locale: Locale,
): PortfolioContent {
  if (locale === "en") {
    return content;
  }

  const site = localizeSite(content.site, locale);
  const experiences: ExperienceItem[] = content.experiences.map((item) => ({
    ...item,
    title: translateEnToFr(item.title),
    company: translateEnToFr(item.company),
    location: translateEnToFr(item.location),
    summary: translateEnToFr(item.summary),
    highlights: item.highlights.map(translateEnToFr),
  }));
  const education: EducationItem[] = content.education.map((item) => ({
    ...item,
    degree: translateEnToFr(item.degree),
    school: translateEnToFr(item.school),
    location: translateEnToFr(item.location),
    honors: item.honors ? translateEnToFr(item.honors) : item.honors,
    details: translateEnToFr(item.details),
  }));
  const projects: ProjectItem[] = content.projects.map((item) => ({
    ...item,
    title: translateEnToFr(item.title),
    period: translateEnToFr(item.period),
    summary: translateEnToFr(item.summary),
    details: translateEnToFr(item.details),
    highlights: item.highlights.map(translateEnToFr),
  }));
  const skillGroups: SkillGroup[] = content.skillGroups.map((group) => ({
    ...group,
    title: translateEnToFr(group.title),
    skills: group.skills.map(translateEnToFr),
  }));
  const certifications: CertificationItem[] = content.certifications.map(
    (cert) => ({
      ...cert,
      name: translateEnToFr(cert.name),
      issuer: cert.issuer ? translateEnToFr(cert.issuer) : cert.issuer,
    }),
  );

  return {
    ...content,
    site,
    experiences,
    education,
    projects,
    skillGroups,
    certifications,
  };
}

function getLocalePaths(locale: Locale) {
  const canonical = locale === "fr" ? "/fr" : "/";
  const absolute = `${siteUrl}${locale === "fr" ? "/fr" : ""}`;

  return { canonical, absolute };
}

export async function buildPortfolioMetadata(
  locale: Locale,
): Promise<Metadata> {
  const content = await getPortfolioContent();
  const localizedContent = localizeContent(content, locale);
  const { site } = localizedContent;
  const { canonical, absolute } = getLocalePaths(locale);
  const titleSuffix =
    locale === "fr" ? "Portfolio Officiel" : "Official Portfolio";
  const description =
    locale === "fr"
      ? `Site officiel de ${site.fullName}. ${site.heroHeadline}`
      : `Official website of ${site.fullName}. ${site.heroHeadline}`;

  return {
    title: `${site.fullName} | ${titleSuffix}`,
    description,
    keywords: [
      site.fullName,
      "Youssef Selk",
      "Selk",
      "Youssef",
      site.role,
      "Software Engineer",
      "Full-Stack Developer",
      "Artificial Intelligence",
      "Machine Learning",
      "Data Engineering",
      "Data Science",
      "Stage",
      "Alternance",
      "Portfolio",
    ],
    alternates: {
      canonical,
      languages: {
        "en-US": "/",
        "fr-FR": "/fr",
      },
    },
    openGraph: {
      title: `${site.fullName} | ${titleSuffix}`,
      description: `${site.heroHeadline}`,
      url: absolute,
      type: "website",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${site.fullName} - Official Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${site.fullName} | ${titleSuffix}`,
      description: `${site.heroHeadline}`,
      images: [`${siteUrl}/twitter-image`],
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPortfolioMetadata("en");
}

export default async function Home() {
  return <PortfolioPage locale="en" />;
}

export async function PortfolioPage({ locale }: { locale: Locale }) {
  const [baseContent, github] = await Promise.all([
    getPortfolioContent(),
    getGithubSnapshot(),
  ]);
  const content = localizeContent(baseContent, locale);

  const { site } = content;
  const uiCopy = uiCopyByLocale[locale];
  const { absolute } = getLocalePaths(locale);
  const translateByLocale = (text: string) =>
    locale === "fr" ? translateEnToFr(text) : text;

  const { experiences, education, projects, skillGroups, certifications } =
    content;
  const phoneDigits = site.phone.replace(/\D/g, "");
  const whatsappUrl = phoneDigits ? `https://wa.me/${phoneDigits}` : null;
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: site.fullName,
    alternateName: ["Youssef Selk", "Selk", "Youssef"],
    jobTitle: site.role,
    url: siteUrl,
    mainEntityOfPage: absolute,
    email: `mailto:${site.email}`,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location,
    },
    sameAs: [
      site.linkedinUrl,
      site.githubUrl,
      ...site.socialLinks.map((social) => social.url).filter(Boolean),
    ],
    description: site.heroHeadline,
    knowsAbout: [
      "Full-Stack Development",
      "Artificial Intelligence",
      "Machine Learning",
      "Data Engineering",
      "Data Science",
      "Software Security",
    ],
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: `${site.fullName} Portfolio`,
    url: siteUrl,
    inLanguage: locale,
    mainEntity: {
      "@id": `${siteUrl}/#person`,
    },
    about: {
      "@type": "Person",
      name: site.fullName,
    },
  };
  const webpageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absolute}/#webpage`,
    url: absolute,
    name: `${site.fullName} | ${locale === "fr" ? "Portfolio Officiel" : "Official Portfolio"}`,
    description: site.heroHeadline,
    isPartOf: {
      "@id": `${siteUrl}/#website`,
    },
    about: {
      "@id": `${siteUrl}/#person`,
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: uiCopy.breadcrumbHome,
        item: absolute,
      },
    ],
  };

  const contactSubject = encodeURIComponent(
    locale === "fr"
      ? "Opportunite stage ou alternance pour Youssef Selk"
      : "Opportunity for Youssef Selk",
  );

  return (
    <div className="verge-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="editorial-grid relative z-10 mx-auto w-full max-w-[1340px] px-3 pb-14 sm:px-6 lg:px-12">
        <ResponsiveNavbar cvUrl={site.cvUrl} locale={locale} />

        <main
          id="top"
          className="space-y-12 pt-8 sm:space-y-16 sm:pt-12 lg:space-y-20 lg:pt-14"
        >
          <section className="slide-up grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-end lg:gap-8">
            <div className="space-y-5 sm:space-y-6">
              <p className="kicker text-[var(--verge-mint)]">
                {site.heroKicker}
              </p>
              <h1 className="display-wordmark max-w-[13ch] text-4xl sm:text-6xl lg:text-[6.1rem]">
                {site.fullName}
              </h1>
              <p className="max-w-3xl text-sm font-semibold uppercase tracking-[0.14em] text-[var(--verge-mint)] sm:text-base">
                {site.role}
              </p>
              <p className="max-w-3xl text-base font-semibold leading-tight text-white sm:text-2xl">
                {site.heroHeadline}
              </p>
              <p className="max-w-3xl text-sm leading-relaxed text-[#d4d4d4] sm:text-lg">
                {site.heroDescription}
              </p>
              <p className="max-w-2xl rounded-[22px] border border-[var(--verge-ultraviolet)] bg-[rgba(82,0,255,0.16)] px-4 py-3 text-xs leading-relaxed text-white sm:px-5 sm:py-4 sm:text-base">
                {site.availability}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={site.landingPrimaryCtaUrl}
                  className="btn-solid focus-outline w-full rounded-full border border-transparent px-6 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.13em] text-black sm:w-auto sm:tracking-[0.16em]"
                >
                  {site.landingPrimaryCtaLabel}
                </a>
                <a
                  href={site.landingSecondaryCtaUrl}
                  className="btn-outline focus-outline w-full rounded-full border border-white px-6 py-3 text-center font-mono text-xs font-bold uppercase tracking-[0.13em] text-white sm:w-auto sm:tracking-[0.16em]"
                >
                  {site.landingSecondaryCtaLabel}
                </a>
              </div>
            </div>
            <aside className="story-pill interactive-card bg-[var(--verge-slate)] p-4 sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-[var(--verge-mint)]">
                {uiCopy.profileSnapshot}
              </p>
              <p className="mb-1 text-sm text-[var(--verge-muted)]">
                {site.role}
              </p>
              <p className="text-base text-white">{site.location}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {site.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/70 bg-[rgba(255,255,255,0.02)] p-4"
                  >
                    <p className="kicker mb-2 text-[var(--verge-muted)]">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
            <div className="story-pill interactive-card bg-[var(--verge-canvas)] p-4 sm:p-6 lg:p-8">
              <p className="kicker mb-3 text-[var(--verge-mint)]">
                {site.aboutTitle}
              </p>
              <p className="mb-4 text-base leading-relaxed text-[#e5e5e5] sm:text-lg">
                {site.aboutParagraphOne}
              </p>
              <p className="text-base leading-relaxed text-[#c8c8c8] sm:text-lg">
                {site.aboutParagraphTwo}
              </p>
            </div>
            <div className="story-pill interactive-card bg-white p-4 text-black sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-black">{uiCopy.languages}</p>
              <div className="space-y-3">
                {site.languages.map((language) => (
                  <div
                    key={language.language}
                    className="flex items-center justify-between border-b border-black/20 pb-2"
                  >
                    <span className="font-semibold">{language.language}</span>
                    <span className="kicker text-black">{language.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="timeline" className="space-y-6 sm:space-y-7">
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {site.timelineTitle}
            </h2>
            <div className="section-rule" aria-hidden="true" />
            <div className="grid gap-8 lg:grid-cols-2">
              <TimelineColumn
                label={uiCopy.professionalExperience}
                items={experiences.map((item) => ({
                  id: item._id,
                  period: translateByLocale(
                    formatRange(item.startDate, item.endDate, item.isCurrent),
                  ),
                  title: item.title,
                  subtitle: `${item.company} - ${item.location}`,
                  summary: item.summary,
                  highlights: item.highlights,
                }))}
              />
              <TimelineColumn
                label={uiCopy.education}
                items={education.map((item) => ({
                  id: item._id,
                  period: translateByLocale(
                    formatRange(item.startDate, item.endDate),
                  ),
                  title: item.degree,
                  subtitle: `${item.school} - ${item.location}`,
                  summary: item.details,
                  highlights: item.honors ? [item.honors] : [],
                }))}
              />
            </div>
          </section>

          <section id="projects" className="space-y-6 sm:space-y-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
                {site.projectsTitle}
              </h2>
              <p className="kicker text-[var(--verge-mint)]">
                {uiCopy.caseStudies}
              </p>
            </div>
            <div className="section-rule" aria-hidden="true" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const palette = projectPalettes[project.colorVariant];

                return (
                  <article
                    key={project._id}
                    className={`story-pill interactive-card flex h-full flex-col border ${palette.card} ${palette.text} ${palette.border} p-5 sm:p-6`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span
                        className={`kicker rounded-full px-3 py-1 ${palette.pill}`}
                      >
                        {project.period}
                      </span>
                      {project.featured ? (
                        <span className="kicker">{uiCopy.featured}</span>
                      ) : null}
                    </div>
                    <h3 className="mb-3 text-xl font-black leading-tight sm:text-2xl">
                      {project.title}
                    </h3>
                    <p className="mb-4 text-sm leading-relaxed sm:text-base">
                      {project.summary}
                    </p>
                    <p className="mb-5 text-sm leading-relaxed opacity-85">
                      {project.details}
                    </p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="max-w-full break-words rounded-full border border-current/30 px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] sm:text-[0.68rem] sm:tracking-[0.14em]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <ul className="mb-5 space-y-2 text-sm">
                      {project.highlights.map((highlight) => (
                        <li key={highlight} className="leading-relaxed">
                          - {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3">
                      {project.repoUrl ? (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-outline rounded-full border border-current px-3 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-[0.1em] sm:px-4 sm:text-[0.64rem] sm:tracking-[0.14em]"
                        >
                          {uiCopy.repository}
                        </a>
                      ) : null}
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-outline rounded-full border border-current px-3 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-[0.1em] sm:px-4 sm:text-[0.64rem] sm:tracking-[0.14em]"
                        >
                          {uiCopy.live}
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="skills" className="space-y-6 sm:space-y-7">
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {site.skillsTitle}
            </h2>
            <div className="section-rule" aria-hidden="true" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {skillGroups.map((group, index) => (
                <article
                  key={group._id}
                  className={`story-pill interactive-card p-5 sm:p-6 ${index % 3 === 0 ? "bg-[var(--verge-slate)]" : "bg-[var(--verge-canvas)]"}`}
                >
                  <h3 className="mb-4 text-xl font-bold">{group.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {group.skills.map((skill) => (
                      <span
                        key={skill}
                        className="max-w-full break-words rounded-full border border-white/70 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.09em] sm:text-[0.65rem] sm:tracking-[0.12em]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <article className="story-pill interactive-card bg-[var(--verge-slate)] p-4 sm:p-6 lg:p-8">
              <p className="kicker mb-3 text-[var(--verge-mint)]">
                {uiCopy.githubOverview}
              </p>
              <h2 className="mb-2 text-3xl font-black leading-tight sm:text-4xl">
                {github.profile.name}
              </h2>
              <p className="mb-5 text-sm text-[#d5d5d5] sm:text-base">
                {translateByLocale(github.profile.bio)}
              </p>
              <div className="mb-6 flex flex-wrap gap-3">
                <Badge
                  label={uiCopy.publicRepos}
                  value={String(github.profile.public_repos)}
                />
                <Badge
                  label={uiCopy.followers}
                  value={String(github.profile.followers)}
                />
                <Badge
                  label={uiCopy.following}
                  value={String(github.profile.following)}
                />
              </div>
              <a
                href={github.profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex rounded-full border border-[var(--verge-mint)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--verge-mint)]"
              >
                {uiCopy.openGithub}
              </a>
            </article>
            <article className="story-pill interactive-card bg-white p-4 text-black sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-black">{uiCopy.topRepositories}</p>
              <div className="space-y-4">
                {github.topRepos.slice(0, 4).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive-card block rounded-2xl border border-black/20 p-4 transition-colors hover:bg-black hover:text-white"
                  >
                    <h3 className="mb-1 text-base font-extrabold">
                      {repo.name}
                    </h3>
                    <p className="mb-2 text-sm opacity-80">
                      {repo.description
                        ? translateByLocale(repo.description)
                        : uiCopy.noRepositoryDescription}
                    </p>
                    <p className="kicker text-black/70">
                      {repo.language || uiCopy.mixedLanguage}
                    </p>
                  </a>
                ))}
              </div>
            </article>
          </section>

          <section id="certifications" className="space-y-5">
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {site.certificationsTitle}
            </h2>
            <div className="section-rule" aria-hidden="true" />
            <div className="story-pill interactive-card bg-[var(--verge-canvas)] p-4 sm:p-6 lg:p-8">
              <div className="flex flex-wrap gap-3">
                {certifications.map((cert) => (
                  <span
                    key={cert._id}
                    className="max-w-full break-words rounded-full border border-white px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.09em] sm:px-4 sm:text-[0.67rem] sm:tracking-[0.14em]"
                  >
                    {cert.name}
                    {cert.issuer ? ` - ${cert.issuer}` : ""}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section
            id="contact"
            className="story-pill interactive-card bg-[var(--verge-mint)] p-5 text-black sm:p-8 lg:p-10"
          >
            <p className="kicker mb-3 text-black">{site.contactTitle}</p>
            <p className="mb-6 max-w-3xl text-lg font-bold leading-tight sm:text-3xl">
              {site.contactDescription}
            </p>
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.12em] text-black/80 sm:text-base">
              {uiCopy.responseTime}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${site.email}?subject=${contactSubject}`}
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                {uiCopy.emailMe}
              </a>
              <a
                href={`tel:${site.phone}`}
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                {uiCopy.callMe}
              </a>
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
                >
                  WhatsApp
                </a>
              ) : null}
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                LinkedIn
              </a>
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                GitHub
              </a>
              <a
                href={site.cvUrl}
                download
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] transition-colors duration-200 hover:bg-black hover:text-[var(--verge-mint)] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                {uiCopy.downloadCv}
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm font-semibold text-black/80">
              <a
                href={`mailto:${site.email}`}
                className="transition-colors duration-200 underline-offset-4 hover:text-black hover:underline"
              >
                {site.email}
              </a>
              <span>-</span>
              <a
                href={`tel:${site.phone}`}
                className="transition-colors duration-200 underline-offset-4 hover:text-black hover:underline"
              >
                {site.phone}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {site.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-outline rounded-full bg-black px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.09em] text-[var(--verge-mint)] transition-colors duration-200 hover:bg-white hover:text-black sm:px-4 sm:text-[0.68rem] sm:tracking-[0.14em]"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-12 border-t border-white/20 py-6 text-xs text-[#a9a9a9] sm:mt-20 sm:py-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="max-w-2xl">{site.footerText}</p>
            <div className="flex flex-wrap items-center gap-2 font-mono uppercase tracking-[0.12em]">
              <span>{site.location}</span>
              <span>-</span>
              <span>{site.phone}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="interactive-card rounded-full border border-white/60 px-4 py-2">
      <p className="kicker text-[var(--verge-muted)]">{label}</p>
      <p className="text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

type TimelineItem = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  summary: string;
  highlights: string[];
};

function TimelineColumn({
  label,
  items,
}: {
  label: string;
  items: TimelineItem[];
}) {
  return (
    <article className="story-pill interactive-card relative bg-[var(--verge-canvas)] p-5 sm:p-7">
      <p className="kicker mb-5 text-[var(--verge-mint)]">{label}</p>
      <div className="relative space-y-5 pl-6">
        <span className="timeline-rail" aria-hidden="true" />
        {items.map((item) => (
          <div
            key={item.id}
            className="story-pill interactive-card relative bg-[var(--verge-slate)] p-4 sm:p-5"
          >
            <p className="kicker mb-3 text-[var(--verge-mint)]">
              {item.period}
            </p>
            <h3 className="mb-2 text-xl font-bold leading-tight">
              {item.title}
            </h3>
            <p className="mb-3 break-words text-sm text-[#d3d3d3]">
              {item.subtitle}
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[#ececec]">
              {item.summary}
            </p>
            {item.highlights.length > 0 ? (
              <ul className="space-y-2 text-sm text-[#d9d9d9]">
                {item.highlights.map((highlight) => (
                  <li key={highlight}>- {highlight}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
