import type { Metadata } from "next";
import { getGithubSnapshot } from "@/lib/github";
import { formatRange } from "@/lib/format";
import { getPortfolioContent } from "@/lib/portfolio";
import { ResponsiveNavbar } from "@/components/site/ResponsiveNavbar";
import type { ProjectItem } from "@/lib/types";

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

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://example.com").replace(
  /\/$/,
  "",
);

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPortfolioContent();
  const { site } = content;

  return {
    title: `${site.fullName} | ${site.role}`,
    description: `${site.fullName} portfolio. ${site.heroHeadline} ${site.heroDescription}`,
    keywords: [
      site.fullName,
      "Youssef Selk",
      "Selk",
      "Youssef",
      site.role,
      "Software Engineer",
      "Full-Stack Developer",
      "Portfolio",
    ],
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${site.fullName} | ${site.role}`,
      description: `${site.heroHeadline} ${site.heroDescription}`,
      url: siteUrl,
      type: "profile",
      firstName: "Youssef",
      lastName: "Selk",
      username: "YoussefSelk",
    },
    twitter: {
      card: "summary",
      title: `${site.fullName} | ${site.role}`,
      description: `${site.heroHeadline} ${site.heroDescription}`,
    },
  };
}

export default async function Home() {
  const [content, github] = await Promise.all([
    getPortfolioContent(),
    getGithubSnapshot(),
  ]);

  const { site, experiences, education, projects, skillGroups, certifications } =
    content;
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.fullName,
    alternateName: ["Youssef Selk", "Selk", "Youssef"],
    jobTitle: site.role,
    url: siteUrl,
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
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${site.fullName} Portfolio`,
    url: siteUrl,
    inLanguage: "en",
    about: {
      "@type": "Person",
      name: site.fullName,
    },
  };

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
      <div className="editorial-grid relative z-10 mx-auto w-full max-w-[1340px] px-3 pb-14 sm:px-6 lg:px-12">
        <ResponsiveNavbar />

        <main id="top" className="space-y-12 pt-8 sm:space-y-16 sm:pt-12 lg:space-y-20 lg:pt-14">
          <section className="slide-up grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-end lg:gap-8">
            <div className="space-y-5 sm:space-y-6">
              <p className="kicker text-[var(--verge-mint)]">{site.heroKicker}</p>
              <h1 className="display-wordmark max-w-[13ch] text-4xl sm:text-6xl lg:text-[6.1rem]">
                {site.fullName}
              </h1>
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
              <p className="kicker mb-4 text-[var(--verge-mint)]">Profile Snapshot</p>
              <p className="mb-1 text-sm text-[var(--verge-muted)]">{site.role}</p>
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
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
            <div className="story-pill interactive-card bg-[var(--verge-canvas)] p-4 sm:p-6 lg:p-8">
              <p className="kicker mb-3 text-[var(--verge-mint)]">{site.aboutTitle}</p>
              <p className="mb-4 text-base leading-relaxed text-[#e5e5e5] sm:text-lg">
                {site.aboutParagraphOne}
              </p>
              <p className="text-base leading-relaxed text-[#c8c8c8] sm:text-lg">
                {site.aboutParagraphTwo}
              </p>
            </div>
            <div className="story-pill interactive-card bg-white p-4 text-black sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-black">Languages</p>
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
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">{site.timelineTitle}</h2>
            <div className="section-rule" aria-hidden="true" />
            <div className="grid gap-8 lg:grid-cols-2">
              <TimelineColumn
                label="Professional Experience"
                items={experiences.map((item) => ({
                  id: item._id,
                  period: formatRange(item.startDate, item.endDate, item.isCurrent),
                  title: item.title,
                  subtitle: `${item.company} - ${item.location}`,
                  summary: item.summary,
                  highlights: item.highlights,
                }))}
              />
              <TimelineColumn
                label="Education"
                items={education.map((item) => ({
                  id: item._id,
                  period: formatRange(item.startDate, item.endDate),
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
              <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">{site.projectsTitle}</h2>
              <p className="kicker text-[var(--verge-mint)]">Case Studies</p>
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
                      <span className={`kicker rounded-full px-3 py-1 ${palette.pill}`}>
                        {project.period}
                      </span>
                      {project.featured ? (
                        <span className="kicker">featured</span>
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
                          Repository
                        </a>
                      ) : null}
                      {project.liveUrl ? (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="focus-outline rounded-full border border-current px-3 py-2 font-mono text-[0.58rem] font-bold uppercase tracking-[0.1em] sm:px-4 sm:text-[0.64rem] sm:tracking-[0.14em]"
                        >
                          Live
                        </a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="skills" className="space-y-6 sm:space-y-7">
            <h2 className="section-heading display-wordmark text-3xl sm:text-5xl lg:text-6xl">{site.skillsTitle}</h2>
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
              <p className="kicker mb-3 text-[var(--verge-mint)]">GitHub Overview</p>
              <h2 className="mb-2 text-3xl font-black leading-tight sm:text-4xl">
                {github.profile.name}
              </h2>
              <p className="mb-5 text-sm text-[#d5d5d5] sm:text-base">{github.profile.bio}</p>
              <div className="mb-6 flex flex-wrap gap-3">
                <Badge label="Public Repos" value={String(github.profile.public_repos)} />
                <Badge label="Followers" value={String(github.profile.followers)} />
                <Badge label="Following" value={String(github.profile.following)} />
              </div>
              <a
                href={github.profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="focus-outline inline-flex rounded-full border border-[var(--verge-mint)] px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[var(--verge-mint)]"
              >
                Open GitHub
              </a>
            </article>
            <article className="story-pill interactive-card bg-white p-4 text-black sm:p-6 lg:p-8">
              <p className="kicker mb-4 text-black">Top Repositories</p>
              <div className="space-y-4">
                {github.topRepos.slice(0, 4).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="interactive-card block rounded-2xl border border-black/20 p-4 transition-colors hover:bg-black hover:text-white"
                  >
                    <h3 className="mb-1 text-base font-extrabold">{repo.name}</h3>
                    <p className="mb-2 text-sm opacity-80">
                      {repo.description || "No description provided yet."}
                    </p>
                    <p className="kicker text-black/70">{repo.language || "Mixed"}</p>
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

          <section id="contact" className="story-pill interactive-card bg-[var(--verge-mint)] p-5 text-black sm:p-8 lg:p-10">
            <p className="kicker mb-3 text-black">{site.contactTitle}</p>
            <p className="mb-6 max-w-3xl text-lg font-bold leading-tight sm:text-3xl">
              {site.contactDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${site.email}`}
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                {site.email}
              </a>
              <a
                href={site.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                LinkedIn
              </a>
              <a
                href={site.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                GitHub
              </a>
              <a
                href={site.cvUrl}
                target="_blank"
                rel="noreferrer"
                className="focus-outline rounded-full border border-black px-4 py-2.5 font-mono text-[0.64rem] font-bold uppercase tracking-[0.1em] sm:px-5 sm:py-3 sm:text-xs sm:tracking-[0.15em]"
              >
                Download CV
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {site.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-outline rounded-full bg-black px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.09em] text-[var(--verge-mint)] sm:px-4 sm:text-[0.68rem] sm:tracking-[0.14em]"
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
            <p className="kicker mb-3 text-[var(--verge-mint)]">{item.period}</p>
            <h3 className="mb-2 text-xl font-bold leading-tight">{item.title}</h3>
            <p className="mb-3 break-words text-sm text-[#d3d3d3]">{item.subtitle}</p>
            <p className="mb-4 text-sm leading-relaxed text-[#ececec]">{item.summary}</p>
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
