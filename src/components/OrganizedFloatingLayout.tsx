'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import Image from 'next/image';

// Avatar configuration
const avatars = [
  {
    id: 'gigi' as const,
    name: 'Gigi',
    emoji: '💕',
    description: 'Empathetic & warm',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-200 via-rose-200 to-pink-300',
    bgLight: 'from-rose-50 via-pink-50 to-purple-50'
  },
  {
    id: 'vee' as const,
    name: 'Vee',
    emoji: '🧠',
    description: 'Logical & structured',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-200 via-cyan-200 to-blue-300',
    bgLight: 'from-sky-50 via-blue-50 to-cyan-50'
  },
  {
    id: 'lumo' as const,
    name: 'Lumo',
    emoji: '✨',
    description: 'Creative & inspiring',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-emerald-200 via-teal-200 to-emerald-300',
    bgLight: 'from-emerald-50 via-teal-50 to-green-50'
  }
];

// Fixed position grid - carefully calculated to prevent overlap
const CARD_POSITIONS = {
  mobile: [
    { x: 0, y: -200, id: 'avatarCard' },      // Top center
    { x: -150, y: -100, id: 'vibeCard' },     // Top left
    { x: 150, y: -100, id: 'chatCard' },      // Top right
    { x: -200, y: 50, id: 'mindAirCard' },    // Middle left
    { x: 200, y: 50, id: 'mindGuideCard' },   // Middle right
    { x: -120, y: 180, id: 'vibeCheckCard' }, // Bottom left
    { x: 120, y: 180, id: 'planCard' },       // Bottom right
  ],
  tablet: [
    { x: 0, y: -250, id: 'avatarCard' },      // Top center
    { x: -200, y: -120, id: 'vibeCard' },     // Top left
    { x: 200, y: -120, id: 'chatCard' },      // Top right
    { x: -300, y: 80, id: 'mindAirCard' },    // Middle left
    { x: 300, y: 80, id: 'mindGuideCard' },   // Middle right
    { x: -150, y: 220, id: 'vibeCheckCard' }, // Bottom left
    { x: 150, y: 220, id: 'planCard' },       // Bottom right
  ],
  desktop: [
    { x: 0, y: -280, id: 'avatarCard' },      // Top center
    { x: -250, y: -140, id: 'vibeCard' },     // Top left
    { x: 250, y: -140, id: 'chatCard' },      // Top right
    { x: -380, y: 100, id: 'mindAirCard' },   // Middle left
    { x: 380, y: 100, id: 'mindGuideCard' },  // Middle right
    { x: -180, y: 280, id: 'vibeCheckCard' }, // Bottom left
    { x: 180, y: 280, id: 'planCard' },       // Bottom right
  ]
};

interface FloatingCardProps {
  children: React.ReactNode;
  position: { x: number; y: number };
  size: 'primary' | 'secondary' | 'tertiary';
  cardId: string;
  viewport: { width: number; height: number };
}

const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  position,
  size,
  cardId,
  viewport
}) => {
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);

  // Update position when viewport changes
  useEffect(() => {
    x.set(position.x);
    y.set(position.y);
  }, [position.x, position.y, x, y]);

  // Calculate drag constraints - strict boundaries
  const getDragConstraints = useCallback(() => {
    const padding = 40;
    const cardWidth = size === 'primary' ? 320 : size === 'secondary' ? 280 : 240;
    const cardHeight = size === 'primary' ? 300 : size === 'secondary' ? 260 : 220;

    return {
      left: -(viewport.width / 2) + padding,
      right: (viewport.width / 2) - cardWidth - padding,
      top: -(viewport.height / 2) + 100, // Account for header
      bottom: (viewport.height / 2) - cardHeight - 60 // Account for footer
    };
  }, [size, viewport]);

  const dragConstraints = getDragConstraints();

  // Return to home position with smooth animation
  const returnToHome = useCallback((delay: number = 500) => {
    setTimeout(() => {
      animate(x, position.x, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        restDelta: 0.01
      });
      animate(y, position.y, {
        type: "spring",
        stiffness: 300,
        damping: 30,
        restDelta: 0.01
      });
    }, delay);
  }, [x, y, position]);

  // Size-based styling
  const sizeClasses = {
    primary: 'scale-110 shadow-2xl z-20',
    secondary: 'scale-100 shadow-xl z-15',
    tertiary: 'scale-90 shadow-lg z-10'
  };

  const glassEffects = {
    primary: 'bg-white/95 border-2 border-gray-200/60 backdrop-blur-xl',
    secondary: 'bg-white/90 border border-gray-200/50 backdrop-blur-lg',
    tertiary: 'bg-white/85 border border-gray-200/40 backdrop-blur-md'
  };

  return (
    <motion.div
      className={`absolute rounded-2xl p-6 cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${sizeClasses[size]} ${glassEffects[size]} ${isDragging ? 'scale-105 rotate-1 shadow-3xl' : ''}`}
      style={{
        x,
        y,
        touchAction: 'pan-x pan-y',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: Math.random() * 0.3 }}
      drag
      dragMomentum={false}
      dragElastic={0.2}
      dragConstraints={dragConstraints}
      onDragStart={(event, info) => {
        // Detect proper drag start (not just click)
        setDragStartTime(Date.now());

        const target = event.target as HTMLElement;
        const isInteractive = target.tagName === 'BUTTON' ||
                             target.tagName === 'INPUT' ||
                             target.closest('button') ||
                             target.closest('input') ||
                             target.closest('[role="button"]');

        if (isInteractive) {
          event.preventDefault();
          return;
        }

        setIsDragging(true);
      }}
      onDrag={(event, info) => {
        // Add subtle haptic feedback through scale changes during drag
        const distance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);
        if (distance > 100) {
          // Visual feedback for being far from home
        }
      }}
      onDragEnd={(event, info) => {
        const dragDuration = Date.now() - dragStartTime;
        const dragDistance = Math.sqrt(info.offset.x ** 2 + info.offset.y ** 2);

        setIsDragging(false);

        // Only return to home if it was a proper drag (not just click)
        if (dragDuration > 100 || dragDistance > 20) {
          // Immediate return for far drags, delayed for close drags
          const returnDelay = dragDistance > 150 ? 200 : 800;
          returnToHome(returnDelay);
        }
      }}
      whileHover={!isDragging ? {
        scale: size === 'primary' ? 1.15 : size === 'secondary' ? 1.05 : 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 400 }
      } : {}}
      whileDrag={{
        scale: size === 'primary' ? 1.12 : size === 'secondary' ? 1.08 : 1.05,
        rotate: [-1, 1, -1, 1, 0],
        transition: { duration: 0.2 }
      }}
    >
      {children}
    </motion.div>
  );
};

