import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanies, getPeople, getNews, catName, cName, pName, cCountry, newsView } from "../../lib/data";
import { fmtShort } from "../../lib/format";
import { getDict, isLocale } from "../../lib/i18n";
import { NewsRow } from "../../components/NewsList";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  const C = getCompanies(), P = getPeople(), N = getNews();
  const v = (n: (typeof N)[number]) => ({ id: n.id, source: n.source, date: n.date, image: n.image, ...newsView(n, locale) });
  const lead = N.find(n => n.image && n.summary && newsView(n, locale).translated) ?? N[0];
  const side = N.filter(n => n !== lead).slice(0, 5);
  const more = N.filter(n => n !== lead && !side.includes(n)).slice(0, 8);
  const top = [...C].sort((a, b) => (b.employees || 0) - (a.employees || 0)).slice(0, 8);
  const people = P.filter(p => p.category !== "other" && !/politician|president|actor|singer|rapper/i.test(p.description)).sort((a, b) => b.bio.length - a.bio.length).slice(0, 8);
  const L = v(lead), href = (id: string) => `/${locale}/news/${id}`;

  return (<>
    <div className="front">
      <Link className="lead" href={href(L.id)}>
        {L.image && <img src={L.image} alt="" />}
        <div className="meta"><b>{L.source}</b> · {fmtShort(L.date, locale)}</div>
        <h2>{L.title}</h2>
        <p>{L.text}</p>
      </Link>
      <div className="stack">
        <h2 className="label"><Link href={`/${locale}/news`}>{t.home.latest}</Link></h2>
        {side.map(n => { const x = v(n); return (
          <Link key={x.id} className="srow" href={href(x.id)}>
            <div><div className="meta"><b>{x.source}</b> · {fmtShort(x.date, locale)}</div><h3>{x.title}</h3></div>
            {x.image && <img src={x.image} alt="" loading="lazy" />}
          </Link>); })}
      </div>
    </div>

    <div className="duo">
      <section>
        <h2 className="label"><Link href={`/${locale}/companies`}>{t.home.top}</Link></h2>
        <table className="mini"><tbody>
          {top.map(c => (
            <tr key={c.slug}>
              <td><div className="who"><span className="mark">{c.logo ? <img src={c.logo} alt="" loading="lazy" /> : c.name[0]}</span><Link href={`/${locale}/companies/${c.slug}`}>{cName(c, locale)}</Link></div></td>
              <td>{cCountry(c, locale)}</td>
            </tr>))}
        </tbody></table>
        <Link className="more-link" href={`/${locale}/companies`}>{t.home.allCompanies}</Link>
      </section>
      <section>
        <h2 className="label"><Link href={`/${locale}/people`}>{t.home.people}</Link></h2>
        <table className="mini"><tbody>
          {people.map(p => (
            <tr key={p.slug}>
              <td><div className="who"><span className="mark round">{p.photo ? <img src={p.photo} alt="" loading="lazy" /> : p.name[0]}</span><Link href={`/${locale}/people/${p.slug}`}>{pName(p, locale)}</Link></div></td>
              <td>{catName(p.category, locale)}</td>
            </tr>))}
        </tbody></table>
        <Link className="more-link" href={`/${locale}/people`}>{t.home.allPeople}</Link>
      </section>
    </div>

    <section style={{ marginTop: 64 }}>
      <h2 className="label"><Link href={`/${locale}/news`}>{t.home.feed}</Link></h2>
      <div className="cols2">{more.map(n => <NewsRow key={n.id} x={v(n)} locale={locale} />)}</div>
      <Link className="more-link" href={`/${locale}/news`}>{t.home.allNews}</Link>
    </section>
  </>);
}
