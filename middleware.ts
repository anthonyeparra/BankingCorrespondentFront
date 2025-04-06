import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/correspondents") || request.nextUrl.pathname.startsWith("/correspondent/")

  if (isProtectedRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/correspondents/:path*", "/correspondent/:path*"],
}

