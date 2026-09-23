import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/attendant(.*)",
  "/technician(.*)",
  "/dashboard(.*)",
  "/service-orders(.*)",
  "/portal(.*)",
  "/orders(.*)",
  "/api/v1(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/sign-up(.*)",
  "/",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request) && !isPublicRoute(request)) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      if (!auth().userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (!auth().userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/login(.*)", "/api/(.*)"],
};
