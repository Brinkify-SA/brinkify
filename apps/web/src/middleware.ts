import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server'

export async function middleware(request: NextRequest) {
  const protectedRoutes = ["/dashboard"]
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  //protect routes, redirect to login if accessing dashboard while unauthenticated
  if (!user && request.nextUrl.pathname.startsWith("/dashboard"))
    return NextResponse.redirect(new URL("/auth/login", request.url));
  //protect routes, redirect to dashboard if accessing auth while authenticated
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard",request.url));
  }

  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}