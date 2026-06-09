import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/site/contact-form";
import { CtaBand } from "@/components/site/cta-band";
import { Hero } from "@/components/site/hero";
import { JsonLd } from "@/components/site/json-ld";
import { SectionHeading } from "@/components/site/section-heading";
import {
  buildMailtoHref,
  createPageMetadata,
  getContactActions,
  isLocale,
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

  const content = getSiteContent(locale);

  return createPageMetadata({
    locale,
    path: "contact",
    title: content.contact.metaTitle,
    description: content.contact.metaDescription,
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = getSiteContent(locale);
  const actions = getContactActions(locale);

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    inLanguage: locale,
    mainEntity: {
      "@type": "Organization",
      name: content.brand.name,
      email: organizationContact.email,
    },
  };

  return (
    <>
      <JsonLd data={contactJsonLd} />
      <Hero
        locale={locale}
        eyebrow={content.contact.eyebrow}
        title={content.contact.title}
        intro={content.contact.intro}
        primaryAction={{
          label: content.contact.primaryAction,
          href: "#contactformulier",
        }}
        secondaryAction={{
          label: content.contact.secondaryAction,
          href: "#contactformulier",
        }}
        highlights={content.contact.highlights}
        compact
        variant="contact"
      />

      <section
        id="contactformulier"
        className="section-space-tight scroll-mt-28 border-y border-line bg-white/75"
      >
        <div className="content-shell">
          <SectionHeading
            eyebrow={content.contact.form.eyebrow}
            title={content.contact.form.title}
            description={content.contact.form.description}
            align="left"
          />
          <div className="mt-10 max-w-5xl">
            <ContactForm
              locale={locale}
              content={content.contact.form}
              fallbackHref={buildMailtoHref(content.contact.directSubject)}
            />
          </div>
        </div>
      </section>

      <section className="section-space-tight">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.contact.methods.eyebrow}
          title={content.contact.methods.title}
          description={content.contact.methods.description}
          align="left"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {content.contact.methods.items.map((item) => (
            <a
              key={item.title}
              href="#contactformulier"
              className="rounded-[1.75rem] border border-line bg-surface px-6 py-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand/65">
                {item.kicker}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-base leading-8 text-muted">
                {item.description}
              </p>
            </a>
          ))}
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-4">
          <a
            href="#contactformulier"
            className="rounded-[1.5rem] border border-line bg-surface px-5 py-5"
          >
            <h3 className="text-lg font-semibold text-foreground">{actions.urgent.label}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              {locale === "nl"
                ? "Voor gesprekken op zeer korte termijn waarbij snelheid in de intake nodig is."
                : "للاجتماعات القريبة جداً التي تحتاج إلى تنسيق سريع وواضح."}
            </p>
          </a>
          <a
            href="#contactformulier"
            className="rounded-[1.5rem] border border-line bg-surface px-5 py-5"
          >
            <h3 className="text-lg font-semibold text-foreground">{actions.sworn.label}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              {locale === "nl"
                ? "Voor formele afspraken waarbij beëdigde of verifieerbare inzet relevant kan zijn."
                : "للمواعيد الرسمية التي قد تتطلب صفة محلّفة أو قابلة للتحقق."}
            </p>
          </a>
          <a
            href="#contactformulier"
            className="rounded-[1.5rem] border border-line bg-surface px-5 py-5"
          >
            <h3 className="text-lg font-semibold text-foreground">{actions.healthcare.label}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              {locale === "nl"
                ? "Voor huisarts, specialist, GGZ, ziekenhuis en andere zorggesprekken."
                : "للطبيب والمستشفى والصحة النفسية وسائر اللقاءات الطبية."}
            </p>
          </a>
          <a
            href="#contactformulier"
            className="rounded-[1.5rem] border border-line bg-surface px-5 py-5"
          >
            <h3 className="text-lg font-semibold text-foreground">{actions.legal.label}</h3>
            <p className="mt-2 text-sm leading-7 text-muted">
              {locale === "nl"
                ? "Voor advocaat, rechtbank en andere juridische of dossiergebonden context."
                : "للمحامي أو المحكمة أو أي سياق قانوني أو مرتبط بالملف."}
            </p>
          </a>
        </div>
        </div>
      </section>

      <section className="section-space-tight border-y border-line bg-white/75">
        <div className="content-shell grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel px-7 py-8">
            <SectionHeading
              eyebrow={content.contact.intake.eyebrow}
              title={content.contact.intake.title}
              description={content.contact.intake.description}
              align="left"
            />
            <ul className="mt-8 space-y-3">
              {content.contact.intake.items.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-line/70 bg-background px-4 py-3 text-sm leading-7 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-brand/10 bg-brand-strong px-7 py-8 text-white">
            <SectionHeading
              eyebrow={content.contact.response.eyebrow}
              title={content.contact.response.title}
              description={content.contact.response.description}
              align="left"
              inverse
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {content.contact.response.items.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.4rem] border border-white/10 bg-white/10 px-5 py-5"
                >
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="content-shell">
        <SectionHeading
          eyebrow={content.contact.sectors.eyebrow}
          title={content.contact.sectors.title}
          description={content.contact.sectors.description}
          align="left"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-4">
          {content.contact.sectors.items.map((item) => (
            <article
              key={item.title}
              className="rounded-[1.5rem] border border-line bg-surface px-5 py-5"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
        </div>
      </section>

      <CtaBand
        eyebrow={content.contact.cta.eyebrow}
        title={content.contact.cta.title}
        description={content.contact.cta.description}
        primaryAction={{
          label: content.contact.primaryAction,
          href: "#contactformulier",
        }}
        secondaryAction={{
          label: content.contact.secondaryAction,
          href: "#contactformulier",
        }}
      />
    </>
  );
}
