import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Catalog from "../../../components/Catalog";
import { getPeople, getCategories, catName, pName, pDesc, pCountry } from "../../../lib/data";
import { fmtYear } from "../../../lib/format";
import { getDict, isLocale } from "../../../lib/i18n";
import { alt } from "../../../lib/seo";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> { const { locale } = await params; return { alternates: alt(locale, "/people"), title: isLocale(locale) ? getDict(locale).cat.peopleTitle : "" }; }
export default async function Page({ params }: P) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDict(locale), P = getPeople(), K = getCategories();
  const items = P.map(p => ({ slug: p.slug, name: pName(p, locale), cat: p.category, img: p.photo, round: true,
    cells: [pDesc(p, locale) || "—", pCountry(p, locale) || "—", catName(p.category, locale), p.birth ? fmtYear(p.birth) + (p.death ? "–" + fmtYear(p.death) : "") : "—"] }));
  const cats = K.map(k => ({ id: k.id, name: locale === "ru" ? k.name : k.nameEn, count: k.people }));
  const labels = { ...t.cat, columns: [t.cat.colDescription, t.cat.colCountry, t.cat.colSphere, t.cat.colLife], placeholder: t.cat.searchPeople, noun: t.cat.nounPeople, nameCol: t.nav.people };
  return (<>
    <h1 className="title">{t.cat.peopleTitle}</h1>
    <p className="sub">{t.cat.peopleSub}</p>
    <Catalog items={items} cats={cats} base={`/${locale}/people`} labels={labels} locale={locale} />
  </>);
}
