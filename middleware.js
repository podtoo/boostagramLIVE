import { NextResponse } from "next/server";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip middleware for API routes and static assets
  if (pathname.startsWith("/api") || pathname.startsWith("/sounds") || pathname.startsWith("/_next") || pathname.startsWith("/static") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  try {
    // Construct the absolute URL for the local API route
    const absoluteUrl = `/api/check-db`;

    // Fetch database connection status
    const response = await fetch(absoluteUrl);
    const data = await response.json();

    if (pathname === "/setup") {
      // Prevent access to /setup if the database is already connected
      if (data?.dbConnected) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } else {
      // Redirect to /setup if the database is not connected
      if (!data?.dbConnected) {
        const url = req.nextUrl.clone();
        url.pathname = "/setup";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Error in middleware database check:", error);
    // Redirect to /setup on error
    const url = req.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico|api/check-db).*)"], // Exclude the check-db API route
};
