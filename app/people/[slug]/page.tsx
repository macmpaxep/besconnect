import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPeople, catName, fmtDate } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => getPeople().map(p => ({ slug: p.slug }));
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const p = getPeople().find(x => x.slug === slug);
  return { title: p?.name, description: p?.description };
}
const Group = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><div className="plist-h">{title}</div><ul className="plist">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { slug } = await params; const p = getPeople().find(x => x.slug === slug); if (!p) notFound();
  const paras = p.bio.split(/\n+/).map(s => s.trim()).filter(Boolean).slice(0, 60);
  const rows: [string, React.ReactNode][] = ([
    ["Родился", p.birth ? fmtDate(p.birth) : null], ["Умер", p.death ? fmtDate(p.death) : null],
    ["Место рождения", p.birthplace], ["Гражданство", p.citizenship.join(", ") || null],
    ["Образование", p.education.slice(0, 3).join(", ") || null],
    ["Сфера", catName(p.category)],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  return (<>
    <nav className="crumb" aria-label="Навигация"><Link href="/people">Предприниматели</Link> / {catName(p.category)}</nav>
    <div className="head">
      <span className="mark round">{p.photo ? <img src={p.photo} alt="" /> : p.name[0]}</span>
      <div><h1>{p.name}</h1><p>{p.nameRu && p.nameRu !== p.name ? p.nameRu + " · " : ""}{p.description}</p></div>
    </div>
    <div className="detail">
      <div>
        <section className="sect"><h2 className="h2">Биография</h2>
          <div className="read">{paras.map((t, i) => /^=+\s.*\s=+$/.test(t) ? <h3 key={i}>{t.replace(/=+/g, "").trim()}</h3> : <p key={i}>{t}</p>)}</div>
        </section>
        {p.companies.length > 0 && <section className="sect"><h2 className="h2">Компании</h2>
          <table className="rel"><tbody>{p.companies.map(c => <tr key={c.slug}><td><Link href={`/companies/${c.slug}`}>{c.name}</Link></td><td>Основатель</td></tr>)}</tbody></table></section>}
        {(p.awards.length + p.works.length + p.occupations.length > 0) && <section className="sect"><h2 className="h2">Деятельность и достижения</h2>
          <Group title="Род деятельности" items={p.occupations} /><Group title="Награды" items={p.awards} /><Group title="Известные работы" items={p.works} /></section>}
        {p.wikipedia && <p className="meta">Источники: <a href={p.wikipedia} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Wikipedia</a> (CC BY-SA), Wikidata.</p>}
      </div>
      <aside><div className="panel"><h2>Краткие сведения</h2>
        <dl className="facts">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div></aside>
    </div>
  </>);
}
