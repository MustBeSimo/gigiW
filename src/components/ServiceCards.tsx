'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import BreathingMiniApp from '@/components/BreathingMiniApp';
import MoodCheckinCard from '@/components/MoodCheckinCard';
import Guides from '@/components/Guides';

interface ServiceCardsProps {
  className?: string;
}

const ServiceCards: React.FC<ServiceCardsProps> = ({ className = '' }) => {
  const { themeClasses } = useTheme();
  const [activeService, setActiveService] = useState<string | null>(null);

  const handleServiceClick = (serviceId: string) => {
    setActiveService(serviceId);
  };

  const handleCloseService = () => {
    setActiveService(null);
  };

  const services = [
    {
      id: 'mindair',
      title: 'MindAir',
      icon: '🌬️',
      description: 'Breathing exercises and mindfulness techniques',
      gradient: 'from-blue-400 to-cyan-400',
      action: 'Start Breathing',
      comingSoon: false
    },
    {
      id: 'mindguide',
      title: 'MindGuide',
      icon: '🧭',
      description: 'Personalized wellness guidance and insights',
      gradient: 'from-purple-400 to-pink-400',
      action: 'Get Guidance',
      comingSoon: false
    },
    {
      id: 'vibecheck',
      title: 'VibeCheck',
      icon: '💫',
      description: 'Mood tracking and emotional awareness',
      gradient: 'from-emerald-400 to-teal-400',
      action: 'Check Vibe',
      comingSoon: false
    }
  ];

  return (
    <>
      <div className={`grid md:grid-cols-3 gap-6 ${className}`}>
      {services.map((service, index) => (
        <motion.div
          key={service.id}
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-5`} />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white text-xl shadow-lg`}>
                {service.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {service.title}
                </h3>
                {service.comingSoon && (
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 rounded-full font-medium">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm mb-6 text-gray-600 dark:text-gray-300 leading-relaxed">
              {service.description}
            </p>

            {/* Action Button */}
            <button
              disabled={service.comingSoon}
              onClick={() => handleServiceClick(service.id)}
              className={`
                w-full py-3 px-4 rounded-xl font-medium transition-all duration-200
                ${service.comingSoon
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : `bg-gradient-to-r ${service.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`
                }
              `}
            >
              {service.action}
            </button>
          </div>
        </motion.div>
      ))}
      </div>

      {/* Service Components as Overlays */}
    {activeService === 'mindair' && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleCloseService}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <BreathingMiniApp />
        </div>
      </div>
    )}

    {activeService === 'mindguide' && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleCloseService}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Guides />
        </div>
      </div>
    )}

    {activeService === 'vibecheck' && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleCloseService}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <MoodCheckinCard />
        </div>
      </div>
    )}
    </>
  );
};

export default ServiceCards;