'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import Providers from '@/components/Providers';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <Providers>
        {children}
      </Providers>
    </AuthProvider>
  );
} 