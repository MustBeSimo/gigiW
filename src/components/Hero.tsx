'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

// Import animations based on react-animations.txt
const SplitText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <motion.div className={className}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: i * 0.03,
              ease: [0.215, 0.61, 0.355, 1]
            }}
            className="inline-block"
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};

const GlitchText = ({ text, className = '' }: { text: string; className?: string }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <span className="inline-block relative">
        {text}
        <span className="absolute left-0 top-0 text-cyan-400 opacity-70 animate-pulse">{text}</span>
        <span className="absolute left-0 top-0 text-pink-500 opacity-70 mix-blend-difference animate-pulse">{text}</span>
      </span>
    </motion.div>
  );
};

export default function Hero() {
  const { user, signInWithGoogle } = useAuth();

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Main content container */}
      <div className="container mx-auto px-6 py-24 relative z-10">
        <div className="flex flex-col items-center justify-center text-white text-center">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              GIGI
            </h1>
            <h2 className="text-4xl font-light tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              GLITZ
            </h2>
          </motion.div>

          {/* Main tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <GlitchText
              text="TALK TO YOUR AI MUSE"
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white"
            />
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mb-20"
          >
            {user ? (
              <Link href="/chat">
                <button className="bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 text-white px-12 py-4 rounded-full text-xl font-medium transition-all duration-300 border border-white/30 shadow-xl hover:shadow-pink-500/20">
                  Let's chat
                </button>
              </Link>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-white bg-opacity-20 backdrop-blur-md hover:bg-opacity-30 text-white px-12 py-4 rounded-full text-xl font-medium transition-all duration-300 border border-white/30 shadow-xl hover:shadow-pink-500/20"
              >
                Let's chat
              </button>
            )}
          </motion.div>

          {/* Social and Navigation Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
            {/* Left side - Instagram */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10"
            >
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-1 rounded-lg">
                    <svg 
                      className="w-6 h-6 text-white" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                  <span className="ml-2 text-lg font-semibold">FOLLOW GIGI</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Image
                    src="/images/media/blue-hair-portrait.png"
                    alt="Gigi portrait"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                  <Image 
                    src="/images/media/3 dancing.png"
                    alt="Gigi dancing"
                    width={150}
                    height={150}
                    className="rounded-lg object-cover"
                  />
                </div>

                <div className="mt-4 w-full">
                  <a 
                    href="#" 
                    className="flex items-center justify-center py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium"
                  >
                    <span>Download Free Guides</span>
                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 9L14 3M14 3V15M14 3H12M5 15L10 21M10 21V9M10 21H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right side - Digital Confidence */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="bg-black/30 backdrop-blur-md p-6 rounded-2xl border border-white/10"
            >
              <h3 className="text-center font-semibold text-2xl mb-8">
                EXPLORE<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">DIGITAL</span><br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">CONFIDENCE</span>
              </h3>

              <div className="space-y-4">
                <a href="#" className="flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300">
                  <div className="bg-cyan-500/20 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="font-medium">WELLNESS GUIDE</span>
                </a>
                
                <a href="#" className="flex items-center p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300">
                  <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">CRYPTO GUIDE</span>
                </a>
              </div>

              <div className="mt-6 text-center">
                <button className="text-white font-semibold bg-purple-600/50 hover:bg-purple-600/70 py-2 px-8 rounded-lg transition-all duration-300">
                  START TALKING NOW
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 