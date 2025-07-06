import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://mindgleam.app'),
  title: 'Mind Gleam - AI-Powered Mental Wellness & Thought Coaching App',
  description: 'Mind Gleam: Advanced AI thought coaching using evidence-based CBT techniques. Track mood, journal privately, and transform negative thoughts with personalized mental health support. Get 50 free sessions.',
  keywords: [
    'AI mental health',
    'thought coaching',
    'CBT app',
    'cognitive behavioral therapy',
    'mood tracking',
    'mental wellness',
    'AI therapist',
    'private journaling',
    'depression support',
    'anxiety help',
    'emotional wellness',
    'mindfulness app',
    'mental health support',
    'AI counseling',
    'thought patterns',
    'negative thoughts',
    'self-reflection',
    'emotional intelligence',
    'mental health tracking',
    'wellbeing app'
  ],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Mind Gleam - AI-Powered Mental Wellness & Thought Coaching',
    description: 'Transform your mental wellness with AI-powered thought coaching. Evidence-based CBT techniques, mood tracking, and private journaling. Start your journey today.',
    images: ['/images/avatars/Gigi_avatar.png'],
    type: 'website',
    url: 'https://mindgleam.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mind Gleam - AI Mental Wellness & Thought Coaching',
    description: 'AI-powered CBT coaching for better mental health. Track mood, journal privately, transform negative thoughts.',
    images: ['/images/avatars/Gigi_avatar.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
  },
  category: 'Health & Wellness',
}; 