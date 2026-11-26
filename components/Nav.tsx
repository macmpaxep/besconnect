"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["/companies", "Компании"], ["/people", "Предприниматели"], ["/news", "Новости"]] as const;
export default function Nav() {
  const p = usePathname();
  return (
    <nav className="nav" aria-label="Основная навигация">
      {items.map(([href, label]) => (
        <Link key={href} href={href} aria-current={p.startsWith(href) ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}
