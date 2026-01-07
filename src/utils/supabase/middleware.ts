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
    let user = null;
    let error = null;

    try {
      const result = await supabase.auth.getUser();
      user = result.data.user;
      error = result.error;
    } catch (authError) {
      // Handle any thrown errors from getUser()
      if (
        authError instanceof Error &&
        (authError.message?.includes("refresh_token_not_found") ||
          authError.message?.includes("Invalid Refresh Token"))
      ) {
        console.log("No valid session found, user not authenticated");
        user = null;
        error = null;
      } else {
        console.error("Auth error:", authError);
        user = null;
        error = authError;
      }
    }

    if (error) {
      // Handle refresh token errors gracefully
      if (
        error instanceof Error &&
        (error.message?.includes("refresh_token_not_found") ||
          error.message?.includes("Invalid Refresh Token"))
      ) {
        console.log("No valid session found, user not authenticated");
        user = null;
      } else {
        console.error("Auth error:", error);
      }
    }

    console.log(
      `[Middleware] Path: ${request.nextUrl.pathname}, User: ${
        user ? "authenticated" : "not authenticated"
      }`
    );

    // Define public paths that don't require authentication
    const publicPaths = [
      "/login",
      "/signup",
      "/auth",
      "/auth/confirm",
      "/error",
      "/favicon.ico",
    ];

    const isPublicPath = publicPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    // Check if the path is in the protected route group (including home page)
    // All routes under (protected) are protected
    const isProtectedPath =
      request.nextUrl.pathname === "/" ||
      request.nextUrl.pathname.startsWith("/student") ||
      request.nextUrl.pathname.startsWith("/tutor") ||
      request.nextUrl.pathname.startsWith("/parent") ||
      request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.startsWith("/private") ||
      request.nextUrl.pathname.startsWith("/api/email") ||
      request.nextUrl.pathname.startsWith("/dashboard");

    console.log(
      `[Middleware] isProtectedPath: ${isProtectedPath}, isPublicPath: ${isPublicPath}`
    );

    // If no user and trying to access protected path, redirect to login
    if (!user && isProtectedPath) {
      // no user trying to access protected route, redirect to login page
      console.log(
        `[Middleware] Redirecting unauthenticated user from ${request.nextUrl.pathname} to /login`
      );
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
      console.log(
        `[Middleware] Redirecting authenticated user from ${request.nextUrl.pathname} to /`
      );
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
