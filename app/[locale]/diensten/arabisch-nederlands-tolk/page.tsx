import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import {
  absoluteUrl,
  createPageMetadata,
  isLocale,
  localizedPath,
  organizationName,
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

  const content = getSiteContent(locale);

  return createPageMetadata({
    locale,
    path: "diensten/arabisch-nederlands-tolk",
    title: content.mainService.metaTitle,
    description: content.mainService.metaDescription,
  });
}

export default async function MainServicePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = getSiteContent(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name:
      locale === "nl"
        ? "Arabisch ↔ Nederlands tolk"
        : "مترجم شفهي عربي هولندي",
    provider: {
      "@type": "Organization",
      name: organizationName,
    },
    areaServed: "NL",
    serviceType:
      locale === "nl"
        ? "Telefonische, video- en fysieke tolkdiensten"
        : "خدمات الترجمة الشفهية الهاتفية والمرئية والحضورية",
    url: absoluteUrl(localizedPath(locale, "diensten/arabisch-nederlands-tolk")),
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <Hero
        eyebrow={content.mainService.eyebrow}
        title={content.mainService.title}
        intro={content.mainService.intro}
        primaryAction={{
          label: content.actions.bookNow,
          href: localizedPath(locale, "contact"),
        }}
        secondaryAction={{
          label: content.actions.viewServices,
          href: localizedPath(locale, "diensten"),
        }}
        highlights={content.mainService.highlights}
        compact
      />

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={content.mainService.answerFirst.eyebrow}
          title={content.mainService.answerFirst.title}
          description={content.mainService.answerFirst.description}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-line bg-surface px-7 py-8">
            <p className="text-base leading-8 text-muted">
              {content.mainService.answerFirst.body}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.mainService.modes.map((mode) => (
                <div
                  key={mode.title}
                  className="rounded-[1.4rem] border border-line/70 bg-background px-5 py-5"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {mode.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <aside className="rounded-[2rem] border border-line bg-soft px-7 py-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/70">
              {content.mainService.proof.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              {content.mainService.proof.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {content.mainService.proof.items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-line/70 bg-white/85 px-4 py-3 text-sm leading-7 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.mainService.contexts.eyebrow}
            title={content.mainService.contexts.title}
            description={content.mainService.contexts.description}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {content.mainService.contexts.items.map((item) => (
              <article
                key={item.title}
                className="rounded-[1.75rem] border border-line bg-surface px-6 py-6"
              >
                <h3 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-muted">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={content.mainService.booking.eyebrow}
          title={content.mainService.booking.title}
          description={content.mainService.booking.description}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.mainService.booking.steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[1.75rem] border border-line bg-surface px-6 py-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/65">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-soft/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.mainService.faq.eyebrow}
            title={content.mainService.faq.title}
            description={content.mainService.faq.description}
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {content.mainService.faq.items.map((item) => (
              <article
                key={item.question}
                className="rounded-[1.5rem] border border-line bg-surface px-6 py-5"
              >
                <h3 className="text-lg font-semibold text-foreground">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={content.mainService.cta.eyebrow}
        title={content.mainService.cta.title}
        description={content.mainService.cta.description}
        primaryAction={{
          label: content.actions.bookNow,
          href: localizedPath(locale, "contact"),
        }}
        secondaryAction={{
          label: content.actions.viewServices,
          href: localizedPath(locale, "diensten"),
        }}
      />
    </>
  );
}
