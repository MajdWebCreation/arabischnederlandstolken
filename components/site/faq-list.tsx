import type { FaqItem } from "@/lib/faq-data";

type FaqListProps = {
  items: readonly FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.question} className="content-card px-6 py-6">
          <p className="eyebrow eyebrow-muted">
            {item.category}
          </p>
          <h3 className="mt-4 text-lg font-semibold leading-7 text-foreground">
            {item.question}
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
