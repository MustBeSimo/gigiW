'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { AvatarId, getAvatarClasses } from '@/utils/avatarThemes';

interface SimpleCardProps {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  avatarId?: AvatarId;
}

export default function SimpleCard({
  title,
  subtitle,
  children,
  className = '',
  borderColor = 'border-blue-500',
  avatarId,
}: SimpleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get avatar-specific colors if avatarId is provided
  const avatarClasses = avatarId ? getAvatarClasses(avatarId, isDark) : null;

  // Map border colors to different animation types
  const getBorderAnimation = () => {
    // If avatar theme is provided, use avatar-specific colors
    if (avatarClasses) {
      switch (avatarId) {
        case 'gigi':
          return {
            gradient: 'from-pink-200 via-purple-200 to-rose-200',
            hoverGradient: 'from-pink-200/30 via-purple-200/30 to-rose-200/30'
          };
        case 'vee':
          return {
            gradient: 'from-blue-200 via-cyan-200 to-indigo-200',
            hoverGradient: 'from-blue-200/30 via-cyan-200/30 to-indigo-200/30'
          };
        case 'lumo':
          return {
            gradient: 'from-teal-200 via-emerald-200 to-cyan-200',
            hoverGradient: 'from-teal-200/30 via-emerald-200/30 to-cyan-200/30'
          };
        default:
          return {
            gradient: 'from-blue-200 via-purple-200 to-pink-200',
            hoverGradient: 'from-blue-200/30 via-purple-200/30 to-pink-200/30'
          };
      }
    }

    // Default border color animations
    switch (borderColor) {
      case 'border-emerald-500':
        return {
          gradient: 'from-emerald-200 via-teal-200 to-cyan-200',
          hoverGradient: 'from-emerald-200/30 via-teal-200/30 to-cyan-200/30'
        };
      case 'border-purple-500':
        return {
          gradient: 'from-purple-200 via-pink-200 to-rose-200',
          hoverGradient: 'from-purple-200/30 via-pink-200/30 to-rose-200/30'
        };
      case 'border-blue-500':
        return {
          gradient: 'from-blue-200 via-indigo-200 to-purple-200',
          hoverGradient: 'from-blue-200/30 via-indigo-200/30 to-purple-200/30'
        };
      case 'border-green-500':
        return {
          gradient: 'from-green-200 via-emerald-200 to-teal-200',
          hoverGradient: 'from-green-200/30 via-emerald-200/30 to-teal-200/30'
        };
      case 'border-orange-500':
        return {
          gradient: 'from-orange-200 via-red-200 to-pink-200',
          hoverGradient: 'from-orange-200/30 via-red-200/30 to-pink-200/30'
        };
      default:
        return {
          gradient: 'from-blue-200 via-purple-200 to-pink-200',
          hoverGradient: 'from-blue-200/30 via-purple-200/30 to-pink-200/30'
        };
    }
  };

  const { gradient, hoverGradient } = getBorderAnimation();

  return (
    <div 
      className={`
        relative
        ${avatarClasses ? '' : 'bg-white dark:bg-gray-800'}
        rounded-2xl 
        shadow-lg 
        transition-all duration-700 ease-in-out
        hover:shadow-xl 
        hover:scale-[1.02] 
        overflow-hidden
        group
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Border */}
      <div className={`
        absolute inset-0 rounded-2xl p-[2px] 
        bg-gradient-to-r ${gradient}
        ${isHovered ? 'animate-gentle-glow' : ''}
        transition-all duration-700 ease-in-out
      `}>
        <div className={`
          h-full w-full rounded-2xl transition-all duration-700 ease-in-out
          ${avatarClasses ? `${avatarClasses.animatedBackground}` : 'bg-white dark:bg-gray-800'}
        `} />
      </div>

      {/* Corner Sparkles */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
      </div>
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
        <div className="w-1.5 h-1.5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className={`
            text-xl transition-all duration-300 
            ${isHovered ? 'scale-110 rotate-12 drop-shadow-lg' : ''}
          `}>
            ✨
          </span>
          <h3 className={`
            text-xl font-bold transition-colors duration-700 ease-in-out
            ${avatarClasses ? avatarClasses.textPrimary : 'text-gray-900 dark:text-white'}
          `}>
            {title}
          </h3>
        </div>
        
        {subtitle && (
          <div className={`
            mb-4 ml-8 transition-colors duration-700 ease-in-out
            ${avatarClasses ? avatarClasses.textSecondary : 'text-gray-600 dark:text-gray-400'}
          `}>
            {typeof subtitle === 'string' ? (
              <p>{subtitle}</p>
            ) : (
              subtitle
            )}
          </div>
        )}
        
        <div className={`
          transition-colors duration-700 ease-in-out
          ${avatarClasses ? avatarClasses.textPrimary : 'text-gray-900 dark:text-white'}
        `}>
          {children}
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <div className={`
          absolute inset-0 rounded-2xl 
          bg-gradient-to-r ${hoverGradient}
          animate-pulse-glow
        `} />
      )}

      {/* Subtle Shine Effect */}
      <div className={`
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-transparent via-white/10 to-transparent
        transform -skew-x-12 -translate-x-full
        group-hover:translate-x-full
        transition-transform duration-1000 ease-out
      `} />
    </div>
  );
} 