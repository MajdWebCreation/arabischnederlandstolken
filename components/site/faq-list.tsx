import type { FaqItem } from "@/lib/faq-data";

type FaqListProps = {
  items: readonly FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {items.map((item) => (
        <article key={item.question} className="panel-quiet first:border-t-0 first:pt-0">
          <p className="eyebrow eyebrow-muted">
            {item.category}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">
            {item.question}
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
