'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function SimpleDragTest() {
  return (
    <div className="fixed top-20 right-20 z-50">
      <motion.div
        className="w-32 h-32 bg-green-500 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-center text-white font-bold shadow-lg"
        drag
        dragMomentum={false}
        dragConstraints={{
          left: -100,
          right: 100,
          top: -100,
          bottom: 100
        }}
        whileDrag={{
          scale: 1.1,
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
        }}
        onDragStart={() => console.log('Simple drag started')}
        onDragEnd={() => console.log('Simple drag ended')}
      >
        DRAG ME
      </motion.div>
    </div>
  );
}