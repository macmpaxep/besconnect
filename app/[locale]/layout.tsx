import "../globals.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Nav from "../../components/Nav";
import { getDict, isLocale, locales } from "../../lib/i18n";

const ui = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-ui", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-serif", display: "swap", axes: ["opsz"] });

type P = { children: React.ReactNode; params: Promise<{ locale: string }> };
export const generateStaticParams = () => locales.map(locale => ({ locale }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) return {};
  const t = getDict(locale);
  return {
    title: { default: t.siteTitle, template: "%s · BESconnect" }, description: t.siteDesc,
    alternates: { languages: Object.fromEntries(locales.map(l => [l, `/${l}`])) },
  };
}

export default async function RootLayout({ children, params }: P) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDict(locale);
  return (
    <html lang={t.htmlLang} className={`${ui.variable} ${serif.variable}`}>
      <body>
        <header className="hdr"><div className="page hdr-in">
          <Link href={`/${locale}`} className="logo" aria-label={t.logoLabel}><b>BES</b>connect</Link>
          <Nav locale={locale} labels={t.nav} />
        </div></header>
        <main className="page">{children}</main>
        <footer className="ftr"><div className="page">
          <p>{t.footerData} <a href="https://www.wikidata.org">Wikidata</a> (CC0), <a href="https://www.wikipedia.org">Wikipedia</a> (CC BY-SA).</p>
          <p>{t.footerNews}</p>
        </div></footer>
      </body>
    </html>
  );
}
