
'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import ProgressBar from '@/components/ProgressBar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

function ClientLayoutContent({ children }: ClientLayoutProps) {
  const { user, loading } = useAuth();
  
  // Only add top padding when user is logged in (when progress bar is visible)
  const shouldAddPadding = user && !loading;
  
  return (
    <>
      <ProgressBar />
      <div className={shouldAddPadding ? "pt-16" : "pt-2"}> {/* Add small padding when no progress bar, larger when progress bar is visible */}
        {children}
      </div>
    </>
  );
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <ClientLayoutContent>
        {children}
      </ClientLayoutContent>
    </AuthProvider>
  );
} 