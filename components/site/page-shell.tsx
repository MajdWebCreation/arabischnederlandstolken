import Image from "next/image";
import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { getSiteContent } from "@/lib/site-content";
import {
  getContactActions,
  localizedPath,
  type Locale,
} from "@/lib/site";

type PageShellProps = {
  children: React.ReactNode;
  locale: Locale;
};

export function PageShell({ children, locale }: PageShellProps) {
  const content = getSiteContent(locale);
  const isArabic = locale === "ar";
  const actions = getContactActions(locale);
  const navLabels = {
    faq: locale === "nl" ? "FAQ" : "الأسئلة الشائعة",
    team: locale === "nl" ? "Team" : "الفريق",
    privacy: locale === "nl" ? "Privacy" : "الخصوصية",
  };
  const navItems = [
    {
      href: localizedPath(locale, ""),
      label: content.navigation.home,
    },
    {
      href: localizedPath(locale, "diensten"),
      label: content.navigation.services,
    },
    {
      href: localizedPath(locale, "contact"),
      label: content.navigation.contact,
    },
    {
      href: localizedPath(locale, "faq"),
      label: navLabels.faq,
    },
    {
      href: localizedPath(locale, "team"),
      label: navLabels.team,
    },
  ];

  return (
    <div className={`page-shell min-h-screen ${isArabic ? "font-arabic" : ""}`}>
      <header className="site-header sticky top-0 z-40 border-b border-line/70 bg-background/94 backdrop-blur">
        <div className="content-shell flex items-center justify-between gap-3 py-4 sm:gap-6">
          <div className="min-w-0 shrink">
            <a
              href={localizedPath(locale, "")}
              aria-label={content.brand.name}
              className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <Image
                src="/brand/logo-mark.webp"
                alt=""
                width={48}
                height={46}
                className="h-[46px] w-12 shrink-0 object-contain"
              />
              <div className="hidden min-w-0 md:block">
                <p className="eyebrow eyebrow-muted whitespace-nowrap">
                  {content.brand.tag}
                </p>
                <p className="mt-1 max-w-64 truncate text-base font-semibold text-foreground xl:max-w-none xl:text-lg">
                  {content.brand.name}
                </p>
              </div>
            </a>
          </div>

          <nav
            aria-label={locale === "nl" ? "Hoofdnavigatie" : "التنقل الرئيسي"}
            className="hidden items-center gap-6 lg:flex"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="site-nav-link text-sm font-medium text-muted-strong transition hover:text-brand focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} />
            <details className="group relative lg:hidden">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-semibold text-foreground shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden">
                {locale === "nl" ? "Menu" : "القائمة"}
              </summary>
              <nav
                aria-label={locale === "nl" ? "Mobiele navigatie" : "التنقل على الهاتف"}
                className="absolute end-0 top-[calc(100%+0.75rem)] z-50 flex min-w-56 flex-col gap-1 rounded-2xl border border-line bg-surface p-2 shadow-[0_20px_60px_rgba(17,36,67,0.16)]"
              >
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-muted-strong transition hover:bg-brand-soft hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
                  >
                    {item.label}
                  </a>
                ))}
                <a
                  href={localizedPath(locale, "contact")}
                  className="mt-1 rounded-xl bg-brand-strong px-4 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {content.actions.bookNow}
                </a>
              </nav>
            </details>
            <div className="hidden sm:block">
              <a
                href={localizedPath(locale, "contact")}
                className="button-primary px-5 py-2.5"
              >
                {content.actions.bookNow}
              </a>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer border-t border-line">
        <div className="content-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <a
              href={localizedPath(locale, "")}
              aria-label={content.brand.name}
              className="inline-flex items-center gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <Image
                src="/brand/logo-mark.webp"
                alt=""
                width={72}
                height={69}
                className="h-[69px] w-[72px] shrink-0 object-contain"
              />
              <span>
                <span className="eyebrow eyebrow-muted block">
                  {content.brand.tag}
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-foreground">
                  {content.brand.name}
                </span>
              </span>
            </a>
            <h2 className="mt-6 text-2xl font-semibold text-foreground">
              {content.footer.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-muted">
              {content.footer.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand/70">
                {content.footer.navigationTitle}
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
                <a className="footer-link" href={localizedPath(locale, "")}>{content.navigation.home}</a>
                <a className="footer-link" href={localizedPath(locale, "diensten")}>
                  {content.navigation.services}
                </a>
                <a className="footer-link" href={localizedPath(locale, "diensten/arabisch-nederlands-tolk")}>
                  {content.actions.viewMainService}
                </a>
                <a className="footer-link" href={localizedPath(locale, "contact")}>
                  {content.navigation.contact}
                </a>
                <a className="footer-link" href={localizedPath(locale, "faq")}>{navLabels.faq}</a>
                <a className="footer-link" href={localizedPath(locale, "team")}>{navLabels.team}</a>
                <a className="footer-link" href={localizedPath(locale, "privacy")}>
                  {navLabels.privacy}
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand/70">
                {content.footer.contactTitle}
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
                <a className="footer-link" href={localizedPath(locale, "contact")}>
                  {locale === "nl"
                    ? "Open het contactformulier"
                    : "افتح نموذج التواصل"}
                </a>
                <a className="footer-link" href={actions.callback.href}>{actions.callback.label}</a>
                <a className="footer-link" href={actions.urgent.href}>{actions.urgent.label}</a>
                <p>{content.footer.contactNote}</p>
                <p>{content.footer.complianceNote}</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
