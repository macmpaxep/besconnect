export const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
