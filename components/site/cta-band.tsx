type Action = {
  label: string;
  href: string;
};

type CtaBandProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: Action;
  secondaryAction: Action;
};

export function CtaBand({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
}: CtaBandProps) {
  return (
    <section className="section-space">
      <div className="content-shell">
        <div className="rounded-[2rem] border border-brand/14 bg-brand-strong px-8 py-10 text-white shadow-[0_24px_80px_rgba(12,36,68,0.22)]">
        <p className="eyebrow eyebrow-inverse">
          {eyebrow}
        </p>
        <div className="mt-5 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl lg:max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight text-balance sm:text-[2.6rem]">
              {title}
            </h2>
            <p className="mt-4 text-base leading-8 text-white/82">
              {description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={primaryAction.href} className="button-primary-on-dark px-6 py-3">
              {primaryAction.label}
            </a>
            <a href={secondaryAction.href} className="button-secondary-on-dark px-6 py-3">
              {secondaryAction.label}
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
