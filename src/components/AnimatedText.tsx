// AnimatedText.tsx – split/falling text animation for headings

'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, className = '', delay = 0, duration = 0.6 }) => {
  return (
    <span className={`inline-block ${className}`}>      
      {Array.from(text).map((char, index) => (
        <motion.span
          key={`char-${index}-${char}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + index * 0.03, duration, ease: 'easeOut' }}
          className="inline-block"
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

export default AnimatedText;
