import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user balance including mood check-ins
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .select('balance, mood_checkins_remaining')
      .eq('user_id', session.user.id)
      .single();

    if (balanceError) {
      console.error('Error fetching balance:', balanceError);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    // If no balance record exists, create one with initial balance
    if (!balanceData) {
      const { data: newBalance, error: insertError } = await supabase
        .from('user_balances')
        .insert([
          {
            user_id: session.user.id,
            balance: 50, // Initial balance for new users
            mood_checkins_remaining: 10, // Initial mood check-ins for new users
            updated_at: new Date().toISOString(),
          },
        ])
        .select('balance, mood_checkins_remaining')
        .single();

      if (insertError) {
        console.error('Error creating balance:', insertError);
        return NextResponse.json({ error: 'Failed to create balance' }, { status: 500 });
      }

      return NextResponse.json({ 
        balance: newBalance?.balance ?? 50,
        moodCheckins: newBalance?.mood_checkins_remaining ?? 10
      });
    }

    return NextResponse.json({ 
      balance: balanceData.balance,
      moodCheckins: balanceData.mood_checkins_remaining
    });
  } catch (error) {
    console.error('Error in balance route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST method to deduct mood check-in
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { action } = await request.json();
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (action === 'deduct_mood_checkin') {
      // Get current balance
      const { data: currentBalance, error: fetchError } = await supabase
        .from('user_balances')
        .select('mood_checkins_remaining')
        .eq('user_id', session.user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching current balance:', fetchError);
        return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
      }

      if (!currentBalance || currentBalance.mood_checkins_remaining <= 0) {
        return NextResponse.json({ error: 'Insufficient mood check-ins' }, { status: 402 });
      }

      // Deduct one mood check-in
      const { data: updatedBalance, error: updateError } = await supabase
        .from('user_balances')
        .update({ 
          mood_checkins_remaining: currentBalance.mood_checkins_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select('balance, mood_checkins_remaining')
        .single();

      if (updateError) {
        console.error('Error updating balance:', updateError);
        return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 });
      }

      return NextResponse.json({ 
        balance: updatedBalance.balance,
        moodCheckins: updatedBalance.mood_checkins_remaining,
        success: true
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in balance POST route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
