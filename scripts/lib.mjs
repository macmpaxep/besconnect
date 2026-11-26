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
export async function getJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch (e) {}
    await sleep(1500 * (i + 1));
  }
  return null;
}
export const qid = u => u.split("/").pop();
