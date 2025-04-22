'use client';

import { motion } from 'framer-motion';
import { COLORS } from '@/utils/constants';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <motion.div
        className="h-12 w-12 rounded-full border-4 border-gray-300"
        style={{ borderTopColor: COLORS.neonPink }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
} 