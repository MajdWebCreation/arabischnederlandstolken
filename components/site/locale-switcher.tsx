"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/site";

type LocaleSwitcherProps = {
  locale: Locale;
};

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  const links = locales.filter((item) => item !== locale).map((target) => {
    const nextPath = pathname.replace(`/${locale}`, `/${target}`);
    return {
      locale: target,
      href: nextPath === pathname ? `/${target}` : nextPath,
    };
  });

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-white/92 p-1">
      <span className="px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-strong">
        {locale.toUpperCase()}
      </span>
      {links.map((link) => (
        <Link
          key={link.locale}
          href={link.href}
          className="rounded-full bg-brand-strong px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white"
        >
          {link.locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
