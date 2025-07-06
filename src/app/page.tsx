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
  const [isClient, setIsClient] = useState(false);
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
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

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
  }, [searchParams, user, isClient]);

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

  const getAvatarColorScheme = (avatarId: string) => {
    switch (avatarId) {
      case 'gigi':
        return {
          gradient: 'from-pink-400 to-purple-400',
          primaryColor: 'pink',
          accentColor: 'purple',
          bgPrimary: 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40',
          borderColor: 'border-pink-400 dark:border-pink-500',
          textColor: 'text-pink-800 dark:text-pink-200',
          buttonColor: 'from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
        };
      case 'vee':
        return {
          gradient: 'from-blue-400 to-cyan-400',
          primaryColor: 'blue',
          accentColor: 'cyan',
          bgPrimary: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40',
          borderColor: 'border-blue-400 dark:border-blue-500',
          textColor: 'text-blue-800 dark:text-blue-200',
          buttonColor: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
        };
      case 'lumo':
        return {
          gradient: 'from-teal-400 to-emerald-400',
          primaryColor: 'teal',
          accentColor: 'emerald',
          bgPrimary: 'bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40',
          borderColor: 'border-teal-400 dark:border-teal-500',
          textColor: 'text-teal-800 dark:text-teal-200',
          buttonColor: 'from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
        };
      default:
        return {
          gradient: 'from-pink-400 to-purple-400',
          primaryColor: 'pink',
          accentColor: 'purple',
          bgPrimary: 'bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/40 dark:to-purple-900/40',
          borderColor: 'border-pink-400 dark:border-pink-500',
          textColor: 'text-pink-800 dark:text-pink-200',
          buttonColor: 'from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
        };
    }
  };

  const colorScheme = getAvatarColorScheme(selectedAvatar);

  return (
    <main className={`relative min-h-screen w-full ${colorScheme.bgPrimary}`}>
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
            
            {/* Responsive button layout - Stack vertically on mobile, horizontally on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 justify-end">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2.5 bg-white/70 dark:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200"
                  title="Weather & Horoscope"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" opacity="0.4"/>
                  </svg>
                </button>
                
                {user && (
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/70 dark:bg-gray-800/70 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </div>
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
              <div className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border-2 ${colorScheme.borderColor}`}>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colorScheme.gradient} p-1`}>
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      <Image
                        src={currentAvatar.src}
                        alt={currentAvatar.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <h2 className={`text-2xl font-bold ${colorScheme.textColor}`}>
                    Chat with {currentAvatar.name}
                  </h2>
                </div>
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>}>
                  <ChatCard />
                </Suspense>
              </div>
            </section>
          )}

          {/* Mood Check-in Section */}
          <section className="mb-12 lg:mb-16">
            <div className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border-2 ${colorScheme.borderColor}`}>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorScheme.gradient} p-1`}>
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <Image
                      src={currentAvatar.src}
                      alt={currentAvatar.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h2 className={`text-2xl font-bold ${colorScheme.textColor}`}>
                  Daily Mood Check-in
                </h2>
              </div>
              
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

          {/* Pricing Section - Before FAQ */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
                Choose Your Plan
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {/* Free Plan */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Free Trial</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$0</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">20 messages included</p>
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
                      <span>5 Mood check-ins and reports</span>
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
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-600 relative h-fit">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Plus</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$4.99</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">200 messages + 30 mood check-ins and reports</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                      <span>Priority support</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">Valid until expires</p>
                </div>

                {/* Pro Plan */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$9.99</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Unlimited messages and mood check-ins and reports</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Everything in Plus</span>
                    </li>
                  </ul>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">Valid one month</p>
                </div>
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

          {/* Medical Disclaimer */}
          <section className="mb-12 lg:mb-16">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 sm:p-8 shadow-lg border-2 border-orange-200 dark:border-orange-600">
              <div className="flex items-start gap-4">
                <div className="text-4xl shrink-0">
                  ⚠️
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-200 mb-4">
                    Important Medical Disclaimer
                  </h2>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-6">
                    Please read carefully before using our services
                  </p>
                  
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 sm:p-6 border border-orange-200 dark:border-orange-600">
                    <div className="text-center mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                        IMPORTANT MEDICAL DISCLAIMER
                      </h3>
                      <p className="text-sm sm:text-base font-semibold text-red-700 dark:text-red-300">
                        Mind Gleam is NOT a substitute for professional medical care, therapy, or psychiatric treatment.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* What We Are NOT */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          What We Are NOT:
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Medical professionals or therapists</li>
                          <li>• A replacement for professional treatment</li>
                          <li>• Able to diagnose or treat mental health conditions</li>
                          <li>• Equipped to handle crisis situations</li>
                        </ul>
                      </div>
                      
                      {/* What We ARE */}
                      <div className="space-y-3">
                        <h4 className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          What We ARE:
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          <li>• Educational AI-powered wellness support</li>
                          <li>• CBT-based thought coaching tools</li>
                          <li>• Mood tracking and journaling assistance</li>
                          <li>• Complementary wellness resources</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Crisis Resources */}
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6">
                      <h4 className="flex items-center gap-2 text-red-800 dark:text-red-200 font-semibold mb-3">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        CRISIS RESOURCES:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-semibold text-red-700 dark:text-red-300">US:</span>
                          <span className="text-red-600 dark:text-red-400"> 988 (Suicide & Crisis Lifeline)</span>
                        </div>
                        <div>
                          <span className="font-semibold text-red-700 dark:text-red-300">Australia:</span>
                          <span className="text-red-600 dark:text-red-400"> 13 11 14 (Lifeline)</span>
                        </div>
                        <div>
                          <span className="font-semibold text-red-700 dark:text-red-300">UK:</span>
                          <span className="text-red-600 dark:text-red-400"> 116 123 (Samaritans)</span>
                        </div>
                        <div>
                          <span className="font-semibold text-red-700 dark:text-red-300">Emergency:</span>
                          <span className="text-red-600 dark:text-red-400"> 911, 000, 999</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                        Ages 18+ only. By using this service, you acknowledge this disclaimer and agree to seek professional help when needed.
                      </p>
                    </div>
                  </div>
                </div>
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