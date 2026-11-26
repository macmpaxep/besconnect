import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getNews, newsView, relatedCompanies, cName, cCountry } from "../../../../lib/data";
import { fmtShort } from "../../../../lib/format";
import { getDict, isLocale, locales } from "../../../../lib/i18n";
import { alt } from "../../../../lib/seo";

export const dynamicParams = false;
export const generateStaticParams = () => locales.flatMap(locale => getNews().map(n => ({ locale, id: n.id })));
type P = { params: Promise<{ locale: string; id: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, id } = await params; const n = getNews().find(x => x.id === id);
  if (!n || !isLocale(locale)) return {};
  const v = newsView(n, locale); return { alternates: alt(locale, `/news/${id}`), title: v.title, description: v.text };
}

export default async function Page({ params }: P) {
  const { locale, id } = await params; if (!isLocale(locale)) notFound();
  const n = getNews().find(x => x.id === id); if (!n) notFound();
  const t = getDict(locale), v = newsView(n, locale), rel = relatedCompanies(n);
  return (<>
    <nav className="crumb" aria-label={t.detail.crumbNav}><Link href={`/${locale}/news`}>{t.news.back}</Link></nav>
    <article style={{ maxWidth: 760, margin: "28px 0 0" }}>
      <div className="meta"><b>{n.source}</b> · {fmtShort(n.date, locale)}</div>
      <h1 className="title" style={{ margin: "12px 0 8px", fontSize: "clamp(30px,4vw,44px)" }}>{v.title}</h1>
      {locale === "ru" && v.translated && <p className="orig">{t.news.original}: {n.title}</p>}
      {n.image && <img src={n.image} alt="" style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 4, margin: "28px 0 8px", background: "var(--tint)" }} />}
      <div className="read" style={{ marginTop: 24 }}><p>{v.text}</p></div>
      <p className="callout">{t.news.note}</p>
      <p style={{ margin: "28px 0 0" }}><a className="btn" href={n.link} target="_blank" rel="noopener noreferrer">{t.news.read} · {n.source}</a></p>
      {rel.length > 0 && <section style={{ marginTop: 56 }}>
        <h2 className="label">{t.news.related}</h2>
        <table className="mini"><tbody>{rel.map(c => <tr key={c.slug}><td><div className="who"><span className="mark">{c.logo ? <img src={c.logo} alt="" /> : c.name[0]}</span><Link href={`/${locale}/companies/${c.slug}`}>{cName(c, locale)}</Link></div></td><td>{cCountry(c, locale)}</td></tr>)}</tbody></table>
      </section>}
    </article>
  </>);
}
