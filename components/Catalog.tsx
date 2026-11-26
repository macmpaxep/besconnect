"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { plural, type Locale } from "../lib/i18n";

export type Item = { slug: string; name: string; cat: string; img: string | null; round?: boolean; cells: string[] };
export type Cat = { id: string; name: string; count: number };
export type Labels = { sphere: string; allSpheres: string; all: string; index: string; catalog: string; empty: string; columns: string[]; placeholder: string; noun: [string, string, string]; nameCol: string };

const first = (n: string) => { let c = n.trim()[0]?.toUpperCase() || "#"; if (/\p{Script=Latin}/u.test(c)) c = c.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); return /\p{L}/u.test(c) ? c : "#"; };
const rank = (l: string, loc: Locale) => (l === "#" ? 3 : /[A-Z]/.test(l) ? (loc === "ru" ? 2 : 1) : /[А-ЯЁ]/.test(l) ? (loc === "ru" ? 1 : 2) : 3);
const cmp = (loc: Locale) => (a: string, b: string) => rank(a, loc) - rank(b, loc) || a.localeCompare(b, loc);

export default function Catalog({ items, cats, base, labels, locale }: { items: Item[]; cats: Cat[]; base: string; labels: Labels; locale: Locale }) {
  const [cat, setCat] = useState("all");
  const [letter, setLetter] = useState("");
  const [q, setQ] = useState("");
  const allLetters = useMemo(() => [...new Set(items.map(i => first(i.name)))].sort(cmp(locale)), [items, locale]);
  const byCat = useMemo(() => items.filter(i => cat === "all" || i.cat === cat), [items, cat]);
  const letters = useMemo(() => new Set(byCat.map(i => first(i.name))), [byCat]);
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return byCat.filter(i => (!letter || first(i.name) === letter) && (!t || (i.name + " " + i.cells.join(" ")).toLowerCase().includes(t)));
  }, [byCat, letter, q]);
  const groups = useMemo(() => {
    const g: Record<string, Item[]> = {};
    shown.forEach(i => (g[first(i.name)] ||= []).push(i));
    return Object.entries(g).sort(([a], [b]) => cmp(locale)(a, b)).map(([l, arr]) => [l, arr.sort((x, y) => x.name.localeCompare(y.name, locale))] as const);
  }, [shown, locale]);
  const pick = (id: string) => { setCat(id); setLetter(""); };
  const n = shown.length;

  return (
    <div className="cat">
      <aside className="side" aria-label={labels.sphere}>
        <h3>{labels.sphere}</h3>
        <button aria-pressed={cat === "all"} onClick={() => pick("all")}>{labels.allSpheres} <span>{items.length}</span></button>
        {cats.filter(c => c.count > 0).map(c => <button key={c.id} aria-pressed={cat === c.id} onClick={() => pick(c.id)}>{c.name} <span>{c.count}</span></button>)}
      </aside>
      <section aria-label={labels.catalog}>
        <div className="tools">
          <input className="search" type="search" placeholder={labels.placeholder} value={q} onChange={e => setQ(e.target.value)} aria-label={labels.placeholder} />
          <select className="sel" value={cat} onChange={e => pick(e.target.value)} aria-label={labels.sphere}>
            <option value="all">{labels.allSpheres}</option>
            {cats.filter(c => c.count > 0).map(c => <option key={c.id} value={c.id}>{c.name} ({c.count})</option>)}
          </select>
        </div>
        <div className="abc" role="group" aria-label={labels.index}>
          <button aria-pressed={!letter} onClick={() => setLetter("")}>{labels.all}</button>
          {allLetters.map(l => <button key={l} disabled={!letters.has(l)} aria-pressed={letter === l} onClick={() => setLetter(l)}>{l}</button>)}
        </div>
        <p className="count" aria-live="polite">{n.toLocaleString(locale === "ru" ? "ru-RU" : "en-GB")} {plural(n, labels.noun, locale)}</p>
        {n === 0 ? <p className="empty">{labels.empty}</p> : (
          <table className="tbl">
            <thead><tr><th>{labels.nameCol}</th>{labels.columns.map((c, i) => <th key={c} className={i > 0 ? "hide-m" : ""}>{c}</th>)}</tr></thead>
            <tbody>
              {groups.map(([l, arr]) => [
                <tr key={"g" + l} className="grp"><th colSpan={labels.columns.length + 1}>{l}</th></tr>,
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
