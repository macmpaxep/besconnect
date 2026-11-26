import type { Metadata } from "next";
import NewsList from "../../components/NewsList";
import { getNews } from "../../lib/data";
export const metadata: Metadata = { title: "Новости международного бизнеса" };
export default function Page() {
  const N = getNews(); const sources = [...new Set(N.map(n => n.source))];
  return (<><h1>Новости международного бизнеса</h1><p className="lead">{N.length} материалов из {sources.length} изданий. Ведут на оригинал.</p><NewsList news={N} sources={sources} /></>);
}
