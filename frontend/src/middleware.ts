import { type NextRequest, NextResponse } from "next/server";
import { CANONICAL_SITE_HOSTNAME, LEGACY_SITE_HOSTNAME } from "@/lib/site-domain";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.hostname;
  if (host.toLowerCase().split(":")[0] !== LEGACY_SITE_HOSTNAME) {
    return NextResponse.next();
  }

  const destination = new URL(request.url);
  destination.protocol = "https:";
  destination.hostname = CANONICAL_SITE_HOSTNAME;
  destination.port = "";
  return NextResponse.redirect(destination, 308);
}
