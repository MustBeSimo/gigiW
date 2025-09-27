'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AvatarId, getAvatarTheme, getThemeClasses } from '@/utils/avatarThemes';

interface ThemeContextType {
  selectedAvatar: AvatarId;
  isDarkMode: boolean;
  themeClasses: ReturnType<typeof getThemeClasses>;
  setSelectedAvatar: (avatar: AvatarId) => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultAvatar?: AvatarId;
  defaultDarkMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultAvatar = 'lumo',
  defaultDarkMode = false
}) => {
  const [selectedAvatar, setSelectedAvatarState] = useState<AvatarId>(defaultAvatar);
  const [isDarkMode, setIsDarkMode] = useState(defaultDarkMode);

  // Load theme preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAvatar = localStorage.getItem('mindgleam_selected_avatar') as AvatarId;
      const savedDarkMode = localStorage.getItem('mindgleam_dark_mode') === 'true';
      
      if (savedAvatar && ['gigi', 'vee', 'lumo'].includes(savedAvatar)) {
        setSelectedAvatarState(savedAvatar);
      }
      
      setIsDarkMode(savedDarkMode);
    }
  }, []);

  // Save theme preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindgleam_selected_avatar', selectedAvatar);
    }
  }, [selectedAvatar]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindgleam_dark_mode', isDarkMode.toString());
    }
  }, [isDarkMode]);

  // Update document class for dark mode with smooth transition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add transition classes before changing theme
      document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';

      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Remove transition after a delay to avoid interference with other animations
      const timeoutId = setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isDarkMode]);

  const setSelectedAvatar = (avatar: AvatarId) => {
    setSelectedAvatarState(avatar);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  const themeClasses = getThemeClasses(selectedAvatar, isDarkMode);

  const value: ThemeContextType = {
    selectedAvatar,
    isDarkMode,
    themeClasses,
    setSelectedAvatar,
    toggleDarkMode,
    setDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme-aware component wrapper
export const withTheme = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const { themeClasses } = useTheme();
    return <Component {...props} ref={ref} themeClasses={themeClasses} />;
  });
};

// Hook for getting current theme info
export const useThemeInfo = () => {
  const { selectedAvatar, isDarkMode, themeClasses } = useTheme();
  const theme = getAvatarTheme(selectedAvatar);
  
  return {
    avatar: theme,
    isDarkMode,
    themeClasses,
    themeName: `${theme.name} ${isDarkMode ? 'Dark' : 'Light'}`,
    themeDescription: `${theme.description} ${isDarkMode ? 'Dark' : 'Light'} Theme`,
  };
};
