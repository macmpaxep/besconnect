import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPeople, catName, fmtDate } from "../../../lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => getPeople().map(p => ({ slug: p.slug }));
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params; const p = getPeople().find(x => x.slug === slug); return { title: p?.name, description: p?.description };
}
const Block = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><h3>{title}</h3><ul className="list">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { slug } = await params; const p = getPeople().find(x => x.slug === slug); if (!p) notFound();
  const paras = p.bio.split(/\n{2,}|\n/).map(s => s.trim()).filter(Boolean).filter(s => !/^=+\s.*\s=+$/.test(s) || true);
  return (<>
    <div className="crumbs"><Link href="/people">Предприниматели</Link> / {catName(p.category)}</div>
    <div className="hero">
      <div className="ava round" style={{ width: 120, height: 120 }}>{p.photo ? <img className="cover" src={p.photo} alt={p.name} /> : p.name[0]}</div>
      <div><h1 style={{ margin: 0 }}>{p.name}</h1>{p.nameRu && p.nameRu !== p.name && <div className="lead" style={{ margin: 0 }}>{p.nameRu}</div>}
        <p className="lead" style={{ margin: "4px 0" }}>{p.description}</p><span className="tag">{catName(p.category)}</span></div>
    </div>
    <div className="facts">
      {([["Родился", fmtDate(p.birth)], ["Умер", p.death ? fmtDate(p.death) : null], ["Место рождения", p.birthplace], ["Гражданство", p.citizenship.join(", ")]] as [string, string | null][])
        .filter(([, v]) => v && v !== "—").map(([k, v]) => <div className="fact" key={k}><b>{k}</b>{v}</div>)}
    </div>
    <h2>Биография</h2>
    <div className="bio">{paras.slice(0, 40).map((t, i) => /^=+\s/.test(t) ? <h3 key={i}>{t.replace(/=+/g, "").trim()}</h3> : <p key={i}>{t}</p>)}</div>
    {p.companies.length > 0 && (<><h2>Компании</h2><ul className="list">{p.companies.map(c => <li key={c.slug}><Link href={`/companies/${c.slug}`}>{c.name}</Link></li>)}</ul></>)}
    <Block title="Род деятельности" items={p.occupations} /><Block title="Образование" items={p.education} />
    <Block title="Награды" items={p.awards} /><Block title="Известные работы" items={p.works} />
    {p.wikipedia && <p className="lead" style={{ marginTop: 24 }}>Источники: <a href={p.wikipedia} target="_blank" rel="noopener noreferrer">Wikipedia</a> (CC BY-SA), Wikidata.</p>}
  </>);
}
