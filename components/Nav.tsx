"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locales, type Locale } from "../lib/i18n";

type Labels = { companies: string; people: string; news: string; main: string; lang: string; menu: string; close: string };

export default function Nav({ locale, labels }: { locale: Locale; labels: Labels }) {
  const path = usePathname() || `/${locale}`;
  const rest = path.replace(/^\/(ru|en)/, "");
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const items = [[`/${locale}/companies`, labels.companies], [`/${locale}/people`, labels.people], [`/${locale}/news`, labels.news]] as const;
  return (
    <div className="hdr-right">
      <nav id="site-nav" className="nav" data-open={open} aria-label={labels.main}>
        {items.map(([href, label]) => <Link key={href} href={href} aria-current={path.startsWith(href) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <div className="lang" role="group" aria-label={labels.lang}>
        {locales.map(l => (
          <Link key={l} href={`/${l}${rest}`} hrefLang={l} aria-current={l === locale ? "true" : undefined} lang={l}>{l.toUpperCase()}</Link>
        ))}
      </div>
      <button className="burger" type="button" aria-expanded={open} aria-controls="site-nav" aria-label={open ? labels.close : labels.menu} onClick={() => setOpen(o => !o)}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M5 5l12 12M17 5L5 17" /> : <path d="M3 5.5h16M3 11h16M3 16.5h16" />}
        </svg>
      </button>
    </div>
  );
}
