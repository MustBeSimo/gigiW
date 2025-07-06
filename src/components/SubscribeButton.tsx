'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SubscribeButton() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const initializeStripeButton = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Load Stripe.js
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/buy-button.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        // Create the buy button with user metadata
        const button = document.createElement('stripe-buy-button');
        button.setAttribute('buy-button-id', 'buy_btn_1RLkOSIclkOLK1ttRHNuANVx');
        button.setAttribute('publishable-key', 'pk_test_51QoeBiIclkOLK1tt2o79EC0Bn9oB8lY7uilGqjBXo37e443KBnEyFRvgoDASguodvB0w0k2xC6pSPYVhWaL0WjS000AvxrArur');
        
        // Add user metadata
        const metadata = {
          user_id: session.user.id
        };
        button.setAttribute('client-reference-id', session.user.id);
        button.setAttribute('metadata', JSON.stringify(metadata));

        // Replace any existing button
        const container = document.getElementById('stripe-button-container');
        if (container) {
          container.innerHTML = '';
          container.appendChild(button);
        }
      };
    };

    initializeStripeButton();

    return () => {
      // Cleanup script on unmount
      const script = document.querySelector('script[src*="buy-button.js"]');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return <div id="stripe-button-container" className="w-full flex justify-center" />;
} 