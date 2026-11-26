"use client";
import { useState } from "react";
import type { News } from "../lib/data";
import { fmtShort } from "../lib/format";

export function NewsRow({ x }: { x: News }) {
  return (
    <a className="nrow" href={x.link} target="_blank" rel="noopener noreferrer">
      <div>
        <div className="meta"><b>{x.source}</b> · {fmtShort(x.date)}</div>
        <h3>{x.title}</h3>
        {x.summary && <p>{x.summary}</p>}
      </div>
      {x.image && <img src={x.image} alt="" loading="lazy" />}
    </a>
  );
}

export default function NewsList({ news, sources }: { news: News[]; sources: string[] }) {
  const [src, setSrc] = useState("all"); const [n, setN] = useState(25); const [q, setQ] = useState("");
  const t = q.trim().toLowerCase();
  const f = news.filter(x => (src === "all" || x.source === src) && (!t || (x.title + " " + x.summary).toLowerCase().includes(t)));
  return (
    <div>
      <div className="tools">
        <input className="search" type="search" placeholder="Поиск по новостям" value={q} onChange={e => { setQ(e.target.value); setN(25); }} aria-label="Поиск по новостям" />
      </div>
      <div className="src" role="group" aria-label="Источник">
        <button aria-pressed={src === "all"} onClick={() => { setSrc("all"); setN(25); }}>Все источники</button>
        {sources.map(s => <button key={s} aria-pressed={src === s} onClick={() => { setSrc(s); setN(25); }}>{s}</button>)}
      </div>
      <p className="count" aria-live="polite">{f.length.toLocaleString("ru-RU")} материалов</p>
      <div>{f.slice(0, n).map(x => <NewsRow key={x.id} x={x} />)}</div>
      {n < f.length && <button className="more" onClick={() => setN(n + 25)}>Показать ещё</button>}
    </div>
  );
}
