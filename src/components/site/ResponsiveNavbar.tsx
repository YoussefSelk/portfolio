"use client";

import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

type Locale = "en" | "fr";

const linksByLocale: Record<Locale, NavLink[]> = {
  en: [
    { href: "#timeline", label: "Timeline" },
    { href: "#projects", label: "Work" },
    { href: "#skills", label: "Skills" },
    { href: "#certifications", label: "Certs" },
    { href: "#contact", label: "Contact" },
  ],
  fr: [
    { href: "#timeline", label: "Parcours" },
    { href: "#projects", label: "Projets" },
    { href: "#skills", label: "Competences" },
    { href: "#certifications", label: "Certifs" },
    { href: "#contact", label: "Contact" },
  ],
};

const copyByLocale: Record<
  Locale,
  {
    downloadCv: string;
    availableLabel: string;
    openMenu: string;
    closeMenu: string;
    contactMe: string;
    switchTo: string;
  }
> = {
  en: {
    downloadCv: "Download CV",
    availableLabel: "Available in 2026",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    contactMe: "Contact Me",
    switchTo: "FR",
  },
  fr: {
    downloadCv: "Telecharger CV",
    availableLabel: "Disponible en 2026",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    contactMe: "Me contacter",
    switchTo: "EN",
  },
};

export function ResponsiveNavbar({
  cvUrl,
  locale = "en",
}: {
  cvUrl: string;
  locale?: Locale;
}) {
  const [open, setOpen] = useState(false);
  const links = linksByLocale[locale];
  const copy = copyByLocale[locale];
  const languageHref = locale === "fr" ? "/" : "/fr";
  const topHref = locale === "fr" ? "/fr#top" : "#top";
  const contactHref = locale === "fr" ? "/fr#contact" : "#contact";

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
    <header className="glass-nav sticky top-2 z-40 mx-auto mt-2 rounded-xl border border-white/20 bg-[rgba(15,16,19,0.92)] px-2 sm:top-3 sm:mt-4 sm:rounded-2xl sm:px-5">
      <div className="mx-auto flex h-14 w-full max-w-[1340px] items-center justify-between px-1 sm:h-16 sm:px-0">
        <a href={topHref} className="display-wordmark text-2xl text-[var(--verge-mint)] sm:text-3xl">
          YS
        </a>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link kicker focus-outline text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <a
            href={languageHref}
            className="focus-outline rounded-full border border-white/40 px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white"
          >
            {copy.switchTo}
          </a>
          <a
            href={cvUrl}
            download
            className="focus-outline rounded-full border border-[var(--verge-mint)]/70 bg-[rgba(52,245,205,0.08)] px-4 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-[var(--verge-mint)] transition-colors hover:bg-[rgba(52,245,205,0.16)]"
          >
            {copy.downloadCv}
          </a>
          <div className="rounded-full border border-white/30 bg-[rgba(255,255,255,0.02)] px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/85">
            {copy.availableLabel}
          </div>
        </div>

        <button
          type="button"
          className="focus-outline flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[rgba(255,255,255,0.03)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? copy.closeMenu : copy.openMenu}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative block h-5 w-5">
            <span
              className={`hamburger-line absolute left-0 top-1/2 h-0.5 w-5 bg-white transition-all duration-300 ${
                open ? "translate-y-0 rotate-45" : "-translate-y-1.5"
              }`}
            />
            <span
              className={`hamburger-line absolute left-0 top-1/2 h-0.5 w-5 bg-white transition-all duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`hamburger-line absolute left-0 top-1/2 h-0.5 w-5 bg-white transition-all duration-300 ${
                open ? "translate-y-0 -rotate-45" : "translate-y-1.5"
              }`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav-panel"
        className={`overflow-hidden transition-all duration-300 ease-out lg:hidden ${
          open ? "max-h-96 pb-3 opacity-100" : "max-h-0 pb-0 opacity-0"
        }`}
      >
        <nav className="mobile-menu-panel space-y-2 rounded-xl border border-white/20 bg-[rgba(255,255,255,0.015)] p-2">
          <a
            href={languageHref}
            onClick={() => setOpen(false)}
            className="focus-outline block rounded-lg border border-white/30 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-white"
          >
            {copy.switchTo}
          </a>
          <a
            href={cvUrl}
            download
            onClick={() => setOpen(false)}
            className="focus-outline block rounded-lg border border-[var(--verge-mint)]/70 bg-[rgba(52,245,205,0.12)] px-3 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-[var(--verge-mint)]"
          >
            {copy.downloadCv}
          </a>
          {links.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="mobile-menu-link nav-link focus-outline block rounded-lg border border-white/15 px-3 py-2.5 font-mono text-xs uppercase tracking-[0.1em] text-white"
              style={{ transitionDelay: open ? `${index * 35}ms` : "0ms" }}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <a
        href={contactHref}
        className="focus-outline fixed bottom-5 right-4 z-50 rounded-full border border-[var(--verge-mint)] bg-[var(--verge-mint)] px-4 py-2.5 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-black shadow-[0_10px_26px_rgba(52,245,205,0.38)] transition-transform hover:-translate-y-0.5 sm:bottom-6 sm:right-6 sm:px-5 sm:text-[0.68rem] lg:bottom-8 lg:right-8"
      >
        {copy.contactMe}
      </a>
    </header>
  );
}
