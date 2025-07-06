'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import ThoughtRecordGuide from '@/components/ThoughtRecordGuide';

export interface GuideCardProps {
  title?: string;
  description?: string;
  imageSrc?: string;
  downloadUrl?: string;
  className?: string;
}

export default function GuideCard({
  title = "Thought Record Guide",
  description = "Master a 5-step thought-shift exercise to transform difficult thoughts",
  imageSrc = "/images/guides/thought-record.png",
  downloadUrl = "#",
  className = '',
}: GuideCardProps) {
  const [showInteractiveGuide, setShowInteractiveGuide] = useState(false);

  const guides = [
    {
      title: "Thought Record Guide",
      description: "Master a 5-step thought-shift exercise to transform difficult thoughts with evidence-based techniques (CBT-inspired)",
      imageSrc: "/images/guides/thought-record.png",
      downloadUrl: "#",
      hasInteractive: true
    },
    {
      title: "Glow Up & Own It: 10 Exercises to Build Confidence",
      description: "Ready to break up with self-doubt and fall head over heels in love with your body?",
      imageSrc: "/images/guides/confidence-guide.jpg",
      downloadUrl: "https://payhip.com/b/YKuyU",
      hasInteractive: false
    }
  ];

  if (showInteractiveGuide) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Interactive Thought Record Guide
          </h3>
          <button
            onClick={() => setShowInteractiveGuide(false)}
            className="px-4 py-2 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Guides
          </button>
        </div>
        <ThoughtRecordGuide />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {guides.map((guide, index) => (
        <GuideCardItem 
          key={index}
          title={guide.title}
          description={guide.description}
          imageSrc={guide.imageSrc}
          downloadUrl={guide.downloadUrl}
          hasInteractive={guide.hasInteractive}
          onStartInteractive={() => setShowInteractiveGuide(true)}
        />
      ))}
    </div>
  );
}

function GuideCardItem({
  title,
  description,
  imageSrc,
  downloadUrl,
  hasInteractive,
  onStartInteractive,
  className = '',
}: GuideCardProps & { hasInteractive?: boolean; onStartInteractive?: () => void }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
    >
      {/* Image at the top */}
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-56 object-cover rounded-t-xl"
      />
      {/* Content below image */}
      <div className="p-4 text-gray-800 dark:text-white bg-white/80 dark:bg-black/80 rounded-b-xl flex flex-col gap-2">
        <h3 className="text-lg font-bold mb-2">
          <AnimatedText text={title || ""} className="inline-block" />
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          <AnimatedText text={description || ""} className="inline-block" />
        </p>
        
        <div className="flex gap-2">
          {hasInteractive && (
            <motion.button
              onClick={onStartInteractive}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400 text-white py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10,8 16,12 10,16 10,8"></polygon>
              </svg>
              Start Interactive Guide
            </motion.button>
          )}
          
          <motion.a
            href={downloadUrl || "#"}
            download={downloadUrl !== "#" && downloadUrl !== undefined}
            target={downloadUrl?.startsWith("http") ? "_blank" : "_self"}
            rel={downloadUrl?.startsWith("http") ? "noopener noreferrer" : ""}
            className={`${hasInteractive ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 bg-emerald-300 hover:bg-emerald-400 text-white py-2 px-4 rounded-lg font-medium text-sm transition-colors`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {downloadUrl === "#" ? "View Guide" : "Download Free Guide"}
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
} 