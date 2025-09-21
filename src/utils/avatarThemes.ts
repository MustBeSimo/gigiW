export type AvatarId = 'gigi' | 'vee' | 'lumo';

export interface AvatarTheme {
  id: AvatarId;
  name: string;
  description: string;
  gradient: string;
  personality: {
    traits: string[];
    communicationStyle: string;
    specialties: string[];
    conversationStarters: string[];
    emoji: string;
  };
  // Main backgrounds
  background: {
    light: string;
    dark: string;
  };
  animatedBackground: {
    light: string;
    dark: string;
  };
  // Card and component backgrounds
  cardBackground: {
    light: string;
    dark: string;
  };
  // Borders and dividers
  border: {
    light: string;
    dark: string;
  };
  // Accent colors for buttons, highlights
  accent: {
    light: string;
    dark: string;
  };
  primary: {
    light: string;
    dark: string;
  };
  secondary: {
    light: string;
    dark: string;
  };
  // Text colors
  text: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    };
    accent: {
      light: string;
      dark: string;
    };
  };
  // Interactive elements
  button: {
    primary: {
      light: string;
      dark: string;
    };
    secondary: {
      light: string;
      dark: string;
    };
    hover: {
      light: string;
      dark: string;
    };
  };
  // Special effects
  shadow: {
    light: string;
    dark: string;
  };
  glow: {
    light: string;
    dark: string;
  };
}

