import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isAuthenticated = !!session

  const isProtected = nextUrl.pathname.startsWith('/dashboard')
  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register'

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}
