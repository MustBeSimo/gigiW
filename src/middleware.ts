import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Refresh session if expired
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // Handle authentication callback
    if (req.nextUrl.pathname === '/auth/callback') {
      return res;
    }

    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/api/public/', '/api/horoscope', '/api/mood-report', '/api/generate-pdf'];
    const isPublicRoute = publicRoutes.some(route => 
      req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(route)
    );

    // If there was an error refreshing the session and it's not a public route
    if (error && !isPublicRoute) {
      console.error('Session error:', error);
      
      // If it's an API route, return a 401
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Session expired. Please sign in again.' },
          { status: 401 }
        );
      }
      
      // For non-API routes, redirect to login
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('error', 'Session expired. Please sign in again.');
      return NextResponse.redirect(redirectUrl);
    }

    // For API routes that require authentication
    if (req.nextUrl.pathname.startsWith('/api/') && !session && !isPublicRoute) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of any error, allow the request to proceed
    // The client-side auth check will handle the session state
    return res;
  }
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 