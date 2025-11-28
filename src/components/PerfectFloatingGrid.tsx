'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { ChatErrorBoundary } from '@/components/ErrorBoundary';

// Avatar configuration
const avatars = [
  {
    id: 'gigi' as const,
    name: 'Gigi',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-100 to-rose-100',
    bgGradient: 'from-rose-50 via-pink-50 to-purple-50'
  },
  {
    id: 'vee' as const,
    name: 'Vee',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-100 to-cyan-100',
    bgGradient: 'from-sky-50 via-blue-50 to-cyan-50'
  },
  {
    id: 'lumo' as const,
    name: 'Lumo',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-emerald-100 to-teal-100',
    bgGradient: 'from-emerald-50 via-teal-50 to-green-50'
  }
];

// Reusable glassy panel for consistent styling across cards
const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`w-full h-full rounded-2xl glass-card-primary p-3 md:p-4 ${className || ''}`}>
    {children}
  </div>
);

// Mathematical grid calculation - ensures zero overlap with responsive sizing
const calculatePerfectGrid = (viewport: { width: number; height: number }) => {
  const centerX = 0;
  const centerY = 0;

  // Responsive positioning based on viewport
  const isMobile = viewport.width < 768;
  const isTablet = viewport.width >= 768 && viewport.width < 1024;

  // Responsive card dimensions - much smaller and properly scaled
  const cardSizes = {
    large: { 
      width: isMobile ? 260 : isTablet ? 280 : 300, 
      height: isMobile ? 220 : isTablet ? 240 : 260 
    },
    medium: { 
      width: isMobile ? 220 : isTablet ? 240 : 260, 
      height: isMobile ? 180 : isTablet ? 200 : 220 
    },
    small: { 
      width: isMobile ? 180 : isTablet ? 200 : 220, 
      height: isMobile ? 140 : isTablet ? 160 : 180 
    }
  };

  // Calculate minimum safe distances (with responsive buffer between cards)
  const safeDistance = {
    large: Math.max(cardSizes.large.width, cardSizes.large.height) / 2 + (isMobile ? 30 : 40),
    medium: Math.max(cardSizes.medium.width, cardSizes.medium.height) / 2 + (isMobile ? 25 : 35),
    small: Math.max(cardSizes.small.width, cardSizes.small.height) / 2 + (isMobile ? 20 : 30)
  };

  let gridPositions: Array<{ id: string; x: number; y: number; size: 'large' | 'medium' | 'small'; angle: number }>;

  // Constrain radii so cards always remain inside the component's visible area,
  // regardless of page container width (e.g., max-w-7xl) vs window width
  const halfWidth = Math.min(viewport.width, 1280) / 2; // cap to typical container width
  const halfHeight = Math.min(viewport.height, 900) / 2;

  // Helper to clamp an offset by available space minus card safe distance
  const clampX = (desired: number, sizeKey: 'large' | 'medium' | 'small') => {
    const available = halfWidth - (safeDistance as any)[sizeKey];
    return Math.sign(desired) * Math.min(Math.abs(desired), Math.max(available, 60));
  };
  const clampY = (desired: number, sizeKey: 'large' | 'medium' | 'small') => {
    const available = halfHeight - (safeDistance as any)[sizeKey];
    return Math.sign(desired) * Math.min(Math.abs(desired), Math.max(available, 60));
  };

  // Reserve space for the title/header so top-row cards never overlap it
  const headerClearance = isMobile ? 110 : isTablet ? 130 : 160;
  const capTopDistance = Math.max(60, halfHeight - headerClearance);
  const capTop = (desired: number) => Math.min(desired, capTopDistance);

  if (isMobile) {
    // Mobile: tighter but non-overlapping ring distances
    const ringPrimary = capTop(safeDistance.medium + 40);
    const ringSecondary = safeDistance.small + 70;

    gridPositions = [
      { id: 'avatarCard',    x: centerX + 0,                     y: centerY - clampY(ringPrimary, 'medium'), size: 'medium' as const, angle: 0   },
      { id: 'chatCard',      x: centerX - clampX(ringSecondary, 'small'), y: centerY - clampY(40, 'small'),   size: 'small'  as const, angle: 45  },
      { id: 'planCard',      x: centerX + clampX(ringSecondary, 'small'), y: centerY - clampY(40, 'small'),   size: 'small'  as const, angle: -45 },
      { id: 'mindAirCard',   x: centerX - clampX(ringSecondary, 'small'), y: centerY + clampY(50, 'small'),   size: 'small'  as const, angle: 90  },
      { id: 'mindGuideCard', x: centerX + clampX(ringSecondary, 'small'), y: centerY + clampY(50, 'small'),   size: 'small'  as const, angle: -90 },
      { id: 'vibeCard',      x: centerX - clampX(ringSecondary - 30, 'small'),  y: centerY + clampY(ringSecondary, 'small'), size: 'small'  as const, angle: 135 },
      { id: 'vibeCheckCard', x: centerX + clampX(ringSecondary - 30, 'small'),  y: centerY + clampY(ringSecondary, 'small'), size: 'small'  as const, angle: -135 },
    ];
  } else if (isTablet) {
    // Tablet: balanced spacing derived from safe distances
    const ringPrimary = capTop(safeDistance.large + 50);    // top center
    const ringSecondaryX = safeDistance.medium + 120; // left/right
    const ringSecondaryY = capTop(safeDistance.medium + 70);  // height offset
    const ringBottom = safeDistance.small + 140;      // bottom row

    gridPositions = [
      { id: 'avatarCard',    x: centerX + 0,                          y: centerY - clampY(ringPrimary, 'large'), size: 'large'  as const, angle: 0   },
      { id: 'chatCard',      x: centerX - clampX(ringSecondaryX, 'medium'), y: centerY - clampY(ringSecondaryY, 'medium'), size: 'medium' as const, angle: 60  },
      { id: 'planCard',      x: centerX + clampX(ringSecondaryX, 'medium'), y: centerY - clampY(ringSecondaryY, 'medium'), size: 'medium' as const, angle: -60 },
      { id: 'mindAirCard',   x: centerX - clampX(ringSecondaryX - 40, 'medium'), y: centerY + clampY(60, 'medium'), size: 'medium' as const, angle: 120 },
      { id: 'mindGuideCard', x: centerX + clampX(ringSecondaryX - 40, 'medium'), y: centerY + clampY(60, 'medium'), size: 'medium' as const, angle: -120 },
      { id: 'vibeCard',      x: centerX - clampX(ringSecondaryX - 20, 'small'), y: centerY + clampY(ringBottom, 'small'), size: 'small'  as const, angle: 150 },
      { id: 'vibeCheckCard', x: centerX + clampX(ringSecondaryX - 20, 'small'), y: centerY + clampY(ringBottom, 'small'), size: 'small'  as const, angle: -150 },
    ];
  } else {
    // Desktop: generous spacing derived from safe distances
    const ringPrimary = capTop(safeDistance.large + 70);
    const ringSecondaryX = safeDistance.large + 170;
    const ringSecondaryY = capTop(safeDistance.large + 100);
    const ringMiddleY = safeDistance.medium + 60;
    const ringBottom = safeDistance.medium + 180;

    gridPositions = [
      { id: 'avatarCard',    x: centerX + 0,                               y: centerY - clampY(ringPrimary, 'large'), size: 'large'  as const, angle: 0   },
      { id: 'chatCard',      x: centerX - clampX(ringSecondaryX, 'large'), y: centerY - clampY(ringSecondaryY, 'large'), size: 'large'  as const, angle: 45  },
      { id: 'planCard',      x: centerX + clampX(ringSecondaryX, 'large'), y: centerY - clampY(ringSecondaryY, 'large'), size: 'large'  as const, angle: -45 },
      { id: 'mindAirCard',   x: centerX - clampX(ringSecondaryX - 40, 'medium'), y: centerY + clampY(ringMiddleY, 'medium'), size: 'medium' as const, angle: 90  },
      { id: 'mindGuideCard', x: centerX + clampX(ringSecondaryX - 40, 'medium'), y: centerY + clampY(ringMiddleY, 'medium'), size: 'medium' as const, angle: -90 },
      { id: 'vibeCard',      x: centerX - clampX(ringSecondaryX - 10, 'medium'), y: centerY + clampY(ringBottom, 'medium'), size: 'medium' as const, angle: 135 },
      { id: 'vibeCheckCard', x: centerX + clampX(ringSecondaryX - 10, 'medium'), y: centerY + clampY(ringBottom, 'medium'), size: 'medium' as const, angle: -135 },
    ];
  }

  return gridPositions;
};

