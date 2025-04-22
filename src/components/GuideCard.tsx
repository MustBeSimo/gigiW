'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';

interface GuideCardProps {
  title: string;
  description: string;
  imageSrc: string;
  downloadUrl: string;
  className?: string;
}

export default function GuideCard({
  title,
  description,
  imageSrc,
  downloadUrl,
  className = '',
}: GuideCardProps) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Background image with overlay */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageSrc} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-2">
          <AnimatedText text={title} className="inline-block" />
        </h3>
        <p className="text-sm text-gray-200 mb-4">
          <AnimatedText text={description} className="inline-block" />
        </p>
        
        <motion.a
          href={downloadUrl}
          download
          className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Free Guide
        </motion.a>
      </div>
    </motion.div>
  );
} 