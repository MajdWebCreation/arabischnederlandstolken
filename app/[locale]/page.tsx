import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { ServiceCard } from "@/components/site/service-card";
import { SectionHeading } from "@/components/site/section-heading";
import { getPhaseTwoServiceContent } from "@/lib/service-pages";
import { createPageMetadata, isLocale, localizedPath } from "@/lib/site";
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
    path: "",
    title: content.home.metaTitle,
    description: content.home.metaDescription,
  });
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = getSiteContent(locale);
  const phaseTwo = getPhaseTwoServiceContent(locale);

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.home.metaTitle,
    description: content.home.metaDescription,
    inLanguage: locale,
    about: "Arabisch ↔ Nederlands tolkdiensten",
  };

  return (
    <>
      <JsonLd data={websiteJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.home.eyebrow}
        title={content.home.title}
        intro={content.home.intro}
        primaryAction={{
          label: content.actions.bookNow,
          href: localizedPath(locale, "contact"),
        }}
        secondaryAction={{
          label: content.navigation.services,
          href: localizedPath(locale, "diensten"),
        }}
        highlights={content.home.highlights}
      />

      <section className="border-t border-line/80 bg-white/75">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          {content.home.proofPoints.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.75rem] border border-line/70 bg-surface px-6 py-6 shadow-[0_18px_50px_rgba(17,36,67,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/70">
                {item.kicker}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={content.home.answerFirst.eyebrow}
          title={content.home.answerFirst.title}
          description={content.home.answerFirst.description}
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-line bg-surface px-7 py-8 shadow-[0_20px_60px_rgba(17,36,67,0.05)]">
            <p className="text-base leading-8 text-muted">
              {content.home.answerFirst.body}
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.home.sectors.map((sector) => (
                <div
                  key={sector.title}
                  className="rounded-[1.5rem] border border-line/70 bg-background px-5 py-5"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {sector.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {sector.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-brand/15 bg-brand px-7 py-8 text-white shadow-[0_22px_60px_rgba(9,27,53,0.18)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">
              {content.home.bookingPanel.eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight">
              {content.home.bookingPanel.title}
            </h2>
            <p className="mt-4 text-base leading-8 text-white/80">
              {content.home.bookingPanel.description}
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-7 text-white/80">
              {content.home.bookingPanel.items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="border-y border-line bg-soft/60">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.home.serviceOverview.eyebrow}
            title={content.home.serviceOverview.title}
            description={content.home.serviceOverview.description}
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {content.home.serviceOverview.cards.map((card) => (
              <ServiceCard
                key={card.title}
                title={card.title}
                description={card.description}
                href={
                  ("href" in card ? localizedPath(locale, card.href) : undefined) as
                    | string
                    | undefined
                }
                label={("cta" in card ? card.cta : undefined) as string | undefined}
                status={
                  ("status" in card ? card.status : undefined) as
                    | string
                    | undefined
                }
              />
            ))}
            <ServiceCard
              title={
                locale === "nl"
                  ? "Beëdigd tolk Arabisch ↔ Nederlands"
                  : "مترجم محلّف عربي ↔ هولندي"
              }
              description={phaseTwo.sworn.hero.intro}
              href={localizedPath(locale, "diensten/beedigd-tolk-arabisch-nederlands")}
              label={locale === "nl" ? "Bekijk dienst" : "اعرض الخدمة"}
              status={locale === "nl" ? "Formele inzet" : "استخدام رسمي"}
            />
            <ServiceCard
              title={
                locale === "nl"
                  ? "Spoedtolk Arabisch ↔ Nederlands"
                  : "مترجم طوارئ عربي ↔ هولندي"
              }
              description={phaseTwo.urgent.hero.intro}
              href={localizedPath(locale, "diensten/spoedtolk-arabisch-nederlands")}
              label={locale === "nl" ? "Bekijk dienst" : "اعرض الخدمة"}
              status={locale === "nl" ? "Afhankelijk van beschikbaarheid" : "بحسب التوافر"}
            />
            <ServiceCard
              title={locale === "nl" ? "FAQ" : "الأسئلة الشائعة"}
              description={
                locale === "nl"
                  ? "Praktische antwoorden over aanvragen, spoed, kwalificatie, kosten en inzet in officiële context."
                  : "إجابات عملية حول الطلب والطوارئ والتأهيل والتكلفة والسياقات الرسمية."
              }
              href={localizedPath(locale, "faq")}
              label={locale === "nl" ? "Bekijk FAQ" : "اعرض الصفحة"}
              status={locale === "nl" ? "Praktische informatie" : "معلومات عملية"}
            />
            <ServiceCard
              title={locale === "nl" ? "Team en verificatie" : "الفريق والتحقق"}
              description={
                locale === "nl"
                  ? "Lees hoe het collectief opdrachten afstemt op context, inzetvorm, beschikbaarheid en vereiste kwalificatie."
                  : "تعرفوا على كيفية تنسيق المهام بحسب السياق وشكل الجلسة والتوافر والتأهيل."
              }
              href={localizedPath(locale, "team")}
              label={locale === "nl" ? "Bekijk team" : "اعرض الصفحة"}
              status={locale === "nl" ? "Collectief en werkwijze" : "المجموعة وطريقة العمل"}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={content.home.process.eyebrow}
          title={content.home.process.title}
          description={content.home.process.description}
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.home.process.steps.map((step, index) => (
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

      <section className="border-t border-line bg-white/75">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={content.home.faqPreview.eyebrow}
            title={content.home.faqPreview.title}
            description={content.home.faqPreview.description}
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {content.home.faqPreview.items.map((item) => (
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
        eyebrow={content.home.cta.eyebrow}
        title={content.home.cta.title}
        description={content.home.cta.description}
        primaryAction={{
          label: content.actions.bookNow,
          href: localizedPath(locale, "contact"),
        }}
        secondaryAction={{
          label: content.actions.viewMainService,
          href: localizedPath(locale, "diensten/arabisch-nederlands-tolk"),
        }}
      />
    </>
  );
}
