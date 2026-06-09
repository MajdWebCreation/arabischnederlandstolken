import Image from "next/image";
import type { Locale } from "@/lib/site";

type Action = {
  label: string;
  href: string;
};

type HeroProps = {
  locale: Locale;
  eyebrow: string;
  title: string;
  intro: string;
  primaryAction: Action;
  secondaryAction: Action;
  highlights: readonly string[];
  compact?: boolean;
  variant?: "default" | "editorial" | "trust" | "contact";
};

export function Hero({
  locale,
  eyebrow,
  title,
  intro,
  primaryAction,
  secondaryAction,
  highlights,
  compact = false,
  variant = "default",
}: HeroProps) {
  const labels =
    locale === "nl"
      ? {
          trust: "Zorgvuldige afstemming",
          contact: "Formulier en e-mail",
          available: "Inzet en beschikbaarheid",
        }
      : {
          trust: "تنسيق مهني",
          contact: "النموذج والبريد الإلكتروني",
          available: "الخدمة والتوافر",
        };

  if (variant === "editorial") {
    return (
      <section className="section-space-tight">
        <div className="content-shell">
          <div className="hero-editorial mx-auto max-w-4xl py-2 sm:py-4">
            <p className="eyebrow eyebrow-muted">{eyebrow}</p>
            <h1
              className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                compact
                  ? "text-[2.35rem] leading-[1.12] sm:text-5xl sm:leading-tight"
                  : "text-[2.55rem] leading-[1.1] sm:text-6xl sm:leading-tight"
              }`}
            >
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={primaryAction.href} className="button-primary px-6 py-3">
                {primaryAction.label}
              </a>
              <a href={secondaryAction.href} className="button-secondary px-6 py-3">
                {secondaryAction.label}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {highlights.map((highlight) => (
                <span key={highlight} className="chip">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "trust") {
    return (
      <section className="section-space-tight">
        <div className="content-shell">
          <div className="hero-shell grid gap-8 px-7 py-9 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:px-12 lg:py-12">
            <div className="max-w-3xl">
              <p className="eyebrow eyebrow-muted">{eyebrow}</p>
              <h1
                className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                  compact
                    ? "text-[2.35rem] leading-[1.12] sm:text-5xl sm:leading-tight"
                    : "text-[2.55rem] leading-[1.1] sm:text-6xl sm:leading-tight"
                }`}
              >
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {intro}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={primaryAction.href} className="button-primary px-6 py-3">
                  {primaryAction.label}
                </a>
                <a href={secondaryAction.href} className="button-secondary px-6 py-3">
                  {secondaryAction.label}
                </a>
              </div>
            </div>
            <aside className="hero-trust-panel panel-soft p-6 lg:p-7">
              <p className="eyebrow eyebrow-muted">
                {labels.trust}
              </p>
              <ul className="mt-5 space-y-4">
                {highlights.map((highlight) => (
                  <li key={highlight} className="panel-quiet first:border-t-0 first:pt-0">
                    <p className="text-sm leading-7 text-muted-strong">{highlight}</p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "contact") {
    return (
      <section className="section-space-tight">
        <div className="content-shell">
          <div className="hero-shell grid gap-8 px-7 py-9 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:px-12 lg:py-12">
            <div className="max-w-3xl">
              <p className="eyebrow eyebrow-muted">{eyebrow}</p>
              <h1
                className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                  compact
                    ? "text-[2.35rem] leading-[1.12] sm:text-5xl sm:leading-tight"
                    : "text-[2.55rem] leading-[1.1] sm:text-6xl sm:leading-tight"
                }`}
              >
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {intro}
              </p>
            </div>
            <aside className="brand-panel-dark px-6 py-6 lg:px-7 lg:py-7">
              <p className="eyebrow eyebrow-inverse">{labels.contact}</p>
              <div className="mt-5 flex flex-col gap-3">
                <a href={primaryAction.href} className="button-primary-on-dark px-6 py-3">
                  {primaryAction.label}
                </a>
                <a href={secondaryAction.href} className="button-secondary-on-dark px-6 py-3">
                  {secondaryAction.label}
                </a>
              </div>
              <ul className="mt-6 space-y-3">
                {highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="dark-list-item text-sm leading-7 text-white/84"
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-space-tight pb-10">
      <div className="content-shell">
        <div className="hero-shell surface-grid">
          <Image
            src="/brand/logo-mark.webp"
            alt=""
            width={160}
            height={153}
            className="hero-brand-mark"
          />
          <div className="grid gap-8 px-7 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-14">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-muted">{eyebrow}</p>
            <h1
              className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                compact
                  ? "text-[2.35rem] leading-[1.12] sm:text-5xl sm:leading-tight"
                  : "text-[2.55rem] leading-[1.1] sm:text-6xl sm:leading-tight"
              }`}
            >
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              {intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={primaryAction.href} className="button-primary px-6 py-3">
                {primaryAction.label}
              </a>
              <a href={secondaryAction.href} className="button-secondary px-6 py-3">
                {secondaryAction.label}
              </a>
            </div>
          </div>

          <aside className="brand-panel-dark px-6 py-6">
            <p className="eyebrow eyebrow-inverse">
              {labels.available}
            </p>
            <ul className="mt-5 space-y-3">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="dark-list-item text-sm leading-7 text-white/80"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
