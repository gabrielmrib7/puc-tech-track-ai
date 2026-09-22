import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/attendant(.*)",
  "/technician(.*)",
  "/portal(.*)",
  "/api/v1(.*)",
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) auth().protect();
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/api/(.*)"],
};
