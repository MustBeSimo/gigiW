import React from 'react';
import { motion } from 'framer-motion';

interface OrbProps {
  className?: string;
}

export const Orb: React.FC<OrbProps> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 opacity-80 blur-lg" />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1.1, 1, 1.1],
          rotate: [360, 0],
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-pink-400 opacity-60 blur-md" />
      </motion.div>
    </div>
  );
}; 