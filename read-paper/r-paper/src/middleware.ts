

import { authConfig } from "@/auth/config";
import NextAuth from "next-auth";
import { apiAuthPrefix, authRoutes, publicRoutes } from "../routes";
export const { auth } = NextAuth(authConfig);



export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoutes = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoutes = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
  
    return ;
  }

  // if (isAuthRoutes) {
  //   if (isLoggedIn) {
  //     return Response.redirect(new URL("/", nextUrl));
  //   }
  //   return  ;
  // }

  if (!isLoggedIn && !isPublicRoutes) {

    // Add both auth_redirect flag and attempted path
    const redirectUrl = new URL("/signin", nextUrl);
    redirectUrl.searchParams.set("auth_redirect", "true");
    // Remove leading slash and convert to title case for display
    const attemptedPath = nextUrl.pathname.slice(1) || "this page";
    redirectUrl.searchParams.set("attempted_path", attemptedPath);
    return Response.redirect(redirectUrl);
  }

  return ;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
