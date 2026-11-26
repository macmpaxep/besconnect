import { getJSON, sleep } from "./lib.mjs";
import fs from "fs";
const { companies, people } = JSON.parse(fs.readFileSync("../data/ids.json"));
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));
const W = "https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&languages=en|ru&languagefallback=1&origin=*";
async function entities(ids, props) {
  const out = {};
  for (const c of chunk(ids, 40)) {
    const j = await getJSON(`${W}&props=${props}&ids=${c.join("|")}`);
    Object.assign(out, j?.entities || {}); await sleep(300);
  }
  return out;
}
const claims = (e, p) => (e.claims?.[p] || []).map(s => s.mainsnak?.datavalue?.value).filter(v => v != null);
const ids = (e, p) => claims(e, p).map(v => v.id).filter(Boolean);
const str = (e, p) => claims(e, p).find(v => typeof v === "string");
const time = (e, p) => { const v = claims(e, p)[0]; return v?.time ? v.time.replace(/^\+/, "").slice(0, 10).replace(/-00/g, "-01") : null; };
const amount = (e, p) => { const v = claims(e, p).slice(-1)[0]; return v?.amount ? Number(v.amount) : null; };
const lab = (e, l) => e?.labels?.en?.value || e?.labels?.ru?.value;
const labRu = e => e?.labels?.ru?.language === "ru" ? e.labels.ru.value : null;
const logo = f => f ? "https://commons.wikimedia.org/wiki/Special:FilePath/" + encodeURIComponent(f) + "?width=300" : null;

const ce = await entities(companies, "labels|descriptions|claims|sitelinks");
const pe = await entities(people, "labels|descriptions|claims|sitelinks");
// collect referenced ids for labels
const refs = new Set();
for (const e of Object.values(ce)) for (const p of ["P452","P17","P159","P112","P1056","P355","P1830","P749","P127","P169"]) ids(e, p).forEach(i => refs.add(i));
for (const e of Object.values(pe)) for (const p of ["P19","P27","P69","P106","P800","P166","P1830","P108"]) ids(e, p).forEach(i => refs.add(i));
const le = await entities([...refs], "labels|descriptions");
const L = i => le[i] ? lab(le[i]) : null;
const Ls = (e, p, n = 12) => [...new Set(ids(e, p).map(L).filter(Boolean))].slice(0, n);

async function wiki(title) {
  if (!title) return null;
  const j = await getJSON("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title.replace(/ /g, "_")));
  return j ? { extract: j.extract, thumb: j.thumbnail?.source || null, url: j.content_urls?.desktop?.page } : null;
}
async function fullBio(title) {
  const j = await getJSON("https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&format=json&redirects=1&titles=" + encodeURIComponent(title));
  const p = j && Object.values(j.query.pages)[0];
  return p?.extract || null;
}
async function pool(items, fn, n = 6) {
  const res = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; res[k] = await fn(items[k]); } }));
  return res;
}

const outC = (await pool(companies.filter(i => ce[i]), async id => {
  const e = ce[id]; const t = e.sitelinks?.enwiki?.title; const w = await wiki(t);
  return { id, name: lab(e), nameRu: labRu(e), description: e.descriptions?.en?.value || "", website: str(e, "P856") || null,
    country: Ls(e, "P17", 1)[0] || null, hq: Ls(e, "P159", 1)[0] || null, founded: time(e, "P571"), employees: amount(e, "P1128"), revenue: amount(e, "P2139"),
    industries: Ls(e, "P452", 6), founders: Ls(e, "P112", 6), ceo: Ls(e, "P169", 1)[0] || null, parent: Ls(e, "P749", 1)[0] || null,
    products: Ls(e, "P1056", 15), subsidiaries: Ls(e, "P355", 15), brands: Ls(e, "P1830", 15),
    logo: logo(str(e, "P154")), wikipedia: w?.url || null, extract: w?.extract || "", thumb: w?.thumb || null, wikiTitle: t || null };
})).filter(c => c.name && c.extract);

const outP = (await pool(people.filter(i => pe[i]), async id => {
  const e = pe[id]; const t = e.sitelinks?.enwiki?.title; if (!t) return null;
  const w = await wiki(t); const bio = await fullBio(t);
  return { id, name: lab(e), nameRu: labRu(e), description: e.descriptions?.en?.value || "", birth: time(e, "P569"), death: time(e, "P570"),
    birthplace: Ls(e, "P19", 1)[0] || null, citizenship: Ls(e, "P27", 2), education: Ls(e, "P69", 5), occupations: Ls(e, "P106", 8),
    awards: Ls(e, "P166", 8), works: Ls(e, "P800", 8), owns: Ls(e, "P1830", 8),
    photo: logo(str(e, "P18")), wikipedia: w?.url || null, summary: w?.extract || "", bio: bio || w?.extract || "", wikiTitle: t };
})).filter(p => p && p.name && p.summary);
fs.writeFileSync("../data/companies.raw.json", JSON.stringify(outC));
fs.writeFileSync("../data/people.raw.json", JSON.stringify(outP));
console.log("companies", outC.length, "people", outP.length);
