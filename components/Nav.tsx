"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "../lib/i18n";

export default function Nav({ locale, labels }: { locale: Locale; labels: { companies: string; people: string; news: string; main: string; lang: string } }) {
  const path = usePathname() || `/${locale}`;
  const rest = path.replace(/^\/(ru|en)/, "");
  const items = [[`/${locale}/companies`, labels.companies], [`/${locale}/people`, labels.people], [`/${locale}/news`, labels.news]] as const;
  return (
    <div className="hdr-right">
      <nav className="nav" aria-label={labels.main}>
        {items.map(([href, label]) => <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <div className="lang" role="group" aria-label={labels.lang}>
        {locales.map(l => (
          <Link key={l} href={`/${l}${rest}`} hrefLang={l} aria-current={l === locale ? "true" : undefined} lang={l}>{l.toUpperCase()}</Link>
        ))}
      </div>
    </div>
  );
}
