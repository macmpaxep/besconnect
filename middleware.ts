import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const p = req.nextUrl.pathname;
  if (/^\/(ru|en)(\/|$)/.test(p)) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/ru" + (p === "/" ? "" : p);
  return NextResponse.redirect(url);
}
export const config = { matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"] };
