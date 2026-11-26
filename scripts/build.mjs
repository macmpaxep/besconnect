import fs from "fs";
const R = f => JSON.parse(fs.readFileSync("../data/" + f));
const companies = R("companies.raw.json"), people = R("people.raw.json"), news = R("news.raw.json");
export const CATS = [
  ["tech", "Технологии и ПО", /software|internet|computer|semiconductor|electronic|information technology|\btech|cloud|video game|e-commerce platform|social (media|network)|artificial intelligence|cybersecurity|search engine|app\b|smartphone|streaming|online/i],
  ["finance", "Финансы и банки", /bank|financ|insurance|invest|asset management|payment|credit|fintech|brokerage|venture capital|private equity|hedge fund|cryptocurrenc/i],
  ["energy", "Энергетика, нефть и газ", /oil|gas\b|petrol|energy|electric utility|power|mining|coal|renewable|solar|nuclear|utilit/i],
  ["pharma", "Здравоохранение и фарма", /pharma|health|biotech|medical|drug|hospital|medicine|vaccine/i],
  ["auto", "Автомобили и транспорт", /automobile|automotive|motor|car manufactur|vehicle|truck|logistic|shipping|railway|freight|aerospace|aircraft|aviation|airline|transport/i],
  ["food", "Еда, напитки и FMCG", /food|beverage|drink|brewing|brewery|beer|wine|spirits|tobacco|cosmetic|restaurant|fast food|coffee|dairy|consumer goods|household|snack|confection/i],
  ["retail", "Ритейл и e-commerce", /retail|supermarket|department store|e-commerce|wholesale|hypermarket|grocery|shop/i],
  ["fashion", "Одежда, люкс и товары", /cloth|apparel|fashion|luxury|footwear|jewel|sport|toy|furniture|textile|watch/i],
  ["media", "Медиа и развлечения", /media|entertain|film|broadcast|publish|music|television|news|gaming|studio|advertis/i],
  ["telecom", "Телекоммуникации", /telecom|mobile network|wireless|cable|satellite/i],
  ["realty", "Недвижимость и строительство", /real estate|construction|property|building|engineering|infrastructure|cement|steel|chemical|manufactur|industr|conglomerate/i],
  ["travel", "Туризм и сервис", /hotel|travel|tourism|hospitality|cruise|service|consult|staffing|education/i],
];
const OTHER = ["other", "Прочее"];
const cat = txt => (CATS.find(([, , re]) => re.test(txt)) || [OTHER[0]])[0];
const slug = (s, used) => { let b = s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "item"; let x = b, i = 2; while (used.has(x)) x = b + "-" + i++; used.add(x); return x; };

const manualC = JSON.parse(fs.readFileSync("../data/manual/companies.json")), manualP = JSON.parse(fs.readFileSync("../data/manual/people.json"));
const uc = new Set(manualC.map(c => c.slug)), up = new Set(manualP.map(p => p.slug));
const seenName = new Set();
let C = companies.filter(c => !seenName.has(c.name) && seenName.add(c.name));
const named = a => a.filter(x => x !== x.toLowerCase());
C.forEach(c => { c.products = named(c.products); c.brands = named(c.brands); c.subsidiaries = named(c.subsidiaries); c.slug = slug(c.name, uc); c.category = cat(c.industries.join(" ") + " " + c.description) !== "other" ? cat(c.industries.join(" ") + " " + c.description) : cat(c.extract.slice(0, 300)); });
const seenP = new Set();
let P = people.filter(p => !seenP.has(p.name) && seenP.add(p.name));
const OUT = /politician|president|prime minister|minister|senator|governor|rapper|singer|actor|actress|musician|footballer|athlete|comedian|composer|television host|model\b/i;
const BIZ = /business|entrepreneur|founder|executive|tycoon|industrialist|investor|billionaire|financier|banker|CEO|chairman|magnate|merchant|philanthrop|inventor/i;
P = P.filter(p => !OUT.test(p.description) || BIZ.test(p.description));
P.forEach(p => p.slug = slug(p.name, up));
C.push(...manualC); P.push(...manualP); // hand-curated entries, kept across rebuilds
const byFounder = {};
for (const c of C) for (const f of c.founders) (byFounder[f] ||= []).push(c);
for (const p of P) {
  if (p.id.startsWith("manual-")) continue;
  const fc = byFounder[p.name] || [];
  p.companies = fc.map(c => ({ slug: c.slug, name: c.name }));
  const cats = fc.map(c => c.category).filter(x => x !== "other");
  p.category = cats[0] || (cat(p.description + " " + p.owns.join(" ") + " " + p.summary.slice(0, 300)));
  p.age = null;
}
for (const c of C) if (!c.id.startsWith("manual-")) c.founderLinks = c.founders.map(n => { const p = P.find(x => x.name === n); return { name: n, slug: p?.slug || null }; });
const EN = { tech: "Technology & Software", finance: "Finance & Banking", energy: "Energy, Oil & Gas", pharma: "Healthcare & Pharma", auto: "Automotive & Transport", food: "Food, Beverage & FMCG", retail: "Retail & E-commerce", fashion: "Apparel, Luxury & Goods", media: "Media & Entertainment", telecom: "Telecommunications", realty: "Real Estate & Construction", travel: "Travel & Services", other: "Other" };
const catList = [...CATS.map(([id, name]) => ({ id, name, nameEn: EN[id] })), { id: OTHER[0], name: OTHER[1], nameEn: EN.other }];
for (const k of catList) { k.companies = C.filter(c => c.category === k.id).length; k.people = P.filter(p => p.category === k.id).length; }
C.sort((a, b) => a.name.localeCompare(b.name)); P.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync("../data/companies.json", JSON.stringify(C));
fs.writeFileSync("../data/people.json", JSON.stringify(P));
fs.writeFileSync("../data/news.json", JSON.stringify(news));
fs.writeFileSync("../data/categories.json", JSON.stringify(catList, null, 1));
console.log("companies", C.length, "people", P.length, "news", news.length);
console.table(catList);
