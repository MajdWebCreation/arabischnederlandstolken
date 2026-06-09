"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/site";

type LocaleSwitcherProps = {
  locale: Locale;
};

export function LocaleSwitcher({ locale }: LocaleSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={locale === "nl" ? "Taal kiezen" : "اختيار اللغة"}
      className="locale-switcher"
      dir="ltr"
    >
      {locales.map((target) => {
        if (target === locale) {
          return (
            <span
              key={target}
              aria-current="page"
              className="locale-switcher__item locale-switcher__item--active"
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
            className="locale-switcher__item locale-switcher__item--link"
          >
            {target.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
