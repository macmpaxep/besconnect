"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type Item = { slug: string; name: string; cat: string; img: string | null; round?: boolean; cells: string[] };
export type Cat = { id: string; name: string; count: number };
const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");
const first = (n: string) => { const c = n.trim()[0]?.toUpperCase() || "#"; return /[A-Z]/.test(c) ? c : "#"; };

export default function Catalog({ items, cats, base, columns, placeholder, noun }: {
  items: Item[]; cats: Cat[]; base: string; columns: string[]; placeholder: string; noun: [string, string, string];
}) {
  const [cat, setCat] = useState("all");
  const [letter, setLetter] = useState("");
  const [q, setQ] = useState("");
  const byCat = useMemo(() => items.filter(i => cat === "all" || i.cat === cat), [items, cat]);
  const letters = useMemo(() => new Set(byCat.map(i => first(i.name))), [byCat]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return byCat.filter(i => (!letter || first(i.name) === letter) && (!t || (i.name + " " + i.cells.join(" ")).toLowerCase().includes(t)));
  }, [byCat, letter, q]);
  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    shown.forEach(i => (g[first(i.name)] ||= []).push(i));
    return Object.entries(g).sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)));
  }, [shown]);
  const pick = (id: string) => { setCat(id); setLetter(""); };
  const n = shown.length, m = n % 10, m100 = n % 100;
  const word = m === 1 && m100 !== 11 ? noun[0] : m >= 2 && m <= 4 && (m100 < 12 || m100 > 14) ? noun[1] : noun[2];

  return (
    <div className="cat">
      <aside className="side" aria-label="Фильтр по сфере деятельности">
        <h3>Сфера деятельности</h3>
        <button aria-pressed={cat === "all"} onClick={() => pick("all")}>Все сферы <span>{items.length}</span></button>
        {cats.filter(c => c.count > 0).map(c => (
          <button key={c.id} aria-pressed={cat === c.id} onClick={() => pick(c.id)}>{c.name} <span>{c.count}</span></button>
        ))}
      </aside>
      <section aria-label="Каталог">
        <div className="tools">
          <input className="search" type="search" placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} aria-label={placeholder} />
          <select className="sel" value={cat} onChange={e => pick(e.target.value)} aria-label="Сфера деятельности">
            <option value="all">Все сферы</option>
            {cats.filter(c => c.count > 0).map(c => <option key={c.id} value={c.id}>{c.name} ({c.count})</option>)}
          </select>
        </div>
        <div className="abc" role="group" aria-label="Алфавитный указатель">
          <button aria-pressed={!letter} onClick={() => setLetter("")}>Все</button>
          {ABC.map(l => <button key={l} disabled={!letters.has(l)} aria-pressed={letter === l} onClick={() => setLetter(l)}>{l}</button>)}
        </div>
        <p className="count" aria-live="polite">{n.toLocaleString("ru-RU")} {word}</p>
        {n === 0 ? <p className="empty">Ничего не найдено. Сбросьте фильтры или измените запрос.</p> : (
          <table className="tbl">
            <thead><tr><th>Название</th>{columns.map((c, i) => <th key={c} className={i > 0 ? "hide-m" : ""}>{c}</th>)}</tr></thead>
            <tbody>
              {groups.map(([l, arr]) => [
                <tr key={"g" + l} className="grp"><th colSpan={columns.length + 1}>{l}</th></tr>,
                ...arr.map(i => (
                  <tr key={i.slug}>
                    <td><div className="who">
                      <span className={"mark" + (i.round ? " round" : "")}>{i.img ? <img src={i.img} alt="" loading="lazy" /> : i.name[0]}</span>
                      <Link href={`${base}/${i.slug}`}>{i.name}</Link>
                    </div></td>
                    {i.cells.map((c, k) => <td key={k} className={k > 0 ? "hide-m" : ""}><span className="clip">{c}</span></td>)}
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
