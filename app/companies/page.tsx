import type { Metadata } from "next";
import Catalog from "../../components/Catalog";
import { getCompanies, getCategories, catName, fmtYear, fmtNum } from "../../lib/data";
export const metadata: Metadata = { title: "Каталог компаний" };
export default function Page() {
  const C = getCompanies(), K = getCategories();
  const items = C.map(c => ({ slug: c.slug, name: c.name, cat: c.category, img: c.logo,
    cells: [c.country || "—", catName(c.category), fmtYear(c.founded), fmtNum(c.employees)] }));
  const cats = K.map(k => ({ id: k.id, name: k.name, count: k.companies }));
  return (<>
    <h1 className="title">Каталог компаний</h1>
    <p className="sub">Международные компании в алфавитном порядке. Фильтр по сфере деятельности и поиск.</p>
    <Catalog items={items} cats={cats} base="/companies" columns={["Страна", "Сфера", "Основана", "Сотрудники"]} placeholder="Поиск по названию или стране" noun={["компания", "компании", "компаний"]} />
  </>);
}
