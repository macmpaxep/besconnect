import fs from "fs";
import path from "path";

export type Company = {
  id: string; slug: string; name: string; nameRu: string | null; description: string; website: string | null;
  country: string | null; hq: string | null; founded: string | null; employees: number | null; revenue: number | null;
  industries: string[]; founders: string[]; founderLinks: { name: string; slug: string | null }[]; ceo: string | null; parent: string | null;
  products: string[]; subsidiaries: string[]; brands: string[]; logo: string | null; wikipedia: string | null;
  extract: string; thumb: string | null; category: string;
};
export type Person = {
  id: string; slug: string; name: string; nameRu: string | null; description: string; birth: string | null; death: string | null;
  birthplace: string | null; citizenship: string[]; education: string[]; occupations: string[]; awards: string[]; works: string[]; owns: string[];
  photo: string | null; wikipedia: string | null; summary: string; bio: string; category: string; companies: { slug: string; name: string }[];
};
export type News = { id: string; title: string; summary: string; link: string; source: string; date: string; image: string | null };
export type Category = { id: string; name: string; companies: number; people: number };

const read = <T,>(f: string): T => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", f), "utf8"));
let cache: { c?: Company[]; p?: Person[]; n?: News[]; k?: Category[] } = {};
export const getCompanies = () => (cache.c ||= read<Company[]>("companies.json"));
export const getPeople = () => (cache.p ||= read<Person[]>("people.json"));
export const getNews = () => (cache.n ||= read<News[]>("news.json"));
export const getCategories = () => (cache.k ||= read<Category[]>("categories.json"));
export const catName = (id: string) => getCategories().find(c => c.id === id)?.name ?? "Прочее";
export const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("ru-RU", { year: "numeric", month: "long", day: "numeric" }) : "—");
export const fmtYear = (d: string | null) => (d ? d.slice(0, 4) : "—");
export const fmtMoney = (n: number | null) => (n == null ? "—" : n >= 1e9 ? (n / 1e9).toFixed(1) + " млрд" : n >= 1e6 ? (n / 1e6).toFixed(1) + " млн" : String(n));
