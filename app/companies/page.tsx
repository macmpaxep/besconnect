import type { Metadata } from "next";
import Catalog from "../../components/Catalog";
import { getCompanies, getCategories } from "../../lib/data";
export const metadata: Metadata = { title: "Каталог компаний" };
export default function Page() {
  const C = getCompanies(), K = getCategories();
  const items = C.map(c => ({ slug: c.slug, name: c.name, sub: [c.country, c.hq].filter(Boolean).join(" · "), cat: c.category, img: c.logo }));
  const cats = K.map(k => ({ id: k.id, name: k.name, count: k.companies }));
  return (<><h1>Каталог компаний</h1><p className="lead">{C.length} международных компаний — по алфавиту, с фильтром по сфере деятельности.</p>
    <Catalog items={items} cats={cats} base="/companies" placeholder="Поиск компании или страны…" /></>);
}
