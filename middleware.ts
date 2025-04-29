import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Skip middleware for API routes and public assets
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const user = request.cookies.get("user")

  // If not authenticated and trying to access protected routes, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
