import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "BESconnect — международные компании и предприниматели", template: "%s · BESconnect" },
  description: "Агрегатор международных компаний, предпринимателей и деловых новостей. Данные: Wikidata, Wikipedia, RSS.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru"><body>
      <header className="hdr"><div className="wrap hdr-in">
        <Link href="/" className="logo">BES<span>connect</span></Link>
        <nav><Link href="/companies">Компании</Link><Link href="/people">Предприниматели</Link><Link href="/news">Новости</Link></nav>
      </div></header>
      <main className="wrap">{children}</main>
      <footer className="ftr"><div className="wrap">Данные: <a href="https://www.wikidata.org">Wikidata</a> (CC0), <a href="https://www.wikipedia.org">Wikipedia</a> (CC BY-SA), RSS-ленты BBC, CNBC, NYT, WSJ, The Economist, FT, Forbes, ET, Al Jazeera. Новости — заголовок и ссылка на оригинал.</div></footer>
    </body></html>
  );
}
