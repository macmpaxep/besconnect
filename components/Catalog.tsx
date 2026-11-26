"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type Item = { slug: string; name: string; sub: string; cat: string; img: string | null; round?: boolean };
export type Cat = { id: string; name: string; count: number };

export default function Catalog({ items, cats, base, placeholder }: { items: Item[]; cats: Cat[]; base: string; placeholder: string }) {
  const [cat, setCat] = useState<string>("all");
  const [letter, setLetter] = useState<string>("");
  const [q, setQ] = useState("");
  const first = (n: string) => { const c = n.trim()[0]?.toUpperCase() || "#"; return /[A-Z]/.test(c) ? c : "#"; };
  const byCat = useMemo(() => items.filter(i => cat === "all" || i.cat === cat), [items, cat]);
  const letters = useMemo(() => new Set(byCat.map(i => first(i.name))), [byCat]);
  const shown = useMemo(() => byCat.filter(i => (!letter || first(i.name) === letter) && (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.sub.toLowerCase().includes(q.toLowerCase()))), [byCat, letter, q]);
  const groups = useMemo(() => { const g: Record<string, Item[]> = {}; shown.forEach(i => (g[first(i.name)] ||= []).push(i)); return Object.entries(g).sort(([a], [b]) => a.localeCompare(b)); }, [shown]);
  const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");
  return (
    <div>
      <input className="search" placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} />
      <div className="chips">
        <button className={"chip" + (cat === "all" ? " on" : "")} onClick={() => { setCat("all"); setLetter(""); }}>Все сферы<small>{items.length}</small></button>
        {cats.filter(c => c.count > 0).map(c => (
          <button key={c.id} className={"chip" + (cat === c.id ? " on" : "")} onClick={() => { setCat(c.id); setLetter(""); }}>{c.name}<small>{c.count}</small></button>
        ))}
      </div>
      <div className="alpha">
        <button className={!letter ? "on" : ""} onClick={() => setLetter("")}>Все</button>
        {ABC.map(l => <button key={l} disabled={!letters.has(l)} className={letter === l ? "on" : ""} onClick={() => setLetter(l)}>{l}</button>)}
      </div>
      <p className="lead">Найдено: {shown.length}</p>
      {groups.map(([l, arr]) => (
        <section key={l}>
          <div className="letter">{l}</div>
          <div className="grid">
            {arr.map(i => (
              <Link key={i.slug} href={`${base}/${i.slug}`} className="card">
                <div className="row">
                  <div className={"ava" + (i.round ? " round" : "")}>{i.img ? <img src={i.img} alt="" loading="lazy" className={i.round ? "cover" : ""} /> : i.name[0]}</div>
                  <div><h3 style={{ margin: 0 }}>{i.name}</h3><p>{i.sub}</p></div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
