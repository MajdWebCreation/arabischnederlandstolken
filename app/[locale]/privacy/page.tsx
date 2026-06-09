import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  createPageMetadata,
  isLocale,
  localizedPath,
  organizationContact,
} from "@/lib/site";
import { getSiteContent } from "@/lib/site-content";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const content = getSiteContent(locale).privacy;

  return createPageMetadata({
    locale,
    path: "privacy",
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = getSiteContent(locale).privacy;

  return (
    <>
      <section className="section-space-tight">
        <div className="content-shell">
          <div className="hero-shell px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
            <p className="eyebrow eyebrow-muted">{content.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg sm:leading-9">
              {content.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="section-surface section-space">
        <div className="content-shell grid items-start gap-8 lg:grid-cols-[0.36fr_0.64fr]">
          <aside className="brand-panel px-6 py-7 lg:sticky lg:top-28">
            <h2 className="text-2xl font-semibold text-foreground">
              {content.overviewTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {content.overviewItems.map((item) => (
                <li
                  key={item}
                  className="info-list-item text-sm leading-7 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>

            <nav
              aria-label={content.navigationLabel}
              className="mt-8 border-t border-line pt-6"
            >
              <p className="eyebrow eyebrow-muted">
                {content.navigationLabel}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {content.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-lg px-2 py-1.5 text-sm font-medium leading-6 text-muted-strong transition hover:bg-brand-soft/60 hover:text-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </nav>
          </aside>

          <article className="brand-panel px-6 py-8 sm:px-9 lg:px-11">
            <div className="list-divider">
              {content.sections.map((section) => (
                <section
                  id={section.id}
                  key={section.id}
                  className="scroll-mt-28 py-7 first:pt-0 last:pb-0"
                >
                  <h2 className="text-2xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-base leading-8 text-muted"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.showContact ? (
                    <div className="mt-5 rounded-2xl border border-line bg-surface-alt px-5 py-5">
                      <p
                        dir="ltr"
                        className="text-sm font-semibold text-foreground"
                      >
                        {organizationContact.email}
                      </p>
                      <a
                        href={localizedPath(locale, "contact")}
                        className="button-tertiary mt-4 px-5 py-2.5"
                      >
                        {content.contactCta}
                      </a>
                    </div>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
