import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import { metadata } from './metadata';

// Dynamically load client-only components
const ClientLayout = dynamic(() => import('@/components/ClientLayout'), { ssr: false });
const SimpleBackground = dynamic(() => import('@/components/SimpleBackground'), { ssr: false });

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter'
});

const manrope = Manrope({ 
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-manrope'
});

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts Preconnect */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Manrope:wght@700&display=swap" rel="stylesheet" />
        
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GigiW" />
        <link rel="apple-touch-icon" href="/icons/ios/192.png" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XZ0EXKEFCS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XZ0EXKEFCS');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${manrope.variable} font-inter min-h-screen antialiased overflow-x-hidden bg-white dark:bg-gray-900 text-neutral-800 dark:text-neutral-200 transition-colors duration-300`}>
        <SimpleBackground />
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}