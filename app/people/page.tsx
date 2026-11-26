import type { Metadata } from "next";
import Catalog from "../../components/Catalog";
import { getPeople, getCategories } from "../../lib/data";
export const metadata: Metadata = { title: "Предприниматели" };
export default function Page() {
  const P = getPeople(), K = getCategories();
  const items = P.map(p => ({ slug: p.slug, name: p.name, sub: p.description, cat: p.category, img: p.photo, round: true }));
  const cats = K.map(k => ({ id: k.id, name: k.name, count: k.people }));
  return (<><h1>Предприниматели</h1><p className="lead">{P.length} предпринимателей и бизнесменов мира — по алфавиту, с фильтром по сфере.</p>
    <Catalog items={items} cats={cats} base="/people" placeholder="Поиск по имени или описанию…" /></>);
}
