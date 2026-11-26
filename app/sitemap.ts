import type { MetadataRoute } from "next";
import { getCompanies, getPeople, getNews } from "../lib/data";
import { locales } from "../lib/i18n";
import { SITE } from "../lib/seo";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/companies", "/people", "/news",
    ...getCompanies().map(c => `/companies/${c.slug}`), ...getPeople().map(p => `/people/${p.slug}`), ...getNews().map(n => `/news/${n.id}`)];
  return paths.flatMap(p => locales.map(l => ({
    url: `${SITE}/${l}${p}`,
    alternates: { languages: Object.fromEntries(locales.map(x => [x, `${SITE}/${x}${p}`])) },
  })));
}
