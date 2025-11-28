'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import 3D components to avoid SSR issues
const PrivacyShield = dynamic(() => import('./3d/PrivacyShield'), { ssr: false });
const BrainVisualization = dynamic(() => import('./3d/BrainVisualization'), { ssr: false });
const ChatOrb = dynamic(() => import('./3d/ChatOrb'), { ssr: false });
const MessageBubble = dynamic(() => import('./3d/MessageBubble'), { ssr: false });
const GlobeCompliance = dynamic(() => import('./3d/GlobeCompliance'), { ssr: false });
const LightningBolt = dynamic(() => import('./3d/LightningBolt'), { ssr: false });

const trustServices = [
  {
    component: PrivacyShield,
    title: 'Privacy Focused',
    description: 'Your data stays secure'
  },
  {
    component: BrainVisualization,
    title: 'Evidence-Based',
    description: 'Built on CBT principles'
  },
  {
    component: ChatOrb,
    title: '24/7 Available',
    description: 'AI support anytime'
  },
  {
    component: MessageBubble,
    title: 'Free to Try',
    description: '20 messages included'
  },
  {
    component: GlobeCompliance,
    title: 'Compliant',
    description: 'Follows privacy standards'
  },
  {
    component: LightningBolt,
    title: 'Instant Access',
    description: 'No waiting lists'
  }
];

export default function TrustBadges() {
  return (
    <section className="py-16 bg-gradient-to-b from-pink-50/30 via-purple-50/20 to-pink-50/30 relative">
      <div className="max-w-4xl mx-auto px-6 relative">
        <div className="text-center mb-16">
          <h3 className="text-2xl font-light text-gray-800/80 mb-4 tracking-wide">
            MindGleam Services
          </h3>
          <p className="text-gray-600/70 text-base font-light max-w-md mx-auto leading-relaxed">
            Clean, simple, and effective
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trustServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              className="group"
            >
              <div className="h-32 mb-6">
                <service.component />
              </div>
              <div className="text-center">
                <h4 className="font-medium text-base text-gray-800/80 mb-2 tracking-wide">
                  {service.title}
                </h4>
                <p className="text-sm text-gray-600/70 font-light leading-relaxed">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
