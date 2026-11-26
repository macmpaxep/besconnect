// Incremental translation via Message Batches. Usage: node translate.mjs
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { loadEnv } from "./env.mjs";
loadEnv();
const client = new Anthropic();
const MODEL = "claude-haiku-5-5";
const PRICE = { in: 0.10 / 2, out: 0.50 / 2 }; // Batch = 50% off
const MAX_COST = 3.0;
const BIO_PARAS = 30;
const OUT = "../data/translations/ru.json";
const R = f => JSON.parse(fs.readFileSync("../data/" + f));
const C = R("companies.json"), P = R("people.json"), N = R("news.json");
fs.mkdirSync("../data/translations", { recursive: true });
const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT)) : { companies: {}, people: {}, news: {} };
const save = () => fs.writeFileSync(OUT, JSON.stringify(store));

const SYS = "You are a professional translator for a business directory website. Translate the user's text into Russian. Rules: write person names in standard Russian transliteration (as in Russian Wikipedia); keep company, brand and product names in Latin script; keep numbers, dates and units accurate; do not add, omit or interpret facts; preserve paragraph breaks and any '== Heading ==' markers (translate the heading text); use a neutral formal business register. Output ONLY the translation, no comments.";
const SYS_NEWS = "You write for a business news directory. From the given headline and snippet, output JSON {\"title\": ..., \"brief\": ...} in Russian. \"title\" is a faithful translation of the headline. \"brief\" is a 1-2 sentence neutral retelling in your own words using ONLY facts present in the headline and snippet; never add details, numbers or context that are not given. Never mention the headline, the snippet, the source text or what information is missing or not provided. If the source gives little information, write a single neutral sentence restating the claim made in the headline. Keep company and brand names in Latin script, person names in standard Russian transliteration. Output only the JSON.";
const SYS_NEWS_EN = "You write for a business news directory. From the given headline and snippet, output JSON {\"brief\": ...}: a 1-2 sentence neutral retelling in your own words using ONLY facts present in the headline and snippet; never add details, numbers or context that are not given. Never mention the headline, the snippet, the source text or what information is missing or not provided. If the source gives little information, write a single neutral sentence restating the claim made in the headline. Output only the JSON.";

const tasks = [];
const add = (id, system, text, max) => tasks.push({ custom_id: id, system, text, max });
for (const c of C) {
  if (!store.companies[c.slug]?.extract) add("c-x-" + c.slug, SYS, c.extract, 2500);
  if (!c.descriptionRu && c.description && !store.companies[c.slug]?.description) add("c-d-" + c.slug, SYS, c.description, 200);
}
for (const p of P) {
  const bio = p.bio.split(/\n+/).filter(Boolean).slice(0, BIO_PARAS).join("\n\n");
  if (!store.people[p.slug]?.bio) add("p-b-" + p.slug, SYS, bio, 12000);
  if (!p.descriptionRu && p.description && !store.people[p.slug]?.description) add("p-d-" + p.slug, SYS, p.description, 200);
}
for (const n of N) {
  const t = n.title + "\n" + n.summary;
  if (!store.news[n.id]?.title) add("n-r-" + n.id, SYS_NEWS, t, 600);
  if (!store.news[n.id]?.briefEn) add("n-e-" + n.id, SYS_NEWS_EN, t, 400);
}
const chars = tasks.reduce((s, t) => s + t.text.length, 0);
const est = (chars * 0.45 * PRICE.in + chars * 0.5 * PRICE.out) / 1e6 + tasks.length * 120 * PRICE.in / 1e6;
console.log(`tasks: ${tasks.length}, source chars: ${chars}, estimated Batch cost: $${est.toFixed(2)}`);
if (!tasks.length) { console.log("nothing to translate"); process.exit(0); }
if (est > MAX_COST) { console.error(`Estimate above cap $${MAX_COST}; aborting`); process.exit(1); }

let thinking = { thinking: { type: "disabled" } };
try { await client.messages.create({ model: MODEL, max_tokens: 5, ...thinking, messages: [{ role: "user", content: "hi" }] }); }
catch (e) { if (e.status === 400) thinking = { output_config: { effort: "low" } }; else throw e; }

const batch = await client.messages.batches.create({
  requests: tasks.map(t => ({ custom_id: t.custom_id, params: { model: MODEL, max_tokens: t.max, ...thinking, system: t.system, messages: [{ role: "user", content: t.text }] } })),
});
console.log("batch id:", batch.id);
fs.writeFileSync("../data/translations/batch-ru.json", JSON.stringify({ id: batch.id, at: new Date().toISOString() }));
let b = batch;
while (b.processing_status !== "ended") {
  await new Promise(r => setTimeout(r, 30000));
  b = await client.messages.batches.retrieve(batch.id);
  console.log("status:", b.processing_status, JSON.stringify(b.request_counts));
}

const cyr = s => { const l = (s.match(/\p{L}/gu) || []).length; return l ? (s.match(/[А-Яа-яЁё]/g) || []).length / l : 0; };
const META = /snippet|headline (asks|states|says|indicates|suggests|describes)|does not (include|provide|contain)|no further details|not provided|are provided|анонс|сниппет|в заголовке|не содерж|не указан|не приводит|не предоставл|отсутству|не сообщается/i;
const strip = b => b.split(/(?<=[.!?…])\s+/).filter(x => !META.test(x)).join(" ").trim();
const parseJson = t => JSON.parse(t.replace(/^[^{]*/, "").replace(/[^}]*$/, ""));
let ok = 0, bad = 0, uin = 0, uout = 0; const badKinds = {}; const samples = [];
for await (const r of await client.messages.batches.results(batch.id)) {
  if (r.result.type !== "succeeded") { bad++; continue; }
  const m = r.result.message; uin += m.usage.input_tokens; uout += m.usage.output_tokens;
  const text = m.content.filter(x => x.type === "text").map(x => x.text).join("").trim();
  const [, kind, id] = r.custom_id.match(/^(c-x|c-d|p-b|p-d|n-r|n-e)-(.+)$/);
  try {
    if (kind === "c-x") { if (cyr(text) < 0.5) throw 0; (store.companies[id] ||= {}).extract = text; }
    else if (kind === "c-d") { if (cyr(text) < 0.4) throw 0; (store.companies[id] ||= {}).description = text; }
    else if (kind === "p-b") { if (cyr(text) < 0.5 || m.stop_reason === "max_tokens") throw 0; (store.people[id] ||= {}).bio = text; }
    else if (kind === "p-d") { if (cyr(text) < 0.4) throw 0; (store.people[id] ||= {}).description = text; }
    else if (kind === "n-r") { const j = parseJson(text); j.brief = strip(j.brief); if (!j.brief || cyr(j.title) < 0.5 || cyr(j.brief) < 0.5) throw 0; Object.assign(store.news[id] ||= {}, { title: j.title, brief: j.brief }); }
    else if (kind === "n-e") { const j = parseJson(text); j.brief = strip(j.brief); if (!j.brief) throw 0; (store.news[id] ||= {}).briefEn = j.brief; }
    ok++;
  } catch { bad++; badKinds[kind] = (badKinds[kind] || 0) + 1; if (samples.length < 4) samples.push(kind + ": " + text.slice(0, 120).replace(/\n/g, " ")); }
}
save();
console.log("rejected by kind:", JSON.stringify(badKinds)); samples.forEach(x => console.log("  ", x));
console.log(`done: ok ${ok}, failed/rejected ${bad} (rerun to retry) | tokens in/out ${uin}/${uout} | actual cost $${((uin * PRICE.in + uout * PRICE.out) / 1e6).toFixed(3)}`);
