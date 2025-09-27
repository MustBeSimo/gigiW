'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface Avatar {
  id: 'gigi' | 'vee' | 'lumo';
  name: string;
  personality: string;
  description: string;
  src: string;
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const avatars: Avatar[] = [
  {
    id: 'gigi',
    name: 'Gigi',
    personality: 'Fun & Creative',
    description: 'Your vibrant AI companion for joyful conversations and creative inspiration',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-400 to-rose-400',
    bgColor: 'bg-gradient-to-br from-pink-50 to-rose-100',
    textColor: 'text-pink-700',
    borderColor: 'border-pink-300 hover:border-pink-400'
  },
  {
    id: 'vee',
    name: 'Vee',
    personality: 'Wise & Supportive',
    description: 'Your thoughtful AI guide for guidance, reflection, and meaningful insights',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-400 to-indigo-400',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300 hover:border-blue-400'
  },
  {
    id: 'lumo',
    name: 'Lumo',
    personality: 'Calm & Mindful',
    description: 'Your peaceful AI friend for wellness, mindfulness, and happy moments',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-emerald-400 to-teal-400',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-300 hover:border-emerald-400'
  }
];

interface AvatarSelectorProps {
  selectedAvatar: 'gigi' | 'vee' | 'lumo';
  onAvatarSelect: (avatarId: 'gigi' | 'vee' | 'lumo') => void;
  className?: string;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onAvatarSelect,
  className = ''
}) => {
  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Section Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          Choose Your AI Friend
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg">
          Each personality offers a unique conversation style - pick the one that resonates with you
        </p>
      </motion.div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {avatars.map((avatar, index) => {
          const isSelected = selectedAvatar === avatar.id;

          return (
            <motion.button
              key={avatar.id}
              onClick={() => onAvatarSelect(avatar.id)}
              className={`
                group relative p-6 rounded-3xl border-2 transition-all duration-300
                ${isSelected
                  ? `${avatar.bgColor} ${avatar.borderColor.split(' ')[0]} shadow-lg ring-2 ring-offset-2 ring-opacity-50`
                  : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:${avatar.bgColor.replace('bg-gradient-to-br', 'bg-gradient-to-br').replace('from-', 'from-').replace('-50', '-25').replace('-100', '-50')} hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md`
                }
                hover:scale-105 active:scale-95
              `}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                type: "spring",
                stiffness: 150
              }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-r ${avatar.gradient} flex items-center justify-center shadow-lg`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                >
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              {/* Avatar Image */}
              <div className="flex justify-center mb-6">
                <motion.div
                  className={`
                    relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3
                    ${isSelected
                      ? `border-gradient-to-r ${avatar.gradient} shadow-xl`
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Gradient border effect for selected */}
                  {isSelected && (
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${avatar.gradient} p-0.5`}>
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800" />
                    </div>
                  )}

                  <Image
                    src={avatar.src}
                    alt={`${avatar.name} avatar`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover relative z-10"
                    priority={index === 0}
                  />

                  {/* Subtle glow effect on hover */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${avatar.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                </motion.div>
              </div>

              {/* Avatar Info */}
              <div className="text-center space-y-3">
                <div>
                  <h3 className={`text-xl md:text-2xl font-bold mb-1 ${isSelected ? avatar.textColor : 'text-gray-800 dark:text-gray-100'}`}>
                    {avatar.name}
                  </h3>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    isSelected
                      ? `bg-gradient-to-r ${avatar.gradient} text-white`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {avatar.personality}
                  </div>
                </div>

                <p className={`text-sm md:text-base leading-relaxed ${
                  isSelected ? avatar.textColor : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {avatar.description}
                </p>

                {/* Call-to-action for selected avatar */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`mt-4 p-3 rounded-xl bg-gradient-to-r ${avatar.gradient} bg-opacity-10 border border-current border-opacity-20`}
                  >
                    <p className={`text-sm font-medium ${avatar.textColor}`}>
                      Perfect! Start chatting with {avatar.name} above ↑
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Hover animation background */}
              <motion.div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${avatar.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}
                initial={false}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
          <span className="font-medium">Friends on demand</span> - Switch between personalities anytime to match your mood
        </p>
      </motion.div>
    </div>
  );
};

export default AvatarSelector;