// Avatar Selection Card
const AvatarSelectionCard: React.FC<{
  selectedAvatar: string;
  onAvatarSelect: (avatarId: 'gigi' | 'vee' | 'lumo') => void;
}> = ({ selectedAvatar, onAvatarSelect }) => {
  return (
    <div className="w-80 h-48">
      <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Meet Your Guides</h3>
      <div className="flex justify-center gap-4">
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
            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              selectedAvatar === avatar.id
                ? 'border-blue-400 shadow-lg'
                : 'border-gray-300 hover:border-gray-400'
            }`}>
              <Image
                src={avatar.src}
                alt={avatar.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <span className="text-xs font-semibold text-gray-700">{avatar.name}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Simple Chat Card
const SimpleChatCard: React.FC<{ selectedAvatar: string }> = ({ selectedAvatar }) => {
  const currentAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];

  return (
    <div className="w-72 h-80">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300">
          <Image
            src={currentAvatar.src}
            alt={currentAvatar.name}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-lg font-bold text-gray-800">{currentAvatar.name}</h3>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 h-40 mb-4">
        <p className="text-sm text-gray-600 text-center py-8">
          Start a conversation with {currentAvatar.name}
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Share what's on your mind..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => e.stopPropagation()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// Feature Cards
const MindAirCard: React.FC = () => (
  <div className="w-64 h-56">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800">MindAir</h3>
    </div>
    <p className="text-gray-600 text-sm mb-4">Breathing exercises and mindfulness practices</p>
    <div className="space-y-2">
      <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors" onClick={(e) => e.stopPropagation()}>
        4-7-8 Breathing
      </button>
      <button className="w-full py-2 px-4 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors" onClick={(e) => e.stopPropagation()}>
        Box Breathing
      </button>
    </div>
  </div>
);

const MindGuideCard: React.FC = () => (
  <div className="w-64 h-56">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800">MindGuide</h3>
    </div>
    <p className="text-gray-600 text-sm mb-4">Evidence-based guides and techniques</p>
    <div className="space-y-2">
      <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors" onClick={(e) => e.stopPropagation()}>
        Anxiety Management
      </button>
      <button className="w-full py-2 px-4 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors" onClick={(e) => e.stopPropagation()}>
        Sleep Hygiene
      </button>
    </div>
  </div>
);

const VibeCheckCard: React.FC = () => (
  <div className="w-64 h-56">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800">VibeCheck</h3>
    </div>
    <p className="text-gray-600 text-sm mb-4">Track your mood patterns</p>
    <div className="space-y-2">
      <button className="w-full py-2 px-4 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors" onClick={(e) => e.stopPropagation()}>
        Daily Check-in
      </button>
      <button className="w-full py-2 px-4 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors" onClick={(e) => e.stopPropagation()}>
        View Trends
      </button>
    </div>
  </div>
);

const VibeCard: React.FC = () => (
  <div className="w-72 h-40">
    <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">VibeIn</h3>
    <div className="flex flex-col items-center gap-4">
      <div className="text-4xl">😊</div>
      <div className="text-sm font-semibold text-gray-700">Feeling Good</div>
    </div>
  </div>
);

const PlanCard: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
  <div className="w-80 h-64">
    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Plan</h3>
    <div className="grid grid-cols-3 gap-3 text-xs">
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-bold text-gray-800 mb-1">Free</h4>
        <p className="text-gray-600 mb-2">$0</p>
        <p className="text-gray-500">20 messages</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
        <h4 className="font-bold text-gray-800 mb-1">Plus</h4>
        <p className="text-gray-600 mb-2">$4.99</p>
        <p className="text-gray-500">200 messages</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-bold text-gray-800 mb-1">Pro</h4>
        <p className="text-gray-600 mb-2">$9.99</p>
        <p className="text-gray-500">500 messages</p>
      </div>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onUpgrade();
      }}
      className="w-full mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
    >
      Upgrade Now
    </button>
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

interface OrganizedFloatingLayoutProps {
  onUpgrade?: () => void;
}

export default function OrganizedFloatingLayout({ onUpgrade }: OrganizedFloatingLayoutProps = {}) {
  const { selectedAvatar, setSelectedAvatar } = useTheme();
  const { avatar } = useThemeInfo();
  const viewport = useViewport();
  const currentAvatar = avatars.find(a => a.id === selectedAvatar) || avatars[0];

  // Get appropriate positions based on viewport
  const getPositions = useCallback(() => {
    if (viewport.width < 768) return CARD_POSITIONS.mobile;
    if (viewport.width < 1024) return CARD_POSITIONS.tablet;
    return CARD_POSITIONS.desktop;
  }, [viewport.width]);

  const positions = getPositions();

  // Card configurations
  const cardConfigs = {
    avatarCard: { size: 'primary' as const, component: AvatarSelectionCard },
    chatCard: { size: 'primary' as const, component: SimpleChatCard },
    planCard: { size: 'primary' as const, component: PlanCard },
    vibeCard: { size: 'secondary' as const, component: VibeCard },
    mindAirCard: { size: 'secondary' as const, component: MindAirCard },
    mindGuideCard: { size: 'secondary' as const, component: MindGuideCard },
    vibeCheckCard: { size: 'tertiary' as const, component: VibeCheckCard },
  };

  return (
    <div className={`relative min-h-screen h-screen overflow-hidden transition-all duration-1000 bg-gradient-to-br ${currentAvatar.bgLight}`}>
      {/* Background Visual Spine */}
      <motion.div
        className={`absolute left-1/2 top-0 transform -translate-x-1/2 w-32 md:w-40 h-full bg-gradient-to-b ${currentAvatar.gradient} rounded-3xl opacity-20`}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 0.2, scaleY: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />

      {/* Main Title */}
      <motion.div
        className="absolute top-8 md:top-12 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h1 className="text-3xl md:text-5xl font-black text-center text-gray-800 tracking-tight">
          Your AI{' '}
          <span className={`bg-gradient-to-r ${currentAvatar.gradient} bg-clip-text text-transparent`}>
            bestie
          </span>
        </h1>
        <p className="text-sm md:text-base text-gray-600 text-center mt-2">
          Drag cards to explore - they'll bounce back gracefully
        </p>
      </motion.div>

      {/* Central Portrait */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-2xl">
          <Image
            src={currentAvatar.src}
            alt={`${currentAvatar.name} avatar`}
            width={192}
            height={192}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </motion.div>

      {/* Floating Cards Container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
        {positions.map((pos, index) => {
          const config = cardConfigs[pos.id as keyof typeof cardConfigs];
          if (!config) return null;

          const CardComponent = config.component;

          return (
            <FloatingCard
              key={pos.id}
              position={{ x: pos.x, y: pos.y }}
              size={config.size}
              cardId={pos.id}
              viewport={viewport}
            >
              {pos.id === 'avatarCard' && (
                <AvatarSelectionCard
                  selectedAvatar={selectedAvatar}
                  onAvatarSelect={setSelectedAvatar}
                />
              )}
              {pos.id === 'chatCard' && <SimpleChatCard selectedAvatar={selectedAvatar} />}
              {pos.id === 'planCard' && <PlanCard onUpgrade={onUpgrade || (() => {})} />}
              {pos.id === 'vibeCard' && <VibeCard />}
              {pos.id === 'mindAirCard' && <MindAirCard />}
              {pos.id === 'mindGuideCard' && <MindGuideCard />}
              {pos.id === 'vibeCheckCard' && <VibeCheckCard />}
            </FloatingCard>
          );
        })}
      </div>

      {/* Status Indicators */}
      <motion.div
        className="fixed bottom-4 left-4 z-30 bg-white/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
          <div className="text-sm">
            <div className="text-gray-800 font-medium">Organized Layout</div>
            <div className="text-gray-600 text-xs">7 cards perfectly positioned</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="fixed bottom-4 right-4 z-30 bg-white/90 backdrop-blur-xl rounded-xl px-4 py-3 border border-gray-200 shadow-lg"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.5, duration: 0.6 }}
      >
        <div className="text-sm">
          <div className="text-gray-800 font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Smooth Interactions
          </div>
          <div className="text-gray-600 text-xs">Click & hold to drag</div>
        </div>
      </motion.div>
    </div>
  );
}