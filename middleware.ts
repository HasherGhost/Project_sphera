import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // Protect /dashboard and /verification routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/verification');

  if (!session && isProtectedRoute) {
    // If not logged in and trying to access protected routes, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verification guard (Simplified for Firebase refactor)
  // In a real app, you might check a custom claim in the session cookie or 
  // fetch user data from Firestore REST API if needed.
  if (session && pathname.startsWith('/dashboard')) {
    // Exclude /dashboard/verify from redirect loop
    if (pathname !== '/dashboard/verify' && pathname !== '/verification') {
      
      // For this refactor, we'll check if a 'verified' cookie exists or 
      // just assume we need to check restricted sub-routes.
      const restrictedPrefixes = ['/dashboard/events/new', '/dashboard/promote', '/dashboard/jobs/new'];
      const isRestricted = restrictedPrefixes.some(p => pathname.startsWith(p));
      
      const isVerified = request.cookies.get('user_verified')?.value === 'true';
      
      if (!isVerified && isRestricted) {
        return NextResponse.redirect(new URL('/dashboard/verify?reason=restricted', request.url));
      }
    }
  }

  return NextResponse.next();
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

