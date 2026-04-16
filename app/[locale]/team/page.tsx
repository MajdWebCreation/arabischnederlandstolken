import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { ProfileCard } from "@/components/site/profile-card";
import { SectionHeading } from "@/components/site/section-heading";
import { createPageMetadata, getContactActions, isLocale, localizedPath, organizationName } from "@/lib/site";
import { getTeamPageContent, teamProfiles } from "@/lib/team-data";

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
    "@graph": [
      {
        "@type": "CollectionPage",
        name: content.metaTitle,
        about: organizationName,
      },
      {
        "@type": "ItemList",
        itemListElement: teamProfiles.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Person",
            name: profile.name,
            description: profile.overview[locale],
            knowsLanguage: profile.languages[locale],
            memberOf: {
              "@type": "Organization",
              name: organizationName,
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={teamJsonLd} />
      <Hero
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
              {locale === "nl" ? "Wat deze laag toevoegt" : "ما الذي تضيفه هذه الطبقة"}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="panel-quiet first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === "nl" ? "Voor opdrachtgevers" : "للجهات الطالبة"}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {locale === "nl"
                    ? "Sneller beoordelen of een profiel past bij zorg, overheid, recht of spoed."
                    : "تساعد على تقييم مدى ملاءمة الملف لسياقات الرعاية والجهات الرسمية والقانون والطوارئ."}
                </p>
              </div>
              <div className="panel-quiet first:border-t-0 first:pt-0">
                <h3 className="text-lg font-semibold text-foreground">
                  {locale === "nl" ? "Voor verdere groei" : "للتوسع اللاحق"}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted">
                  {locale === "nl"
                    ? "Klaar voor individuele profielen, sectorspecifieke detailpagina’s en verifieerbare registratielagen."
                    : "مهيأة لصفحات ملفات فردية وصفحات قطاعية وطبقات تحقق مهنية أكثر تفصيلاً."}
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
          eyebrow={locale === "nl" ? "Teamprofielen" : "ملفات الفريق"}
          title={
            locale === "nl"
              ? "Profielen zijn ingericht als inhoudelijke trust-objecten, niet als losse visitekaartjes."
              : "تم إعداد الملفات كعناصر ثقة حقيقية، لا كبطاقات تعريف سطحية."
          }
          description={
            locale === "nl"
              ? "Elke kaart bevat inhoud die later kan uitgroeien tot een eigen profielpagina met sectorspecifieke en verificatiegebonden details."
              : "كل بطاقة تتضمن عناصر يمكن توسيعها لاحقاً إلى صفحة ملف مستقل بتفاصيل قطاعية وتحقق مهني."
          }
          align="left"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {teamProfiles.map((profile) => (
            <ProfileCard key={profile.slug} profile={profile} locale={locale} />
          ))}
        </div>
        </div>
      </section>

      <section className="section-space-tight border-t border-line bg-soft/45">
        <div className="content-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow={content.sections.growth.eyebrow}
            title={content.sections.growth.title}
            description={content.sections.growth.description}
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
                  : "إجابات موجزة وقابلة للاقتباس تتصل بالحجز والتحقق والسياق المهني."}
              </p>
            </a>
          </div>
        </div>
      </section>

      <CtaBand
        eyebrow={locale === "nl" ? "Trust naar actie" : "من الثقة إلى الإجراء"}
        title={
          locale === "nl"
            ? "Wilt u een aanvraag koppelen aan formele eisen, sectorcontext of snelle inzet?"
            : "هل تريدون ربط الطلب بمتطلبات رسمية أو سياق قطاعي أو تنسيق سريع؟"
        }
        description={
          locale === "nl"
            ? "Gebruik de contactroutes voor algemene, formele, juridische of spoedgebonden aanvragen."
            : "استخدموا مسارات التواصل للطلبات العامة أو الرسمية أو القانونية أو العاجلة."
        }
        primaryAction={actions.official}
        secondaryAction={actions.legal}
      />
    </>
  );
}
