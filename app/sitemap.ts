import type { MetadataRoute } from "next";
import { locales, localizedPath, siteUrl } from "@/lib/site";

const staticPaths = [
  "",
  "diensten",
  "diensten/arabisch-nederlands-tolk",
  "diensten/beedigd-tolk-arabisch-nederlands",
  "diensten/spoedtolk-arabisch-nederlands",
  "contact",
  "faq",
  "team",
  "privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const localizedEntries = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}${localizedPath(locale, path)}`,
      changeFrequency:
        path === "privacy" ? ("yearly" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path === "privacy" ? 0.5 : 0.8,
    })),
  );

  // Dutch-only, unlike every path above: see
  // app/[locale]/algemene-voorwaarden/page.tsx for why. Listed separately
  // rather than added to staticPaths so it isn't also generated for /ar/,
  // where the route deliberately 404s.
  const termsEntry = {
    url: `${siteUrl}${localizedPath("nl", "algemene-voorwaarden")}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  };

  return [...localizedEntries, termsEntry];
}
