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
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}${localizedPath(locale, path)}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
  );
}
