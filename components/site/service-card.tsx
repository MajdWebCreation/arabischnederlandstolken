type ServiceCardProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  status?: string;
};

export function ServiceCard({
  title,
  description,
  href,
  label,
  status,
}: ServiceCardProps) {
  const content = (
    <>
      {status ? (
        <p className="eyebrow eyebrow-muted">
          {status}
        </p>
      ) : null}
      <h3 className="mt-3 text-[1.55rem] font-semibold leading-tight text-foreground">
        {title}
      </h3>
      <p className="mt-3 max-w-2xl text-base leading-8 text-muted">{description}</p>
      {label ? (
        <span className="mt-6 inline-flex items-center rounded-full border border-brand/15 bg-brand-soft px-4 py-2 text-sm font-semibold text-brand-strong">
          {label}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="brand-panel link-card block px-6 py-6 sm:px-7 sm:py-7"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="brand-panel px-6 py-6 sm:px-7 sm:py-7">
      {content}
    </article>
  );
}
