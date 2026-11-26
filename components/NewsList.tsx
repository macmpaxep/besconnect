"use client";
import Link from "next/link";
import { useState } from "react";
import { fmtShort } from "../lib/format";
import { plural, type Locale } from "../lib/i18n";

export type NewsItem = { id: string; title: string; text: string; source: string; date: string; image: string | null };

export function NewsRow({ x, locale }: { x: NewsItem; locale: Locale }) {
  return (
    <Link className="nrow" href={`/${locale}/news/${x.id}`}>
      <div>
        <div className="meta"><b>{x.source}</b> · {fmtShort(x.date, locale)}</div>
        <h3>{x.title}</h3>
        {x.text && <p>{x.text}</p>}
      </div>
      {x.image && <img src={x.image} alt="" loading="lazy" />}
    </Link>
  );
}

export default function NewsList({ news, sources, locale, labels }: { news: NewsItem[]; sources: string[]; locale: Locale; labels: { search: string; allSources: string; source: string; items: [string, string, string]; more: string } }) {
  const [src, setSrc] = useState("all"); const [n, setN] = useState(25); const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const f = news.filter(x => (src === "all" || x.source === src) && (!t || (x.title + " " + x.text).toLowerCase().includes(t)));
  return (
    <div>
      <div className="tools">
        <input className="search" type="search" placeholder={labels.search} value={q} onChange={e => { setQ(e.target.value); setN(25); }} aria-label={labels.search} />
      </div>
      <div className="src" role="group" aria-label={labels.source}>
        <button aria-pressed={src === "all"} onClick={() => { setSrc("all"); setN(25); }}>{labels.allSources}</button>
        {sources.map(s => <button key={s} aria-pressed={src === s} onClick={() => { setSrc(s); setN(25); }}>{s}</button>)}
      </div>
      <p className="count" aria-live="polite">{f.length.toLocaleString(locale === "ru" ? "ru-RU" : "en-GB")} {plural(f.length, labels.items, locale)}</p>
      <div>{f.slice(0, n).map(x => <NewsRow key={x.id} x={x} locale={locale} />)}</div>
      {n < f.length && <button className="more" onClick={() => setN(n + 25)}>{labels.more}</button>}
    </div>
  );
}
