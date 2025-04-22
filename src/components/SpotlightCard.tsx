'use client';

import React, { useState, useRef, ReactNode, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';
import './SpotlightCard.css';
import styles from './SpotlightCardRainbowBorder.module.css';

interface SpotlightCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  cardColor?: string;
  initialPosition?: { x: number; y: number };
  isDraggable?: boolean;
}

export default function SpotlightCard({
  title,
  subtitle,
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.3)',
  cardColor = 'rgba(23, 23, 23, 0.8)',
  initialPosition = { x: 0, y: 0 },
  isDraggable = true,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  
  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smooth spring physics for spotlight
  const spotlightX = useSpring(mouseX, { stiffness: 500, damping: 150 });
  const spotlightY = useSpring(mouseY, { stiffness: 500, damping: 150 });

  // Position for dragging
  const x = useMotionValue(initialPosition.x);
  const y = useMotionValue(initialPosition.y);

  // Bounce constraints so cards stay within viewport
  const [constraints, setConstraints] = useState({ top: 0, left: 0, right: 0, bottom: 0 });
  useEffect(() => {
    const updateConstraints = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setConstraints({
        left: -rect.left,
        top: -rect.top,
        right: window.innerWidth - rect.left - rect.width,
        bottom: window.innerHeight - rect.top - rect.height,
      });
    };
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    mouseX.set(relativeX);
    mouseY.set(relativeY);
    // Update CSS spotlight position and color
    cardRef.current.style.setProperty('--mouse-x', `${relativeX}px`);
    cardRef.current.style.setProperty('--mouse-y', `${relativeY}px`);
    cardRef.current.style.setProperty('--spotlight-color', spotlightColor);
  }

  const maskOpacity = useTransform(
    [spotlightX, spotlightY],
    () => isFocused ? 0.5 : 0
  );

  // Show tooltip after a delay when card is hovered and hasn't been dragged
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFocused && isDraggable && !hasBeenDragged) {
      timeout = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    }
    return () => {
      clearTimeout(timeout);
      setShowTooltip(false);
    };
  }, [isFocused, isDraggable, hasBeenDragged]);

  return (
    <motion.div
      ref={cardRef}
      className={`card-spotlight ${className}`}
      style={{ 
        backgroundColor: cardColor,
        x, 
        y,
        zIndex: isFocused ? 20 : 10 
      }}
      drag={isDraggable}
      dragElastic={0.3}
      dragMomentum={true}
      dragConstraints={constraints}
      whileDrag={{ scale: 1.02, zIndex: 30 }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      onDragStart={() => {
        setHasBeenDragged(true);
        setShowTooltip(false);
      }}
    >
      {/* Rainbow animated border */}
      <div className={styles["rainbow-border"]} aria-hidden="true">
        <div className={styles["rainbow-border-inner"]}></div>
      </div>
      {/* Floating animation */}
      <motion.div
        className="absolute inset-0"
        animate={{
          y: [0, -10, 0],
          x: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
      />
      
      {/* Card content */}
      <div className="p-6 relative z-10">
        <h3 className="text-xl font-bold text-white mb-1">
          <AnimatedText text={title} className="inline-block" />
        </h3>
        {subtitle && (
          <p className="text-gray-300 mb-4">
            <AnimatedText text={subtitle} className="inline-block" />
          </p>
        )}
        {children}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mt-[-8px] px-3 py-1.5 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none"
          >
            Click and drag to move this card
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-black/90" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 