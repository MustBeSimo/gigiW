'use client';

import React, { useState, useEffect, Suspense } from 'react';
import SimplifiedHero from '@/components/SimplifiedHero';
import Footer from '@/components/Footer';
import ProfileSettings from '@/components/ProfileSettings';
import ThemeToggle from '@/components/ThemeToggle';
const ChatCard = React.lazy(() => import('@/components/ChatCard'));
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Profile } from '@/types/database';
import { motion } from 'framer-motion';
import { GeneralDisclaimer, CrisisBanner } from '@/components/ComplianceDisclaimer';
import MindGleamLogoAnimated from '@/components/MindGleamLogoAnimated';
import ServiceCards from '@/components/ServiceCards';
import { avatarThemes } from '@/utils/avatarThemes';

export default function HomeClient() {
  const [isClient, setIsClient] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [buyingPlus, setBuyingPlus] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { selectedAvatar, setSelectedAvatar, themeClasses, isDarkMode } = useTheme();
  const { avatar, themeName } = useThemeInfo();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get avatar info from avatarThemes - single source of truth
  const getAvatarInfo = (avatarId: 'gigi' | 'vee' | 'lumo') => {
    const theme = avatarThemes[avatarId];
    return {
      id: avatarId,
      name: theme.name,
      description: theme.description,
      src: `/images/avatars/${theme.name}_avatar.png`,
      gradient: theme.gradient,
      bgGradient: isDarkMode ? theme.animatedBackground.dark : theme.animatedBackground.light,
      bgGradientDark: theme.animatedBackground.dark,
    };
  };

  const currentAvatarInfo = getAvatarInfo(selectedAvatar);

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
      setSuccessMessage('🎉 Payment successful! Your chat messages have been added to your account.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('success');
      window.history.replaceState({}, '', newUrl.toString());
      if (user) {
        setTimeout(() => {
          fetchUserBalance();
        }, 1000);
      }
    }

    // Handle cancelled purchase
    const cancelled = searchParams.get('canceled');
    if (cancelled === 'true') {
      setSuccessMessage('❌ Purchase was cancelled. No charges were made.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('canceled');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Handle authentication errors
    const authError = searchParams.get('error');
    if (authError === 'auth_error') {
      setSuccessMessage('❌ Sign in failed. Please try again.');
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
    }

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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching balance:', error);
      }
    } finally {
      setBalanceLoading(false);
    }
  };

  // Fetch balance when user is available
  useEffect(() => {
    if (user) {
      fetchUserBalance();
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data }: { data: Profile | null }) => setUserProfile(data));
    }
  }, [user]);

  const handleBuyPlus = async () => {
    if (!user) {
      alert('Please sign in first to purchase the Plus plan. Click the "Sign In" button at the top right.');
      return;
    }
    setBuyingPlus(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create checkout session');
      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) throw new Error('Stripe failed to load');
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Stripe redirect error:', error);
        }
        alert('Something went wrong with the payment. Please try again.');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error during checkout:', error);
      }
      alert('Something went wrong. Please try again.');
    } finally {
      setBuyingPlus(false);
    }
  };




  return (
    <main className={themeClasses.main}>
      {/* Header Navigation - Floating on top of hero */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/20">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 text-gray-900 dark:text-white">
                <MindGleamLogoAnimated mode="mono" />
              </div>
              <h1 className={`text-xl font-bold ${themeClasses.heading}`}>Mind Gleam</h1>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              {loading ? (
                <div className="w-20 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-2">
                  {balance !== null && (
                    <div className="px-3 py-1.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-white/30 dark:border-gray-600/30">
                      {balance} credits
                    </div>
                  )}
                  <button
                    onClick={() => setShowProfileSettings(true)}
                    className="p-2.5 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/30 dark:hover:bg-gray-800/30 transition-all duration-200 border border-white/30 dark:border-gray-600/30"
                    title="Profile Settings"
                    aria-label="Open profile settings"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto">
          <motion.div
            className="p-4 bg-green-100 dark:bg-green-900/90 border border-green-300 dark:border-green-600 rounded-lg shadow-lg backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="text-green-800 dark:text-green-200">{successMessage}</p>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-green-950/20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}

      {/* Hero - same for all users */}
      {!loading && (
        <SimplifiedHero onUpgrade={handleBuyPlus} />
      )}

      {/* Signed-in extras below hero - Service Cards only */}
      {!loading && user && (
        <>
          {/* Service Cards Section */}
          <section className="px-4 mb-16">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Complete Wellness Experience
                </motion.h2>
                <motion.p
                  className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Beyond conversations, explore our full suite of mental wellness tools
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <ServiceCards />
              </motion.div>
            </div>
          </section>
        </>
      )}


      {/* Minimal Compliance Footer */}
      <section className="py-8 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <GeneralDisclaimer compact className="mx-auto" />
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProfileSettings isOpen={showProfileSettings} onClose={() => setShowProfileSettings(false)} />
    </main>
  );
}


