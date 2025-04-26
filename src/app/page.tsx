'use client';

import React, { useState, useEffect, Suspense } from 'react';
import SpotlightCard from '@/components/SpotlightCard';
import SpotlightMediaScroll from '@/components/SpotlightMediaScroll';
import SpotlightChat from '@/components/SpotlightChat';
import SocialLinks from '@/components/SocialLinks';
import ContactCard from '@/components/ContactCard';
const GuideCard = React.lazy(() => import('@/components/GuideCard'));
const ChatCard = React.lazy(() => import('@/components/ChatCard'));
import { fetchSocialLinks } from '@/utils/clientSocialLinks';
import { SocialLink } from '@/utils/socialLinks';

import AnimatedText from '@/components/AnimatedText';
import ShinyText from '@/components/ShinyText';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';

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
        <ChatCard user={user} balance={balance} />
      </>
    );
  }

  // Cards layout: aligned in a flex container on desktop, stacked on mobile
  const { user, loading, signInWithGoogle } = useAuth();
const [balance, setBalance] = useState<number | null>(null);
const [buying, setBuying] = useState(false);

useEffect(() => {
  if (user) {
    fetch('/api/balance')
      .then(res => res.json())
      .then(data => setBalance(data.balance));
  }
}, [user]);

const handleBuy = async () => {
  setBuying(true);
  const res = await fetch('/api/checkout', { method: 'POST' });
  const { sessionId } = await res.json();
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  stripe?.redirectToCheckout({ sessionId });
  setBuying(false);
};

  return (
    <main className="relative min-h-screen w-full">
      
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
            <div className="flex justify-center mt-4">
              <Image src="/images/avatars/gigi-avatar-logo.png" alt="Gigi avatar" width={200} height={200} className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 object-contain" />
            </div>
          </SpotlightCard>
          
          {/* Cards */}
          <div className={`w-full ${isMobile ? 'flex flex-col items-center space-y-6' : 'flex justify-center items-start flex-wrap gap-6'}`}>
            {/* Media Spotlight Card */}
            <SpotlightCard
              title="Gigi's Media Gallery"
              subtitle="Scroll through images and videos"
              className="w-full md:w-96"
              isDraggable={!isMobile}
              spotlightColor="rgba(124, 58, 237, 0.81)"
            >
              <Suspense fallback={<div className="text-center text-gray-300">Loading gallery...</div>}>
                <SpotlightMediaScroll />
              </Suspense>
            </SpotlightCard>

            {/* Sign In / Account Card (always visible) */}
            {/* Spotlight Chat Card, visible to signed-in users */}
            {user && (
              <SpotlightCard
                title="Chat with Gigi"
                subtitle="Your AI bestie is here!"
                className="w-full md:w-96"
                isDraggable={!isMobile}
                spotlightColor="rgba(255, 46, 99, 0.7)"
              >
                <SpotlightChat />
              </SpotlightCard>
            )}

            <SpotlightCard
              title={user ? `Welcome${user.email ? ", " + user.email : ""}` : "Sign in to Chat"}
              subtitle={user ? "Manage your account" : "Access Gigi's AI chat by signing in"}
              className="w-full md:w-96"
              isDraggable={!isMobile}
              spotlightColor={user ? "rgba(34,197,94,0.7)" : "rgba(255,255,255,0.8)"}
            >
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : user ? (
                <>
                  <div className="flex flex-col gap-2 items-center">
                    <span className="text-green-600 font-semibold">Signed in</span>
                    <span className="text-pink-600 font-bold">Balance: {balance ?? '…'}</span>
                    <button onClick={handleBuy} className="bg-yellow-400 text-black px-3 py-1 rounded mt-1 text-sm">Buy 200 messages</button>
                    <button onClick={() => window.location.href = "/api/auth/signout"} className="bg-gray-200 text-black px-3 py-1 rounded mt-1 text-sm">Sign Out</button>
                  </div>
                </>
              ) : (
                <button onClick={signInWithGoogle} className="bg-pink-500 text-white px-4 py-2 rounded w-full font-bold mt-2">
                  Sign in with Google
                </button>
              )}
            </SpotlightCard>


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
            
            {/* Chat Card (always visible) */}
            <SpotlightCard
              title="Let's Chat"
              subtitle="Have a secure conversation with your fav AI gal"
              className="w-full md:w-2/3"
              isDraggable={!isMobile}
              spotlightColor="rgba(219, 39, 120, 0.75)"
            >
              <Suspense fallback={<div className="text-center text-pink-200 py-8">Loading chat…</div>}>
                {(() => {
                  // Inline implementation for ChatCardWithBalance
                  const [balance, setBalance] = React.useState<number|null>(null);
                  const [buying, setBuying] = React.useState(false);
                  React.useEffect(() => {
                    if (user) {
                      fetch('/api/balance')
                        .then(res => res.json())
                        .then(data => setBalance(data.balance));
                    }
                  }, [user]);
                  const handleBuy = async () => {
                    setBuying(true);
                    const res = await fetch('/api/checkout', { method: 'POST' });
                    const { sessionId } = await res.json();
                    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
                    stripe?.redirectToCheckout({ sessionId });
                    setBuying(false);
                  };
                  if (loading) return <div className="text-center text-gray-500">Loading...</div>;
                  return (
                    <>
                      {user ? (
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                          <span className="text-sm text-white/80">Balance: <span className="font-bold text-pink-300">{balance ?? '…'}</span></span>
                          <button onClick={handleBuy} className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-bold" disabled={buying}>
                            {buying ? 'Redirecting…' : 'Buy 200 messages'}
                          </button>
                        </div>
                      ) : (
                        <div className="mb-3 flex flex-col items-center">
                          <span className="inline-block bg-white/20 text-xs text-white px-3 py-1 rounded-full mb-2">Preview mode: test messages do not count against balance</span>
                        </div>
                      )}
                      <ChatCard key={user ? 'user' : 'preview'} />
                    </>
                  );
                })()}
              </Suspense>
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