import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getAuthorization(request: Request, supabase: any){
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return { error: "No token provided", user: null };

  const token = authHeader.split(" ")[1]; // Bearer <token>

  // Verify token using Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error) return { error, user: null };

  return { error: null, user };
}

