import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from './utils/supabase/server'
import { getServerCookie } from './utils/server/cookies';

export async function proxy(request: NextRequest) {
  const protectedRoutes = ["/dashboard"]
  
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const cookieUser = await getServerCookie("app-user");

  //check if the cookies for the user are not set, then log the user out to login and set the cookies.
  if (user && !cookieUser) {
    await supabase.auth.signOut();
  }

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