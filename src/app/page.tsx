'use client';

import React, { useState, useEffect, Suspense } from 'react';
import SimpleCard from '@/components/SimpleCard';
import SocialLinks from '@/components/SocialLinks';
import ContactCard from '@/components/ContactCard';
import TypewriterText from '@/components/TypewriterText';
import FAQCard from '@/components/FAQCard';
import Hero from '@/components/Hero';
import DemoChat from '@/components/DemoChat';
import UpsellBanner from '@/components/UpsellBanner';
const GuideCard = React.lazy(() => import('@/components/GuideCard'));
const ChatCard = React.lazy(() => import('@/components/ChatCard'));
const WeatherHoroscopeCard = React.lazy(() => import('@/components/WeatherHoroscopeCard'));
import { fetchSocialLinks } from '@/utils/clientSocialLinks';
import { SocialLink } from '@/utils/socialLinks';

import MoodCheckinCard from '@/components/MoodCheckinCard';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomePage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<'gigi' | 'vee' | 'lumo'>('gigi');
  const [isDemoChatOpen, setIsDemoChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Avatar configuration
  const avatars = [
    {
      id: 'gigi' as const,
      name: 'Gigi',
      description: 'Your empathetic AI companion',
      src: '/images/avatars/Gigi_avatar.png',
      gradient: 'from-pink-200 to-purple-200'
    },
    {
      id: 'vee' as const,
      name: 'Vee',
      description: 'Your logical thought coach',
      src: '/images/avatars/Vee_avatar.png',
      gradient: 'from-blue-200 to-cyan-200'
    },
    {
      id: 'lumo' as const,
      name: 'Lumo',
      description: 'Your creative wellness guide',
      src: '/images/avatars/Lumo_avatar.png',
      gradient: 'from-teal-200 to-emerald-200'
    }
  ];

  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar) || avatars[0];

  const punchlines = [
    "AI-Powered Mental Wellness & Thought Coaching 🧠",
    "Transform Negative Thoughts into Positive Growth 💚",
    "Evidence-Based Cognitive Behavioral Therapy Support",
    "24/7 Private Journaling & Mood Tracking Assistant",
    "Personalized Mental Health Guidance at Your Fingertips",
    "Breakthrough Limiting Beliefs with AI Coaching",
    "Your Digital Safe Space for Emotional Wellness",
    "Clinical-Grade CBT Techniques Made Accessible",
    "Mindful Conversations for Mental Health Recovery"
  ];

  useEffect(() => {
    // Handle auth code and clean URL
    const code = searchParams.get('code');
    if (code) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Set chat visible when user is signed in
    if (user) {
      setIsChatVisible(true);
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams, user]);

  // Fetch balance when user is available
  useEffect(() => {
    if (user) {
      const fetchBalance = async () => {
        try {
          const response = await fetch('/api/balance');
          const data = await response.json();
          setBalance(data.balance);
        } catch (error) {
          console.error('Error fetching balance:', error);
        }
      };
      fetchBalance();

      // Fetch user profile from Supabase
      const supabase = createClientComponentClient();
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setUserProfile(data));
    }
  }, [user]);

  useEffect(() => {
    // Fetch social links
    const loadSocialLinks = async () => {
      const links = await fetchSocialLinks();
      setSocialLinks(links);
    };

    loadSocialLinks();
  }, []);

  const handleBuy = async () => {
    setBuying(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const { sessionId } = await res.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error during checkout:', error);
    } finally {
      setBuying(false);
    }
  };

  const handleStartDemo = () => {
    setIsDemoChatOpen(true);
  };

  const handleAvatarChange = (avatar: 'gigi' | 'vee' | 'lumo') => {
    setSelectedAvatar(avatar);
  };

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar for Weather/Horoscope - Mobile Optimized */}
      <div className={`fixed inset-y-0 right-0 w-full sm:w-96 max-w-sm bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-4 sm:p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-gray-800 py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Weather & Horoscope</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="pb-4">
            <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>}>
              <WeatherHoroscopeCard />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          {/* Header with mobile-optimized layout */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mind Gleam</h1>
              {user && balance !== null && (
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ml-auto sm:ml-0">
                  <span className="text-gray-600 dark:text-gray-400">Credits: </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{balance}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 sm:p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200"
                title="Weather & Horoscope"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              {user && (
                <button
                  onClick={signOut}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 font-medium"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>

          {/* Hero Section */}
          <section className="mb-12 lg:mb-16">
            <Hero 
              onStartDemo={handleStartDemo}
              selectedAvatar={selectedAvatar}
              onAvatarChange={handleAvatarChange}
            />
          </section>

          {/* Pricing Section - Transparent */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Choose Your Plan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Free Plan */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Free Trial</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">50 messages included</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Basic CBT guidance</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Mood check-ins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>3 AI companions</span>
                    </li>
                  </ul>
                </div>

                {/* Plus Plan */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-600 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Plus</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$4.99</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">200 messages</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Advanced CBT sessions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Mood trend analysis</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Streak tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>

                {/* Pro Plan */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$9.99</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Unlimited messages</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Everything in Plus</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Voice conversations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Custom exercises</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Progress reports</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Upsell Banners - Contextual */}
          <UpsellBanner 
            trigger="low-balance" 
            balance={balance || 0}
            onUpgrade={() => handleBuy()}
          />
          
          {!user && (
            <UpsellBanner 
              trigger="feature-locked"
              onUpgrade={() => signInWithGoogle()}
            />
          )}

          {/* Chat Section for Authenticated Users */}
          {user && isChatVisible && (
            <section className="mb-12 lg:mb-16">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                  Chat with {selectedAvatar.charAt(0).toUpperCase() + selectedAvatar.slice(1)}
                </h2>
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>}>
                  <ChatCard />
                </Suspense>
              </div>
            </section>
          )}

          {/* Mood Check-in Section */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Daily Mood Check-in
              </h2>
              
              {/* Mood Chain Upsell */}
              <UpsellBanner 
                trigger="mood-chain"
                onUpgrade={() => handleBuy()}
              />
              
              <div className="max-w-md mx-auto">
                <MoodCheckinCard />
              </div>
            </div>
          </section>

          {/* Guides Section */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Free CBT Guides & Resources
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>}>
                  <GuideCard />
                </Suspense>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Frequently Asked Questions
              </h2>
              <div className="max-w-4xl mx-auto">
                <FAQCard />
              </div>
            </div>
          </section>

                     {/* Social Links Section */}
           <section className="mb-12 lg:mb-16">
             <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
               <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                 Connect with Us
               </h2>
               <div className="max-w-md mx-auto">
                 <SocialLinks links={socialLinks} />
               </div>
             </div>
           </section>
        </div>
      </div>

      {/* Demo Chat Modal */}
      <DemoChat 
        isOpen={isDemoChatOpen}
        onClose={() => setIsDemoChatOpen(false)}
        selectedAvatar={selectedAvatar}
      />
    </main>
  );
} 