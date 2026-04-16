"use client";

import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

type Locale = "en" | "fr";
type NavLabelKey = "dispatch" | "work" | "build" | "timeline" | "colophon";

const linksByLocale: Record<Locale, NavLink[]> = {
  en: [
    { href: "#dispatch", label: "Dispatch" },
    { href: "#work", label: "Work" },
    { href: "#build", label: "Build" },
    { href: "#timeline", label: "Timeline" },
    { href: "#colophon", label: "Colophon" },
  ],
  fr: [
    { href: "#dispatch", label: "Dispatch" },
    { href: "#work", label: "Projets" },
    { href: "#build", label: "Stack" },
    { href: "#timeline", label: "Parcours" },
    { href: "#colophon", label: "Colophon" },
  ],
};

const copyByLocale: Record<
  Locale,
  {
    issueLine: string;
    menu: string;
    close: string;
    stickyContact: string;
    availableLabel: string;
    city: string;
    openMenu: string;
    closeMenu: string;
    switchTo: string;
  }
> = {
  en: {
    issueLine: "Issue 2026 - Portfolio of Youssef Selk",
    menu: "Menu",
    close: "Close",
    stickyContact: "Contact",
    availableLabel: "Available",
    city: "Lille",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    switchTo: "FR",
  },
  fr: {
    issueLine: "Edition 2026 - Portfolio de Youssef Selk",
    menu: "Menu",
    close: "Fermer",
    stickyContact: "Contact",
    availableLabel: "Disponible",
    city: "Lille",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    switchTo: "EN",
  },
};

export function ResponsiveNavbar({
  locale = "en",
  linkLabelOverrides,
  stickyContactLabel,
}: {
  locale?: Locale;
  linkLabelOverrides?: Partial<Record<NavLabelKey, string>>;
  stickyContactLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [timeLabel, setTimeLabel] = useState("");
  const links = linksByLocale[locale].map((link) => {
    const key = link.href.replace("#", "") as NavLabelKey;
    const override = linkLabelOverrides?.[key];

    return {
      ...link,
      label: override && override.trim() ? override : link.label,
    };
  });
  const copy = copyByLocale[locale];
  const stickyContact =
    stickyContactLabel && stickyContactLabel.trim()
      ? stickyContactLabel
      : copy.stickyContact;
  const languageHref = locale === "fr" ? "/" : "/fr";

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(
      locale === "fr" ? "fr-FR" : "en-GB",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      },
    );

    const updateTime = () => setTimeLabel(formatter.format(new Date()));
    updateTime();
    const timer = window.setInterval(updateTime, 30_000);

    return () => window.clearInterval(timer);
  }, [locale]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onResize() {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="masthead-reveal relative z-40 pt-4 sm:pt-5">
      <div className="masthead-topline masthead-topline-reveal px-3 sm:px-6 lg:px-12">
        {copy.issueLine}
      </div>
      <div className="hazard-tape hazard-tape-reveal mt-2" aria-hidden="true" />
      <div className="masthead-row-reveal flex items-center justify-between gap-4 px-3 py-3 sm:px-6 lg:px-12">
        <nav className="masthead-nav-reveal hidden items-center gap-0 md:flex">
          {links.map((link, index) => (
            <span key={link.href} className="inline-flex items-center">
              <a
                href={link.href}
                className="nav-link focus-outline kicker text-foreground"
              >
                {link.label}
              </a>
              {index < links.length - 1 ? (
                <span className="mx-3 text-(--text-muted)" aria-hidden="true">
                  ·
                </span>
              ) : null}
            </span>
          ))}
          <span className="mx-3 text-(--text-muted)" aria-hidden="true">
            ·
          </span>
          <a
            href={languageHref}
            className="nav-link focus-outline kicker text-foreground"
          >
            {copy.switchTo}
          </a>
        </nav>

        <button
          type="button"
          className="focus-outline kicker min-h-11 min-w-11 rounded-full border border-[color-mix(in_srgb,var(--text)_30%,transparent)] px-3 py-2 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? copy.close : copy.menu}
        </button>

        <div className="status-pill status-pill-reveal" aria-live="off">
          <span className="status-dot" aria-hidden="true" />
          <span>{copy.availableLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{copy.city}</span>
          <span aria-hidden="true">·</span>
          <span>{timeLabel}</span>
        </div>
      </div>

      <div
        id="mobile-nav-panel"
        className={`overflow-hidden transition-all duration-300 ease-out lg:hidden ${
          open ? "max-h-96 pb-3 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <nav className="mobile-menu-panel mx-3 space-y-2 rounded-xl border border-white/20 bg-(--bg-elevated) p-3 sm:mx-6 lg:hidden">
          <a
            href={languageHref}
            onClick={() => setOpen(false)}
            className="focus-outline block min-h-11 rounded-lg border border-white/30 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-white"
          >
            {copy.switchTo}
          </a>
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="mobile-menu-link nav-link focus-outline block min-h-11 rounded-lg border border-white/15 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-white"
              style={{ transitionDelay: open ? `${index * 35}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <a
        href="#colophon"
        aria-label={stickyContact}
        className={`focus-outline fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center rounded-full border border-black/45 bg-(--accent-mint) px-4 py-2 font-mono text-[0.68rem] font-extrabold uppercase tracking-[0.11em] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition-opacity ${
          open ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ color: "#101010" }}
      >
        {stickyContact}
      </a>
    </header>
  );
}
