"use client";

import { useEffect, useState } from "react";

type NavLink = {
  href: string;
  label: string;
};

const links: NavLink[] = [
  { href: "#timeline", label: "Timeline" },
  { href: "#projects", label: "Work" },
  { href: "#skills", label: "Skills" },
  { href: "#certifications", label: "Certs" },
  { href: "#contact", label: "Contact" },
];

export function ResponsiveNavbar() {
  const [open, setOpen] = useState(false);

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
        <a href="#top" className="display-wordmark text-2xl text-[var(--verge-mint)] sm:text-3xl">
          YS
        </a>

        <nav className="hidden items-center gap-4 lg:flex xl:gap-7">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link kicker focus-outline text-white">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden rounded-full border border-white/30 bg-[rgba(255,255,255,0.02)] px-3 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.1em] text-white/85 xl:block">
          Available in 2026
        </div>

        <button
          type="button"
          className="focus-outline flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[rgba(255,255,255,0.03)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          aria-label={open ? "Close menu" : "Open menu"}
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
    </header>
  );
}
