'use client';

import Chat from '@/components/Chat';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();

  // This effect will clean up the URL if there are any query parameters
  useEffect(() => {
    // Check if there are query parameters in the URL
    if (window.location.search || window.location.hash) {
      // Replace current URL with a clean one, keeping the pathname
      router.replace('/chat');
    }
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-8"
          >
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Gigi Glitz
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Welcome, {user?.user_metadata?.full_name || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
          
          <div className="mt-10">
            <Chat />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 