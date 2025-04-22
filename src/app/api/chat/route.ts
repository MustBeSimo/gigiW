import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // Authenticate user session
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  // Fetch current balance or initialize
  let { data: row, error } = await supabase
    .from('user_balances')
    .select<{ balance: number }>('balance')
    .eq('user_id', userId)
    .single();
  if (error && error.code === 'PGRST116') {
    const insertRes = await supabase
      .from('user_balances')
      .insert({ user_id: userId })
      .single();
    if (insertRes.error) {
      return NextResponse.json({ error: insertRes.error.message }, { status: 500 });
    }
    row = insertRes.data;
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check balance
  if (row.balance <= 0) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 402 });
  }

  // Decrement balance
  const dec = await supabase
    .from('user_balances')
    .update({ balance: row!.balance - 1 })
    .eq('user_id', userId)
    .select<{ balance: number }>('balance')
    .single();
  if (dec.error) {
    return NextResponse.json({ error: dec.error.message }, { status: 500 });
  }

  // Parse messages and call Together API
  const { messages } = await req.json();
  if (!process.env.TOGETHER_API_KEY) {
    throw new Error('Missing TOGETHER_API_KEY');
  }
  const togetherRes = await fetch('https://api.together.ai/v0/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      messages,
    }),
  });
  const data = await togetherRes.json();
  if (!togetherRes.ok) {
    return NextResponse.json({ error: data.error || 'Together API error' }, { status: togetherRes.status });
  }

  return NextResponse.json(data);
}
