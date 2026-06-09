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
  return locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}${localizedPath(locale, path)}`,
      changeFrequency:
        path === "privacy" ? ("yearly" as const) : ("weekly" as const),
      priority: path === "" ? 1 : path === "privacy" ? 0.5 : 0.8,
    })),
  );
}
