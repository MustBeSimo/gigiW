'use client';

import { motion } from 'framer-motion';

export default function LightningBolt() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
        className="relative"
      >
        <div className="backdrop-blur-sm bg-white/40 border border-pink-200/30 rounded-3xl p-8 shadow-lg">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-60">⚡</div>
            <div className="text-sm font-light text-gray-700/70 tracking-wider uppercase">
              Instant Access
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
