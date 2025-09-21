'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function SimpleBackground() {
  const { themeClasses } = useTheme();

  return (
    <div className="fixed inset-0 -z-10">
      <div className={`w-full h-full ${themeClasses.main.replace('min-h-screen', 'h-full')}`} />
    </div>
  );
} 