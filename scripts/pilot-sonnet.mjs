import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { loadEnv } from "./env.mjs";
loadEnv();
const client = new Anthropic();
const MODEL = "claude-sonnet-5-5";
const PRICE = { in: 2.0, out: 10.0 }; // $ per 1M tokens (Haiku 5.5, prompts <=100K)
const LANGS = { kk: "Kazakh (modern Cyrillic orthography, Republic of Kazakhstan)" };
const R = f => JSON.parse(fs.readFileSync("../data/" + f));
const C = R("companies.json"), P = R("people.json"), N = R("news.json");

const SYS = lang => `You are a professional translator for a business directory website. Translate the user's text into ${LANGS[lang]}.
Rules: keep company, brand and person names in their original Latin spelling; keep numbers, dates and units accurate; do not add, omit or interpret facts; preserve paragraph breaks; use a neutral formal business register. Output ONLY the translation, no comments.`;
const SYS_NEWS = lang => `You write for a business news directory. From the given headline and snippet, produce JSON {"title": ..., "brief": ...} in ${LANGS[lang]}. "title" is a faithful translation of the headline. "brief" is a 1-2 sentence neutral retelling in your own words, using ONLY facts present in the headline and snippet; never add details, numbers or context that are not given. Keep proper names in original Latin spelling. Output only the JSON.`;

const usage = { in: 0, out: 0 }; const byKind = {};
async function call(system, text, kind, lang) {
  let r;
  try { r = await client.messages.create({ model: MODEL, max_tokens: 4096, thinking: { type: "disabled" }, system, messages: [{ role: "user", content: text }] }); }
  catch (e) { if (e.status === 400) r = await client.messages.create({ model: MODEL, max_tokens: 4096, output_config: { effort: "low" }, system, messages: [{ role: "user", content: text }] }); else throw e; }
  const out = r.content.filter(b => b.type === "text").map(b => b.text).join("");
  const k = kind + ":" + lang; byKind[k] ||= { in: 0, out: 0, srcChars: 0, outChars: 0, n: 0 };
  byKind[k].in += r.usage.input_tokens; byKind[k].out += r.usage.output_tokens; byKind[k].srcChars += text.length; byKind[k].outChars += out.length; byKind[k].n++;
  usage.in += r.usage.input_tokens; usage.out += r.usage.output_tokens;
  return out;
}
const pick = (a, n) => a.filter((_, i) => i % Math.floor(a.length / n) === 0).slice(0, n);
const comps = pick(C, 10);
const bigPeople = P.filter(p => p.bio.length > 3000); const people = pick(bigPeople, 8);
const news = pick(N, 10);
const bioText = p => p.bio.split(/\n+/).filter(Boolean).slice(0, 8).join("\n\n"); // first 8 paragraphs

const result = [];
for (const lang of Object.keys(LANGS)) {
  for (const c of comps) result.push({ kind: "company", id: c.slug, lang, src: c.extract, out: await call(SYS(lang), c.extract, "company", lang) });
  for (const p of people) { const t = bioText(p); result.push({ kind: "bio", id: p.slug, lang, src: t, out: await call(SYS(lang), t, "bio", lang) }); }
  for (const n of news) { const t = n.title + "\n" + n.summary; result.push({ kind: "news", id: n.id, lang, src: t, out: await call(SYS_NEWS(lang), t, "news", lang) }); }
}
fs.mkdirSync("../data/pilot", { recursive: true });
fs.writeFileSync("../data/pilot/pilot-sonnet-kk.json", JSON.stringify(result, null, 1));
const cost = u => (u.in * PRICE.in + u.out * PRICE.out) / 1e6;
console.log("PILOT calls:", result.length, "| tokens in/out:", usage.in, usage.out, "| cost $" + cost(usage).toFixed(4));
console.table(Object.entries(byKind).map(([k, v]) => ({ kind: k, n: v.n, in_tok: v.in, out_tok: v.out, in_per_char: +(v.in / v.srcChars).toFixed(3), out_per_char: +(v.out / v.srcChars).toFixed(3) })));

// full-corpus estimate from measured per-char ratios (source chars -> tokens)
const corpus = {
  company: C.reduce((s, c) => s + c.extract.length + [...c.products, ...c.brands, ...c.subsidiaries].join(", ").length, 0),
  bio: P.reduce((s, p) => s + p.bio.split(/\n+/).filter(Boolean).slice(0, 60).join("\n\n").length, 0),
  news: N.reduce((s, n) => s + n.title.length + n.summary.length + 2, 0),
};
let total = 0, totalBatch = 0;
for (const lang of Object.keys(LANGS)) for (const kind of ["company", "bio", "news"]) {
  const m = byKind[kind + ":" + lang]; const inTok = corpus[kind] * (m.in / m.srcChars), outTok = corpus[kind] * (m.out / m.srcChars);
  const c = (inTok * PRICE.in + outTok * PRICE.out) / 1e6; total += c;
}
console.log("corpus chars:", corpus);
console.log("ESTIMATE full run (ru+kk): $" + total.toFixed(2), "| with Batch (-50%): $" + (total / 2).toFixed(2));
