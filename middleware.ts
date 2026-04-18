import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Basic auth route guard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verification guard
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Exclude /dashboard/verify from redirect loop
    if (request.nextUrl.pathname !== '/dashboard/verify') {
      const { data: profile } = await supabase
        .from('users')
        .select('verified_at')
        .eq('id', user.id)
        .single();
      
      // If attempting to access sensitive areas without verification
      const restrictedPrefixes = ['/dashboard/events/new', '/dashboard/promote', '/dashboard/jobs/new'];
      const isRestricted = restrictedPrefixes.some(p => request.nextUrl.pathname.startsWith(p));
      
      if (!profile?.verified_at && isRestricted) {
        return NextResponse.redirect(new URL('/dashboard/verify?reason=restricted', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
