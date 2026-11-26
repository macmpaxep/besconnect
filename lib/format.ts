import type { Locale } from "./i18n";
const tag = (l: Locale) => (l === "ru" ? "ru-RU" : "en-GB");
export const fmtShort = (d: string, l: Locale) => new Date(d).toLocaleDateString(tag(l), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtDate = (d: string | null, l: Locale) => (d ? new Date(d).toLocaleDateString(tag(l), { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }) : "—");
export const fmtYear = (d: string | null) => (d ? d.slice(0, 4) : "—");
export const fmtNum = (n: number | null, l: Locale) => (n == null ? "—" : n.toLocaleString(tag(l)));
export const fmtMoney = (n: number | null, l: Locale, units: { bn: string; m: string }) => {
  if (n == null) return "—";
  const d = (v: number) => v.toFixed(1).replace(".", l === "ru" ? "," : ".");
  return n >= 1e9 ? d(n / 1e9) + " " + units.bn : n >= 1e6 ? d(n / 1e6) + " " + units.m : String(n);
};
