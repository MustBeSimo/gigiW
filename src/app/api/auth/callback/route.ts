import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  // Handle OAuth error
  if (error || error_description) {
    console.error('OAuth error:', error, error_description);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(error_description || 'Authentication failed')}`, requestUrl.origin)
    );
  }

  // Handle successful OAuth callback
  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) throw exchangeError;

      // Get the session to ensure it was created
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error('No session created after code exchange');
      }

      // Initialize user profile and balance
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }

      // Initialize balance if needed
      const { error: balanceError } = await supabase
        .from('user_balances')
        .upsert(
          {
            user_id: session.user.id,
            balance: 20, // Give 20 free messages to new users
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (balanceError) {
        console.error('Error initializing balance:', balanceError);
      }

      // Redirect to home page with success message
      return NextResponse.redirect(
        new URL('/?message=Successfully signed in', requestUrl.origin)
      );
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(
        new URL('/?error=Authentication failed', requestUrl.origin)
      );
    }
  }

  // If no code or error, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 