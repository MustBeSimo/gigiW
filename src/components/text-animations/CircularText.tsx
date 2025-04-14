import React from 'react';
import { motion } from 'framer-motion';

interface CircularTextProps {
  text: string;
  className?: string;
}

export const CircularText: React.FC<CircularTextProps> = ({ text, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        className="relative w-32 h-32"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <path
              id="circle"
              d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
            />
          </defs>
          <text className="fill-white text-[1rem]">
            <textPath href="#circle" startOffset="0%">
              {text.split('').join(' ')}
            </textPath>
          </text>
        </svg>
      </motion.div>
    </div>
  );
}; 