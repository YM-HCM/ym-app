import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add all routes that should be accessible without authentication
const publicRoutes = ['/login', '/auth-test', '/', '/api/auth']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // For now, we'll just allow all routes since auth is handled client-side
  // In production, you'd check for a session cookie here
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}