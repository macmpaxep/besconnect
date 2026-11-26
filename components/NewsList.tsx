"use client";
import { useState } from "react";
import type { News } from "@/lib/data";

export default function NewsList({ news, sources }: { news: News[]; sources: string[] }) {
  const [src, setSrc] = useState("all"); const [n, setN] = useState(30); const [q, setQ] = useState("");
  const f = news.filter(x => (src === "all" || x.source === src) && (!q || (x.title + x.summary).toLowerCase().includes(q.toLowerCase())));
  return (<div>
    <input className="search" placeholder="Поиск по новостям…" value={q} onChange={e => { setQ(e.target.value); setN(30); }} />
    <div className="chips">
      <button className={"chip" + (src === "all" ? " on" : "")} onClick={() => setSrc("all")}>Все источники<small>{news.length}</small></button>
      {sources.map(s => <button key={s} className={"chip" + (src === s ? " on" : "")} onClick={() => { setSrc(s); setN(30); }}>{s}</button>)}
    </div>
    <div className="news">
      {f.slice(0, n).map(x => (
        <a key={x.id} className="n-item" href={x.link} target="_blank" rel="noopener noreferrer">
          {x.image && <img src={x.image} alt="" loading="lazy" />}
          <div><div className="meta">{x.source} · {new Date(x.date).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}</div><h3>{x.title}</h3>{x.summary && <p>{x.summary}</p>}</div>
        </a>))}
    </div>
    {n < f.length && <button className="more" onClick={() => setN(n + 30)}>Показать ещё ({f.length - n})</button>}
  </div>);
}
