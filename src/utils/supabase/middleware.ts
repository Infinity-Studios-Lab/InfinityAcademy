import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // Check if environment variables are set
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Missing Supabase environment variables");
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  try {
    // Refresh session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error:", error);
    }

    console.log(`[Middleware] Path: ${request.nextUrl.pathname}, User: ${user ? 'authenticated' : 'not authenticated'}`);

    // Define public paths that don't require authentication
    const publicPaths = [
      "/login",
      "/signup",
      "/auth",
      "/error",
      "/favicon.ico",
    ];

    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Check if the path is in the protected route group (including home page)
    const isProtectedPath =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/student") ||
      request.nextUrl.pathname.startsWith("/tutor") ||
      request.nextUrl.pathname.startsWith("/parent") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/private");

    console.log(`[Middleware] isProtectedPath: ${isProtectedPath}, isPublicPath: ${isPublicPath}`);

    if (!user && isProtectedPath) {
      // no user trying to access protected route, redirect to login page
      console.log(`[Middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`);
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("message", "Please login to access this page");
      return NextResponse.redirect(url);
    }

    if (
      user &&
      (request.nextUrl.pathname === "/login" ||
        request.nextUrl.pathname === "/signup")
    ) {
      // user is logged in but trying to access login/signup pages, redirect to home
      console.log(`[Middleware] Redirecting authenticated user from ${request.nextUrl.pathname} to /`);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    console.log(`[Middleware] Allowing access to ${request.nextUrl.pathname}`);

    // IMPORTANT: Return the response with updated cookies
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next({ request });
  }
}
