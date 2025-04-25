import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import dynamic from 'next/dynamic';
// Dynamically load the client-only background (no SSR)
const MediaFlyThroughBackground = dynamic(
  () => import('@/components/MediaFlyThroughBackground'),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hey, It\'s Gigi AI - Your Favorite AI Bestie',
  description: 'Connect with Gigi AI, download exclusive guides, chat securely, and collaborate on amazing projects.',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Hey, It\'s Gigi AI - Your Favorite AI Bestie',
    description: 'Connect with Gigi AI, download exclusive guides, chat securely, and collaborate on amazing projects.',
    images: ['/images/avatars/gigi-ai.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen antialiased overflow-x-hidden text-black dark:text-white`}>
        <MediaFlyThroughBackground />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}