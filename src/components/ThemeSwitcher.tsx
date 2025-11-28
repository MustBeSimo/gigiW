'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import { AvatarId } from '@/utils/avatarThemes';

const ThemeSwitcher: React.FC = () => {
  const { selectedAvatar, setSelectedAvatar, isDarkMode, toggleDarkMode, themeClasses } = useTheme();
  const { avatar } = useThemeInfo();

  const avatars: Array<{id: AvatarId, name: string, emoji: string, description: string}> = [
    { id: 'gigi', name: 'Gigi', emoji: '🌸', description: 'Warm & Empathetic' },
    { id: 'vee', name: 'Vee', emoji: '💙', description: 'Cool & Analytical' },
    { id: 'lumo', name: 'Lumo', emoji: '🌿', description: 'Fresh & Creative' }
  ];

  return (
    <div className={`${themeClasses.card} p-4 space-y-4`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-lg font-semibold ${themeClasses.heading}`}>
          Choose Your Theme
        </h3>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-lg ${themeClasses.btnSecondary} transition-all duration-300`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="space-y-3">
        <p className={`text-sm ${themeClasses.caption}`}>
          Select your AI companion to personalize your experience:
        </p>
        
        <div className="grid grid-cols-1 gap-2">
          {avatars.map((avatarOption) => (
            <motion.button
              key={avatarOption.id}
              onClick={() => setSelectedAvatar(avatarOption.id)}
              className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                selectedAvatar === avatarOption.id
                  ? `${themeClasses.btnPrimary} text-white border-transparent`
                  : `${themeClasses.card} ${themeClasses.cardHover}`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{avatarOption.emoji}</span>
                <div>
                  <div className="font-semibold">{avatarOption.name}</div>
                  <div className={`text-xs ${
                    selectedAvatar === avatarOption.id ? 'text-white/80' : themeClasses.caption
                  }`}>
                    {avatarOption.description}
                  </div>
                </div>
                {selectedAvatar === avatarOption.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className={`pt-3 border-t border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center justify-between text-sm">
          <span className={themeClasses.caption}>
            Current theme: <span className={themeClasses.heading}>{avatar.name} {isDarkMode ? 'Dark' : 'Light'}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className={themeClasses.caption}>Mode:</span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'
            }`}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
