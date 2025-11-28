'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleChatInput from '@/components/SimpleChatInput';
import AvatarSelector from '@/components/AvatarSelector';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Avatar configuration matching the existing system
const avatars = [
  {
    id: 'gigi' as const,
    name: 'Gigi',
    src: '/images/avatars/Gigi_avatar.png',
    personality: 'Warm & Empathetic',
    description: 'Your caring companion for emotional support and self-compassion',
    gradient: 'from-pink-400/30 via-rose-400/20 to-purple-400/30',
    bgGradient: 'from-rose-50 via-pink-50 to-purple-50',
    bgGradientDark: 'from-rose-950/20 via-pink-950/20 to-purple-950/20',
    accentColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-700',
  },
  {
    id: 'vee' as const,
    name: 'Vee',
    src: '/images/avatars/Vee_avatar.png',
    personality: 'Logical & Structured',
    description: 'Your analytical guide for problem-solving and goal achievement',
    gradient: 'from-blue-400/30 via-cyan-400/20 to-indigo-400/30',
    bgGradient: 'from-sky-50 via-blue-50 to-cyan-50',
    bgGradientDark: 'from-sky-950/20 via-blue-950/20 to-cyan-950/20',
    accentColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
  {
    id: 'lumo' as const,
    name: 'Lumo',
    src: '/images/avatars/Lumo_avatar.png',
    personality: 'Creative & Inspiring',
    description: 'Your imaginative partner for fresh perspectives and mindfulness',
    gradient: 'from-emerald-400/30 via-teal-400/20 to-green-400/30',
    bgGradient: 'from-emerald-50 via-teal-50 to-green-50',
    bgGradientDark: 'from-emerald-950/20 via-teal-950/20 to-green-950/20',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-700',
  }
];

interface SimplifiedHeroProps {
  onUpgrade?: () => void;
}

export default function SimplifiedHero({ onUpgrade }: SimplifiedHeroProps) {
  const { selectedAvatar, setSelectedAvatar, isDarkMode } = useTheme();
  const { avatar } = useThemeInfo();
  const { user, signInWithGoogle } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [demoMessageCount, setDemoMessageCount] = useState(0);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: number}>>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Demo message limit for non-users
  const DEMO_MESSAGE_LIMIT = 3;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a loading state that matches the final design to prevent layout shift
    const loadingAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];
    return (
      <div className={`min-h-screen bg-gradient-to-br ${loadingAvatar.bgGradient} animate-pulse`}>
        <div className="relative z-10 min-h-screen flex flex-col">
          <div className="pt-8 pb-6 px-4 text-center">
            <div className="h-16 md:h-20 lg:h-24 bg-gray-300 dark:bg-gray-700 rounded-lg mb-6 mx-auto max-w-md" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 max-w-3xl mx-auto" />
            <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-12 max-w-lg mx-auto" />
          </div>
          <div className="px-4 mb-16">
            <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded-3xl max-w-4xl mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Handle demo messages for non-users
  const handleDemoMessage = async (message: string) => {
    if (demoMessageCount >= DEMO_MESSAGE_LIMIT) {
      setShowSignUpPrompt(true);
      return;
    }

    setIsLoading(true);
    setHasStartedChat(true);
    const userMessage = { role: 'user' as const, content: message, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // Send demo message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          selectedAvatar,
          isDemo: true,
          messageCount: demoMessageCount
        }),
      });

      const data = await response.json();
      console.log('Demo chat response:', data);

      if (data.message) {
        const assistantMessage = { role: 'assistant' as const, content: data.message, timestamp: Date.now() };
        setChatHistory(prev => [...prev, assistantMessage]);
        setLastResponse(data.message);
      }

      // Update message count
      setDemoMessageCount(prev => prev + 1);

      // Show sign-up prompt after reaching limit
      if (demoMessageCount + 1 >= DEMO_MESSAGE_LIMIT) {
        setTimeout(() => setShowSignUpPrompt(true), 1500);
      }
    } catch (error) {
      console.error('Error sending demo message:', error);
      const errorMessage = { role: 'assistant' as const, content: "I'm having a moment of connection trouble, but I'm here for you! Please try again.", timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authenticated messages
  const handleAuthMessage = async (message: string) => {
    setIsLoading(true);
    setHasStartedChat(true);
    const userMessage = { role: 'user' as const, content: message, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // Send authenticated message to chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          selectedAvatar,
          isDemo: false
        }),
      });

      const data = await response.json();
      console.log('Auth chat response:', data);

      if (data.message) {
        const assistantMessage = { role: 'assistant' as const, content: data.message, timestamp: Date.now() };
        setChatHistory(prev => [...prev, assistantMessage]);
        setLastResponse(data.message);
      }
    } catch (error) {
      console.error('Error sending authenticated message:', error);
      const errorMessage = { role: 'assistant' as const, content: "I'm having a moment of connection trouble, but I'm here for you! Please try again.", timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isDarkMode ? currentAvatar.bgGradientDark : currentAvatar.bgGradient} transition-all duration-1000 relative overflow-hidden`}>
      {/* Subtle background decoration */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${currentAvatar.gradient} opacity-30`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5 }}
      />

      {/* Main content container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header section with title */}
        <motion.div
          className="pt-20 pb-6 px-4 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Eyebrow text */}
          <p className="text-sm md:text-base font-semibold text-purple-600 dark:text-purple-400 mb-3 uppercase tracking-wider">
            AI Wellness Companion for Educational Exploration
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Explore wellness techniques{' '}
            <span className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              anytime, anywhere
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
            Join 100K+ people exploring AI-powered wellness conversations for educational purposes only
          </p>

          {/* Educational Disclaimer Banner */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg flex-shrink-0">⚠️</span>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>Educational & Entertainment Only</strong> - Not therapy, medical advice, or professional mental health treatment. Ages 18+. Crisis? Call 988 (US) or local emergency services.
                </p>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm md:text-base text-gray-600 dark:text-gray-400 mb-8">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% Private
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Educational Content
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              4.9/5 User Rating
            </span>
          </div>
        </motion.div>

        {/* Chat Input Section */}
        <motion.div
          className="px-4 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <SimpleChatInput
            selectedAvatar={selectedAvatar}
            onSendMessage={user ? handleAuthMessage : handleDemoMessage}
            placeholder={
              user
                ? undefined
                : `Try saying something to get started... (${DEMO_MESSAGE_LIMIT - demoMessageCount} demo messages left)`
            }
            disabled={(!user && showSignUpPrompt) || isLoading}
            isLoading={isLoading}
            chatHistory={chatHistory}
            hasStartedChat={hasStartedChat}
          />


          {/* Demo message counter for non-users */}
          {!user && (
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-gray-800/70 rounded-full border border-gray-200 dark:border-gray-600">
                <div className="flex gap-1">
                  {[...Array(DEMO_MESSAGE_LIMIT)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < demoMessageCount ? 'bg-purple-400' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Demo messages
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Avatar Selection */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <AvatarSelector
            selectedAvatar={selectedAvatar}
            onAvatarSelect={setSelectedAvatar}
            className="mb-16 px-4"
          />
        </motion.div>

        {/* Services Section */}
        <motion.div
          className="px-4 mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
            What makes your AI friend special?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="text-center p-6"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Pure Fun</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Laugh, play, and enjoy lighthearted conversations that brighten your day
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Wise Guidance</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get thoughtful advice and perspectives when you need direction in life
              </p>
            </motion.div>

            <motion.div
              className="text-center p-6"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">True Friendship</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Experience genuine companionship that's always there when you need it
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Sign-Up Prompt Modal for Demo Users */}
        {showSignUpPrompt && !user && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => setShowSignUpPrompt(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to unlock 20 free chats?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  You've used all your demo messages! Sign in to get 20 free messages and continue chatting with your AI companion.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setShowSignUpPrompt(false);
                  }}
                  className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-semibold shadow-lg transition-all duration-200 hover:scale-105"
                >
                  Sign In with Google
                </button>

                <button
                  onClick={() => setShowSignUpPrompt(false)}
                  className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold transition-all duration-200"
                >
                  Maybe Later
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    20 free messages
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    All features
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Call to Action for Non-Users */}
        {!user && (
          <motion.div
            className="px-4 mb-16 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-xl max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to explore wellness conversations?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Join thousands exploring AI wellness conversations. Start with 20 free messages for educational purposes.
              </p>
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Try 20 Free Messages →
              </button>
            </div>
          </motion.div>
        )}

        {/* Bottom disclaimer */}
        <motion.div
          className="px-4 pb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <p className="text-xs text-gray-500 dark:text-gray-500 max-w-lg mx-auto">
            🔒 Your conversations are private • This is supportive AI, not professional therapy • Crisis? Call 988 (US)
          </p>
        </motion.div>
      </div>
    </div>
  );
}