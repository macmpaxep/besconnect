import type { Metadata } from "next";
import NewsList from "../../components/NewsList";
import { getNews } from "../../lib/data";
export const metadata: Metadata = { title: "Новости международного бизнеса" };
export default function Page() {
  const N = getNews(); const sources = [...new Set(N.map(n => n.source))];
  return (<>
    <h1 className="title">Новости международного бизнеса</h1>
    <p className="sub">Заголовки ведущих деловых изданий со ссылками на оригиналы.</p>
    <div style={{ maxWidth: 820 }}><NewsList news={N} sources={sources} /></div>
  </>);
}
