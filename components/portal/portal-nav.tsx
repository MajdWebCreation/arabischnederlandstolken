"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/lib/auth/actions";

const navItems = [
  { href: "/tolk", label: "Overzicht", exact: true },
  { href: "/tolk/opdrachten", label: "Opdrachten" },
  { href: "/tolk/facturen", label: "Facturen" },
  { href: "/tolk/profiel", label: "Profiel" },
];

function isItemActive(pathname: string, item: (typeof navItems)[number]) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

// The `!` (important) modifier is load-bearing, not decorative: globals.css
// has an unlayered `a { color: inherit }` rule that otherwise beats a plain
// Tailwind color utility regardless of specificity, silently turning the
// active pill's white text back into the surrounding muted color. Do not
// remove these - see components/portal/customer-nav.tsx, which mirrors this
// exact fix.
function navLinkClassName(isActive: boolean) {
  return `min-h-11 flex-1 rounded-full px-3 py-2.5 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
    isActive
      ? "bg-brand-strong text-white!"
      : "text-muted-strong! hover:bg-brand-soft hover:text-brand-strong!"
  }`;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="h-5 w-5 shrink-0"
    >
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

/**
 * Desktop/tablet (md and up) keeps the original horizontal nav. Below that,
 * the horizontal list is replaced by a disclosure button + dropdown panel -
 * identical component pattern to components/portal/customer-nav.tsx (see
 * that file's own comment for the full reasoning), reused here now that a
 * fourth item (Facturen) makes four equal-width labels a real overflow risk
 * on a 320px screen.
 */
export function PortalNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleButtonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const activeItem = navItems.find((item) => isItemActive(pathname, item));

  return (
    <div ref={containerRef} className="relative">
      <nav aria-label="Portaalnavigatie" className="hidden items-center gap-1 md:flex">
        {navItems.map((item) => {
          const isActive = isItemActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={navLinkClassName(isActive)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="md:hidden">
        <button
          ref={toggleButtonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="tolk-mobiel-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-full border border-line px-4 py-2.5 text-sm font-semibold text-foreground"
        >
          <span className="flex items-center gap-2">
            <MenuIcon open={open} />
            Menu
          </span>
          {activeItem ? <span className="chip">{activeItem.label}</span> : null}
        </button>

        {open ? (
          <nav
            id="tolk-mobiel-menu"
            aria-label="Portaalnavigatie"
            className="absolute inset-x-0 top-full z-50 mt-2 space-y-1 rounded-2xl border border-line bg-surface p-2 shadow-lg"
          >
            {navItems.map((item) => {
              const isActive = isItemActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block min-h-11 rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    isActive
                      ? "bg-brand-strong text-white!"
                      : "text-muted-strong! hover:bg-brand-soft hover:text-brand-strong!"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-1 border-t border-line pt-1">
              <form action={signOut.bind(null, "/tolk/login")}>
                <button
                  type="submit"
                  className="block min-h-11 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-muted-strong! transition hover:bg-brand-soft hover:text-brand-strong!"
                >
                  Uitloggen
                </button>
              </form>
            </div>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
