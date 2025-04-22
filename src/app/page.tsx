'use client';

import React, { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard';
import SocialLinks from '@/components/SocialLinks';
import GuideCard from '@/components/GuideCard';
import ChatCard from '@/components/ChatCard';
import ContactCard from '@/components/ContactCard';
import { fetchSocialLinks } from '@/utils/clientSocialLinks';
import { SocialLink } from '@/utils/socialLinks';
import MediaBackground from '@/components/MediaBackground';
import AnimatedText from '@/components/AnimatedText';
import ShinyText from '@/components/ShinyText';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';

export default function HomePage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fetch social links
    const loadSocialLinks = async () => {
      const links = await fetchSocialLinks();
      setSocialLinks(links);
    };

    loadSocialLinks();

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Conditionally render sign-in, balance info, purchase, and chat
  function ChatSpotlight() {
    const { user, loading, signInWithGoogle } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
      if (user) {
        fetch('/api/balance')
          .then(res => res.json())
          .then(data => setBalance(data.balance));
      }
    }, [user]);

    if (loading) return <p>Loading...</p>;
    if (!user)
      return (
        <button onClick={signInWithGoogle} className="bg-white text-black px-4 py-2 rounded">
          Sign in with Google
        </button>
      );

    const handleBuy = async () => {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const { sessionId } = await res.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      stripe?.redirectToCheckout({ sessionId });
    };

    return (
      <>
        <p className="text-white">Hello, {user.email}</p>
        <p className="text-white">Balance: {balance ?? '...'}</p>
        <button onClick={handleBuy} className="bg-yellow-400 text-black px-4 py-2 rounded mb-4">
          Buy 200 messages
        </button>
        <ChatCard />
      </>
    );
  }

  // Cards layout: aligned in a flex container on desktop, stacked on mobile

  return (
    <main className="relative min-h-screen w-full">
      <MediaBackground />
      <div className="relative z-10">
        <div className={`container mx-auto p-4 md:p-8 relative z-10 ${isMobile ? 'flex flex-col gap-6' : 'h-screen'}`}>
          {/* Hero Spotlight Card */}
          <SpotlightCard
            title="Hey, It's Gigi AI"
            subtitle="Your favorite AI bestie ✨"
            className="inline-block mx-auto mb-8 mt-6"
            isDraggable={false}
            spotlightColor="rgba(255, 255, 255, 0.3)"
          >
            {/* empty children to satisfy type */}
            <></>
          </SpotlightCard>
          
          {/* Cards */}
          <div className={`w-full ${isMobile ? 'flex flex-col items-center space-y-6' : 'flex justify-center items-start flex-wrap gap-6'}`}>
            {/* Follow Me! Card */}
            <SpotlightCard
              title="Follow Me!"
              subtitle="Stay connected with Gigi on social media"
              className="w-full md:w-96"
              isDraggable={!isMobile}
              spotlightColor="rgba(236, 72, 154, 0.82)"
            >
              <SocialLinks links={socialLinks} />
            </SpotlightCard>
            
            {/* Guides Card */}
            <SpotlightCard
              title="Download Free Guides"
              subtitle="Exclusive content just for you"
              className="w-full md:w-96"
              isDraggable={!isMobile}
              spotlightColor="rgba(124, 58, 237, 0.81)"
            >
              <div className="grid grid-cols-1 gap-4">
                <GuideCard
                  title="Gigi's Crypto Beginner 5 Step Guide"
                  description="🔥 New to crypto? Feeling overwhelmed by all the jargon? Don't stress, queen—I got you! 💅"
                  imageSrc="/images/guides/crypto-guide.jpg"
                  downloadUrl="https://payhip.com/b/k9Ygc"
                />
                
                <GuideCard
                  title="Glow Up & Own It: 10 Exercises to Build Confidence"
                  description="Ready to break up with self-doubt and fall head over heels in love with your body?"
                  imageSrc="/images/guides/confidence-guide.jpg"
                  downloadUrl="https://payhip.com/b/YKuyU"
                />
              </div>
            </SpotlightCard>
            
            {/* Chat Card */}
            <SpotlightCard
              title="Let's Chat"
              subtitle="Have a secure conversation with your fav AI gal"
              className="w-full md:w-2/3"
              isDraggable={!isMobile}
              spotlightColor="rgba(219, 39, 120, 0.75)"
            >
              <ChatSpotlight />
            </SpotlightCard>
            
            {/* Collaboration Card */}
            <SpotlightCard
              title="Collaborate"
              subtitle="Let's work together on something amazing"
              className="w-full md:w-96"
              isDraggable={!isMobile}
              spotlightColor="hsla(243, 100.00%, 61.60%, 0.82)"
            >
              <ContactCard email="heyitsgigiai@gmail.com" />
            </SpotlightCard>
          </div>
        </div>
      </div>
    </main>
  );
} 