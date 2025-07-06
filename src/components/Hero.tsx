'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Import animations based on react-animations.txt
const SplitText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <motion.div 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {text}
    </motion.div>
  );
};

// Avatar configuration
const avatars = [
  {
    id: 'gigi' as const,
    name: 'Gigi',
    description: 'Your empathetic companion',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-200 to-purple-200'
  },
  {
    id: 'vee' as const,
    name: 'Vee',
    description: 'Your logical coach',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-200 to-cyan-200'
  },
  {
    id: 'lumo' as const,
    name: 'Lumo',
    description: 'Your creative guide',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-teal-200 to-emerald-200'
  }
];

interface HeroProps {
  onStartDemo: () => void;
  selectedAvatar: string;
  onAvatarChange: (avatar: 'gigi' | 'vee' | 'lumo') => void;
}

export default function Hero({ onStartDemo, selectedAvatar, onAvatarChange }: HeroProps) {
  const { user, signInWithGoogle } = useAuth();
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar) || avatars[0];

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = avatars.map(avatar => avatar.src);

      const loadPromises = imageUrls.map(url => {
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.src = url;
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        });
      });

      try {
        await Promise.all(loadPromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true);
      }
    };

    preloadImages();
  }, []);

  return (
    <div className="relative">
      {/* Main Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 dark:to-black/10"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-orange-100/30 via-transparent to-transparent dark:from-orange-900/10"></div>
        
        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Headline - Mobile First */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="mb-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
                Feel lighter in 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                  {" "}five minutes
                </span> a day
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 font-medium max-w-3xl mx-auto">
                50 AI-guided CBT sessions free—start now, no card needed
              </p>
            </motion.div>

            {/* Avatar Selection - Horizontal Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">
                Choose your AI companion:
              </p>
              <div className="flex justify-center gap-4 sm:gap-6 overflow-x-auto pb-2">
                {avatars.map((avatar) => (
                  <motion.button
                    key={avatar.id}
                    onClick={() => onAvatarChange(avatar.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 min-w-[80px] ${
                      selectedAvatar === avatar.id 
                        ? 'bg-white/60 dark:bg-gray-800/60 shadow-lg scale-105' 
                        : 'bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-102'
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${avatar.gradient} p-1`}>
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {imagesLoaded && (
                          <Image
                            src={avatar.src}
                            alt={avatar.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{avatar.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{avatar.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons - Mobile Optimized - Only show when NOT signed in */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
              >
                {/* Primary CTA - Demo Chat */}
                <motion.button
                  onClick={onStartDemo}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Try 3 Free Messages</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </motion.button>

                {/* Secondary CTA - Full Access */}
                <motion.button
                  onClick={signInWithGoogle}
                  className="w-full sm:w-auto bg-white/80 hover:bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl text-lg border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Get 20 Free Sessions</span>
                </motion.button>
              </motion.div>
            )}

            {/* Welcome message for signed-in users */}
            {user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mb-8"
              >
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-6 shadow-md">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome back! 👋
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ready to continue your wellness journey with {avatars.find(a => a.id === selectedAvatar)?.name}?
                  </p>
                </div>
              </motion.div>
            )}

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600 dark:text-gray-400"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Evidence-based CBT</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>100% private & secure</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 