import { headers } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type StripeEvent = {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      customer_email: string;
      payment_status?: string;
      status?: string;
      mode?: string;
      metadata?: {
        user_id?: string;
      };
      subscription?: string;
      billing_reason?: string;
      lines?: {
        data: Array<{
          subscription?: string;
        }>;
      };
    };
  };
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: StripeEvent;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    ) as StripeEvent;
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Verify payment status
        if (session.payment_status !== 'paid') {
          throw new Error('Payment not completed');
        }

        // Get user from session metadata or email
        let userId = session.metadata?.user_id;
        
        if (!userId) {
          // Try to find user by email
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          
          if (userError) {
            throw new Error('Failed to fetch users');
          }
          
          const user = userData.users.find(u => u.email === session.customer_email);
          if (!user) {
            throw new Error('No user found for email: ' + session.customer_email);
          }
          
          userId = user.id;
        }

        // Check if this is a one-time payment (mode: 'payment') or subscription
        if (session.mode === 'payment') {
          // One-time payment: Add 200 messages + 60 mood check-ins
          const { data: currentBalance, error: fetchError } = await supabase
            .from('user_balances')
            .select('balance, mood_checkins_remaining')
            .eq('user_id', userId)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            throw new Error('Failed to fetch current balance');
          }

          if (currentBalance) {
            // Update existing balance
            await supabase
              .from('user_balances')
              .update({
                balance: currentBalance.balance + 200,
                mood_checkins_remaining: currentBalance.mood_checkins_remaining + 60,
                updated_at: new Date().toISOString(),
              })
              .eq('user_id', userId);
          } else {
            // Create new balance record
            await supabase
              .from('user_balances')
              .insert([{
                user_id: userId,
                balance: 250, // 50 initial + 200 purchased
                mood_checkins_remaining: 70, // 10 initial + 60 purchased
                updated_at: new Date().toISOString(),
              }]);
          }
        } else {
          // Subscription payment: handle subscription logic
          const currentPeriodEnd = new Date();
          currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

          await supabase
            .from('user_subscriptions')
            .update({
              status: 'subscribed',
              stripe_customer_id: session.customer,
              current_period_end: currentPeriodEnd.toISOString(),
              subscribed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        
        // Only handle subscription-related invoices
        if (invoice.billing_reason !== 'subscription_cycle') {
          return NextResponse.json({ received: true });
        }

        // Get the subscription ID from the invoice
        const subscriptionId = invoice.subscription || invoice.lines?.data[0]?.subscription;
        if (!subscriptionId) {
          throw new Error('No subscription found in invoice');
        }

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Get user from customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (userError || !userData) {
          throw new Error('No user found for customer: ' + invoice.customer);
        }

        // Calculate new period end
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

        // Update subscription status
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'subscribed',
            current_period_end: currentPeriodEnd.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userData.user_id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        // Get user from customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', invoice.customer)
          .single();

        if (userError || !userData) {
          throw new Error('No user found for customer: ' + invoice.customer);
        }

        // Update subscription status to expired
        await supabase
          .from('user_subscriptions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userData.user_id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 