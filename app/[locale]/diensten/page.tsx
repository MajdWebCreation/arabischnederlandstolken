import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { SectionHeading } from "@/components/site/section-heading";
import { getPhaseTwoServiceContent } from "@/lib/service-pages";
import { ServiceCard } from "@/components/site/service-card";
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
    path: "diensten",
    title: content.services.metaTitle,
    description: content.services.metaDescription,
  });
}

export default async function ServicesPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = getSiteContent(locale);
  const phaseTwo = getPhaseTwoServiceContent(locale);

  return (
    <>
      <Hero
        eyebrow={content.services.eyebrow}
        title={content.services.title}
        intro={content.services.intro}
        primaryAction={{
          label: content.actions.bookNow,
          href: localizedPath(locale, "contact"),
        }}
        secondaryAction={{
          label: content.actions.viewMainService,
          href: localizedPath(locale, "diensten/arabisch-nederlands-tolk"),
        }}
        highlights={content.services.highlights}
        compact
        variant="editorial"
      />

      <section className="section-space-tight">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.services.liveServices.eyebrow}
          title={content.services.liveServices.title}
          description={`${content.services.liveServices.description} ${
            locale === "nl"
              ? "De hoofdroutes staan eerst; de ondersteunende trust- en groeiroutes volgen daarna."
              : "تظهر المسارات الأساسية أولاً ثم تتبعها مسارات الثقة والتوسع."
          }`}
          align="left"
        />
        <div className="mt-10 grid gap-4">
          {content.services.liveServices.cards.map((card) => (
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
            label={locale === "nl" ? "Open dienstpagina" : "افتح صفحة الخدمة"}
            status={locale === "nl" ? "Nieuw in fase 2" : "جديد في المرحلة الثانية"}
          />
          <ServiceCard
            title={
              locale === "nl"
                ? "Spoedtolk Arabisch ↔ Nederlands"
                : "مترجم طوارئ عربي ↔ هولندي"
            }
            description={phaseTwo.urgent.hero.intro}
            href={localizedPath(locale, "diensten/spoedtolk-arabisch-nederlands")}
            label={locale === "nl" ? "Open dienstpagina" : "افتح صفحة الخدمة"}
            status={locale === "nl" ? "Nieuw in fase 2" : "جديد في المرحلة الثانية"}
          />
        </div>
        </div>
      </section>

      <section className="section-space-tight border-y border-line bg-white/75">
        <div className="content-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow={content.services.verification.eyebrow}
            title={content.services.verification.title}
            description={content.services.verification.description}
            align="left"
          />
          <div className="grid gap-4">
            {content.services.verification.items.map((item) => (
              <article
                key={item.title}
                className="panel-quiet first:border-t-0 first:pt-0"
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

      <section className="section-space">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.services.future.eyebrow}
          title={content.services.future.title}
          description={content.services.future.description}
          align="left"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {content.services.future.cards.map((card) => (
            <ServiceCard
              key={card.title}
              title={card.title}
              description={card.description}
              status={
                ("status" in card ? card.status : undefined) as
                  | string
                  | undefined
              }
            />
          ))}
          <ServiceCard
            title={locale === "nl" ? "FAQ" : "الأسئلة الشائعة"}
            description={
              locale === "nl"
                ? "Echte antwoordpagina met compacte, citeerbare antwoorden over boeken, spoed, verificatie en inzet."
                : "صفحة إجابات فعلية بأسلوب موجز وقابل للاقتباس حول الحجز والطوارئ والتحقق والاستخدام."
            }
            href={localizedPath(locale, "faq")}
            label={locale === "nl" ? "Open FAQ" : "افتح الصفحة"}
            status={locale === "nl" ? "Nieuw in fase 2" : "جديد في المرحلة الثانية"}
          />
          <ServiceCard
            title={locale === "nl" ? "Team en verificatie" : "الفريق والتحقق"}
            description={
              locale === "nl"
                ? "Overzicht van profielen, specialisaties, verificatievelden en voorbereide trust-informatie."
                : "عرض للملفات المهنية والتخصصات وحقول التحقق وعناصر الثقة القابلة للتوسع."
            }
            href={localizedPath(locale, "team")}
            label={locale === "nl" ? "Open team" : "افتح الصفحة"}
            status={locale === "nl" ? "Nieuw in fase 2" : "جديد في المرحلة الثانية"}
          />
        </div>
        </div>
      </section>

      <CtaBand
        eyebrow={content.services.cta.eyebrow}
        title={content.services.cta.title}
        description={content.services.cta.description}
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
