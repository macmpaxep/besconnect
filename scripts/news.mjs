import { UA } from "./lib.mjs";
import fs from "fs";
const feeds = [
  ["BBC News", "https://feeds.bbci.co.uk/news/business/rss.xml"],
  ["CNBC", "https://www.cnbc.com/id/10001147/device/rss/rss.html"],
  ["CNBC", "https://www.cnbc.com/id/100003114/device/rss/rss.html"],
  ["CNBC", "https://www.cnbc.com/id/100727362/device/rss/rss.html"],
  ["CNBC", "https://www.cnbc.com/id/10000664/device/rss/rss.html"],
  ["The New York Times", "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml"],
  ["The New York Times", "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml"],
  ["The Wall Street Journal", "https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness"],
  ["The Economist", "https://www.economist.com/business/rss.xml"],
  ["Financial Times", "https://www.ft.com/world?format=rss"],
  ["Forbes", "https://www.forbes.com/business/feed/"],
  ["The Economic Times", "https://economictimes.indiatimes.com/rssfeedstopstories.cms"],
  ["Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"],
];
const dec = s => (s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const tag = (x, t) => (x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)) || [])[1];
const items = [], seen = new Set();
for (const [source, url] of feeds) {
  try {
    const xml = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 " + UA } })).text();
    for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
      const x = m[0]; const title = dec(tag(x, "title")); let link = dec(tag(x, "link"));
      if (!link) link = (x.match(/<link[^>]*href="([^"]+)"/) || [])[1]; 
      const d = new Date(dec(tag(x, "pubDate")));
      if (!title || !link || seen.has(link) || seen.has(title) || isNaN(d)) continue;
      seen.add(link); seen.add(title);
      let summary = dec(tag(x, "description")); if (summary.length > 260) summary = summary.slice(0, 257).replace(/\s+\S*$/, "") + "…";
      const image = (x.match(/<media:(?:thumbnail|content)[^>]+url="([^"]+)"/) || x.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1] || null;
      items.push({ title, summary, link, source, date: d.toISOString(), image });
    }
  } catch (e) { console.error("fail", url, e.message); }
}
items.sort((a, b) => b.date.localeCompare(a.date));
items.forEach((n, i) => n.id = String(i + 1));
fs.writeFileSync("../data/news.raw.json", JSON.stringify(items));
console.log("news", items.length, "sources", new Set(items.map(i => i.source)).size);
