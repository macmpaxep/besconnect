import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import Nav from "../components/Nav";

const ui = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-ui", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin", "cyrillic"], variable: "--font-serif", display: "swap", axes: ["opsz"] });

export const metadata: Metadata = {
  title: { default: "BESconnect — международные компании и предприниматели", template: "%s · BESconnect" },
  description: "Каталог международных компаний, предпринимателей и деловые новости.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${ui.variable} ${serif.variable}`}>
      <body>
        <header className="hdr"><div className="page hdr-in">
          <Link href="/" className="logo" aria-label="BESconnect, на главную"><b>BES</b>connect</Link>
          <Nav />
        </div></header>
        <main className="page">{children}</main>
        <footer className="ftr"><div className="page">
          <p>Источники данных: <a href="https://www.wikidata.org">Wikidata</a> (CC0), <a href="https://www.wikipedia.org">Wikipedia</a> (CC BY-SA).</p>
          <p>Новости: BBC, CNBC, The New York Times, The Wall Street Journal, The Economist, Financial Times, Forbes, The Economic Times, Al Jazeera. Приводятся заголовок и ссылка на оригинал.</p>
        </div></footer>
      </body>
    </html>
  );
}
