"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/site";

type LocaleSwitcherProps = {
  locale: Locale;
};

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const itemClassName =
    "inline-flex min-h-8 min-w-11 items-center justify-center rounded-full px-3 py-1.5 text-[11px] font-bold uppercase leading-none tracking-[0.12em]";

  return (
    <nav
      aria-label={locale === "nl" ? "Taal kiezen" : "اختيار اللغة"}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-line-strong/80 bg-surface p-1 shadow-[0_6px_18px_rgba(17,36,67,0.08)]"
      dir="ltr"
    >
      {locales.map((target) => {
        if (target === locale) {
          return (
            <span
              key={target}
              aria-current="page"
              className={`${itemClassName} bg-brand-strong text-[#fffdf9] shadow-[0_4px_12px_rgba(12,36,68,0.2)]`}
            >
              {target.toUpperCase()}
            </span>
          );
        }

        const nextPath = pathname.replace(`/${locale}`, `/${target}`);

        return (
          <Link
            key={target}
            href={nextPath === pathname ? `/${target}` : nextPath}
            className={`${itemClassName} text-brand-strong transition-colors hover:bg-brand-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`}
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
