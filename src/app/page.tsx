'use client';

import React, { useState, useEffect } from 'react';
import SpotlightCard from '@/components/SpotlightCard';
import SocialLinks from '@/components/SocialLinks';
import GuideCard from '@/components/GuideCard';
import ChatCard from '@/components/ChatCard';
import ContactCard from '@/components/ContactCard';
import { fetchSocialLinks } from '@/utils/clientSocialLinks';
import { SocialLink } from '@/utils/socialLinks';
import MediaBackground from '@/components/MediaBackground';

export default function HomePage() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Fetch social links
    const loadSocialLinks = async () => {
      const links = await fetchSocialLinks();
      setSocialLinks(links);
    };

    loadSocialLinks();

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Predefined positions for desktop view (these will be ignored on mobile)
  const cardPositions = {
    social: { x: 20, y: 100 },
    guides: { x: 420, y: 150 },
    chat: { x: 120, y: 420 },
    contact: { x: 520, y: 450 }
  };

  return (
    <main className="relative min-h-screen w-full">
      <MediaBackground />
      <div className="relative z-10">
        <div className={`container mx-auto p-4 md:p-8 relative z-10 ${isMobile ? 'flex flex-col gap-6' : 'h-screen'}`}>
          {/* Header */}
          <header className="text-center mb-8 mt-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Hey, It's Gigi AI
              </span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl">Your favorite AI bestie ✨</p>
          </header>
          
          {/* Cards */}
          <div className={`w-full flex flex-col items-center`}>
            <div className={`${isMobile ? 'space-y-6' : ''}`}>
              {/* Follow Me! Card */}
              <SpotlightCard
                title="Follow Me!"
                subtitle="Stay connected with Gigi on social media"
                className="w-full md:w-96"
                initialPosition={cardPositions.social}
                isDraggable={!isMobile}
                spotlightColor="rgba(236, 72, 154, 0.82)"
              >
                <SocialLinks links={socialLinks} />
              </SpotlightCard>
              
              {/* Guides Card */}
              <SpotlightCard
                title="Download Free Guides"
                subtitle="Exclusive content just for you"
                className="w-full md:w-96"
                initialPosition={cardPositions.guides}
                isDraggable={!isMobile}
                spotlightColor="rgba(124, 58, 237, 0.81)"
              >
                <div className="grid grid-cols-1 gap-4">
                  <GuideCard
                    title="Gigi's Crypto Beginner 5 Step Guide"
                    description="🔥 New to crypto? Feeling overwhelmed by all the jargon? Don't stress, queen—I got you! 💅"
                    imageSrc="/images/guides/crypto-guide.jpg"
                    downloadUrl="https://payhip.com/b/k9Ygc"
                  />
                  
                  <GuideCard
                    title="Glow Up & Own It: 10 Exercises to Build Confidence"
                    description="Ready to break up with self-doubt and fall head over heels in love with your body?"
                    imageSrc="/images/guides/confidence-guide.jpg"
                    downloadUrl="https://payhip.com/b/YKuyU"
                  />
                </div>
              </SpotlightCard>
              
              {/* Chat Card */}
              <SpotlightCard
                title="Let's Chat"
                subtitle="Have a secure conversation with your fav AI gal"
                className="w-full md:w-96"
                initialPosition={cardPositions.chat}
                isDraggable={!isMobile}
                spotlightColor="rgba(219, 39, 120, 0.75)"
              >
                <ChatCard />
              </SpotlightCard>
              
              {/* Collaboration Card */}
              <SpotlightCard
                title="Collaborate"
                subtitle="Let's work together on something amazing"
                className="w-full md:w-96"
                initialPosition={cardPositions.contact}
                isDraggable={!isMobile}
                spotlightColor="hsla(243, 100.00%, 61.60%, 0.82)"
              >
                <ContactCard email="heyitsgigiai@gmail.com" />
              </SpotlightCard>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 