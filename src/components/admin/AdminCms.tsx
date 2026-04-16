"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  PortfolioContent,
  ProjectItem,
  SiteSettings,
  SkillGroup,
} from "@/lib/types";

type TabKey =
  | "site"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "certifications";

const tabs: { key: TabKey; label: string }[] = [
  { key: "site", label: "Global" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "certifications", label: "Certifications" },
];

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function toLines(values: string[]) {
  return values.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function cloneContent(content: PortfolioContent) {
  return structuredClone(content);
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function renumberByPosition<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);

  return next;
}

function isValidUrl(input: string) {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateContent(content: PortfolioContent) {
  const issues: string[] = [];

  if (!content.site.fullName.trim()) {
    issues.push("Global: Full Name is required.");
  }

  if (!content.site.heroHeadline.trim()) {
    issues.push("Global: Hero Headline is required.");
  }

  if (!content.site.email.trim().includes("@")) {
    issues.push("Global: Email looks invalid.");
  }

  if (!isValidUrl(content.site.linkedinUrl)) {
    issues.push("Global: LinkedIn URL must be a valid http(s) URL.");
  }

  if (!isValidUrl(content.site.githubUrl)) {
    issues.push("Global: GitHub URL must be a valid http(s) URL.");
  }

  const socialIssues = content.site.socialLinks
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.label.trim() || !item.url.trim())
    .map(({ index }) => `Global: Social link #${index + 1} is incomplete.`);
  issues.push(...socialIssues);

  const orderGroups: Array<{
    label: string;
    items: { order: number; _id: string }[];
  }> = [
    { label: "Experience", items: content.experiences },
    { label: "Education", items: content.education },
    { label: "Projects", items: content.projects },
    { label: "Skills", items: content.skillGroups },
    { label: "Certifications", items: content.certifications },
  ];

  for (const group of orderGroups) {
    const seen = new Set<number>();

    for (const item of group.items) {
      if (!Number.isInteger(item.order) || item.order < 1) {
        issues.push(`${group.label}: invalid order value '${item.order}'.`);
      }

      if (seen.has(item.order)) {
        issues.push(`${group.label}: duplicate order '${item.order}'.`);
      }

      seen.add(item.order);
    }
  }

  const projectUrlIssues = content.projects
    .map((project, index) => ({ project, index }))
    .flatMap(({ project, index }) => {
      const local: string[] = [];

      if (project.repoUrl && !isValidUrl(project.repoUrl)) {
        local.push(
          `Projects: '${project.title || `#${index + 1}`}' has invalid Repository URL.`,
        );
      }

      if (project.liveUrl && !isValidUrl(project.liveUrl)) {
        local.push(
          `Projects: '${project.title || `#${index + 1}`}' has invalid Live URL.`,
        );
      }

      if (!project.title.trim()) {
        local.push(`Projects: item #${index + 1} needs a title.`);
      }

      return local;
    });

  issues.push(...projectUrlIssues);

  return issues;
}

function previewAnchorForTab(tab: TabKey) {
  switch (tab) {
    case "site":
      return "#top";
    case "experience":
    case "education":
      return "#timeline";
    case "projects":
      return "#projects";
    case "skills":
      return "#skills";
    case "certifications":
      return "#certifications";
    default:
      return "#top";
  }
}

