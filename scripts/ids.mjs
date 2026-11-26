import { sparql, qid } from "./lib.mjs";
import fs from "fs";
const comp = `SELECT ?c ?s WHERE { VALUES ?t { wd:Q891723 wd:Q4830453 wd:Q6881511 } ?c wdt:P31 ?t ; wikibase:sitelinks ?s . FILTER(?s > 12) } ORDER BY DESC(?s) LIMIT 900`;
const ppl = `SELECT ?p ?s WHERE { VALUES ?o { wd:Q131524 wd:Q43845 } ?p wdt:P31 wd:Q5 ; wdt:P106 ?o ; wikibase:sitelinks ?s . FILTER(?s > 30) } ORDER BY DESC(?s) LIMIT 1500`;
const c = await sparql(comp); const p = await sparql(ppl);
const uc = [...new Set(c.map(x => qid(x.c.value)))], up = [...new Set(p.map(x => qid(x.p.value)))];
console.log("companies", uc.length, "people", up.length);
fs.writeFileSync("../data/ids.json", JSON.stringify({ companies: uc, people: up }));
