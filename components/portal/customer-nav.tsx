"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/klant", label: "Overzicht", exact: true },
  { href: "/klant/aanvragen/nieuw", label: "Nieuwe aanvraag" },
  { href: "/klant/opdrachten", label: "Opdrachten" },
  { href: "/klant/profiel", label: "Profiel" },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Portaalnavigatie" className="flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`min-h-11 flex-1 rounded-full px-3 py-2.5 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
              isActive
                ? "bg-brand-strong text-white!"
                : "text-muted-strong! hover:bg-brand-soft hover:text-brand-strong!"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
