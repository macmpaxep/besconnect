import Link from "next/link";
import { getCompanies, getPeople, getNews, getCategories } from "../lib/data";

export default function Home() {
  const C = getCompanies(), P = getPeople(), N = getNews(), K = getCategories();
  return (<>
    <h1>Международный бизнес в одном месте</h1>
    <p className="lead">Каталог компаний и предпринимателей мира по сферам деятельности и свежие деловые новости.</p>
    <div className="stats">
      <Link href="/companies" className="card stat"><b>{C.length}</b>компаний</Link>
      <Link href="/people" className="card stat"><b>{P.length}</b>предпринимателей</Link>
      <Link href="/news" className="card stat"><b>{N.length}</b>новостей</Link>
    </div>
    <h2>Сферы деятельности</h2>
    <div className="chips">{K.filter(k => k.companies + k.people > 0).map(k => <span key={k.id} className="chip">{k.name}<small>{k.companies} / {k.people}</small></span>)}</div>
    <h2>Последние новости</h2>
    <div className="news">{N.slice(0, 6).map(x => (
      <a key={x.id} className="n-item" href={x.link} target="_blank" rel="noopener noreferrer">
        {x.image && <img src={x.image} alt="" />}<div><div className="meta">{x.source}</div><h3>{x.title}</h3></div></a>))}</div>
    <h2>Популярные компании</h2>
    <div className="grid">{C.slice(0, 0).length ? null : [...C].sort((a, b) => (b.employees || 0) - (a.employees || 0)).slice(0, 8).map(c => (
      <Link key={c.slug} href={`/companies/${c.slug}`} className="card"><h3>{c.name}</h3><p>{c.country || ""}</p></Link>))}</div>
  </>);
}
