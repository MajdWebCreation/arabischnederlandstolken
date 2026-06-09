type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  inverse = false,
}: SectionHeadingProps) {
  const textAlignment = align === "left" ? "text-left" : "text-center";
  const titleColor = inverse ? "text-white" : "text-foreground";
  const descriptionColor = inverse ? "text-white/82" : "text-muted";
  const eyebrowColor = inverse ? "eyebrow eyebrow-inverse" : "eyebrow eyebrow-muted";

  return (
    <div
      className={`section-heading ${textAlignment} ${
        align === "center" ? "mx-auto max-w-3xl" : "max-w-2xl"
      }`}
      data-align={align}
    >
      <p className={`${eyebrowColor} section-heading__eyebrow`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-3xl font-semibold leading-tight text-balance sm:text-[2.6rem] ${titleColor}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-8 ${descriptionColor}`}>
        {description}
      </p>
    </div>
  );
}
