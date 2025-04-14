import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SpotlightCardProps {
  title: string;
  description: string;
  date?: string;
  readTime?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  title,
  description,
  date,
  readTime,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/50 to-black p-1"
      whileHover={{ scale: 1.02 }}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.06), transparent 40%)`,
        }}
      />
      <div className="relative p-6 bg-black/50 rounded-lg h-full">
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        {(date || readTime) && (
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {date && <span>{date}</span>}
            {readTime && <span>{readTime}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}; 