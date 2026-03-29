import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const baseDomain =
    process.env.NEXT_PUBLIC_BASE_DOMAIN || "designtodeployment.com";

  // Skip for localhost/vercel preview domains
  if (hostname.includes("localhost") || hostname.includes("vercel.app")) {
    return NextResponse.next();
  }

  // Check if this is a subdomain request
  // e.g., "my-app.designtodeployment.com"
  if (hostname.endsWith(`.${baseDomain}`)) {
    const slug = hostname.replace(`.${baseDomain}`, "");
    // Skip "www" subdomain
    if (slug === "www") return NextResponse.next();
    // Rewrite to /deployed/[slug]
    const url = request.nextUrl.clone();
    url.pathname = `/deployed/${slug}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
