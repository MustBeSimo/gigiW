import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gigi - Crypto, Fitness & Confidence',
  description: 'Your guide to all things crypto, fitness, and confidence. Level up in every aspect of your life.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Gigi
        </div>
        <div className="flex gap-6 text-sm">
          <a href="#crypto" className="text-white/80 hover:text-white transition">Crypto</a>
          <a href="#fitness" className="text-white/80 hover:text-white transition">Fitness</a>
          <a href="#mindset" className="text-white/80 hover:text-white transition">Mindset</a>
          <a href="#blog" className="text-white/80 hover:text-white transition">Blog</a>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="bg-black/90 text-white/60 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div>
            © {new Date().getFullYear()} Gigi. All rights reserved.
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com" className="hover:text-white transition">Twitter</a>
            <a href="https://instagram.com" className="hover:text-white transition">Instagram</a>
            <a href="https://linkedin.com" className="hover:text-white transition">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
} 