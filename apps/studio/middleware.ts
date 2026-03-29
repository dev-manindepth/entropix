import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/s/(.*)",
  "/deployed/(.*)",
  "/api/export(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const hostname = request.headers.get("host") || "";
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || "designtodeployment.com";

  // Step 1: Handle subdomain routing (before auth check)
  if (!hostname.includes("localhost") && !hostname.includes("vercel.app")) {
    if (hostname.endsWith(`.${baseDomain}`)) {
      const slug = hostname.replace(`.${baseDomain}`, "");
      if (slug && slug !== "www") {
        const url = request.nextUrl.clone();
        url.pathname = `/deployed/${slug}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
        return NextResponse.rewrite(url);
      }
    }
  }

  // Step 2: Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
