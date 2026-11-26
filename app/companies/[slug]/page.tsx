import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanies, catName, fmtYear, fmtMoney } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => getCompanies().map(c => ({ slug: c.slug }));
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const c = getCompanies().find(x => x.slug === slug); return { title: c?.name, description: c?.description };
}
const Block = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><h3>{title}</h3><ul className="list">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { slug } = await params; const c = getCompanies().find(x => x.slug === slug); if (!c) notFound();
  const hasPortfolio = c.products.length + c.brands.length + c.subsidiaries.length > 0;
  const similar = getCompanies().filter(x => x.category === c.category && x.slug !== c.slug).slice(0, 6);
  return (<>
    <div className="crumbs"><Link href="/companies">Компании</Link> / {catName(c.category)}</div>
    <div className="hero">
      <div className="ava">{c.logo ? <img src={c.logo} alt={c.name} /> : c.name[0]}</div>
      <div><h1 style={{ margin: 0 }}>{c.name}</h1>{c.nameRu && c.nameRu !== c.name && <div className="lead" style={{ margin: 0 }}>{c.nameRu}</div>}
        <p className="lead" style={{ margin: "4px 0" }}>{c.description}</p><span className="tag">{catName(c.category)}</span></div>
    </div>
    <div className="facts">
      {([["Страна", c.country], ["Штаб-квартира", c.hq], ["Основана", fmtYear(c.founded)], ["Сотрудников", c.employees?.toLocaleString("ru-RU")], ["Выручка, $", fmtMoney(c.revenue)], ["Руководитель", c.ceo], ["Материнская компания", c.parent]] as [string, string | null | undefined][])
        .filter(([, v]) => v && v !== "—").map(([k, v]) => <div className="fact" key={k}><b>{k}</b>{v}</div>)}
      {c.website && <div className="fact"><b>Сайт</b><a href={c.website} target="_blank" rel="noopener noreferrer">{c.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a></div>}
    </div>
    <h2>О компании</h2><div className="bio"><p>{c.extract}</p></div>
    {c.industries.length > 0 && <Block title="Отрасли" items={c.industries} />}
    <h2>Портфолио</h2>
    {hasPortfolio ? (<><Block title="Продукты и услуги" items={c.products} /><Block title="Бренды" items={c.brands} /><Block title="Дочерние компании и проекты" items={c.subsidiaries} /></>)
      : <p className="lead">В открытых базах нет структурированного списка продуктов этой компании. Подробности — в источнике.</p>}
    {c.founderLinks.length > 0 && (<><h2>Основатели</h2><ul className="list">{c.founderLinks.map(f => <li key={f.name}>{f.slug ? <Link href={`/people/${f.slug}`}>{f.name}</Link> : f.name}</li>)}</ul></>)}
    {c.wikipedia && <p className="lead" style={{ marginTop: 24 }}>Источники: <a href={c.wikipedia} target="_blank" rel="noopener noreferrer">Wikipedia</a>, Wikidata.</p>}
    {similar.length > 0 && (<><h2>Другие компании сферы</h2><div className="grid">{similar.map(s => <Link key={s.slug} href={`/companies/${s.slug}`} className="card"><h3>{s.name}</h3><p>{s.country}</p></Link>)}</div></>)}
  </>);
}
