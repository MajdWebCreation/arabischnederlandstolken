"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Overzicht", exact: true },
  { href: "/admin/bookings", label: "Boekingen" },
  { href: "/admin/invoices", label: "Facturen" },
  { href: "/admin/interpreter-invoices", label: "Tolkenfacturen" },
  { href: "/admin/interpreters", label: "Tolken" },
  { href: "/admin/customers", label: "Klanten" },
  { href: "/admin/capabilities", label: "Dialecten/specialisaties" },
  { href: "/admin/settings", label: "Instellingen" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Beheernavigatie"
      className="flex flex-wrap items-center gap-1"
    >
      {navItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
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
