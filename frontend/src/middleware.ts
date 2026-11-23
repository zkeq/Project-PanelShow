import { type NextRequest, NextResponse } from "next/server";
import { CANONICAL_SITE_ORIGIN, getPortfolioPath, getPortfolioUsername, LEGACY_SITE_HOSTNAME, LOCAL_PORTFOLIO_DOMAIN } from "@/lib/site-domain";

const SHARED_ROUTE = /^\/(?:admin|share|editor-demo)(?:\/|$)/;
const STATIC_ROUTE = /^\/(?:_next|api|\.well-known)(?:\/|$)/;
const ROOT_ASSET = /^\/[^/]+\.(?:ico|png|svg|txt)$/i;
const PROJECT_ROUTE = /^\/project\/([^/]+)(?:\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("host") ?? request.nextUrl.hostname).split(":")[0].toLowerCase().replace(/\.$/, "");

  if (host === LEGACY_SITE_HOSTNAME) {
    return NextResponse.redirect(`${CANONICAL_SITE_ORIGIN}${pathname}${search}`, 308);
  }

  const username = getPortfolioUsername(host);
  if (!username) return NextResponse.next();

  const projectRoute = PROJECT_ROUTE.exec(pathname);
  if (SHARED_ROUTE.test(pathname) || (projectRoute && projectRoute[1] !== username)) {
    const origin = process.env.NODE_ENV === "development" && host.endsWith(`.${LOCAL_PORTFOLIO_DOMAIN}`)
      ? `http://localhost:${request.nextUrl.port}`
      : CANONICAL_SITE_ORIGIN;
    return NextResponse.redirect(`${origin}${pathname}${search}`, 308);
  }

  const portfolioPath = getPortfolioPath(username);
  if (pathname === portfolioPath || pathname === `${portfolioPath}/`) {
    const home = request.nextUrl.clone();
    home.hostname = host;
    home.pathname = "/";
    return NextResponse.redirect(home, 308);
  }

  if (projectRoute || STATIC_ROUTE.test(pathname) || ROOT_ASSET.test(pathname)) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = `${portfolioPath}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(destination);
}
