import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // Handle authentication callback
  if (req.nextUrl.pathname === '/auth/callback') {
    // Allow the callback to proceed without redirection
    return res;
  }

  // If there was an error refreshing the session, clear it and redirect to home
  if (error) {
    console.error('Session error:', error);
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('error', 'Session expired. Please sign in again.');
    return NextResponse.redirect(redirectUrl);
  }

  // Define public API routes that don't require authentication
  const publicApiRoutes = [
    '/api/public/',
    '/api/horoscope'
  ];

  // Check if the current route is a public API route
  const isPublicApiRoute = publicApiRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // If accessing protected routes without session, redirect to home
  if ((req.nextUrl.pathname.startsWith('/chat') || req.nextUrl.pathname.startsWith('/api/chat')) && !session) {
    const redirectUrl = new URL('/', req.url);
    redirectUrl.searchParams.set('error', 'Please sign in to access chat');
    return NextResponse.redirect(redirectUrl);
  }

  // For API routes that require authentication
  if (req.nextUrl.pathname.startsWith('/api/') && !session && !isPublicApiRoute) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/public/).*)',
  ],
} 