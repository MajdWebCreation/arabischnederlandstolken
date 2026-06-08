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
          <div className="mx-auto max-w-4xl">
            <p className="eyebrow eyebrow-muted">{eyebrow}</p>
            <h1
              className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                compact ? "text-4xl leading-tight sm:text-5xl" : "text-5xl leading-tight sm:text-6xl"
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
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <div className="max-w-3xl">
              <p className="eyebrow eyebrow-muted">{eyebrow}</p>
              <h1
                className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                  compact ? "text-4xl leading-tight sm:text-5xl" : "text-5xl leading-tight sm:text-6xl"
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
            <aside className="panel-soft p-6 lg:p-7">
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
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="max-w-3xl">
              <p className="eyebrow eyebrow-muted">{eyebrow}</p>
              <h1
                className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                  compact ? "text-4xl leading-tight sm:text-5xl" : "text-5xl leading-tight sm:text-6xl"
                }`}
              >
                {title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
                {intro}
              </p>
            </div>
            <aside className="panel border-line-strong bg-brand-strong px-6 py-6 text-white lg:px-7 lg:py-7">
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
                    className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3 text-sm leading-7 text-white/84"
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
        <div className="surface-grid overflow-hidden rounded-[2.3rem] border border-line/80 bg-surface shadow-[0_24px_90px_rgba(17,36,67,0.08)]">
        <div className="grid gap-8 px-7 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-14">
          <div className="max-w-3xl">
            <p className="eyebrow eyebrow-muted">{eyebrow}</p>
            <h1
              className={`mt-5 text-balance font-semibold tracking-tight text-foreground ${
                compact ? "text-4xl leading-tight sm:text-5xl" : "text-5xl leading-tight sm:text-6xl"
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

          <aside className="rounded-[1.9rem] border border-brand/12 bg-brand-strong px-6 py-6 text-white shadow-[0_18px_50px_rgba(12,36,68,0.16)]">
            <p className="eyebrow eyebrow-inverse">
              {labels.available}
            </p>
            <ul className="mt-5 space-y-3">
              {highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-7 text-white/80"
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
