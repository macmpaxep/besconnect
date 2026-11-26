import { locales } from "./i18n";
export const SITE = "https://besconnect.com";
/** canonical + hreflang alternates for a page path (e.g. "/companies/apple-inc") */
export const alt = (locale: string, path = "") => ({
  canonical: `/${locale}${path}`,
  languages: { ...Object.fromEntries(locales.map(l => [l, `/${l}${path}`])), "x-default": `/ru${path}` },
});
