import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { absoluteUrl, createPageMetadata, getContactActions, isLocale, localizedPath, organizationName } from "@/lib/site";
import { getPhaseTwoServiceContent } from "@/lib/service-pages";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const content = getPhaseTwoServiceContent(locale).urgent;

  return createPageMetadata({
    locale,
    path: "diensten/spoedtolk-arabisch-nederlands",
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function UrgentServicePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getPhaseTwoServiceContent(locale).urgent;
  const actions = getContactActions(locale);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name:
      locale === "nl"
        ? "Spoedtolk Arabisch-Nederlands"
        : "مترجم طوارئ عربي هولندي",
    provider: {
      "@type": "Organization",
      name: organizationName,
    },
    serviceType:
      locale === "nl"
        ? "Spoed- en snelle tolkondersteuning"
        : "دعم ترجمة شفهية عاجل وسريع",
    url: absoluteUrl(localizedPath(locale, "diensten/spoedtolk-arabisch-nederlands")),
  };

  return (
    <>
      <JsonLd data={serviceJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        primaryAction={actions.urgent}
        secondaryAction={actions.callback}
        highlights={content.hero.highlights}
        compact
        variant="contact"
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
            <div className="brand-panel px-7 py-8">
              <p className="text-base leading-8 text-muted">{content.answerFirst.body}</p>
            </div>
            <aside className="brand-panel-dark px-7 py-8">
              <p className="eyebrow eyebrow-inverse">
                {locale === "nl" ? "Spoedsignalen" : "مؤشرات الاستعجال"}
              </p>
              <div className="mt-6 space-y-3">
                {content.signals.map((item) => (
                  <div
                    key={item.title}
                    className="dark-list-item"
                  >
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-white/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-surface section-space-tight">
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
                className="content-card content-card-compact text-sm leading-7 text-muted"
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
                className="content-card px-6 py-6"
              >
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-base leading-8 text-muted">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-warm section-space-tight">
        <div className="content-shell">
          <SectionHeading
            eyebrow={locale === "nl" ? "Spoedintake" : "استقبال الطوارئ"}
            title={
              locale === "nl"
                ? "Snelheid werkt het best wanneer de aanvraag meteen concreet is."
                : "السرعة تكون أكثر فاعلية عندما يكون الطلب واضحاً من اللحظة الأولى."
            }
            description={
              locale === "nl"
                ? "Deze drie stappen helpen om niet alleen snel, maar ook professioneel te handelen."
                : "هذه الخطوات الثلاث تساعد على الجمع بين السرعة والانضباط المهني."
            }
            align="left"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {content.steps.map((step, index) => (
              <article
                key={step.title}
                className="step-card"
              >
                <p className="step-marker">
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
        primaryAction={actions.urgent}
        secondaryAction={actions.callback}
      />
    </>
  );
}
