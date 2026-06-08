import { LocaleSwitcher } from "@/components/site/locale-switcher";
import { getSiteContent } from "@/lib/site-content";
import {
  getContactActions,
  localizedPath,
  organizationContact,
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
      <header className="sticky top-0 z-40 border-b border-line/70 bg-background/92 backdrop-blur">
        <div className="content-shell flex items-center justify-between gap-3 py-4 sm:gap-6">
          <div className="min-w-0">
            <a href={localizedPath(locale, "")} className="block">
              <p className="eyebrow eyebrow-muted">
                {content.brand.tag}
              </p>
              <p className="mt-1 text-base font-semibold text-foreground sm:text-lg">
                {content.brand.name}
              </p>
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
                className="text-sm font-medium text-muted-strong transition hover:text-brand focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
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

      <footer className="border-t border-line bg-white/70">
        <div className="content-shell grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow eyebrow-muted">
              {content.brand.tag}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
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
                <a href={localizedPath(locale, "")}>{content.navigation.home}</a>
                <a href={localizedPath(locale, "diensten")}>
                  {content.navigation.services}
                </a>
                <a href={localizedPath(locale, "diensten/arabisch-nederlands-tolk")}>
                  {content.actions.viewMainService}
                </a>
                <a href={localizedPath(locale, "contact")}>
                  {content.navigation.contact}
                </a>
                <a href={localizedPath(locale, "faq")}>{navLabels.faq}</a>
                <a href={localizedPath(locale, "team")}>{navLabels.team}</a>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand/70">
                {content.footer.contactTitle}
              </h3>
              <div className="mt-4 flex flex-col gap-3 text-sm text-muted">
                <a href={`mailto:${organizationContact.email}`}>
                  {organizationContact.email}
                </a>
                <a href={actions.callback.href}>{actions.callback.label}</a>
                <a href={actions.urgent.href}>{actions.urgent.label}</a>
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
