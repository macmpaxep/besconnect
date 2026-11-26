import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanies, catName, fmtYear, fmtMoney, fmtNum } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => getCompanies().map(c => ({ slug: c.slug }));
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const c = getCompanies().find(x => x.slug === slug);
  return { title: c?.name, description: c?.description };
}
const Group = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><div className="plist-h">{title}</div><ul className="plist">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { slug } = await params; const c = getCompanies().find(x => x.slug === slug); if (!c) notFound();
  const hasPortfolio = c.products.length + c.brands.length + c.subsidiaries.length > 0;
  const similar = getCompanies().filter(x => x.category === c.category && x.slug !== c.slug).slice(0, 8);
  const site = c.website?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const rows: [string, React.ReactNode][] = ([
    ["Страна", c.country], ["Штаб-квартира", c.hq], ["Основана", c.founded ? fmtYear(c.founded) : null],
    ["Сотрудники", c.employees ? fmtNum(c.employees) : null], ["Выручка", c.revenue ? fmtMoney(c.revenue) : null],
    ["Руководитель", c.ceo], ["Материнская компания", c.parent],
    ["Сайт", c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer">{site}</a> : null],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  return (<>
    <nav className="crumb" aria-label="Навигация"><Link href="/companies">Компании</Link> / {catName(c.category)}</nav>
    <div className="head">
      <span className="mark">{c.logo ? <img src={c.logo} alt="" /> : c.name[0]}</span>
      <div>
        <h1>{c.name}</h1>
        <p>{c.nameRu && c.nameRu !== c.name ? c.nameRu + " · " : ""}{c.description} <span className="tag">{catName(c.category)}</span></p>
      </div>
    </div>
    <div className="detail">
      <div>
        <section className="sect"><h2 className="h2">О компании</h2><div className="read"><p>{c.extract}</p></div></section>
        <section className="sect"><h2 className="h2">Портфолио</h2>
          {hasPortfolio ? (<><Group title="Продукты и услуги" items={c.products} /><Group title="Бренды" items={c.brands} /><Group title="Дочерние компании и проекты" items={c.subsidiaries} /></>)
            : <p className="meta">В открытых базах нет структурированного списка продуктов этой компании.</p>}
        </section>
        {c.founderLinks.length > 0 && <section className="sect"><h2 className="h2">Основатели</h2>
          <table className="rel"><tbody>{c.founderLinks.map(f => <tr key={f.name}><td>{f.slug ? <Link href={`/people/${f.slug}`}>{f.name}</Link> : f.name}</td><td>{f.slug ? "Профиль" : ""}</td></tr>)}</tbody></table>
        </section>}
        {c.wikipedia && <p className="meta">Источники: <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Wikipedia</a>, Wikidata.</p>}
      </div>
      <aside>
        <div className="panel" style={{ marginBottom: 28 }}>
          <h2>Реквизиты</h2>
          <dl className="facts">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </div>
        {similar.length > 0 && <div className="panel"><h2>Другие компании сферы</h2>
          <dl className="facts">{similar.map(s => <div key={s.slug}><dt><Link href={`/companies/${s.slug}`}>{s.name}</Link></dt><dd>{s.country}</dd></div>)}</dl></div>}
      </aside>
    </div>
  </>);
}
