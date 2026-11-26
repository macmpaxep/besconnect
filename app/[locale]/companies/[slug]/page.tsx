import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCompanies, catName, cName, cDesc, cExtract, cCountry, cHq, getCategories } from "../../../../lib/data";
import { fmtYear, fmtMoney, fmtNum } from "../../../../lib/format";
import { getDict, isLocale, locales } from "../../../../lib/i18n";

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap(locale => getCompanies().map(c => ({ locale, slug: c.slug })));
type P = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, slug } = await params; const c = getCompanies().find(x => x.slug === slug);
  if (!c || !isLocale(locale)) return {};
  return { title: cName(c, locale), description: cDesc(c, locale) };
}
const Group = ({ title, items }: { title: string; items: string[] }) => items.length ? (<><div className="plist-h">{title}</div><ul className="plist">{items.map(i => <li key={i}>{i}</li>)}</ul></>) : null;

export default async function Page({ params }: P) {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const c = getCompanies().find(x => x.slug === slug); if (!c) notFound();
  const t = getDict(locale), d = t.detail;
  const hasPortfolio = c.products.length + c.brands.length + c.subsidiaries.length > 0;
  const similar = getCompanies().filter(x => x.category === c.category && x.slug !== c.slug).slice(0, 8);
  const site = c.website?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  const rows = ([
    [d.country, cCountry(c, locale)], [d.hq, cHq(c, locale)], [d.founded, c.founded ? fmtYear(c.founded) : null],
    [d.employees, c.employees ? fmtNum(c.employees, locale) : null], [d.revenue, c.revenue ? fmtMoney(c.revenue, locale, { bn: d.mlrd, m: d.mln }) : null],
    [d.ceo, locale === "ru" ? c.ceoRu || c.ceo : c.ceo], [d.parent, locale === "ru" ? c.parentRu || c.parent : c.parent],
    [d.site, c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer">{site}</a> : null],
  ] as [string, React.ReactNode][]).filter(([, v]) => v);
  const sphere = catName(c.category, locale), desc = cDesc(c, locale);
  return (<>
    <nav className="crumb" aria-label={d.crumbNav}><Link href={`/${locale}/companies`}>{d.companies}</Link> / {sphere}</nav>
    <div className="head">
      <span className="mark">{c.logo ? <img src={c.logo} alt="" /> : c.name[0]}</span>
      <div>
        <h1>{cName(c, locale)}</h1>
        <p>{desc} <span className="tag">{sphere}</span></p>
      </div>
    </div>
    <div className="detail">
      <div>
        <section className="sect"><h2 className="h2">{d.about}</h2><div className="read"><p>{cExtract(c, locale)}</p></div></section>
        <section className="sect"><h2 className="h2">{d.portfolio}</h2>
          {hasPortfolio ? (<><Group title={d.products} items={c.products} /><Group title={d.brands} items={c.brands} /><Group title={d.subs} items={c.subsidiaries} /></>) : <p className="meta">{d.noPortfolio}</p>}
        </section>
        {c.founderLinks.length > 0 && <section className="sect"><h2 className="h2">{d.founders}</h2>
          <table className="rel"><tbody>{c.founderLinks.map(f => <tr key={f.name}><td>{f.slug ? <Link href={`/${locale}/people/${f.slug}`}>{f.name}</Link> : f.name}</td><td>{f.slug ? d.profile : ""}</td></tr>)}</tbody></table>
        </section>}
        {c.wikipedia && <p className="meta">{d.sources} <a href={c.wikipedia} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Wikipedia</a>, Wikidata.</p>}
      </div>
      <aside>
        <div className="panel"><h2>{d.requisites}</h2><dl className="facts">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div>
        {similar.length > 0 && <div className="panel"><h2>{d.similar}</h2>
          <dl className="facts">{similar.map(s => <div key={s.slug}><dt><Link href={`/${locale}/companies/${s.slug}`}>{cName(s, locale)}</Link></dt><dd>{cCountry(s, locale)}</dd></div>)}</dl></div>}
      </aside>
    </div>
  </>);
}