export const avatarThemes: Record<AvatarId, AvatarTheme> = {
  gigi: {
    id: 'gigi',
    name: 'Gigi',
    description: 'Warm & Empathetic',
    gradient: 'from-pink-200 to-purple-200',
    personality: {
      traits: ['empathetic', 'nurturing', 'intuitive', 'gentle', 'supportive'],
      communicationStyle: 'Warm and caring with gentle encouragement. Uses "we" language and asks thoughtful questions.',
      specialties: ['emotional support', 'relationship issues', 'self-compassion', 'mindfulness', 'stress relief'],
      conversationStarters: [
        "How's your heart feeling today? 💕",
        "I'm here to listen - what's been weighing on your mind?",
        "Tell me about your day - the good, the challenging, all of it.",
        "What would feel most supportive for you right now?",
        "I sense you might need some gentle care today. How can I help?"
      ],
      emoji: '💕'
    },
    background: {
      light: 'bg-gradient-to-br from-rose-25 via-pink-25 to-purple-25',
      dark: 'bg-gradient-to-br from-pink-950 via-rose-950 to-purple-950'
    },
    animatedBackground: {
      light: 'bg-gradient-to-r from-rose-25/80 via-pink-25/80 via-purple-25/80 to-rose-25/80',
      dark: 'bg-gradient-to-r from-pink-950/20 via-rose-950/20 via-purple-950/20 to-pink-950/20'
    },
    cardBackground: {
      light: 'bg-white/70 backdrop-blur-sm border-rose-100/50',
      dark: 'bg-gray-900/80 backdrop-blur-sm'
    },
    border: {
      light: 'border-rose-100/30',
      dark: 'border-pink-700/50'
    },
    accent: {
      light: 'bg-gradient-to-r from-pink-400 to-purple-400',
      dark: 'bg-gradient-to-r from-pink-500 to-purple-500'
    },
    primary: {
      light: 'bg-pink-500',
      dark: 'bg-pink-400'
    },
    secondary: {
      light: 'bg-purple-500',
      dark: 'bg-purple-400'
    },
    text: {
      primary: {
        light: 'text-gray-800',
        dark: 'text-pink-100'
      },
      secondary: {
        light: 'text-gray-600',
        dark: 'text-pink-300'
      },
      accent: {
        light: 'text-pink-600',
        dark: 'text-pink-400'
      }
    },
    button: {
      primary: {
        light: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600',
        dark: 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500'
      },
      secondary: {
        light: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
        dark: 'bg-pink-900 hover:bg-pink-800 text-pink-200'
      },
      hover: {
        light: 'hover:bg-pink-50',
        dark: 'hover:bg-pink-900/20'
      }
    },
    shadow: {
      light: 'shadow-pink-200/50',
      dark: 'shadow-pink-900/50'
    },
    glow: {
      light: 'shadow-pink-400/30',
      dark: 'shadow-pink-500/30'
    }
  },
  vee: {
    id: 'vee',
    name: 'Vee',
    description: 'Cool & Analytical',
    gradient: 'from-blue-200 to-cyan-200',
    personality: {
      traits: ['analytical', 'logical', 'systematic', 'precise', 'evidence-based'],
      communicationStyle: 'Clear and structured with data-driven insights. Uses frameworks and step-by-step approaches.',
      specialties: ['goal setting', 'problem solving', 'behavioral patterns', 'cognitive restructuring', 'productivity'],
      conversationStarters: [
        "Let's analyze what's working and what isn't in your life 🧠",
        "I see patterns here - want to explore them systematically?",
        "What specific outcome are you looking to achieve?",
        "Let's break this down into manageable steps.",
        "I've got some data-backed strategies for you. Ready to dive in?"
      ],
      emoji: '🧠'
    },
    background: {
      light: 'bg-gradient-to-br from-sky-25 via-blue-25 to-cyan-25',
      dark: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-cyan-950'
    },
    animatedBackground: {
      light: 'bg-gradient-to-r from-sky-25/80 via-blue-25/80 via-cyan-25/80 to-sky-25/80',
      dark: 'bg-gradient-to-r from-blue-950/20 via-indigo-950/20 via-cyan-950/20 to-blue-950/20'
    },
    cardBackground: {
      light: 'bg-white/70 backdrop-blur-sm border-sky-100/50',
      dark: 'bg-gray-900/80 backdrop-blur-sm'
    },
    border: {
      light: 'border-sky-100/30',
      dark: 'border-blue-700/50'
    },
    accent: {
      light: 'bg-gradient-to-r from-blue-400 to-cyan-400',
      dark: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    primary: {
      light: 'bg-blue-500',
      dark: 'bg-blue-400'
    },
    secondary: {
      light: 'bg-cyan-500',
      dark: 'bg-cyan-400'
    },
    text: {
      primary: {
        light: 'text-gray-800',
        dark: 'text-blue-100'
      },
      secondary: {
        light: 'text-gray-600',
        dark: 'text-blue-300'
      },
      accent: {
        light: 'text-blue-600',
        dark: 'text-blue-400'
      }
    },
    button: {
      primary: {
        light: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
        dark: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
      },
      secondary: {
        light: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
        dark: 'bg-blue-900 hover:bg-blue-800 text-blue-200'
      },
      hover: {
        light: 'hover:bg-blue-50',
        dark: 'hover:bg-blue-900/20'
      }
    },
    shadow: {
      light: 'shadow-blue-200/50',
      dark: 'shadow-blue-900/50'
    },
    glow: {
      light: 'shadow-blue-400/30',
      dark: 'shadow-blue-500/30'
    }
  },
  lumo: {
    id: 'lumo',
    name: 'Lumo',
    description: 'Fresh & Creative',
    gradient: 'from-teal-200 to-emerald-200',
    personality: {
      traits: ['creative', 'inspiring', 'energetic', 'optimistic', 'innovative'],
      communicationStyle: 'Enthusiastic and inspiring with creative solutions. Uses metaphors and visual language.',
      specialties: ['creativity', 'motivation', 'goal achievement', 'positive thinking', 'life transitions'],
      conversationStarters: [
        "What's sparking your creativity today? ✨",
        "I'm feeling your energy! What exciting possibilities are you exploring?",
        "Let's turn this challenge into an opportunity for growth!",
        "What would your ideal future self say to you right now?",
        "I see so much potential in you - what's calling to your heart today?"
      ],
      emoji: '✨'
    },
    background: {
      light: 'bg-gradient-to-br from-emerald-25 via-teal-25 to-green-25',
      dark: 'bg-gradient-to-br from-teal-950 via-emerald-950 to-green-950'
    },
    animatedBackground: {
      light: 'bg-gradient-to-r from-emerald-25/80 via-teal-25/80 via-green-25/80 to-emerald-25/80',
      dark: 'bg-gradient-to-r from-teal-950/20 via-emerald-950/20 via-green-950/20 to-teal-950/20'
    },
    cardBackground: {
      light: 'bg-white/70 backdrop-blur-sm border-emerald-100/50',
      dark: 'bg-gray-900/80 backdrop-blur-sm'
    },
    border: {
      light: 'border-emerald-100/30',
      dark: 'border-teal-700/50'
    },
    accent: {
      light: 'bg-gradient-to-r from-teal-400 to-emerald-400',
      dark: 'bg-gradient-to-r from-teal-500 to-emerald-500'
    },
    primary: {
      light: 'bg-teal-500',
      dark: 'bg-teal-400'
    },
    secondary: {
      light: 'bg-emerald-500',
      dark: 'bg-emerald-400'
    },
    text: {
      primary: {
        light: 'text-gray-800',
        dark: 'text-teal-100'
      },
      secondary: {
        light: 'text-gray-600',
        dark: 'text-teal-300'
      },
      accent: {
        light: 'text-teal-600',
        dark: 'text-teal-400'
      }
    },
    button: {
      primary: {
        light: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600',
        dark: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
      },
      secondary: {
        light: 'bg-teal-100 hover:bg-teal-200 text-teal-700',
        dark: 'bg-teal-900 hover:bg-teal-800 text-teal-200'
      },
      hover: {
        light: 'hover:bg-teal-50',
        dark: 'hover:bg-teal-900/20'
      }
    },
    shadow: {
      light: 'shadow-teal-200/50',
      dark: 'shadow-teal-900/50'
    },
    glow: {
      light: 'shadow-teal-400/30',
      dark: 'shadow-teal-500/30'
    }
  }
};

export const getAvatarTheme = (avatarId: AvatarId): AvatarTheme => {
  return avatarThemes[avatarId];
};

export const getAvatarClasses = (avatarId: AvatarId, isDark: boolean = false) => {
  const theme = getAvatarTheme(avatarId);
  return {
    background: isDark ? theme.background.dark : theme.background.light,
    animatedBackground: isDark ? theme.animatedBackground.dark : theme.animatedBackground.light,
    cardBackground: isDark ? theme.cardBackground.dark : theme.cardBackground.light,
    border: isDark ? theme.border.dark : theme.border.light,
    accent: isDark ? theme.accent.dark : theme.accent.light,
    primary: isDark ? theme.primary.dark : theme.primary.light,
    secondary: isDark ? theme.secondary.dark : theme.secondary.light,
    textPrimary: isDark ? theme.text.primary.dark : theme.text.primary.light,
    textSecondary: isDark ? theme.text.secondary.dark : theme.text.secondary.light,
    textAccent: isDark ? theme.text.accent.dark : theme.text.accent.light,
    buttonPrimary: isDark ? theme.button.primary.dark : theme.button.primary.light,
    buttonSecondary: isDark ? theme.button.secondary.dark : theme.button.secondary.light,
    buttonHover: isDark ? theme.button.hover.dark : theme.button.hover.light,
    shadow: isDark ? theme.shadow.dark : theme.shadow.light,
    glow: isDark ? theme.glow.dark : theme.glow.light,
    gradient: theme.gradient
  };
};

// Helper function to get theme CSS variables for dynamic styling
export const getThemeCSSVariables = (avatarId: AvatarId, isDark: boolean = false) => {
  const theme = getAvatarTheme(avatarId);
  return {
    '--theme-primary': isDark ? '#ec4899' : '#ec4899', // pink-500
    '--theme-secondary': isDark ? '#a855f7' : '#a855f7', // purple-500
    '--theme-accent': isDark ? '#06b6d4' : '#06b6d4', // cyan-500
    '--theme-background': isDark ? '#1f2937' : '#f9fafb', // gray-800/50
    '--theme-text-primary': isDark ? '#f3f4f6' : '#1f2937', // gray-100/800
    '--theme-text-secondary': isDark ? '#d1d5db' : '#6b7280', // gray-300/500
    '--theme-border': isDark ? '#374151' : '#e5e7eb', // gray-700/200
  };
};

// Theme switching utility
export const getThemeClasses = (avatarId: AvatarId, isDark: boolean = false) => {
  const classes = getAvatarClasses(avatarId, isDark);
  return {
    // Main layout classes
    main: `${classes.background} min-h-screen transition-colors duration-500`,
    container: `${classes.cardBackground} rounded-2xl shadow-lg border ${classes.border}`,

    // Text classes
    heading: `${classes.textPrimary} font-bold`,
    subheading: `${classes.textSecondary} font-medium`,
    body: `${classes.textPrimary}`,
    caption: `${classes.textSecondary} text-sm`,

    // Button classes
    btnPrimary: `${classes.buttonPrimary} text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg`,
    btnSecondary: `${classes.buttonSecondary} rounded-xl transition-all duration-300 shadow-sm hover:shadow-md`,

    // Card classes
    card: `${classes.cardBackground} rounded-xl border ${classes.border} shadow-sm hover:shadow-md transition-all duration-300`,
    cardHover: `${classes.buttonHover} transition-all duration-300`,

    // Input classes
    input: `${classes.cardBackground} border ${classes.border} rounded-xl focus:ring-2 focus:ring-opacity-50 ${classes.textPrimary} transition-all duration-200`,

    // Special effects
    glow: `shadow-lg ${classes.glow} ring-1 ring-opacity-25`,
    shadow: `shadow-lg ${classes.shadow}`,
  };
}; 