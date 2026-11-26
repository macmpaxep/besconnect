import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Catalog from "../../../components/Catalog";
import { getCompanies, getCategories, catName, cName, cCountry } from "../../../lib/data";
import { fmtYear, fmtNum } from "../../../lib/format";
import { getDict, isLocale } from "../../../lib/i18n";

type P = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> { const { locale } = await params; return { title: isLocale(locale) ? getDict(locale).cat.companiesTitle : "" }; }
export default async function Page({ params }: P) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDict(locale), C = getCompanies(), K = getCategories();
  const items = C.map(c => ({ slug: c.slug, name: cName(c, locale), cat: c.category, img: c.logo, cells: [cCountry(c, locale) || "—", catName(c.category, locale), fmtYear(c.founded), fmtNum(c.employees, locale)] }));
  const cats = K.map(k => ({ id: k.id, name: locale === "ru" ? k.name : k.nameEn, count: k.companies }));
  const labels = { ...t.cat, columns: [t.cat.colCountry, t.cat.colSphere, t.cat.colFounded, t.cat.colEmployees], placeholder: t.cat.searchCompanies, noun: t.cat.nounCompanies, nameCol: t.nav.companies };
  return (<>
    <h1 className="title">{t.cat.companiesTitle}</h1>
    <p className="sub">{t.cat.companiesSub}</p>
    <Catalog items={items} cats={cats} base={`/${locale}/companies`} labels={labels} locale={locale} />
  </>);
}
