import fs from "fs";
import path from "path";
import type { Locale } from "./i18n";

export type Company = {
  id: string; slug: string; name: string; nameRu: string | null; description: string; descriptionRu: string | null; website: string | null;
  country: string | null; countryRu: string | null; hq: string | null; hqRu: string | null; founded: string | null; employees: number | null; revenue: number | null;
  industries: string[]; industriesRu: string[]; founders: string[]; founderLinks: { name: string; slug: string | null }[]; ceo: string | null; ceoRu: string | null; parent: string | null; parentRu: string | null;
  products: string[]; subsidiaries: string[]; brands: string[]; logo: string | null; wikipedia: string | null; extract: string; extractRu?: string; thumb: string | null; category: string;
  ceoSlug?: string; projects?: { ru: string[]; en: string[] }; source?: { name: string; url: string };
};
export type Person = {
  id: string; slug: string; name: string; nameRu: string | null; description: string; descriptionRu: string | null; birth: string | null; death: string | null;
  birthplace: string | null; birthplaceRu: string | null; citizenship: string[]; citizenshipRu: string[]; education: string[]; educationRu: string[];
  occupations: string[]; occupationsRu: string[]; awards: string[]; awardsRu: string[]; works: string[]; worksRu: string[]; owns: string[];
  photo: string | null; wikipedia: string | null; summary: string; bio: string; bioRu?: string; category: string; companies: { slug: string; name: string; role?: { ru: string; en: string } }[];
  source?: { name: string; url: string };
};
export type News = { id: string; title: string; summary: string; link: string; source: string; date: string; image: string | null };
export type Category = { id: string; name: string; nameEn: string; companies: number; people: number };
type Tr = { companies: Record<string, { extract?: string; description?: string }>; people: Record<string, { bio?: string; description?: string }>; news: Record<string, { title?: string; brief?: string; briefEn?: string }> };

const read = <T,>(f: string, fallback?: T): T => {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8")); } catch (e) { if (fallback !== undefined) return fallback; throw e; }
};
const cache: { c?: Company[]; p?: Person[]; n?: News[]; k?: Category[]; t?: Tr } = {};
export const getCompanies = () => (cache.c ||= read<Company[]>("companies.json"));
export const getPeople = () => (cache.p ||= read<Person[]>("people.json"));
export const getNews = () => (cache.n ||= read<News[]>("news.json"));
export const getCategories = () => (cache.k ||= read<Category[]>("categories.json"));
export const getRu = () => (cache.t ||= read<Tr>("translations/ru.json", { companies: {}, people: {}, news: {} }));
export const catName = (id: string, l: Locale) => { const k = getCategories().find(c => c.id === id); return k ? (l === "ru" ? k.name : k.nameEn) : l === "ru" ? "Прочее" : "Other"; };
export const BIO_PARAS = 30;

// ---- localized views ----
const ru = (l: Locale) => l === "ru";
export const cName = (c: Company, l: Locale) => (ru(l) ? c.nameRu || c.name : c.name);
export const pName = (p: Person, l: Locale) => (ru(l) ? p.nameRu || p.name : p.name);
export const cDesc = (c: Company, l: Locale) => (ru(l) ? c.descriptionRu || getRu().companies[c.slug]?.description || c.description : c.description);
export const pDesc = (p: Person, l: Locale) => (ru(l) ? p.descriptionRu || getRu().people[p.slug]?.description || p.description : p.description);
export const cExtract = (c: Company, l: Locale) => (ru(l) ? c.extractRu || getRu().companies[c.slug]?.extract || c.extract : c.extract);
export const pBio = (p: Person, l: Locale) => {
  const t = ru(l) ? p.bioRu || getRu().people[p.slug]?.bio : undefined;
  return (t || p.bio).split(/\n+/).map(s => s.trim()).filter(Boolean).slice(0, BIO_PARAS);
};
export const cCountry = (c: Company, l: Locale) => (ru(l) ? c.countryRu || c.country : c.country);
export const cHq = (c: Company, l: Locale) => (ru(l) ? c.hqRu || c.hq : c.hq);
export const pCountry = (p: Person, l: Locale) => (ru(l) ? p.citizenshipRu[0] || p.citizenship[0] : p.citizenship[0]) || null;
export const pList = (p: Person, key: "citizenship" | "education" | "occupations" | "awards" | "works", l: Locale) => (ru(l) && p[`${key}Ru` as const].length ? p[`${key}Ru` as const] : p[key]);
export const pBirthplace = (p: Person, l: Locale) => (ru(l) ? p.birthplaceRu || p.birthplace : p.birthplace);
const METAISH = /\b(headline|snippet)\b|заголов|анонс|сниппет|предоставленн|не раскрыва|не уточня|не сообща|в тексте не|not (disclosed|specified|provided)|provided text|given text|no (further )?details/i;
export const newsView = (n: News, l: Locale) => {
  const t = getRu().news[n.id];
  if (ru(l)) {
    const brief = t?.brief && !METAISH.test(t.brief) ? t.brief : "";
    return { title: t?.title || n.title, text: brief || (t?.title ? "" : n.summary), translated: !!t?.title };
  }
  const brief = t?.briefEn && !METAISH.test(t.briefEn) ? t.briefEn : n.summary;
  return { title: n.title, text: brief, translated: true };
};
export const relatedCompanies = (n: News, limit = 4) => {
  const hay = n.title + " " + n.summary;
  return getCompanies().filter(c => c.name.length >= 4 && new RegExp("\\b" + c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b").test(hay)).slice(0, limit);
};