interface PerfectCardProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  size: 'large' | 'medium' | 'small';
  cardId: string;
  angle: number;
  viewport: { width: number; height: number };
}

const PerfectCard: React.FC<PerfectCardProps> = ({
  children,
  position,
  size,
  cardId,
  angle,
  viewport
}) => {
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const [isDragging, setIsDragging] = useState(false);
  const dragTimeoutRef = useRef<NodeJS.Timeout>();

  // Update position when props change
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  // Calculate responsive drag boundaries to prevent chaos
  const getDragBounds = useCallback(() => {
    const isMobile = viewport.width < 768;
    const isTablet = viewport.width >= 768 && viewport.width < 1024;

    // Use the same responsive sizing as the grid calculation
    const cardDimensions = {
      large: { 
        width: isMobile ? 260 : isTablet ? 280 : 300, 
        height: isMobile ? 220 : isTablet ? 240 : 260 
      },
      medium: { 
        width: isMobile ? 220 : isTablet ? 240 : 260, 
        height: isMobile ? 180 : isTablet ? 200 : 220 
      },
      small: { 
        width: isMobile ? 180 : isTablet ? 200 : 220, 
        height: isMobile ? 140 : isTablet ? 160 : 180 
      }
    };

    const card = cardDimensions[size];
    const padding = isMobile ? 20 : isTablet ? 40 : 60;

    return {
      left: -(viewport.width / 2) + padding,
      right: (viewport.width / 2) - card.width - padding,
      top: -(viewport.height / 2) + (isMobile ? 80 : 120),
      bottom: (viewport.height / 2) - card.height - (isMobile ? 40 : 80)
    };
  }, [size, viewport]);

  const dragBounds = getDragBounds();

  // Compute responsive card size (must match bounds logic)
  const cardSize = React.useMemo(() => {
    const isMobile = viewport.width < 768;
    const isTablet = viewport.width >= 768 && viewport.width < 1024;
    const dims = {
      large: {
        width: isMobile ? 260 : isTablet ? 280 : 300,
        height: isMobile ? 220 : isTablet ? 240 : 260,
      },
      medium: {
        width: isMobile ? 220 : isTablet ? 240 : 260,
        height: isMobile ? 180 : isTablet ? 200 : 220,
      },
      small: {
        width: isMobile ? 180 : isTablet ? 200 : 220,
        height: isMobile ? 140 : isTablet ? 160 : 180,
      },
    } as const;
    return dims[size];
  }, [size, viewport.width]);

  // Smooth return to home position with improved spring physics
  const returnHome = useCallback((delay: number = 600) => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    dragTimeoutRef.current = setTimeout(() => {
      animate(x, position.x, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        restDelta: 0.01,
        restSpeed: 0.01
      });
      animate(y, position.y, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        restDelta: 0.01,
        restSpeed: 0.01
      });
    }, delay);
  }, [x, y, position]);

  // Size-based styling
  const sizeStyles = {
    large: 'scale-110 shadow-2xl z-30',
    medium: 'scale-100 shadow-xl z-20',
    small: 'scale-90 shadow-lg z-10'
  };

  const glassStyles = {
    large: 'glass-card-primary',
    medium: 'glass-card-secondary',
    small: 'glass-card-tertiary'
  };

  return (
    <motion.div
      className={`absolute rounded-3xl p-4 md:p-6 cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${sizeStyles[size]} ${glassStyles[size]} ${isDragging ? 'scale-105 shadow-3xl' : ''}`}
      style={{
        x,
        y,
        left: '50%',
        top: '50%',
        translateX: '-50%',
        translateY: '-50%',
        width: cardSize.width,
        height: cardSize.height,
        touchAction: 'pan-x pan-y',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      initial={{
        opacity: 0,
        scale: 0.5,
        rotate: angle * 0.3 // Subtle initial rotation based on position
      }}
      animate={{
        opacity: 1,
        scale: 1,
        rotate: 0
      }}
      transition={{
        duration: 0.8,
        delay: Math.random() * 0.4,
        type: "spring",
        stiffness: 150
      }}
      drag
      dragMomentum={false}
      dragElastic={0.2}
      dragConstraints={dragBounds}
      dragTransition={{ 
        bounceStiffness: 300, 
        bounceDamping: 40,
        power: 0.3,
        timeConstant: 750
      }}
      onDragStart={(event) => {
        // Prevent drag on interactive elements
        const target = event.target as HTMLElement;
        const isInteractive = target.tagName === 'BUTTON' ||
                             target.tagName === 'INPUT' ||
                             target.closest('button') ||
                             target.closest('input') ||
                             target.closest('[role="button"]');

        if (isInteractive) {
          event.preventDefault();
          return false;
        }

        setIsDragging(true);

        // Clear any pending return animation
        if (dragTimeoutRef.current) {
          clearTimeout(dragTimeoutRef.current);
        }
      }}
      onDragEnd={(event, info) => {
        setIsDragging(false);

        // Calculate drag distance to determine return timing
        const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
        const returnDelay = dragDistance > 150 ? 0 : 400;

        // Only return home if the card ends outside constraints (bounce back)
        const withinX = x.get() >= dragBounds.left && x.get() <= dragBounds.right;
        const withinY = y.get() >= dragBounds.top && y.get() <= dragBounds.bottom;
        if (!withinX || !withinY) {
          returnHome(returnDelay);
        }
      }}
      whileHover={!isDragging ? {
        scale: size === 'large' ? 1.08 : size === 'medium' ? 1.05 : 1.03,
        transition: { duration: 0.2, type: "spring", stiffness: 400, damping: 25 }
      } : {}}
      whileDrag={{
        scale: size === 'large' ? 1.12 : size === 'medium' ? 1.08 : 1.05,
        rotate: [0, 2, -2, 1, -1, 0],
        transition: { duration: 0.3, type: "spring", stiffness: 300 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Card Components
const AvatarCard: React.FC<{
  selectedAvatar: string;
  onAvatarSelect: (avatarId: 'gigi' | 'vee' | 'lumo') => void;
}> = ({ selectedAvatar, onAvatarSelect }) => (
  <div className="w-full h-full min-w-0 p-2">
    <GlassPanel>
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6 text-center">Meet Your AI Friends</h3>
      <div className="flex justify-center gap-3 md:gap-6">
      {avatars.map((avatar) => (
        <motion.button
          key={avatar.id}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAvatarSelect(avatar.id);
          }}
          className={`relative group ${
            selectedAvatar === avatar.id ? 'ring-2 ring-blue-400 ring-opacity-60' : ''
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={`w-14 h-14 md:w-18 md:h-18 rounded-full overflow-hidden border-2 transition-all duration-300 ${
            selectedAvatar === avatar.id
              ? 'border-blue-500 shadow-lg'
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <Image
              src={avatar.src}
              alt={avatar.name}
              width={72}
              height={72}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs md:text-sm font-bold text-gray-700">{avatar.name}</span>
          </div>
        </motion.button>
      ))}
      </div>
    </GlassPanel>
  </div>
);

const ChatCard: React.FC<{ selectedAvatar: string }> = ({ selectedAvatar }) => {
  const currentAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];

  return (
    <div className="w-full h-full min-w-0 p-2">
      <GlassPanel>
        <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300">
          <Image
            src={currentAvatar.src}
            alt={currentAvatar.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-sm md:text-lg font-bold text-gray-800 truncate">Chat with {currentAvatar.name}</h3>
        </div>

        <div className="bg-white/70 border border-white/60 rounded-xl p-3 h-20 md:h-28 mb-3 flex items-center justify-center backdrop-blur-sm">
          <p className="text-xs md:text-sm text-gray-700 text-center">
            Start a conversation with {currentAvatar.name}
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Share what's on your mind..."
            className="flex-1 px-3 py-2 border border-white/60 bg-white/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-xs md:text-sm backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-xs md:text-sm font-semibold shadow-md"
          >
            Send
          </button>
        </div>
      </GlassPanel>
    </div>
  );
};

const PlanCard: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
  <div className="w-full h-full min-w-0 p-2">
    <GlassPanel>
      <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-3 md:mb-4 text-center">Choose Your Plan</h3>
      <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3 md:mb-4">
        <div className="bg-white/70 border border-white/60 rounded-lg p-2 text-center backdrop-blur-sm">
          <h4 className="font-bold text-gray-800 mb-1 text-xs md:text-sm">Free</h4>
          <p className="text-lg md:text-xl font-bold text-gray-600 mb-1">$0</p>
          <p className="text-xs text-gray-500">20 msgs</p>
        </div>
        <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-2 text-center border-2 border-blue-200">
          <h4 className="font-bold text-gray-800 mb-1 text-xs md:text-sm">Plus</h4>
          <p className="text-lg md:text-xl font-bold text-blue-600 mb-1">$4.99</p>
          <p className="text-xs text-gray-500">200 msgs</p>
        </div>
        <div className="bg-white/70 border border-white/60 rounded-lg p-2 text-center backdrop-blur-sm">
          <h4 className="font-bold text-gray-800 mb-1 text-xs md:text-sm">Pro</h4>
          <p className="text-lg md:text-xl font-bold text-gray-600 mb-1">$9.99</p>
          <p className="text-xs text-gray-500">500 msgs</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpgrade();
        }}
        className="w-full py-2 px-4 bg-blue-500 text-white rounded-xl font-bold text-sm md:text-base hover:bg-blue-600 transition-colors shadow-lg"
      >
        Upgrade Now
      </button>
    </GlassPanel>
  </div>
);

const FeatureCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  description: string;
  buttons: Array<{ label: string; primary?: boolean; }>;
  color: string;
}> = ({ title, icon, description, buttons, color }) => (
  <div className="w-full h-full min-w-0 p-2">
    <GlassPanel>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl ${color} flex items-center justify-center text-white shadow-lg`}>
          {React.cloneElement(icon as React.ReactElement, { className: "w-4 h-4 md:w-5 md:h-5" })}
        </div>
        <h3 className="text-sm md:text-base font-bold text-gray-800 truncate">{title}</h3>
      </div>
      <p className="text-gray-700 text-xs md:text-sm mb-3 leading-relaxed line-clamp-2">{description}</p>
      <div className="space-y-1 md:space-y-2">
        {buttons.slice(0, 2).map((button, index) => (
          <button
            key={index}
            onClick={(e) => e.stopPropagation()}
            className={`w-full py-1.5 md:py-2 px-3 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
              button.primary
                ? `${color} text-white hover:opacity-90 shadow-md`
                : `${color.replace('bg-', 'bg-').replace('-500', '-100')} ${color.replace('bg-', 'text-').replace('-500', '-700')} hover:${color.replace('bg-', 'bg-').replace('-500', '-200')}`
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </GlassPanel>
  </div>
);

const VibeCard: React.FC = () => (
  <div className="w-full h-full min-w-0 p-2">
    <GlassPanel>
      <h3 className="text-sm md:text-base font-bold text-gray-800 mb-3 text-center">How are you feeling?</h3>
      <div className="flex flex-col items-center gap-2 md:gap-3">
        <div className="text-3xl md:text-4xl">😊</div>
        <div className="text-sm md:text-base font-semibold text-gray-700">Feeling Good</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-400 h-2 rounded-full" style={{ width: '70%' }}></div>
        </div>
      </div>
    </GlassPanel>
  </div>
);

const useViewport = () => {
  const [viewport, setViewport] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
};

interface PerfectFloatingGridProps {
  onUpgrade?: () => void;
}

export default function PerfectFloatingGrid({ onUpgrade }: PerfectFloatingGridProps = {}) {
  const { selectedAvatar, setSelectedAvatar } = useTheme();
  const { avatar } = useThemeInfo();
  // Measure the actual container size instead of full viewport
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };

    updateSize();

    // Observe container for responsive changes (including mobile orientation)
    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(el);
    window.addEventListener('resize', updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);
  const currentAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];

  // Calculate grid positions
  const gridPositions = calculatePerfectGrid(containerSize);

  return (
    <div ref={containerRef} className={`relative min-h-[600px] max-h-screen h-[80vh] md:h-[90vh] overflow-hidden bg-gradient-to-br ${currentAvatar.bgGradient}`}>
      {/* Beautiful Background Spine */}
      <motion.div
        className={`absolute left-1/2 top-0 transform -translate-x-1/2 w-24 md:w-32 lg:w-40 h-full bg-gradient-to-b ${currentAvatar.gradient} rounded-full opacity-20`}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 0.2, scaleY: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Main Title */}
      <motion.div
        className="absolute top-4 md:top-8 left-1/2 transform -translate-x-1/2 z-40 px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-center text-gray-800 tracking-tight pb-2">
          Your AI{' '}
          <span className={`bg-gradient-to-r ${currentAvatar.gradient} bg-clip-text text-transparent`}>
            bestie
          </span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mt-0 md:mt-1 font-medium">
          Drag cards to explore - they'll bounce back gracefully
        </p>
      </motion.div>

      {/* Central Avatar */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6, type: "spring", stiffness: 150 }}
      >
        <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
          <Image
            src={currentAvatar.src}
            alt={`${currentAvatar.name} avatar`}
            width={160}
            height={160}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </motion.div>

      {/* Perfect Grid of Floating Cards */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
        {containerSize.width > 0 && containerSize.height > 0 && gridPositions.map((pos) => (
          <PerfectCard
            key={pos.id}
            position={{ x: pos.x, y: pos.y }}
            size={pos.size}
            cardId={pos.id}
            angle={pos.angle}
            viewport={containerSize}
          >
            {pos.id === 'avatarCard' && (
              <AvatarCard
                selectedAvatar={selectedAvatar}
                onAvatarSelect={setSelectedAvatar}
              />
            )}
            {pos.id === 'chatCard' && (
              <ChatErrorBoundary>
                <ChatCard selectedAvatar={selectedAvatar} />
              </ChatErrorBoundary>
            )}
            {pos.id === 'planCard' && <PlanCard onUpgrade={onUpgrade || (() => {})} />}
            {pos.id === 'vibeCard' && <VibeCard />}
            {pos.id === 'mindAirCard' && (
              <FeatureCard
                title="MindAir"
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                description="Breathing exercises and mindfulness practices to center yourself"
                buttons={[
                  { label: "4-7-8 Breathing", primary: true },
                  { label: "Box Breathing" },
                  { label: "Calm Breathing" }
                ]}
                color="bg-blue-500"
              />
            )}
            {pos.id === 'mindGuideCard' && (
              <FeatureCard
                title="MindGuide"
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                description="Evidence-based guides and techniques for mental wellness"
                buttons={[
                  { label: "Anxiety Management", primary: true },
                  { label: "Sleep Hygiene" },
                  { label: "Stress Relief" }
                ]}
                color="bg-green-500"
              />
            )}
            {pos.id === 'vibeCheckCard' && (
              <FeatureCard
                title="VibeCheck"
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                description="Track your mood patterns and emotional well-being"
                buttons={[
                  { label: "Daily Check-in", primary: true },
                  { label: "View Trends" },
                  { label: "Export Report" }
                ]}
                color="bg-purple-500"
              />
            )}
          </PerfectCard>
        ))}
      </div>

      {/* Status Indicators - Responsive */}
      <motion.div
        className="fixed bottom-3 left-3 md:bottom-6 md:left-6 z-30 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-4 border border-white/40 shadow-xl"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-green-400 animate-pulse shadow-lg" />
          <div className="text-xs md:text-sm">
            <div className="text-gray-800 font-bold">Perfect Grid</div>
            <div className="text-gray-600 text-xs hidden md:block">Zero overlaps guaranteed</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-3 right-3 md:bottom-6 md:right-6 z-30 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl px-3 py-2 md:px-5 md:py-4 border border-white/40 shadow-xl"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <div className="text-xs md:text-sm">
          <div className="text-gray-800 font-bold flex items-center gap-2">
            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-400" />
            <span className="hidden sm:inline">Smooth Interactions</span>
            <span className="sm:hidden">Drag</span>
          </div>
          <div className="text-gray-600 text-xs hidden md:block">Click & hold to drag</div>
        </div>
      </motion.div>
    </div>
  );
}