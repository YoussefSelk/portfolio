import type { Metadata } from "next";
import { getGithubSnapshot } from "@/lib/github";
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
    breadcrumbHome: "Accueil",
  },
};

function localizeSite(site: SiteSettings, locale: Locale): SiteSettings {
  const contentOverrides = Array.isArray(site.contentOverrides)
    ? site.contentOverrides
    : [];

  if (locale === "en") {
    return {
      ...site,
      contentOverrides,
    };
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
    contentOverrides: contentOverrides.map((item) => {
      if (item.key.endsWith(".fr") || item.key.endsWith(".en")) {
        return item;
      }

      return {
        ...item,
        value: translateEnToFr(item.value),
      };
    }),
  };
}

function createTextResolver(site: SiteSettings, locale: Locale) {
  const contentOverrides = Array.isArray(site.contentOverrides)
    ? site.contentOverrides
    : [];

  const values = new Map(
    contentOverrides
      .map((item) => [item.key.trim(), item.value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  );

  return (key: string, fallback: string) => {
    const localeValue = values.get(`${key}.${locale}`);
    if (localeValue) {
      return localeValue;
    }

    const genericValue = values.get(key);
    if (genericValue) {
      return genericValue;
    }

    return fallback;
  };
}

const enToFrMap: Array<[string, string]> = [
  [
    "I build full-stack systems that ship and stay stable in production.",
    "Je construis des systemes full-stack qui sortent en prod et restent stables.",
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
  [
    "Building production-grade software",
    "Conception de logiciels de production",
  ],
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
  const title =
    locale === "fr"
      ? "Youssef Selk — Developpeur Full-Stack · Stage Juin 2026"
      : "Youssef Selk — Full-Stack Developer · Internship Jun 2026";
  const description =
    locale === "fr"
      ? "Portfolio de Youssef Selk: projets backend/full-stack, preuves terrain et disponibilite stage juin 2026 puis alternance septembre 2026."
      : "Portfolio of Youssef Selk: backend/full-stack projects, field-tested outcomes, and availability for internship in June 2026 then apprenticeship in September 2026.";

  return {
    title: {
      absolute: title,
    },
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
      title,
      description,
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
      card: "summary_large_image",
      title,
      description,
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
  const portfolioSummary =
    locale === "fr"
      ? "Portfolio backend/full-stack de Youssef Selk avec resultats terrain, approche securite et disponibilite stage juin 2026 puis alternance septembre 2026."
      : "Youssef Selk backend/full-stack portfolio with field-tested outcomes, security-first delivery, and availability for internship in June 2026 then apprenticeship in September 2026.";

  const { experiences, education, projects, certifications, skillGroups } =
    content;
  const alumniOf = Array.from(
    new Set(education.map((item) => item.school)),
  ).map((school) => ({
    "@type": "CollegeOrUniversity",
    name: school,
  }));
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
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location,
    },
    sameAs: [
      site.linkedinUrl,
      site.githubUrl,
      ...site.socialLinks.map((social) => social.url).filter(Boolean),
    ],
    alumniOf,
    description: portfolioSummary,
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
    description: portfolioSummary,
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

  const text = createTextResolver(site, locale);
  const heroSubhead = site.heroHeadline.trim() || site.heroDescription.trim();
  const heroSticker =
    site.heroKicker.trim() ||
    (locale === "fr"
      ? "Etudiant en genie informatique / EILCO"
      : "Computer Engineering Student / EILCO");
  const heroStats =
    site.stats.length > 0
      ? site.stats.slice(0, 3).map((stat) => ({
          value: stat.value,
          label: stat.label,
          detail: "",
        }))
      : locale === "fr"
        ? [
            {
              value: "+20%",
              label: "Vitesse Equipe",
              detail: "Chez SMTM, en Agile",
            },
            {
              value: "-30%",
              label: "Regressions",
              detail: "Avec PHPUnit",
            },
            {
              value: "+40%",
              label: "Productivite",
              detail: "Presence QR a l'UIR",
            },
          ]
        : [
            {
              value: "+20%",
              label: "Team Velocity",
              detail: "At SMTM, Agile",
            },
            {
              value: "-30%",
              label: "Regressions",
              detail: "Via PHPUnit",
            },
            {
              value: "+40%",
              label: "Productivity",
              detail: "QR Attendance",
            },
          ];
  const featuredProjects = [...projects]
    .sort((a, b) => a.order - b.order)
    .slice(0, 6);
  const [case01, case02, case03, case04, case05, case06] = featuredProjects;
  const getProjectOutcome = (project?: ProjectItem) => {
    if (!project) {
      return "";
    }

    return project.highlights[0] || project.summary || project.details;
  };
  const dispatchLabel = text("dispatch.label", "Dispatch · 01");
  const dispatchTitle = site.aboutTitle;
  const dispatchIntro = site.aboutParagraphOne;
  const dispatchBody = site.aboutParagraphTwo;
  const dispatchQuote = site.role;
  const languagesLine =
    site.languages.length > 0
      ? `${locale === "fr" ? "Langues" : "Fluent in"}: ${site.languages
          .map((item) => `${item.language} (${item.level})`)
          .join(" · ")}.`
      : locale === "fr"
        ? "Langues: francais (C2) · arabe (natif) · anglais (TOEIC 855, C1)."
        : "Fluent in: French (C2) · Arabic (native) · English (TOEIC 855, C1).";
  const buildLabel = text("build.label", "Build · Table of Contents");
  const buildTitle = site.skillsTitle;
  const buildRows = [...skillGroups]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      label: group.title,
      copy: group.skills.join(" · "),
    }))
    .filter((row) => row.copy.trim().length > 0);
  const timelineReadMore = text(
    "timeline.readMore",
    locale === "fr" ? "Lire plus" : "Read more",
  );
  const timelineEntries = [
    ...experiences.map((item) => ({
      id: item._id,
      startDate: item.startDate,
      period: `${new Date(item.startDate).getFullYear()} - ${
        item.isCurrent
          ? text("timeline.present", locale === "fr" ? "En cours" : "Present")
          : new Date(item.endDate || item.startDate).getFullYear()
      }`,
      year: String(new Date(item.startDate).getFullYear()),
      role: item.title,
      org: `${item.company} · ${item.location}`,
      outcome: item.summary,
      details: item.highlights,
    })),
    ...education.map((item) => ({
      id: item._id,
      startDate: item.startDate,
      period: `${new Date(item.startDate).getFullYear()} - ${new Date(item.endDate || item.startDate).getFullYear()}`,
      year: String(new Date(item.startDate).getFullYear()),
      role: item.degree,
      org: `${item.school} · ${item.location}`,
      outcome: item.details,
      details: [item.details, item.honors].filter(Boolean) as string[],
    })),
  ].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );
  const timelineYears = timelineEntries
    .map((entry) => Number(entry.year))
    .filter((year) => Number.isFinite(year));
  const timelineLabelPrefix = text("timeline.labelPrefix", "Timeline");
  const timelineLabel =
    timelineYears.length > 0
      ? `${timelineLabelPrefix} · ${Math.min(...timelineYears)} - ${Math.max(...timelineYears)}`
      : timelineLabelPrefix;
  const timelineTitle = site.timelineTitle;
  const colophonLabel = site.contactTitle;
  const colophonBody = site.contactDescription;
  const colophonMailSubject = text(
    "colophon.mailSubject",
    `${site.fullName} · Contact`,
  );
  const primaryCtaLabel =
    site.landingPrimaryCtaLabel.trim() ||
    (locale === "fr" ? "Telecharger CV" : "Download CV");
  const primaryCtaUrl = site.landingPrimaryCtaUrl.trim() || "#work";
  const primaryCtaIsDownload = /\.pdf($|[?#])/i.test(primaryCtaUrl);
  const secondaryCtaLabel =
    site.landingSecondaryCtaLabel.trim() ||
    (locale === "fr" ? "Lire les projets" : "Read the work");
  const secondaryCtaUrl = site.landingSecondaryCtaUrl.trim() || "#work";
  const navLabelOverrides = {
    dispatch: text("nav.dispatch", locale === "fr" ? "Dispatch" : "Dispatch"),
    work: text("nav.work", locale === "fr" ? "Projets" : "Work"),
    build: text("nav.build", locale === "fr" ? "Stack" : "Build"),
    timeline: text("nav.timeline", locale === "fr" ? "Parcours" : "Timeline"),
    colophon: text("nav.colophon", "Colophon"),
  };
  const navStickyContactLabel = text("nav.contact", "Contact");
  const workKicker = text(
    "work.kicker",
    locale === "fr" ? "Featured · Edition 2026" : "Featured · Issue 2026",
  );
  const case01State = text(
    "work.case01State",
    locale === "fr" ? "En production" : "In production",
  );
  const case02State = text(
    "work.case02State",
    locale === "fr" ? "Publie" : "Published",
  );
  const case03State = text(
    "work.case03State",
    locale === "fr" ? "Actif" : "Active",
  );
  const workRepoLabel = text(
    "work.repoLabel",
    locale === "fr" ? "Depot" : "Repository",
  );
  const workLiveLabel = text(
    "work.liveLabel",
    locale === "fr" ? "Live" : "Live",
  );
  const workPreviewTitle = text("work.previewTitle", "Preview");
  const workPreviewMeta = text(
    "work.previewMeta",
    "Roles · Events · Validation",
  );
  const githubOverviewLabel = text(
    "github.overviewLabel",
    uiCopy.githubOverview,
  );
  const githubPublicReposLabel = text(
    "github.publicReposLabel",
    uiCopy.publicRepos,
  );
  const githubFollowersLabel = text("github.followersLabel", uiCopy.followers);
  const githubFollowingLabel = text("github.followingLabel", uiCopy.following);
  const githubOpenLabel = text("github.openLabel", uiCopy.openGithub);
  const githubTopReposLabel = text(
    "github.topReposLabel",
    uiCopy.topRepositories,
  );
  const githubNoDescriptionLabel = text(
    "github.noDescriptionLabel",
    uiCopy.noRepositoryDescription,
  );
  const githubMixedLanguageLabel = text(
    "github.mixedLanguageLabel",
    uiCopy.mixedLanguage,
  );
  const colophonCvLabel = text("colophon.cvLabel", "CV (PDF)");
  const orcidLink =
    site.socialLinks.find((item) => item.label.trim().toLowerCase() === "orcid")
      ?.url || "https://orcid.org/0009-0006-9970-3188";

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
        <ResponsiveNavbar
          locale={locale}
          linkLabelOverrides={navLabelOverrides}
          stickyContactLabel={navStickyContactLabel}
        />

        <main
          id="top"
          className="space-y-12 pt-8 sm:space-y-16 sm:pt-12 lg:space-y-20 lg:pt-10"
        >
          <section className="slide-up relative min-h-[calc(100vh-11.5rem)] pt-2 sm:pt-5">
            <div className="relative max-w-[95rem]">
              {/* Intentional: editorial imperfection, do not fix */}
              <span className="hero-sticker absolute left-0 top-1 z-10 inline-flex bg-(--accent-mint) px-3 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.14em] text-black sm:px-4 sm:text-[0.64rem] lg:left-4">
                {heroSticker}
              </span>
              <h1 className="display-wordmark pr-2 pt-8 text-[clamp(72px,14vw,220px)] text-foreground sm:pr-0 sm:pt-9">
                {site.fullName}
              </h1>
            </div>

            <p className="mt-5 max-w-4xl text-[1.08rem] italic leading-[1.6] text-foreground sm:mt-6 sm:text-[1.2rem]">
              {heroSubhead}
            </p>

            <div className="stats-strip mt-7 grid gap-4 py-4 sm:mt-8 sm:grid-cols-3 sm:gap-6 sm:py-5">
              {heroStats.map((stat) => (
                <article
                  key={stat.label}
                  className="border-l border-white/20 pl-4 first:border-l-0 first:pl-0"
                >
                  <p className="display-wordmark text-[clamp(56px,7vw,96px)] leading-[0.8] text-(--accent-mint)">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-mono text-[0.63rem] uppercase tracking-[0.16em] text-foreground">
                    {stat.label}
                  </p>
                  {stat.detail ? (
                    <p className="mt-1 font-mono text-[0.63rem] uppercase tracking-[0.14em] text-(--text-muted)">
                      {stat.detail}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-4">
              <a
                href={primaryCtaUrl}
                download={primaryCtaIsDownload || undefined}
                className="editorial-link focus-outline text-foreground"
              >
                <span aria-hidden="true">→</span>
                {primaryCtaLabel}
              </a>
              <a
                href={secondaryCtaUrl}
                className="editorial-link focus-outline text-foreground"
              >
                <span aria-hidden="true">→</span>
                {secondaryCtaLabel}
              </a>
            </div>
          </section>

          <section id="dispatch" className="space-y-4 sm:space-y-5">
            <p className="kicker text-(--text-muted)">{dispatchLabel}</p>
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {dispatchTitle}
            </h2>
            <div className="relative grid gap-6 lg:grid-cols-12 lg:gap-8">
              {/* Intentional: editorial imperfection, do not fix */}
              <article className="lg:col-span-8 max-w-[65ch] text-left">
                <p className="dispatch-intro">{dispatchIntro}</p>
                <p className="dispatch-body mt-5">{dispatchBody}</p>
                <p className="mt-7 text-[1.02rem] italic leading-[1.6] text-(--text-muted)">
                  {languagesLine}
                </p>
              </article>
              {/* Intentional: editorial imperfection, do not fix */}
              <aside className="lg:col-span-4 lg:-ml-7 lg:pt-10">
                <p className="dispatch-pullquote">
                  <span className="dispatch-quote-mark" aria-hidden="true">
                    “
                  </span>
                  {dispatchQuote}
                </p>
              </aside>
            </div>
          </section>

          <section id="timeline" className="space-y-4 sm:space-y-5">
            <p className="kicker text-(--text-muted)">{timelineLabel}</p>
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {timelineTitle}
            </h2>
            <div className="timeline-strip" aria-hidden="true" />
            <div className="relative mt-6 pb-3">
              <span className="timeline-axis" aria-hidden="true" />
              <div className="space-y-6 md:space-y-4">
                {timelineEntries.map((entry, index) => (
                  <article
                    key={entry.id}
                    className={`relative grid grid-cols-1 md:grid-cols-2 ${index % 2 === 1 ? "md:-mt-6" : ""}`}
                  >
                    <div
                      className={`relative ${index % 2 === 0 ? "md:pr-10" : "md:col-start-2 md:pl-10"}`}
                    >
                      <span
                        className={`display-wordmark absolute top-1 hidden text-[clamp(42px,5vw,72px)] text-(--accent-mint) md:block ${index % 2 === 0 ? "-right-8" : "-left-8"}`}
                        aria-hidden="true"
                      >
                        {entry.year}
                      </span>
                      <article className="story-pill border border-white/30 bg-(--bg-elevated) p-5 sm:p-6">
                        <p className="kicker text-(--text-muted)">
                          {entry.period}
                        </p>
                        <h3 className="mt-3 text-[1.25rem] italic leading-[1.35] text-foreground sm:text-[1.38rem]">
                          {entry.role}
                        </h3>
                        <p className="mt-2 font-mono text-[0.64rem] uppercase tracking-[0.15em] text-(--text-muted)">
                          {entry.org}
                        </p>
                        <p className="mt-3 text-[1rem] leading-[1.6] text-foreground">
                          {entry.outcome}
                        </p>
                        <details className="mt-4 timeline-details">
                          <summary className="focus-outline inline-flex min-h-11 items-center cursor-pointer font-mono text-[0.66rem] uppercase tracking-[0.16em] text-(--accent-mint)">
                            {timelineReadMore}
                          </summary>
                          <ul className="mt-3 space-y-2 text-[0.94rem] leading-[1.5] text-foreground">
                            {entry.details.map((detail) => (
                              <li key={detail} className="ml-5 list-disc">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </article>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="work" className="space-y-6 sm:space-y-7">
            <div className="space-y-2">
              <p className="kicker text-(--text-muted)">{workKicker}</p>
              <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
                {site.projectsTitle}
              </h2>
            </div>
            <div className="section-rule" aria-hidden="true" />
            <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
              {case01 ? (
                <article className="work-tile work-tile-hero col-span-12 border border-[color-mix(in_srgb,var(--text)_20%,transparent)] bg-(--accent-ultraviolet) p-5 text-white sm:p-7 lg:p-10">
                  <p className="work-kicker kicker text-white/80">
                    {`Case 01 · ${case01.period} · ${case01State}`}
                  </p>
                  <div className="relative mt-5">
                    <h3 className="display-wordmark max-w-[8ch] text-[clamp(48px,9vw,120px)] leading-[0.8]">
                      {case01.title}
                    </h3>
                    <div
                      aria-hidden="true"
                      className="absolute right-0 top-2 hidden w-[38%] max-w-76 rotate-2 border border-black/80 bg-[#24164a] shadow-[12px_12px_0_#000] lg:block"
                    >
                      <div className="aspect-3/4 bg-[#211244] p-4">
                        <p className="kicker text-white/70">
                          {workPreviewTitle}
                        </p>
                        <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-(--accent-mint)">
                          {workPreviewMeta}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-white/85">
                    {case01.stack.slice(0, 3).join(" · ")}
                  </p>
                  <p className="mt-4 max-w-2xl text-[1.02rem] italic leading-[1.6] text-white/95 sm:text-[1.1rem]">
                    {getProjectOutcome(case01)}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3">
                    {case01.repoUrl ? (
                      <a
                        href={case01.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="editorial-link focus-outline text-white"
                      >
                        <span aria-hidden="true">→</span>
                        {workRepoLabel}
                      </a>
                    ) : null}
                    {case01.liveUrl ? (
                      <a
                        href={case01.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="editorial-link focus-outline text-white"
                      >
                        <span aria-hidden="true">→</span>
                        {workLiveLabel}
                      </a>
                    ) : null}
                  </div>
                </article>
              ) : null}

              {case03 ? (
                <article className="work-tile col-span-12 border border-white/25 bg-black p-5 text-foreground sm:p-6 lg:col-span-7">
                  <p className="work-kicker kicker text-(--text-muted)">
                    {`Case 03 · ${case03.period} · ${case03State}`}
                  </p>
                  <h3 className="mt-4 display-wordmark text-[clamp(34px,5.2vw,78px)] leading-[0.84]">
                    {case03.title}
                  </h3>
                  <pre
                    aria-hidden="true"
                    className="mt-4 overflow-hidden rounded-lg border border-(--accent-ultraviolet)/50 bg-(--bg-elevated) p-4 font-mono text-[10px] leading-[1.35] text-(--accent-ultraviolet)/85"
                  >
                    {`[ Linux ]──sync──┐
                  ├─> core-bus.cpp ──> dispatcher
[ Win ]────sync───┘

event queue: 42
latency: 8.2ms`}
                  </pre>
                  <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-(--text-muted)">
                    {case03.stack.slice(0, 3).join(" · ")}
                  </p>
                  <p className="mt-3 max-w-2xl text-[1rem] italic leading-[1.6] text-foreground">
                    {getProjectOutcome(case03)}
                  </p>
                </article>
              ) : null}

              {case02 ? (
                <article className="work-tile relative col-span-12 border border-black/35 bg-(--accent-mint) p-5 text-black sm:p-6 lg:col-span-5">
                  <p className="work-kicker kicker text-black/70">
                    {`Case 02 · ${case02.period} · ${case02State}`}
                  </p>
                  <h3 className="mt-4 display-wordmark max-w-[9ch] text-[clamp(36px,4.8vw,66px)] leading-[0.85]">
                    {case02.title}
                  </h3>
                  <p className="mt-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-black/70">
                    {case02.stack.slice(0, 3).join(" · ")}
                  </p>
                  <p className="mt-3 text-[1rem] italic leading-[1.6] text-black/90">
                    {getProjectOutcome(case02)}
                  </p>
                  <pre
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-3 right-3 max-w-[70%] overflow-hidden font-mono text-[10px] leading-[1.35] text-black/25"
                  >
                    {`task("review")
  .agent("copilot")
  .verify("tests")
  .ship();`}
                  </pre>
                </article>
              ) : null}

              {case04 ? (
                <>
                  {/* Intentional: editorial imperfection, do not fix */}
                  <article className="work-tile col-span-12 -rotate-2 border border-[#2b2524] bg-(--paper) p-5 text-black sm:p-6 lg:col-span-4">
                    <p className="work-kicker kicker text-black/60">
                      {locale === "fr"
                        ? `Case 04 · ${case04.period}`
                        : `Case 04 · ${case04.period}`}
                    </p>
                    <h3 className="mt-3 display-wordmark text-[clamp(28px,3.4vw,50px)] leading-[0.88]">
                      {case04.title}
                    </h3>
                    <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-black/70">
                      {case04.stack.slice(0, 4).join(" · ")}
                    </p>
                    <p className="mt-3 text-[0.97rem] italic leading-[1.6] text-black/85">
                      {getProjectOutcome(case04)}
                    </p>
                  </article>
                </>
              ) : null}

              {case05 ? (
                <article className="work-tile col-span-12 border border-white/30 bg-(--bg-elevated) p-5 text-foreground sm:p-6 lg:col-span-3">
                  <p className="work-kicker kicker text-(--text-muted)">
                    {locale === "fr"
                      ? `Case 05 · ${case05.period}`
                      : `Case 05 · ${case05.period}`}
                  </p>
                  <h3 className="mt-3 display-wordmark text-[clamp(24px,2.7vw,38px)] leading-[0.9]">
                    {case05.title}
                  </h3>
                  <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-(--text-muted)">
                    {case05.stack.slice(0, 3).join(" · ")}
                  </p>
                  <p className="mt-3 text-[0.95rem] italic leading-[1.6] text-foreground">
                    {getProjectOutcome(case05)}
                  </p>
                </article>
              ) : null}

              {case06 ? (
                <article className="work-tile col-span-12 border border-[color-mix(in_srgb,var(--text)_30%,transparent)] bg-black p-5 text-foreground sm:p-6 lg:col-span-5">
                  <p className="work-kicker kicker text-(--text-muted)">
                    {locale === "fr"
                      ? `Case 06 · ${case06.period}`
                      : `Case 06 · ${case06.period}`}
                  </p>
                  <h3 className="mt-3 display-wordmark text-[clamp(32px,3.8vw,52px)] leading-[0.86]">
                    {case06.title}
                  </h3>
                  <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-(--text-muted)">
                    {case06.stack.slice(0, 4).join(" · ")}
                  </p>
                  <p className="mt-3 text-[0.98rem] italic leading-[1.6] text-foreground">
                    {getProjectOutcome(case06)}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {case06.repoUrl ? (
                      <a
                        href={case06.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="editorial-link focus-outline text-foreground"
                      >
                        <span aria-hidden="true">→</span>
                        {workRepoLabel}
                      </a>
                    ) : null}
                  </div>
                </article>
              ) : null}
            </div>
          </section>

          <section id="build" className="space-y-6 sm:space-y-7">
            <p className="kicker text-(--text-muted)">{buildLabel}</p>
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">
              {buildTitle}
            </h2>
            <div className="section-rule" aria-hidden="true" />
            <div className="story-pill overflow-hidden border border-white/30 bg-(--bg-elevated)">
              {(buildRows.length > 0
                ? buildRows
                : [
                    {
                      label: "Stack",
                      copy: "Laravel · Spring Boot · Next.js · PostgreSQL",
                    },
                  ]
              ).map((row) => (
                <article key={row.label} className="build-row">
                  <p className="build-row-label">{row.label}</p>
                  <p className="build-row-copy">{row.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <article className="story-pill interactive-card bg-[var(--verge-slate)] p-4 sm:p-6 lg:p-8">
              <p className="kicker mb-3 text-[var(--verge-mint)]">
                {githubOverviewLabel}
              </p>
              <h2 className="mb-2 text-3xl font-black leading-tight sm:text-4xl">
                {github.profile.name}
              </h2>
              <p className="mb-5 text-sm text-[#d5d5d5] sm:text-base">
                {translateByLocale(github.profile.bio)}
              </p>
              <div className="mb-6 flex flex-wrap gap-3">
                <Badge
                  label={githubPublicReposLabel}
                  value={String(github.profile.public_repos)}
                />
                <Badge
                  label={githubFollowersLabel}
                  value={String(github.profile.followers)}
                />
                <Badge
                  label={githubFollowingLabel}
                  value={String(github.profile.following)}
                />
              </div>
              <a
                href={github.profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex rounded-full border border-[var(--verge-mint)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--verge-mint)]"
              >
                {githubOpenLabel}
              </a>
            </article>
            <article className="story-pill interactive-card bg-white p-4 text-black sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-black">{githubTopReposLabel}</p>
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
                        : githubNoDescriptionLabel}
                    </p>
                    <p className="kicker text-black/70">
                      {repo.language || githubMixedLanguageLabel}
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
            id="colophon"
            className="story-pill border border-white/30 bg-(--paper) p-5 text-black sm:p-8 lg:p-10"
          >
            <p className="kicker mb-4 text-black/70">{colophonLabel}</p>
            <p className="max-w-4xl text-[1.04rem] leading-[1.7] text-black/90 sm:text-[1.12rem]">
              {colophonBody}
            </p>
            <a
              href={`mailto:${site.email}?subject=${encodeURIComponent(colophonMailSubject)}`}
              className="mt-7 inline-block text-[clamp(1.6rem,4.1vw,2.7rem)] font-semibold leading-[1.1] text-black underline decoration-[2px] underline-offset-[7px] hover:text-black focus-visible:text-black"
            >
              {site.email}
            </a>
            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.66rem] uppercase tracking-[0.16em] text-black/65">
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex min-h-11 items-center hover:text-black"
              >
                GitHub
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex min-h-11 items-center hover:text-black"
              >
                LinkedIn
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={orcidLink}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex min-h-11 items-center hover:text-black"
              >
                ORCID
              </a>
              <span aria-hidden="true">·</span>
              <a
                href={site.cvUrl}
                download
                className="focus-outline inline-flex min-h-11 items-center hover:text-black"
              >
                {colophonCvLabel}
              </a>
            </div>
          </section>
        </main>

        <footer className="mt-12 border-t border-white/20 py-6 text-xs text-[#a9a9a9] sm:mt-20 sm:py-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center font-mono uppercase tracking-[0.14em]">
            <p className="max-w-3xl">{site.footerText}</p>
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
