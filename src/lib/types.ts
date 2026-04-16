export type SocialLink = {
  label: string;
  url: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type LanguageItem = {
  language: string;
  level: string;
};

export type SiteSettings = {
  fullName: string;
  role: string;
  heroKicker: string;
  heroHeadline: string;
  heroDescription: string;
  availability: string;
  location: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  cvUrl: string;
  landingPrimaryCtaLabel: string;
  landingPrimaryCtaUrl: string;
  landingSecondaryCtaLabel: string;
  landingSecondaryCtaUrl: string;
  aboutTitle: string;
  aboutParagraphOne: string;
  aboutParagraphTwo: string;
  timelineTitle: string;
  projectsTitle: string;
  skillsTitle: string;
  certificationsTitle: string;
  contactTitle: string;
  contactDescription: string;
  footerText: string;
  socialLinks: SocialLink[];
  stats: StatItem[];
  languages: LanguageItem[];
};

export type ExperienceItem = {
  _id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  summary: string;
  highlights: string[];
  order: number;
};

export type EducationItem = {
  _id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate?: string;
  honors?: string;
  details: string;
  order: number;
};

export type ProjectItem = {
  _id: string;
  title: string;
  period: string;
  summary: string;
  details: string;
  stack: string[];
  highlights: string[];
  repoUrl?: string;
  liveUrl?: string;
  featured: boolean;
  order: number;
  colorVariant:
    | "mint"
    | "ultraviolet"
    | "yellow"
    | "orange"
    | "pink"
    | "slate"
    | "white";
};

export type SkillGroup = {
  _id: string;
  title: string;
  skills: string[];
  order: number;
};

export type CertificationItem = {
  _id: string;
  name: string;
  issuer?: string;
  order: number;
};

export type GithubProfile = {
  login: string;
  name: string;
  bio: string;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
};

export type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
};

export type PortfolioContent = {
  site: SiteSettings;
  experiences: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skillGroups: SkillGroup[];
  certifications: CertificationItem[];
};
