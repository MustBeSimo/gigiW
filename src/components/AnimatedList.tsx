import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  items: string[];
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ items }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.ul
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="space-y-4"
    >
      {items.map((text, index) => (
        <motion.li
          key={index}
          variants={item}
          className="flex items-center space-x-3 text-lg text-gray-200"
        >
          <span className="text-purple-500">✦</span>
          <span>{text}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}; 