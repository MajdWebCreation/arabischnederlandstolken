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

  return (
    <div className={`page-shell min-h-screen ${isArabic ? "font-arabic" : ""}`}>
      <header className="sticky top-0 z-40 border-b border-line/70 bg-background/92 backdrop-blur">
        <div className="content-shell flex items-center justify-between gap-6 py-4">
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

          <nav className="hidden items-center gap-6 lg:flex">
            <a
              href={localizedPath(locale, "")}
              className="text-sm font-medium text-muted-strong transition hover:text-brand"
            >
              {content.navigation.home}
            </a>
            <a
              href={localizedPath(locale, "diensten")}
              className="text-sm font-medium text-muted-strong transition hover:text-brand"
            >
              {content.navigation.services}
            </a>
            <a
              href={localizedPath(locale, "contact")}
              className="text-sm font-medium text-muted-strong transition hover:text-brand"
            >
              {content.navigation.contact}
            </a>
            <a
              href={localizedPath(locale, "faq")}
              className="text-sm font-medium text-muted-strong transition hover:text-brand"
            >
              {navLabels.faq}
            </a>
            <a
              href={localizedPath(locale, "team")}
              className="text-sm font-medium text-muted-strong transition hover:text-brand"
            >
              {navLabels.team}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LocaleSwitcher locale={locale} />
            <a
              href={localizedPath(locale, "contact")}
              className="button-primary hidden px-5 py-2.5 sm:inline-flex"
            >
              {content.actions.bookNow}
            </a>
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
                <p>
                  {locale === "nl"
                    ? organizationContact.officeHoursNl
                    : organizationContact.officeHoursAr}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
