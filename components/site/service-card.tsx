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
        className="panel block px-6 py-6 transition-transform duration-200 hover:-translate-y-1 hover:border-brand/25"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="panel px-6 py-6">
      {content}
    </article>
  );
}
