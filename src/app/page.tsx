import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Orb } from '@/components/backgrounds/Orb';
import { ShinyText } from '@/components/text-animations/ShinyText';
import { AnimatedList } from '@/components/AnimatedList';
import { SpotlightCard } from '@/components/SpotlightCard';
import { CircularText } from '@/components/text-animations/CircularText';

// Dynamic import of ThreeBackground to avoid SSR issues
const ThreeBackground = dynamic(() => import('@/components/backgrounds/ThreeBackground'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <ThreeBackground />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-16">
        <Orb className="absolute right-0 top-0 w-2/3 h-full opacity-50" />
        <div className="container mx-auto px-4 z-10">
          <ShinyText className="text-6xl font-bold mb-6">
            Origin Story meets Power Manifesto
          </ShinyText>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl max-w-2xl"
          >
            <p className="mb-4">Hey queens! I'm Gigi, your guide to all things crypto, fitness, and confidence. I'm here to help you level up in every aspect of your life.</p>
            <p>After years in tech and finance, I've learned that true success comes from a balanced approach to wealth, health, and mindset.</p>
          </motion.div>
        </div>
      </section>

      {/* Expertise Section */}
      <section id="expertise" className="py-20 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <SpotlightCard title="Crypto Queen 💰" description="Expert guidance in cryptocurrency investments" />
            <SpotlightCard title="Fitness Philosopher 💪" description="Transform your body with science-backed methods" />
            <SpotlightCard title="Digital Entrepreneur 💻" description="Building empires in the digital space" />
            <SpotlightCard title="Mindset Maven 🧠" description="Develop unshakeable confidence" />
          </div>
        </div>
      </section>

      {/* Fun Facts Section */}
      <section id="fun-facts" className="py-20">
        <div className="container mx-auto px-4">
          <CircularText text="Fun Facts About Gigi" className="mb-12" />
          <AnimatedList
            items={[
              "Once onboarded a friend to crypto over mimosa brunch",
              "Survived a 30-day digital detox (and lived to tweet about it)",
              "Can deadlift more than most tech bros",
              "Builds spreadsheets for fun",
              "Collects NFTs and vintage vinyl equally passionately"
            ]}
          />
        </div>
      </section>

      {/* Latest Content Section */}
      <section id="blog" className="py-20 bg-gradient-to-b from-black to-purple-900/20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 gradient-text">Byte-Size Vibes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SpotlightCard
              title="Crypto for Queens: Your 5-Step Entry Guide"
              description="Ready to dive into crypto but don't know where to start? Here's my no-BS approach to getting your first coins without the anxiety."
              date="May 15, 2023"
              readTime="5 min read"
            />
            <SpotlightCard
              title="Confidence Is a Skill, Not a Talent"
              description="Let's debunk the myth that confidence is something you're born with. Here's how I built mine through intentional practice."
              date="April 22, 2023"
              readTime="6 min read"
            />
          </div>
        </div>
      </section>
    </main>
  );
} 