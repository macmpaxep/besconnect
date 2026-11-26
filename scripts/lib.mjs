export const UA = "BESconnectBot/1.0 (educational aggregator; contact via GitHub macmpaxep/besconnect)";
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function sparql(query, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch("https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(query),
      { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
    if (r.ok) return (await r.json()).results.bindings;
    console.error("sparql", r.status); await sleep(3000 * (i + 1));
  }
  throw new Error("sparql failed");
}
import fs from "fs";
import crypto from "crypto";
fs.mkdirSync("../data/cache", { recursive: true });
export async function getJSON(url, tries = 4) {
  const f = "../data/cache/" + crypto.createHash("md5").update(url).digest("hex") + ".json";
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(45000) });
      if (r.ok) { const j = await r.json(); fs.writeFileSync(f, JSON.stringify(j)); return j; }
      if (r.status === 404) return null;
      console.error("HTTP", r.status, url.slice(0, 90));
      await sleep((Number(r.headers.get("retry-after")) || 3 * (i + 1)) * 1000);
    } catch (e) { console.error("ERR", e.message, url.slice(0, 90)); await sleep(2000 * (i + 1)); }
  }
  console.error("GAVE UP", url.slice(0, 120)); return null;
}
export const qid = u => u.split("/").pop();
