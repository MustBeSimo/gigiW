'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <AuthProvider>
        <div className="fixed top-4 left-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
