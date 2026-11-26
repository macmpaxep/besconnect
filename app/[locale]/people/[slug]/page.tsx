import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPeople, catName, pName, pDesc, pBio, pList, pBirthplace } from "../../../../lib/data";
import { fmtDate } from "../../../../lib/format";
import { getDict, isLocale, locales } from "../../../../lib/i18n";

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap(locale => getPeople().map(p => ({ locale, slug: p.slug })));
type P = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params; const p = getPeople().find(x => x.slug === slug);
  if (!p || !isLocale(locale)) return {};
  return { title: pName(p, locale), description: pDesc(p, locale) };
}
const Group = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><div className="plist-h">{title}</div><ul className="plist">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const p = getPeople().find(x => x.slug === slug); if (!p) notFound();
  const d = getDict(locale).detail, paras = pBio(p, locale);
  const rows = ([
    [d.born, p.birth ? fmtDate(p.birth, locale) : null], [d.died, p.death ? fmtDate(p.death, locale) : null],
    [d.birthplace, pBirthplace(p, locale)], [d.citizenship, pList(p, "citizenship", locale).join(", ") || null],
    [d.education, pList(p, "education", locale).slice(0, 3).join(", ") || null], [d.sphere, catName(p.category, locale)],
  ] as [string, string | null][]).filter(([, v]) => v);
  const occ = pList(p, "occupations", locale), aw = pList(p, "awards", locale), wk = pList(p, "works", locale);
  return (<>
    <nav className="crumb" aria-label={d.crumbNav}><Link href={`/${locale}/people`}>{d.people}</Link> / {catName(p.category, locale)}</nav>
    <div className="head">
      <span className="mark round">{p.photo ? <img src={p.photo} alt="" /> : p.name[0]}</span>
      <div><h1>{pName(p, locale)}</h1><p>{pDesc(p, locale)}</p></div>
    </div>
    <div className="detail">
      <div>
        <section className="sect"><h2 className="h2">{d.bio}</h2>
          <div className="read">{paras.map((x, i) => /^=+\s.*\s=+$/.test(x) ? <h3 key={i}>{x.replace(/=+/g, "").trim()}</h3> : <p key={i}>{x}</p>)}</div>
        </section>
        {p.companies.length > 0 && <section className="sect"><h2 className="h2">{d.companiesOf}</h2>
          <table className="rel"><tbody>{p.companies.map(c => <tr key={c.slug}><td><Link href={`/${locale}/companies/${c.slug}`}>{c.name}</Link></td><td>{c.role ? c.role[locale] : d.founder}</td></tr>)}</tbody></table></section>}
        {(occ.length + aw.length + wk.length > 0) && <section className="sect"><h2 className="h2">{d.activity}</h2>
          <Group title={d.occupations} items={occ} /><Group title={d.awards} items={aw} /><Group title={d.works} items={wk} /></section>}
        {p.source && <p className="meta">{d.sourceLabel} <a href={p.source.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{p.source.name}</a></p>}
        {p.wikipedia && <p className="meta">{d.sources} <a href={p.wikipedia} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Wikipedia</a> (CC BY-SA), Wikidata.</p>}
      </div>
      <aside><div className="panel"><h2>{d.facts}</h2><dl className="facts">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div></aside>
    </div>
  </>);
}
