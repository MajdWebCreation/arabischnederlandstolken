import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { createPageMetadata, getContactActions, isLocale, localizedPath, organizationName, absoluteUrl } from "@/lib/site";
import { getPhaseTwoServiceContent } from "@/lib/service-pages";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPhaseTwoServiceContent(locale).sworn;

  return createPageMetadata({
    locale,
    path: "diensten/beedigd-tolk-arabisch-nederlands",
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function SwornServicePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getPhaseTwoServiceContent(locale).sworn;
  const actions = getContactActions(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name:
      locale === "nl"
        ? "Beëdigd tolk Arabisch ↔ Nederlands"
        : "مترجم محلّف عربي ↔ هولندي",
    provider: {
      "@type": "Organization",
      name: organizationName,
    },
    serviceType:
      locale === "nl"
        ? "Beëdigde of formeel verifieerbare tolkdienst"
        : "خدمة ترجمة شفهية محلّفة أو قابلة للتحقق الرسمي",
    url: absoluteUrl(localizedPath(locale, "diensten/beedigd-tolk-arabisch-nederlands")),
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        primaryAction={actions.sworn}
        secondaryAction={{
          label: locale === "nl" ? "Bekijk team en verificatie" : "اعرض الفريق والتحقق",
          href: localizedPath(locale, "team"),
        }}
        highlights={content.hero.highlights}
        compact
        variant="trust"
      />

      <section className="section-space-tight">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.answerFirst.eyebrow}
          title={content.answerFirst.title}
          description={content.answerFirst.description}
          align="left"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-line bg-surface px-7 py-8">
            <p className="text-base leading-8 text-muted">{content.answerFirst.body}</p>
          </div>
          <aside className="rounded-[2rem] border border-brand/10 bg-soft px-7 py-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/70">
              {locale === "nl" ? "Signalen" : "مؤشرات"}
            </p>
            <div className="mt-6 space-y-3">
              {content.signals.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-line/70 bg-white/80 px-4 py-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{item.description}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
        </div>
      </section>

      <section className="section-space-tight border-y border-line bg-white/75">
        <div className="content-shell">
          <SectionHeading
            eyebrow={content.verification.eyebrow}
            title={content.verification.title}
            description={content.verification.description}
            align="left"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.verification.items.map((item) => (
              <div
                key={item}
                className="rounded-[1.35rem] border border-line bg-surface px-4 py-4 text-sm leading-7 text-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.contexts.eyebrow}
          title={content.contexts.title}
          description={content.contexts.description}
          align="left"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.contexts.items.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-line bg-surface px-6 py-6"
            >
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-base leading-8 text-muted">{item.description}</p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <section className="section-space-tight border-t border-line bg-soft/45">
        <div className="content-shell">
          <SectionHeading
            eyebrow={locale === "nl" ? "Aanvraagproces" : "مسار الطلب"}
            title={
              locale === "nl"
                ? "Heldere intake voorkomt verwarring in formele trajecten."
                : "الاستقبال الواضح يمنع الالتباس في المسارات الرسمية."
            }
            description={
              locale === "nl"
                ? "Bij beëdigde of formele inzet is voorbereiding onderdeel van de kwaliteit."
                : "في الاستخدام المحلّف أو الرسمي، تعتبر مرحلة التهيئة جزءاً من الجودة نفسها."
            }
            align="left"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.steps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-[1.75rem] border border-line bg-surface px-6 py-6"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/65">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-xl font-semibold text-foreground">{step.title}</h3>
                <p className="mt-3 text-base leading-8 text-muted">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={content.cta.eyebrow}
        title={content.cta.title}
        description={content.cta.description}
        primaryAction={actions.sworn}
        secondaryAction={actions.official}
      />
    </>
  );
}
