'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import ThemeToggle from './ThemeToggle';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <ThemeToggle />
      </div>
      {children}
    </ThemeProvider>
  );
}
