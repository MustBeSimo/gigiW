'use client';

import React, { useState, useEffect, Suspense } from 'react';
import SimpleCard from '@/components/SimpleCard';
import SocialLinks from '@/components/SocialLinks';
import ContactCard from '@/components/ContactCard';
import TypewriterText from '@/components/TypewriterText';
import FAQCard from '@/components/FAQCard';
import Hero from '@/components/Hero';
import DemoChat from '@/components/DemoChat';
import Footer from '@/components/Footer';
const GuideCard = React.lazy(() => import('@/components/GuideCard'));
const ChatCard = React.lazy(() => import('@/components/ChatCard'));
const WeatherHoroscopeCard = React.lazy(() => import('@/components/WeatherHoroscopeCard'));
const MoodCheckinCard = React.lazy(() => import('@/components/MoodCheckinCard'));
const UpsellBanner = React.lazy(() => import('@/components/UpsellBanner'));
import { fetchSocialLinks } from '@/utils/clientSocialLinks';
import { SocialLink } from '@/utils/socialLinks';
import { useAuth } from '@/contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Profile } from '@/types/database';

export default function HomePage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [buyingPlus, setBuyingPlus] = useState(false);
  const [buyingPro, setBuyingPro] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<'gigi' | 'vee' | 'lumo'>('gigi');
  const [isDemoChatOpen, setIsDemoChatOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

    // Handle successful purchase
    const success = searchParams.get('success');
    if (success === 'true') {
      setSuccessMessage('🎉 Payment successful! Your messages and mood check-ins have been added to your account.');
      
      // Clean URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Refresh balance if user is signed in
      if (user) {
        setTimeout(() => {
          fetchUserBalance();
        }, 1000); // Give webhook time to process
      }
    }

    // Handle cancelled purchase
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      setSuccessMessage('❌ Purchase was cancelled. No charges were made.');
      
      // Clean URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('canceled');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Handle authentication errors
    const authError = searchParams.get('error');
    if (authError === 'auth_error') {
      setSuccessMessage('❌ Sign in failed. Please try again.');
      
      // Clean URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
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

  // Function to fetch user balance
  const fetchUserBalance = async () => {
    if (!user) return;
    
    setBalanceLoading(true);
    try {
      const response = await fetch('/api/balance');
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balance when user is available
  useEffect(() => {
    if (user) {
      fetchUserBalance();

      // Fetch user profile from Supabase
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }: { data: Profile | null }) => setUserProfile(data));
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

  const handleBuyPlus = async () => {
    // Check if user is signed in
    if (!user) {
      alert('Please sign in first to purchase the Plus plan. Click the "Sign In" button at the top right.');
      return;
    }

    setBuyingPlus(true);
    try {
      // Use API-based checkout instead of direct Stripe URL
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        alert('Something went wrong with the payment. Please try again.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setBuyingPlus(false);
    }
  };

  const handleBuyPro = async () => {
    // Pro plan is not implemented yet
    alert('Pro plan is coming soon! Please try the Plus plan for now.');
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

  // Check for success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    
    if (success === 'true') {
      // Show success message and refresh balance
      setShowSuccess(true);
      
      // Refresh user balance after successful purchase
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, []);

  // Success message state
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <main className={`relative min-h-screen w-full ${getAvatarColorScheme(selectedAvatar).bgPrimary}`}>
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
                  <span className="text-gray-600 dark:text-gray-400">Messages: </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{balance}</span>
                  {user.email && (
                    <>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px] sm:max-w-none" title={user.email}>
                        {user.email}
                      </span>
                    </>
                  )}
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
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.5 20q-2.28 0-3.89-1.57Q1 16.86 1 14.58q0-1.95 1.17-3.48q1.18-1.52 3.08-1.95q.55-2.27 2.39-3.71Q9.68 4 12 4t4.36 1.44q1.84 1.44 2.39 3.71q1.9.43 3.08 1.95Q23 12.63 23 14.58q0 2.28-1.61 3.85Q19.78 20 17.5 20H6.5Z"/>
                  </svg>
                </button>
                {user ? (
                  <button
                    onClick={signOut}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white/70 dark:bg-gray-800/70 rounded-lg text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 text-sm font-medium"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={signInWithGoogle}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-white/70 dark:bg-gray-800/70 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 text-sm font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Sign In'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded-lg">
              <p className="text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          )}

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
            onUpgrade={() => handleBuyPlus()}
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
              <div className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border-2 ${getAvatarColorScheme(selectedAvatar).borderColor}`}>
                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColorScheme(selectedAvatar).gradient} p-1`}>
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
                  <h2 className={`text-2xl font-bold ${getAvatarColorScheme(selectedAvatar).textColor}`}>
                    Chat with {currentAvatar.name}
                  </h2>
                </div>
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>}>
                  <ChatCard 
                    user={user}
                    balance={balance}
                    selectedAvatar={currentAvatar}
                  />
                </Suspense>
              </div>
            </section>
          )}

          {/* Mood Check-in Section */}
          <section className="mb-12 lg:mb-16">
            <div className={`bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 shadow-lg border-2 ${getAvatarColorScheme(selectedAvatar).borderColor}`}>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColorScheme(selectedAvatar).gradient} p-1`}>
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
                <h2 className={`text-2xl font-bold ${getAvatarColorScheme(selectedAvatar).textColor}`}>
                  Daily Mood Check-in
                </h2>
              </div>
              
              {/* Mood Chain Upsell */}
              <UpsellBanner 
                trigger="mood-chain"
                onUpgrade={() => handleBuyPlus()}
              />
              
              <div className="max-w-md mx-auto">
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg"></div>}>
                  <MoodCheckinCard />
                </Suspense>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">200 messages + 60 mood check-ins and reports</p>
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
                  <div className="mt-4">
                    <button
                      onClick={handleBuyPlus}
                      disabled={buyingPlus}
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                        buyingPlus
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {buyingPlus ? 'Processing...' : 'Get Plus'}
                    </button>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600 h-fit">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Pro</h3>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">$9.99</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">500 messages + 150 mood check-ins and reports</p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Unlimited access</span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <button
                      onClick={handleBuyPro}
                      disabled={true}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gray-400 cursor-not-allowed text-white`}
                    >
                      Coming Soon
                    </button>
                  </div>
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
              <div className="max-w-3xl mx-auto">
                <Suspense fallback={<div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>}>
                  <FAQCard />
                </Suspense>
              </div>
            </div>
          </section>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </main>
  );
}
