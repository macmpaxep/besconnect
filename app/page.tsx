import Link from "next/link";
import { getCompanies, getPeople, getNews, catName } from "../lib/data";
import { fmtShort } from "../lib/format";
import { NewsRow } from "../components/NewsList";

export default function Home() {
  const C = getCompanies(), P = getPeople(), N = getNews();
  const lead = N.find(n => n.image && n.summary) ?? N[0];
  const side = N.filter(n => n !== lead).slice(0, 5);
  const more = N.filter(n => n !== lead && !side.includes(n)).slice(0, 8);
  const top = [...C].sort((a, b) => (b.employees || 0) - (a.employees || 0)).slice(0, 8);
  const people = P.filter(p => p.category !== "other" && !/politician|president|actor|singer|rapper/i.test(p.description)).sort((a, b) => b.bio.length - a.bio.length).slice(0, 8);

  return (<>
    <div className="front">
      <a className="lead" href={lead.link} target="_blank" rel="noopener noreferrer">
        {lead.image && <img src={lead.image} alt="" />}
        <div className="meta"><b>{lead.source}</b> · {fmtShort(lead.date)}</div>
        <h2>{lead.title}</h2>
        <p>{lead.summary}</p>
      </a>
      <div className="stack">
        <h2 className="label"><Link href="/news">Последние материалы</Link></h2>
        {side.map(x => (
          <a key={x.id} className="srow" href={x.link} target="_blank" rel="noopener noreferrer">
            <div><div className="meta"><b>{x.source}</b> · {fmtShort(x.date)}</div><h3>{x.title}</h3></div>
            {x.image && <img src={x.image} alt="" loading="lazy" />}
          </a>
        ))}
      </div>
    </div>

    <div className="duo">
      <section>
        <h2 className="label"><Link href="/companies">Крупнейшие по числу сотрудников</Link></h2>
        <table className="mini"><tbody>
          {top.map(c => (
            <tr key={c.slug}>
              <td><div className="who"><span className="mark">{c.logo ? <img src={c.logo} alt="" loading="lazy" /> : c.name[0]}</span><Link href={`/companies/${c.slug}`}>{c.name}</Link></div></td>
              <td>{c.country}</td>
            </tr>
          ))}
        </tbody></table>
        <Link className="more-link" href="/companies">Весь каталог компаний</Link>
      </section>
      <section>
        <h2 className="label"><Link href="/people">Предприниматели</Link></h2>
        <table className="mini"><tbody>
          {people.map(p => (
            <tr key={p.slug}>
              <td><div className="who"><span className="mark round">{p.photo ? <img src={p.photo} alt="" loading="lazy" /> : p.name[0]}</span><Link href={`/people/${p.slug}`}>{p.name}</Link></div></td>
              <td>{catName(p.category)}</td>
            </tr>
          ))}
        </tbody></table>
        <Link className="more-link" href="/people">Все предприниматели</Link>
      </section>
    </div>

    <section style={{ marginTop: 64 }}>
      <h2 className="label"><Link href="/news">Лента новостей</Link></h2>
      <div className="cols2">{more.map(x => <NewsRow key={x.id} x={x} />)}</div>
      <Link className="more-link" href="/news">Все новости</Link>
    </section>
  </>);
}
