'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import Image from 'next/image';
import MindGleamLogoAnimated from '@/components/MindGleamLogoAnimated';
import InlineChat from '@/components/InlineChat';

// Typewriter component for rotating taglines
const TypewriterTaglines = () => {
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const taglines = [
    { text: "Feel lighter in five minutes a day", color: "text-emerald-500" },
    { text: "Transform anxious thoughts into calm confidence", color: "text-blue-500" },
    { text: "Build mental resilience with CBT-inspired tools", color: "text-purple-500" },
    { text: "Your AI companion for emotional wellness", color: "text-pink-500" },
    { text: "Evidence-based techniques for daily mental health", color: "text-teal-500" }
  ];

  const currentTagline = taglines[currentTaglineIndex];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping) {
      if (displayText.length < currentTagline.text.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentTagline.text.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause before erasing
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 50);
      } else {
        setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isTyping, currentTagline.text]);

  return (
    <div className="h-20 sm:h-24 lg:h-28 flex items-center justify-center">
      <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-center leading-tight ${currentTagline.color} transition-colors duration-500`}>
        {displayText}
        <span className="animate-pulse">|</span>
      </h1>
    </div>
  );
};

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

// Avatar configuration with unified colors
const avatars = [
  {
    id: 'gigi' as const,
    name: 'Gigi',
    description: 'Your empathetic companion',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-mindgleam-peach-200 to-mindgleam-peach-300'
  },
  {
    id: 'vee' as const,
    name: 'Vee',
    description: 'Your logical coach',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-mindgleam-lavender-200 to-mindgleam-lavender-300'
  },
  {
    id: 'lumo' as const,
    name: 'Lumo',
    description: 'Your creative guide',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-mindgleam-mint-200 to-mindgleam-mint-300'
  }
];

interface HeroProps {
  onStartDemo: (goal?: string) => void;
}

export default function Hero({ onStartDemo }: HeroProps) {
  const { user, signInWithGoogle } = useAuth();
  const { selectedAvatar, setSelectedAvatar, themeClasses } = useTheme();
  const { avatar, themeName } = useThemeInfo();
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const avatarSectionRef = useRef<HTMLDivElement | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null);
  const [showPoints, setShowPoints] = useState<boolean>(false);

  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar) || avatars[0];

  // Goal options for users to select
  const goalOptions = [
    { id: 'sleep', emoji: '😴', label: 'Sleep Better', description: 'Calm racing thoughts at bedtime' },
    { id: 'stress', emoji: '🧘', label: 'Stress Less', description: 'Build resilience for daily challenges' },
    { id: 'confidence', emoji: '💪', label: 'Grow Confidence', description: 'Challenge self-doubt and limiting beliefs' },
    { id: 'anxiety', emoji: '🌱', label: 'Manage Anxiety', description: 'Learn to reframe anxious thoughts' },
  ];

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

  // Removed auto-rotation as it's annoying during chat interactions

  return (
    <div className="relative">
      {/* Main Hero Section */}
      <div className={`relative overflow-hidden rounded-2xl ${themeClasses.container}`}>
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/5 dark:to-black/10"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-orange-100/30 via-transparent to-transparent dark:from-orange-900/10"></div>
        
        {/* Content - Rearranged layout */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-4"
            >
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none ${themeClasses.heading}`}>
                Turn today around
              </h1>
              <p className={`mt-3 text-lg sm:text-xl font-medium tracking-wide leading-relaxed ${themeClasses.subheading}`}>
                Tap your vibe. Get a boost. Go.
              </p>
            </motion.div>

            {/* Progress */}
            <div className="max-w-md mx-auto mb-6">
              <div className="w-full h-2 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full ${themeClasses.btnPrimary} transition-all duration-300`}
                  style={{ width: `${(currentStep - 1) * 33.33}%` }}
                />
              </div>
              <p className={`mt-2 text-xs ${themeClasses.caption}`}>Step {Math.min(currentStep, 3)} of 3</p>
            </div>

            {/* Steps */}
            <div className="mb-6">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`text-xl font-bold tracking-tight ${themeClasses.heading} mb-4`}>What's your vibe right now?</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {[
                      { id: 'chill', label: 'Chill', emoji: '😌' },
                      { id: 'meh', label: 'Meh', emoji: '😐' },
                      { id: 'stressed', label: 'Stressed', emoji: '😵' },
                    ].map((m) => (
                      <motion.button
                        key={m.id}
                        onClick={() => { setSelectedMood(m.id); setCurrentStep(2); }}
                        className={`px-4 py-3 rounded-xl ${themeClasses.card} hover:scale-105 shadow-sm hover:shadow-md transition-all duration-200`}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className="text-2xl mr-2">{m.emoji}</span>
                        <span className={`font-semibold tracking-wide ${themeClasses.heading}`}>{m.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`text-xl font-bold tracking-tight ${themeClasses.heading} mb-4`}>Pick your boost</p>
                  <div className="flex justify-center gap-3 flex-wrap">
                    {[
                      { id: 'calm', label: 'Calm' },
                      { id: 'focus', label: 'Focus' },
                      { id: 'confidence', label: 'Confidence' },
                    ].map((e) => (
                      <motion.button
                        key={e.id}
                        onClick={() => {
                          setSelectedEnergy(e.id);
                          if (!user) {
                            // Gate after step 2
                            signInWithGoogle();
                          }
                          setCurrentStep(3);
                        }}
                        className={`px-4 py-3 rounded-xl ${themeClasses.card} hover:scale-105 shadow-sm hover:shadow-md transition-all duration-200`}
                        whileTap={{ scale: 0.97 }}
                      >
                        <span className={`font-semibold tracking-wide ${themeClasses.heading}`}>{e.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  {!user && (
                    <p className={`mt-3 text-xs ${themeClasses.caption}`}>Sign in to save your plan and continue.</p>
                  )}
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={`text-xl font-bold tracking-tight ${themeClasses.heading} mb-3`}>Choose your guide</p>
                  <div className="flex justify-center gap-2 sm:gap-3 flex-wrap max-w-sm mx-auto" ref={avatarSectionRef}>
                    {avatars.map((a) => (
                      <motion.button
                        key={a.id}
                        onClick={() => {
                          setSelectedAvatar(a.id);
                          setShowPoints(true);
                          setCurrentStep(4);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg transition-all duration-300 min-w-[80px] sm:min-w-[90px] flex-1 max-w-[100px] ${
                          selectedAvatar === a.id
                            ? `${themeClasses.card} shadow-md scale-105 ring-2 ring-opacity-50 ${themeClasses.glow}`
                            : `${themeClasses.card} opacity-70 hover:opacity-100 hover:scale-102`
                        }`}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${a.gradient} p-0.5`}>
                          <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                            {imagesLoaded && (
                              <Image src={a.src} alt={a.name} width={40} height={40} className="object-contain avatar-image" sizes="40px" />
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className={`text-xs font-bold tracking-wide uppercase ${themeClasses.heading}`}>{a.name}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`${themeClasses.card} rounded-xl p-6 shadow-lg`}>
                    <p className={`text-2xl font-black tracking-tight leading-tight ${themeClasses.heading} mb-2`}>Your mini‑plan is ready 🎉</p>
                    <p className={`text-sm font-medium tracking-wide ${themeClasses.subheading} mb-4`}>Mood: {selectedMood} • Boost: {selectedEnergy} • Guide: {currentAvatar.name}</p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          try {
                            if (selectedEnergy) localStorage.setItem('selectedGoal', selectedEnergy);
                            if (selectedMood) localStorage.setItem('selectedMood', selectedMood);
                            if (selectedAvatar) localStorage.setItem('selectedGuide', selectedAvatar);
                          } catch (e) {}
                          onStartDemo(selectedEnergy || undefined);
                        }}
                        className={`px-5 py-3 rounded-lg text-white ${themeClasses.btnPrimary} font-bold tracking-wide transition-all`}
                      >
                        Start now
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                          setSelectedMood(null);
                          setSelectedEnergy(null);
                          setShowPoints(false);
                        }}
                        className={`px-4 py-3 rounded-lg ${themeClasses.btnSecondary} font-medium tracking-wide transition-all`}
                      >
                        Restart
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Points chip */}
            <AnimatePresence>
              {showPoints && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${themeClasses.btnSecondary} text-sm font-medium`}
                >
                  <span>+5 feel‑good points</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className={`mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs ${themeClasses.caption}`}
            >
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>100% private</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>CBT‑inspired</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Loved by busy humans</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 