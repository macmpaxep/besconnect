import type { Metadata } from "next";
import Catalog from "../../components/Catalog";
import { getPeople, getCategories, catName, fmtYear } from "../../lib/data";
export const metadata: Metadata = { title: "Предприниматели" };
export default function Page() {
  const P = getPeople(), K = getCategories();
  const items = P.map(p => ({ slug: p.slug, name: p.name, cat: p.category, img: p.photo, round: true,
    cells: [p.description || "—", p.citizenship[0] || "—", catName(p.category), p.birth ? fmtYear(p.birth) + (p.death ? "–" + fmtYear(p.death) : "") : "—"] }));
  const cats = K.map(k => ({ id: k.id, name: k.name, count: k.people }));
  return (<>
    <h1 className="title">Предприниматели</h1>
    <p className="sub">Предприниматели и бизнесмены мира в алфавитном порядке. Фильтр по сфере деятельности и поиск.</p>
    <Catalog items={items} cats={cats} base="/people" columns={["Описание", "Страна", "Сфера", "Годы жизни"]} placeholder="Поиск по имени или описанию" noun={["персона", "персоны", "персон"]} />
  </>);
}
