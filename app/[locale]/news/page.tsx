import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NewsList from "../../../components/NewsList";
import { getNews, newsView } from "../../../lib/data";
import { getDict, isLocale } from "../../../lib/i18n";
import { alt } from "../../../lib/seo";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> { const { locale } = await params; return { alternates: alt(locale, "/news"), title: isLocale(locale) ? getDict(locale).news.title : "" }; }
export default async function Page({ params }: P) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDict(locale), N = getNews();
  const items = N.map(n => ({ id: n.id, source: n.source, date: n.date, image: n.image, ...newsView(n, locale) }));
  const sources = [...new Set(N.map(n => n.source))];
  return (<>
    <h1 className="title">{t.news.title}</h1>
    <p className="sub">{t.news.sub}</p>
    <div style={{ maxWidth: 860 }}><NewsList news={items} sources={sources} locale={locale} labels={t.news} /></div>
  </>);
}
