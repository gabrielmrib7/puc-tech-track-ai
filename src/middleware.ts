import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/attendant(.*)",
  "/technician(.*)",
  "/portal(.*)",
  "/api/v1(.*)",
]);

const isPublicRoute = createRouteMatcher(["/login(.*)", "/"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request) && !isPublicRoute(request)) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      auth().protect();
    } else if (!auth().userId) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/login(.*)", "/api/(.*)"],
};
