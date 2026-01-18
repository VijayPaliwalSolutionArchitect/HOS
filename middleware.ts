/**
 * NextAuth v5 Middleware
 * 
 * Handles:
 * - Authentication check
 * - Role-based route protection
 * - Tenant resolution
 * - Automatic redirects
 */

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ]

  // Check if current path is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  // Allow access to public routes
  if (isPublicRoute) {
    // If logged in and trying to access auth pages, redirect to dashboard
    if (session && ["/login", "/register"].includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  }

  // Require authentication for all other routes
  if (!session) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const role = session.user.role

  // Role-based access control
  
  // Super Admin has access to everything
  if (role === "SUPER_ADMIN") {
    return NextResponse.next()
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Manager routes
  if (pathname.startsWith("/manager")) {
    if (!["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Teacher routes (if any in future)
  if (pathname.startsWith("/teacher")) {
    if (!["TEACHER", "MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Student routes - most restrictive
  // Actually, students should be able to access /dashboard, /courses, /exams, etc.
  // So we don't need additional checks here

  return NextResponse.next()
})

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