export function AdminCms({
  initialContent,
}: {
  initialContent: PortfolioContent;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("site");
  const [content, setContent] = useState<PortfolioContent>(initialContent);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [previewTick, setPreviewTick] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [baselineSnapshot, setBaselineSnapshot] = useState(() =>
    JSON.stringify(initialContent),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const snapshot = useMemo(() => JSON.stringify(content), [content]);
  const hasUnsavedChanges = snapshot !== baselineSnapshot;
  const validationIssues = useMemo(() => validateContent(content), [content]);
  const previewAnchor = previewAnchorForTab(activeTab);

  const previewBase = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  const previewSrc = useMemo(() => {
    const path = `/?adminPreview=${previewTick}${previewAnchor}`;

    if (!previewBase) {
      return path;
    }

    return `${previewBase.replace(/\/$/, "")}${path}`;
  }, [previewAnchor, previewBase, previewTick]);

  const saveAll = useCallback(async () => {
    if (validationIssues.length > 0) {
      setMessage("Fix validation issues before saving.");
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        let apiMessage: string | undefined;

        try {
          const payload = (await response.json()) as { message?: string };
          apiMessage = payload.message;
        } catch {
          apiMessage = undefined;
        }

        if (response.status === 404) {
          setMessage(
            "Session invalid or expired. Please log in again.",
          );
          return;
        }

        setMessage(apiMessage ?? "Failed to save due to a server error.");
        return;
      }

      const payload = (await response.json()) as {
        ok: boolean;
        content?: PortfolioContent;
      };

      const savedContent = payload.content
        ? cloneContent(payload.content)
        : cloneContent(content);

      setContent(savedContent);
      setBaselineSnapshot(JSON.stringify(savedContent));
      setLastSavedAt(new Date().toLocaleString());

      setMessage("Saved successfully. Preview is updated.");
      setPreviewTick((value) => value + 1);
    } catch {
      setMessage("Unexpected error while saving.");
    } finally {
      setSaving(false);
    }
  }, [content, validationIssues.length]);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();

        if (!saving) {
          void saveAll();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [saveAll, saving]);

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `portfolio-content-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("JSON exported.");
  }

  function requestImport() {
    fileInputRef.current?.click();
  }

  async function importJson(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<PortfolioContent>;

      if (
        typeof parsed !== "object" ||
        parsed === null ||
        !("site" in parsed) ||
        !("experiences" in parsed) ||
        !("education" in parsed) ||
        !("projects" in parsed) ||
        !("skillGroups" in parsed) ||
        !("certifications" in parsed)
      ) {
        throw new Error("Invalid JSON shape");
      }

      const imported = cloneContent(parsed as PortfolioContent);
      setContent(imported);
      setMessage("JSON imported. Review and save to publish.");
      setPreviewTick((value) => value + 1);
    } catch {
      setMessage("Import failed. The file is not a valid portfolio JSON.");
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  }

  function resetUnsaved() {
    try {
      const parsed = JSON.parse(baselineSnapshot) as PortfolioContent;
      setContent(parsed);
      setMessage("Unsaved changes were reset.");
      setPreviewTick((value) => value + 1);
    } catch {
      setMessage("Reset failed because the saved snapshot is invalid.");
    }
  }

  function updateSite<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setContent((prev) => ({
      ...prev,
      site: {
        ...prev.site,
        [key]: value,
      },
    }));
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#101012] text-white">
      <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
        <header className="rounded-2xl border border-white/20 bg-[#16181b] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#78ffe0]">
                Private Admin
              </p>
              <h1 className="text-xl font-bold sm:text-2xl">
                Custom Portfolio CMS
              </h1>
              <p className="text-sm text-zinc-300">
                Edit content on the left. Use preview on the right to see
                placement instantly.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importJson}
              />
              <button
                type="button"
                onClick={requestImport}
                className="rounded-full border border-white/30 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:text-xs sm:tracking-[0.14em]"
              >
                Import JSON
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="rounded-full border border-white/30 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:text-xs sm:tracking-[0.14em]"
              >
                Export JSON
              </button>
              <button
                type="button"
                disabled={!hasUnsavedChanges}
                onClick={resetUnsaved}
                className="rounded-full border border-yellow-300/50 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-yellow-200 disabled:opacity-50 sm:px-4 sm:text-xs sm:tracking-[0.14em]"
              >
                Reset Unsaved
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-red-400/60 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-red-300 sm:px-4 sm:text-xs sm:tracking-[0.14em]"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setPreviewTick((value) => value + 1)}
                className="rounded-full border border-white/30 px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.1em] sm:px-4 sm:text-xs sm:tracking-[0.14em]"
              >
                Refresh Preview
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={saveAll}
                className="rounded-full border border-transparent bg-[#3cffd0] px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-black disabled:opacity-70 sm:px-5 sm:text-xs sm:tracking-[0.14em]"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          {message ? (
            <p className="mt-3 text-sm text-[#b6fbe6]">{message}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.72rem] uppercase tracking-[0.12em]">
            <span
              className={`rounded-full border px-3 py-1 ${
                hasUnsavedChanges
                  ? "border-yellow-300/50 text-yellow-200"
                  : "border-emerald-300/50 text-emerald-200"
              }`}
            >
              {hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
            </span>
            <span
              className={`rounded-full border px-3 py-1 ${
                validationIssues.length > 0
                  ? "border-red-300/50 text-red-200"
                  : "border-emerald-300/50 text-emerald-200"
              }`}
            >
              Validation{" "}
              {validationIssues.length > 0
                ? `(${validationIssues.length})`
                : "(0)"}
            </span>
            <span className="rounded-full border border-white/30 px-3 py-1 text-zinc-200">
              {lastSavedAt
                ? `Last save: ${lastSavedAt}`
                : "Not saved in this session"}
            </span>
            <span className="rounded-full border border-white/20 px-3 py-1 text-zinc-400">
              Ctrl/Cmd + S to save
            </span>
          </div>
          {validationIssues.length > 0 ? (
            <details className="mt-3 rounded-xl border border-red-300/30 bg-red-950/20 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-red-200">
                Show validation issues ({validationIssues.length})
              </summary>
              <ul className="mt-2 space-y-1 text-sm text-red-100">
                {validationIssues.map((issue, index) => (
                  <li key={`${issue}-${index}`}>- {issue}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </header>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-white/20 bg-[#141518] p-3 sm:p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.09em] sm:px-4 sm:text-xs sm:tracking-[0.12em] ${
                    activeTab === tab.key
                      ? "bg-[#3cffd0] text-black"
                      : "border border-white/25 text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "site" ? (
              <SiteTab content={content.site} updateSite={updateSite} />
            ) : null}

            {activeTab === "experience" ? (
              <ExperienceTab
                items={content.experiences}
                onChange={(items) =>
                  setContent((prev) => ({ ...prev, experiences: items }))
                }
              />
            ) : null}

            {activeTab === "education" ? (
              <EducationTab
                items={content.education}
                onChange={(items) =>
                  setContent((prev) => ({ ...prev, education: items }))
                }
              />
            ) : null}

            {activeTab === "projects" ? (
              <ProjectsTab
                items={content.projects}
                onChange={(items) =>
                  setContent((prev) => ({ ...prev, projects: items }))
                }
              />
            ) : null}

            {activeTab === "skills" ? (
              <SkillsTab
                items={content.skillGroups}
                onChange={(items) =>
                  setContent((prev) => ({ ...prev, skillGroups: items }))
                }
              />
            ) : null}

            {activeTab === "certifications" ? (
              <CertificationsTab
                items={content.certifications}
                onChange={(items) =>
                  setContent((prev) => ({ ...prev, certifications: items }))
                }
              />
            ) : null}
          </section>

          <aside className="rounded-2xl border border-white/20 bg-[#0d0e10] p-2">
            <iframe
              key={previewSrc}
              src={previewSrc}
              title="Portfolio Preview"
              className="h-[52vh] w-full rounded-xl border border-white/15 bg-black sm:h-[64vh] xl:h-[78vh]"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function SiteTab({
  content,
  updateSite,
}: {
  content: SiteSettings;
  updateSite: <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Full Name"
        value={content.fullName}
        onChange={(v) => updateSite("fullName", v)}
      />
      <Field
        label="Role"
        value={content.role}
        onChange={(v) => updateSite("role", v)}
      />
      <Field
        label="Hero Kicker"
        value={content.heroKicker}
        onChange={(v) => updateSite("heroKicker", v)}
      />
      <Field
        label="Hero Headline"
        value={content.heroHeadline}
        onChange={(v) => updateSite("heroHeadline", v)}
      />
      <Area
        label="Hero Description"
        value={content.heroDescription}
        onChange={(v) => updateSite("heroDescription", v)}
        rows={3}
      />
      <Area
        label="Availability"
        value={content.availability}
        onChange={(v) => updateSite("availability", v)}
        rows={2}
      />
      <Field
        label="Location"
        value={content.location}
        onChange={(v) => updateSite("location", v)}
      />
      <Field
        label="Email"
        value={content.email}
        onChange={(v) => updateSite("email", v)}
      />
      <Field
        label="Phone"
        value={content.phone}
        onChange={(v) => updateSite("phone", v)}
      />
      <Field
        label="LinkedIn URL"
        value={content.linkedinUrl}
        onChange={(v) => updateSite("linkedinUrl", v)}
      />
      <Field
        label="GitHub URL"
        value={content.githubUrl}
        onChange={(v) => updateSite("githubUrl", v)}
      />
      <Field
        label="CV URL"
        value={content.cvUrl}
        onChange={(v) => updateSite("cvUrl", v)}
      />
      <Field
        label="Primary CTA Label"
        value={content.landingPrimaryCtaLabel}
        onChange={(v) => updateSite("landingPrimaryCtaLabel", v)}
      />
      <Field
        label="Primary CTA URL"
        value={content.landingPrimaryCtaUrl}
        onChange={(v) => updateSite("landingPrimaryCtaUrl", v)}
      />
      <Field
        label="Secondary CTA Label"
        value={content.landingSecondaryCtaLabel}
        onChange={(v) => updateSite("landingSecondaryCtaLabel", v)}
      />
      <Field
        label="Secondary CTA URL"
        value={content.landingSecondaryCtaUrl}
        onChange={(v) => updateSite("landingSecondaryCtaUrl", v)}
      />
      <Field
        label="About Title"
        value={content.aboutTitle}
        onChange={(v) => updateSite("aboutTitle", v)}
      />
      <Area
        label="About Paragraph One"
        value={content.aboutParagraphOne}
        onChange={(v) => updateSite("aboutParagraphOne", v)}
        rows={3}
      />
      <Area
        label="About Paragraph Two"
        value={content.aboutParagraphTwo}
        onChange={(v) => updateSite("aboutParagraphTwo", v)}
        rows={3}
      />
      <Field
        label="Timeline Title"
        value={content.timelineTitle}
        onChange={(v) => updateSite("timelineTitle", v)}
      />
      <Field
        label="Projects Title"
        value={content.projectsTitle}
        onChange={(v) => updateSite("projectsTitle", v)}
      />
      <Field
        label="Skills Title"
        value={content.skillsTitle}
        onChange={(v) => updateSite("skillsTitle", v)}
      />
      <Field
        label="Certifications Title"
        value={content.certificationsTitle}
        onChange={(v) => updateSite("certificationsTitle", v)}
      />
      <Field
        label="Contact Title"
        value={content.contactTitle}
        onChange={(v) => updateSite("contactTitle", v)}
      />
      <Area
        label="Contact Description"
        value={content.contactDescription}
        onChange={(v) => updateSite("contactDescription", v)}
        rows={3}
      />
      <Field
        label="Footer Text"
        value={content.footerText}
        onChange={(v) => updateSite("footerText", v)}
      />

      <SimpleObjectArrayEditor
        title="Stats"
        entries={content.stats}
        createItem={() => ({ label: "New stat", value: "0" })}
        onChange={(items) => updateSite("stats", items)}
        render={(item, setItem) => (
          <>
            <Field
              label="Label"
              value={item.label}
              onChange={(v) => setItem({ ...item, label: v })}
            />
            <Field
              label="Value"
              value={item.value}
              onChange={(v) => setItem({ ...item, value: v })}
            />
          </>
        )}
      />

      <SimpleObjectArrayEditor
        title="Social Links"
        entries={content.socialLinks}
        createItem={() => ({ label: "New", url: "https://" })}
        onChange={(items) => updateSite("socialLinks", items)}
        render={(item, setItem) => (
          <>
            <Field
              label="Label"
              value={item.label}
              onChange={(v) => setItem({ ...item, label: v })}
            />
            <Field
              label="URL"
              value={item.url}
              onChange={(v) => setItem({ ...item, url: v })}
            />
          </>
        )}
      />

      <SimpleObjectArrayEditor
        title="Languages"
        entries={content.languages}
        createItem={() => ({ language: "New language", level: "A1" })}
        onChange={(items) => updateSite("languages", items)}
        render={(item, setItem) => (
          <>
            <Field
              label="Language"
              value={item.language}
              onChange={(v) => setItem({ ...item, language: v })}
            />
            <Field
              label="Level"
              value={item.level}
              onChange={(v) => setItem({ ...item, level: v })}
            />
          </>
        )}
      />
    </div>
  );
}

function ExperienceTab({
  items,
  onChange,
}: {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}) {
  const orderedItems = useMemo(() => sortByOrder(items), [items]);

  function update(index: number, value: ExperienceItem) {
    const next = [...orderedItems];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(orderedItems.filter((_, currentIndex) => currentIndex !== index));
  }

  function move(index: number, direction: -1 | 1) {
    onChange(renumberByPosition(moveItem(orderedItems, index, direction)));
  }

  function duplicate(index: number) {
    const source = orderedItems[index];
    const duplicateItem: ExperienceItem = {
      ...source,
      _id: id("experience"),
      title: `${source.title} Copy`,
      highlights: [...source.highlights],
    };

    const next = [...orderedItems];
    next.splice(index + 1, 0, duplicateItem);
    onChange(renumberByPosition(next));
  }

  function add() {
    onChange([
      ...orderedItems,
      {
        _id: id("experience"),
        title: "New role",
        company: "Company",
        location: "Location",
        startDate: "2026-01-01",
        endDate: "",
        isCurrent: false,
        summary: "Summary",
        highlights: ["Highlight"],
        order: items.length + 1,
      },
    ]);
  }

  return (
    <ItemList
      title="Experience"
      addLabel="Add Experience"
      onAdd={add}
      onSort={() => onChange(renumberByPosition(sortByOrder(orderedItems)))}
    >
      {orderedItems.map((item, index) => (
        <ItemCard
          key={item._id}
          title={item.title}
          onRemove={() => remove(index)}
          onDuplicate={() => duplicate(index)}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < orderedItems.length - 1 ? () => move(index, 1) : undefined
          }
        >
          <Field
            label="Order"
            type="number"
            value={String(item.order)}
            onChange={(v) => update(index, { ...item, order: Number(v) || 1 })}
          />
          <Field
            label="Title"
            value={item.title}
            onChange={(v) => update(index, { ...item, title: v })}
          />
          <Field
            label="Company"
            value={item.company}
            onChange={(v) => update(index, { ...item, company: v })}
          />
          <Field
            label="Location"
            value={item.location}
            onChange={(v) => update(index, { ...item, location: v })}
          />
          <Field
            label="Start Date"
            type="date"
            value={item.startDate}
            onChange={(v) => update(index, { ...item, startDate: v })}
          />
          <Field
            label="End Date"
            type="date"
            value={item.endDate || ""}
            onChange={(v) => update(index, { ...item, endDate: v })}
          />
          <Toggle
            label="Current"
            checked={item.isCurrent}
            onChange={(v) => update(index, { ...item, isCurrent: v })}
          />
          <Area
            label="Summary"
            value={item.summary}
            onChange={(v) => update(index, { ...item, summary: v })}
            rows={3}
          />
          <Area
            label="Highlights (one per line)"
            value={toLines(item.highlights)}
            onChange={(v) =>
              update(index, { ...item, highlights: fromLines(v) })
            }
            rows={4}
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function EducationTab({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}) {
  const orderedItems = useMemo(() => sortByOrder(items), [items]);

  function update(index: number, value: EducationItem) {
    const next = [...orderedItems];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(orderedItems.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    onChange(renumberByPosition(moveItem(orderedItems, index, direction)));
  }

  function duplicate(index: number) {
    const source = orderedItems[index];
    const duplicateItem: EducationItem = {
      ...source,
      _id: id("education"),
      degree: `${source.degree} Copy`,
    };
    const next = [...orderedItems];
    next.splice(index + 1, 0, duplicateItem);
    onChange(renumberByPosition(next));
  }

  return (
    <ItemList
      title="Education"
      addLabel="Add Education"
      onSort={() => onChange(renumberByPosition(sortByOrder(orderedItems)))}
      onAdd={() =>
        onChange([
          ...orderedItems,
          {
            _id: id("education"),
            degree: "Degree",
            school: "School",
            location: "Location",
            startDate: "2026-01-01",
            endDate: "",
            honors: "",
            details: "Details",
            order: items.length + 1,
          },
        ])
      }
    >
      {orderedItems.map((item, index) => (
        <ItemCard
          key={item._id}
          title={item.degree}
          onRemove={() => remove(index)}
          onDuplicate={() => duplicate(index)}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < orderedItems.length - 1 ? () => move(index, 1) : undefined
          }
        >
          <Field
            label="Order"
            type="number"
            value={String(item.order)}
            onChange={(v) => update(index, { ...item, order: Number(v) || 1 })}
          />
          <Field
            label="Degree"
            value={item.degree}
            onChange={(v) => update(index, { ...item, degree: v })}
          />
          <Field
            label="School"
            value={item.school}
            onChange={(v) => update(index, { ...item, school: v })}
          />
          <Field
            label="Location"
            value={item.location}
            onChange={(v) => update(index, { ...item, location: v })}
          />
          <Field
            label="Start Date"
            type="date"
            value={item.startDate}
            onChange={(v) => update(index, { ...item, startDate: v })}
          />
          <Field
            label="End Date"
            type="date"
            value={item.endDate || ""}
            onChange={(v) => update(index, { ...item, endDate: v })}
          />
          <Field
            label="Honors"
            value={item.honors || ""}
            onChange={(v) => update(index, { ...item, honors: v })}
          />
          <Area
            label="Details"
            value={item.details}
            onChange={(v) => update(index, { ...item, details: v })}
            rows={3}
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function ProjectsTab({
  items,
  onChange,
}: {
  items: ProjectItem[];
  onChange: (items: ProjectItem[]) => void;
}) {
  const orderedItems = useMemo(() => sortByOrder(items), [items]);

  function update(index: number, value: ProjectItem) {
    const next = [...orderedItems];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(orderedItems.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    onChange(renumberByPosition(moveItem(orderedItems, index, direction)));
  }

  function duplicate(index: number) {
    const source = orderedItems[index];
    const duplicateItem: ProjectItem = {
      ...source,
      _id: id("project"),
      title: `${source.title} Copy`,
      stack: [...source.stack],
      highlights: [...source.highlights],
    };
    const next = [...orderedItems];
    next.splice(index + 1, 0, duplicateItem);
    onChange(renumberByPosition(next));
  }

  return (
    <ItemList
      title="Projects"
      addLabel="Add Project"
      onSort={() => onChange(renumberByPosition(sortByOrder(orderedItems)))}
      onAdd={() =>
        onChange([
          ...orderedItems,
          {
            _id: id("project"),
            title: "New Project",
            period: "2026",
            summary: "Summary",
            details: "Details",
            stack: ["Next.js"],
            highlights: ["Highlight"],
            repoUrl: "",
            liveUrl: "",
            featured: false,
            order: items.length + 1,
            colorVariant: "slate",
          },
        ])
      }
    >
      {orderedItems.map((item, index) => (
        <ItemCard
          key={item._id}
          title={item.title}
          onRemove={() => remove(index)}
          onDuplicate={() => duplicate(index)}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < orderedItems.length - 1 ? () => move(index, 1) : undefined
          }
        >
          <Field
            label="Order"
            type="number"
            value={String(item.order)}
            onChange={(v) => update(index, { ...item, order: Number(v) || 1 })}
          />
          <Toggle
            label="Featured"
            checked={item.featured}
            onChange={(v) => update(index, { ...item, featured: v })}
          />
          <Field
            label="Title"
            value={item.title}
            onChange={(v) => update(index, { ...item, title: v })}
          />
          <Field
            label="Period"
            value={item.period}
            onChange={(v) => update(index, { ...item, period: v })}
          />
          <Select
            label="Color Variant"
            value={item.colorVariant}
            onChange={(v) =>
              update(index, {
                ...item,
                colorVariant: v as ProjectItem["colorVariant"],
              })
            }
            options={[
              "mint",
              "ultraviolet",
              "yellow",
              "orange",
              "pink",
              "slate",
              "white",
            ]}
          />
          <Area
            label="Summary"
            value={item.summary}
            onChange={(v) => update(index, { ...item, summary: v })}
            rows={2}
          />
          <Area
            label="Details"
            value={item.details}
            onChange={(v) => update(index, { ...item, details: v })}
            rows={4}
          />
          <Area
            label="Tech Stack (one per line)"
            value={toLines(item.stack)}
            onChange={(v) => update(index, { ...item, stack: fromLines(v) })}
            rows={4}
          />
          <Area
            label="Highlights (one per line)"
            value={toLines(item.highlights)}
            onChange={(v) =>
              update(index, { ...item, highlights: fromLines(v) })
            }
            rows={4}
          />
          <Field
            label="Repository URL"
            value={item.repoUrl || ""}
            onChange={(v) => update(index, { ...item, repoUrl: v })}
          />
          <Field
            label="Live URL"
            value={item.liveUrl || ""}
            onChange={(v) => update(index, { ...item, liveUrl: v })}
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function SkillsTab({
  items,
  onChange,
}: {
  items: SkillGroup[];
  onChange: (items: SkillGroup[]) => void;
}) {
  const orderedItems = useMemo(() => sortByOrder(items), [items]);

  function update(index: number, value: SkillGroup) {
    const next = [...orderedItems];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(orderedItems.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    onChange(renumberByPosition(moveItem(orderedItems, index, direction)));
  }

  function duplicate(index: number) {
    const source = orderedItems[index];
    const duplicateItem: SkillGroup = {
      ...source,
      _id: id("skills"),
      title: `${source.title} Copy`,
      skills: [...source.skills],
    };
    const next = [...orderedItems];
    next.splice(index + 1, 0, duplicateItem);
    onChange(renumberByPosition(next));
  }

  return (
    <ItemList
      title="Skill Groups"
      addLabel="Add Skill Group"
      onSort={() => onChange(renumberByPosition(sortByOrder(orderedItems)))}
      onAdd={() =>
        onChange([
          ...orderedItems,
          {
            _id: id("skills"),
            title: "New Group",
            skills: ["Skill"],
            order: items.length + 1,
          },
        ])
      }
    >
      {orderedItems.map((item, index) => (
        <ItemCard
          key={item._id}
          title={item.title}
          onRemove={() => remove(index)}
          onDuplicate={() => duplicate(index)}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < orderedItems.length - 1 ? () => move(index, 1) : undefined
          }
        >
          <Field
            label="Order"
            type="number"
            value={String(item.order)}
            onChange={(v) => update(index, { ...item, order: Number(v) || 1 })}
          />
          <Field
            label="Title"
            value={item.title}
            onChange={(v) => update(index, { ...item, title: v })}
          />
          <Area
            label="Skills (one per line)"
            value={toLines(item.skills)}
            onChange={(v) => update(index, { ...item, skills: fromLines(v) })}
            rows={5}
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function CertificationsTab({
  items,
  onChange,
}: {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
}) {
  const orderedItems = useMemo(() => sortByOrder(items), [items]);

  function update(index: number, value: CertificationItem) {
    const next = [...orderedItems];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    onChange(orderedItems.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    onChange(renumberByPosition(moveItem(orderedItems, index, direction)));
  }

  function duplicate(index: number) {
    const source = orderedItems[index];
    const duplicateItem: CertificationItem = {
      ...source,
      _id: id("cert"),
      name: `${source.name} Copy`,
    };
    const next = [...orderedItems];
    next.splice(index + 1, 0, duplicateItem);
    onChange(renumberByPosition(next));
  }

  return (
    <ItemList
      title="Certifications"
      addLabel="Add Certification"
      onSort={() => onChange(renumberByPosition(sortByOrder(orderedItems)))}
      onAdd={() =>
        onChange([
          ...orderedItems,
          {
            _id: id("cert"),
            name: "New Certification",
            issuer: "",
            order: items.length + 1,
          },
        ])
      }
    >
      {orderedItems.map((item, index) => (
        <ItemCard
          key={item._id}
          title={item.name}
          onRemove={() => remove(index)}
          onDuplicate={() => duplicate(index)}
          onMoveUp={index > 0 ? () => move(index, -1) : undefined}
          onMoveDown={
            index < orderedItems.length - 1 ? () => move(index, 1) : undefined
          }
        >
          <Field
            label="Order"
            type="number"
            value={String(item.order)}
            onChange={(v) => update(index, { ...item, order: Number(v) || 1 })}
          />
          <Field
            label="Name"
            value={item.name}
            onChange={(v) => update(index, { ...item, name: v })}
          />
          <Field
            label="Issuer"
            value={item.issuer || ""}
            onChange={(v) => update(index, { ...item, issuer: v })}
          />
        </ItemCard>
      ))}
    </ItemList>
  );
}

function ItemList({
  title,
  addLabel,
  onAdd,
  onSort,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  onSort?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {onSort ? (
            <button
              type="button"
              onClick={onSort}
              className="rounded-full border border-white/25 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.09em] text-zinc-200 sm:text-xs sm:tracking-[0.12em]"
            >
              Sort + Renumber
            </button>
          ) : null}
          <button
            type="button"
            onClick={onAdd}
            className="rounded-full border border-white/30 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.09em] sm:text-xs sm:tracking-[0.12em]"
          >
            {addLabel}
          </button>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ItemCard({
  title,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  children,
}: {
  title: string;
  onRemove: () => void;
  onDuplicate?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-white/15 bg-[#0f1114] p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="break-words text-sm font-bold text-[#78ffe0]">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1">
          {onMoveUp ? (
            <button
              type="button"
              onClick={onMoveUp}
              className="rounded-full border border-white/25 px-2 py-1 text-[0.6rem] uppercase tracking-[0.09em] text-zinc-200 sm:text-[0.65rem] sm:tracking-[0.12em]"
            >
              Up
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              onClick={onMoveDown}
              className="rounded-full border border-white/25 px-2 py-1 text-[0.6rem] uppercase tracking-[0.09em] text-zinc-200 sm:text-[0.65rem] sm:tracking-[0.12em]"
            >
              Down
            </button>
          ) : null}
          {onDuplicate ? (
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-full border border-white/25 px-2 py-1 text-[0.6rem] uppercase tracking-[0.09em] text-zinc-200 sm:text-[0.65rem] sm:tracking-[0.12em]"
            >
              Duplicate
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full border border-red-400/60 px-2 py-1 text-[0.6rem] uppercase tracking-[0.09em] text-red-300 sm:text-[0.65rem] sm:tracking-[0.12em]"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "date";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-300">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/20 bg-[#14171c] px-3 py-2 text-sm text-white outline-none focus:border-[#3cffd0]"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-300">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/20 bg-[#14171c] px-3 py-2 text-sm text-white outline-none focus:border-[#3cffd0]"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-[#14171c] px-3 py-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-[0.12em] text-zinc-300">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/20 bg-[#14171c] px-3 py-2 text-sm text-white outline-none focus:border-[#3cffd0]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SimpleObjectArrayEditor<T extends object>({
  title,
  entries,
  createItem,
  onChange,
  render,
}: {
  title: string;
  entries: T[];
  createItem: () => T;
  onChange: (entries: T[]) => void;
  render: (entry: T, setEntry: (entry: T) => void) => React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-xl border border-white/15 bg-[#0f1114] p-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-[#78ffe0]">{title}</h4>
        <button
          type="button"
          className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]"
          onClick={() => onChange([...entries, createItem()])}
        >
          Add
        </button>
      </div>
      {entries.map((entry, index) => (
        <div
          key={index}
          className="space-y-2 rounded-lg border border-white/10 p-2"
        >
          {render(entry, (nextEntry) => {
            const next = [...entries];
            next[index] = nextEntry;
            onChange(next);
          })}
          <button
            type="button"
            onClick={() => onChange(entries.filter((_, i) => i !== index))}
            className="rounded-full border border-red-400/60 px-2 py-1 text-[0.65rem] uppercase tracking-[0.12em] text-red-300"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
