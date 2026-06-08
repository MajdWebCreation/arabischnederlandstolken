import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { FaqList } from "@/components/site/faq-list";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import { getFaqContent } from "@/lib/faq-data";
import { createPageMetadata, getContactActions, isLocale, localizedPath } from "@/lib/site";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  const content = getFaqContent(locale);

  return createPageMetadata({
    locale,
    path: "faq",
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) notFound();

  const content = getFaqContent(locale);
  const actions = getContactActions(locale);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        intro={content.hero.intro}
        primaryAction={actions.general}
        secondaryAction={{
          label: locale === "nl" ? "Bekijk team en verificatie" : "اعرض الفريق والتحقق",
          href: localizedPath(locale, "team"),
        }}
        highlights={content.hero.highlights}
        compact
        variant="editorial"
      />

      <section className="section-space-tight">
        <div className="content-shell grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <SectionHeading
          eyebrow={locale === "nl" ? "Vraagstructuur" : "هيكل الأسئلة"}
          title={
            locale === "nl"
              ? "De FAQ is geordend op de onderwerpen waar opdrachtgevers het eerst duidelijkheid over nodig hebben."
              : "تم ترتيب الأسئلة وفق الموضوعات التي تحتاج الجهات إلى وضوح مباشر بشأنها."
          }
          description={
            locale === "nl"
              ? "Zo vindt een opdrachtgever snel de informatie die nodig is om een passende aanvraag te sturen."
              : "وبذلك تجد الجهة الطالبة سريعاً المعلومات اللازمة لإرسال طلب مناسب."
          }
          align="left"
        />
        <div className="grid gap-3">
          {content.categories.map((category) => (
            <article
              key={category.title}
              className="panel-soft px-6 py-5"
            >
              <h3 className="text-xl font-semibold text-foreground">
                {category.title}
              </h3>
              <p className="mt-3 text-base leading-8 text-muted">
                {category.description}
              </p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <section className="section-space border-y border-line bg-white/75">
        <div className="content-shell">
          <SectionHeading
            eyebrow={locale === "nl" ? "Antwoorden" : "الإجابات"}
            title={
              locale === "nl"
                ? "Compact geschreven, maar inhoudelijk bruikbaar."
                : "مختصرة في الصياغة لكنها عملية وواضحة."
            }
            description={
              locale === "nl"
              ? "Elke vraag sluit aan op aanvragen, spoed, kwalificatie of een specifieke gesprekscontext."
              : "كل سؤال مرتبط بالطلبات أو الطوارئ أو التأهيل أو سياق محادثة محدد."
            }
            align="left"
          />
          <div className="mt-12">
            <FaqList items={content.items} />
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={locale === "nl" ? "Verder vanuit FAQ" : "بعد صفحة الأسئلة"}
        title={
          locale === "nl"
            ? "Wilt u direct een vraag omzetten in een concrete aanvraag?"
            : "هل تريدون تحويل السؤال مباشرة إلى طلب فعلي؟"
        }
        description={
          locale === "nl"
            ? "Gebruik de contactroute voor een algemene aanvraag, spoedvraag of formele afspraak."
            : "استخدموا صفحة التواصل لطلب عام أو طلب عاجل أو موعد رسمي."
        }
        primaryAction={actions.general}
        secondaryAction={actions.urgent}
      />
    </>
  );
}
