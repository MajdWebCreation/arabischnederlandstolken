import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { createPageMetadata, getContactActions, isLocale, localizedPath, organizationName } from "@/lib/site";
import { getTeamPageContent, teamCapabilities } from "@/lib/team-data";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  const content = getTeamPageContent(locale);

  return createPageMetadata({
    locale,
    path: "team",
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function TeamPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const content = getTeamPageContent(locale);
  const actions = getContactActions(locale);

  const teamJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.metaTitle,
    description: content.metaDescription,
    inLanguage: locale,
    about: {
      "@type": "Organization",
      name: organizationName,
      knowsLanguage: ["Arabic", "Dutch"],
      description: content.hero.intro,
    },
  };

  return (
    <>
      <JsonLd data={teamJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        primaryAction={actions.general}
        secondaryAction={{
          label: locale === "nl" ? "Bekijk FAQ" : "اعرض الأسئلة الشائعة",
          href: localizedPath(locale, "faq"),
        }}
        highlights={content.hero.highlights}
        compact
        variant="trust"
      />

      <section className="section-space-tight">
        <div className="content-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <SectionHeading
            eyebrow={content.sections.overview.eyebrow}
            title={content.sections.overview.title}
            description={content.sections.overview.description}
            align="left"
          />
          <div className="panel-soft px-6 py-6">
            <p className="eyebrow eyebrow-muted">
              {locale === "nl" ? "Wat vooraf telt" : "ما الذي يهم مسبقاً"}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="panel-quiet first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === "nl" ? "Voor opdrachtgevers" : "للجهات الطالبة"}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {locale === "nl"
                    ? "Duidelijkheid over de context, inzetvorm en eventuele formele eisen."
                    : "وضوح حول السياق وشكل الجلسة وأي متطلبات رسمية."}
                </p>
              </div>
              <div className="panel-quiet first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === "nl" ? "Voor een passende match" : "لاختيار مناسب"}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {locale === "nl"
                    ? "Beschikbaarheid en kwalificatie worden per concrete aanvraag beoordeeld."
                    : "يتم تقييم التوافر والتأهيل لكل طلب محدد."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space-tight border-y border-line bg-white/75">
        <div className="content-shell">
          <SectionHeading
            eyebrow={content.sections.verification.eyebrow}
            title={content.sections.verification.title}
            description={content.sections.verification.description}
            align="left"
          />
          <div className="mt-10 grid gap-x-8 gap-y-4 lg:grid-cols-5">
            {content.sections.verification.items.map((item) => (
              <div
                key={item}
                className="panel-quiet first:border-t-0 first:pt-0 text-sm leading-7 text-muted"
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
            eyebrow={content.sections.expertise.eyebrow}
            title={content.sections.expertise.title}
            description={content.sections.expertise.description}
            align="left"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {teamCapabilities.map((capability) => (
              <article key={capability.id} className="panel px-6 py-6">
                <h3 className="text-2xl font-semibold text-foreground">
                  {capability.title[locale]}
                </h3>
                <p className="mt-4 text-base leading-8 text-muted">
                  {capability.overview[locale]}
                </p>
                <div className="mt-6 panel-quiet">
                  <h4 className="eyebrow eyebrow-muted">
                    {locale === "nl" ? "Contexten" : "السياقات"}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                    {capability.contexts[locale].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 panel-quiet">
                  <h4 className="eyebrow eyebrow-muted">
                    {locale === "nl" ? "Inzetvormen" : "أشكال الخدمة"}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                    {capability.modes[locale].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 panel-quiet">
                  <h4 className="eyebrow eyebrow-muted">
                    {locale === "nl" ? "Aandachtspunten" : "نقاط مهمة"}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                    {capability.safeguards[locale].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space-tight border-t border-line bg-soft/45">
        <div className="content-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow={content.sections.assignment.eyebrow}
            title={content.sections.assignment.title}
            description={content.sections.assignment.description}
            align="left"
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <a
              href={localizedPath(locale, "diensten/beedigd-tolk-arabisch-nederlands")}
              className="panel px-6 py-6"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {locale === "nl" ? "Beëdigd tolk" : "مترجم محلّف"}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted">
                {locale === "nl"
                  ? "Route voor formele inzet waar verificatie en bevoegdheid expliciet meewegen."
                  : "مسار للاستخدام الرسمي حيث يكون التحقق من الصفة المهنية جزءاً أساسياً."}
              </p>
            </a>
            <a
              href={localizedPath(locale, "diensten/spoedtolk-arabisch-nederlands")}
              className="panel px-6 py-6"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {locale === "nl" ? "Spoedtolk" : "مترجم طوارئ"}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted">
                {locale === "nl"
                  ? "Route voor tijdkritische gesprekken met snelle intake en realistische haalbaarheidscheck."
                  : "مسار للمحادثات العاجلة مع استقبال سريع وتقييم واقعي للإمكانية."}
              </p>
            </a>
            <a
              href={localizedPath(locale, "faq")}
              className="panel px-6 py-6"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {locale === "nl" ? "FAQ" : "الأسئلة الشائعة"}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted">
                {locale === "nl"
                  ? "Compacte, citeerbare antwoorden die aansluiten op intake, verificatie en context."
                  : "إجابات موجزة تتصل بالطلب والتحقق والسياق المهني."}
              </p>
            </a>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={locale === "nl" ? "Een aanvraag sturen" : "إرسال الطلب"}
        title={
          locale === "nl"
            ? "Heeft uw gesprek formele eisen, een specifieke sectorcontext of korte doorlooptijd?"
            : "هل ترتبط محادثتكم بمتطلبات رسمية أو قطاع محدد أو وقت قصير؟"
        }
        description={
          locale === "nl"
            ? "Mail de datum, tijd, inzetvorm en context om beschikbaarheid en kwalificatie te laten beoordelen."
            : "أرسلوا التاريخ والوقت وشكل الجلسة والسياق لتقييم التوافر والتأهيل."
        }
        primaryAction={actions.official}
        secondaryAction={actions.legal}
      />
    </>
  );
}
