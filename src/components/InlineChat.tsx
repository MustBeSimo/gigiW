'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme, useThemeInfo } from '@/contexts/ThemeContext';
import Image from 'next/image';
import CrisisResourceModal, { detectCrisisKeywords } from './CrisisResourceModal';
import { MESSAGE_LIMITS } from '@/config/limits';
import { getEncryptedStorage, setEncryptedStorage, clearEncryptedStorage } from '@/utils/encryption';

interface InlineChatProps {
  onUpgrade?: () => void;
}

const avatars = {
  'gigi': {
    name: 'Gigi',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-400/30 via-rose-400/20 to-purple-400/30',
    personality: 'empathetic and warm',
    chatStyle: 'warm, empathetic, uses heart emojis, focuses on emotional support',
    conversationStarters: [
      "💕 How is your heart feeling today?",
      "🧸 What's been weighing on your mind lately?",
      "💝 I'm here to listen - what would help you feel supported?"
    ],
    specialties: ['Emotional Support', 'Self-Compassion', 'Relationships']
  },
  'vee': {
    name: 'Vee',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-400/30 via-cyan-400/20 to-indigo-400/30',
    personality: 'logical and structured',
    chatStyle: 'analytical, structured, uses thinking emojis, focuses on problem-solving',
    conversationStarters: [
      "🧠 Let's break down what's challenging you today",
      "🎯 What specific goal would you like to work on?",
      "📊 How can we approach this situation logically?"
    ],
    specialties: ['Problem Solving', 'Goal Setting', 'CBT Techniques']
  },
  'lumo': {
    name: 'Lumo',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-emerald-400/30 via-teal-400/20 to-green-400/30',
    personality: 'creative and inspiring',
    chatStyle: 'creative, inspiring, uses sparkle emojis, focuses on new perspectives',
    conversationStarters: [
      "✨ What new perspective might help you see this differently?",
      "🌈 Let's explore creative ways to shift your mindset",
      "🎨 How could we reframe this situation in a more positive light?"
    ],
    specialties: ['Creative Thinking', 'Mindfulness', 'Perspective Shifts']
  }
};

const demoResponses = [
  {
    trigger: ['hello', 'hi', 'hey', 'start'],
    response: "Hey! I'm {name} 👋 What's going on?"
  },
  {
    trigger: ['anxious', 'anxiety', 'worried', 'stress', 'nervous'],
    response: "Anxiety sucks. What's your mind spinning about right now?"
  },
  {
    trigger: ['sad', 'depressed', 'down', 'low', 'upset'],
    response: "That sounds really tough. Want to tell me what's weighing on you?"
  },
  {
    trigger: ['angry', 'frustrated', 'mad', 'furious'],
    response: "Ugh, frustration is the worst. What happened?"
  },
  {
    trigger: ['help', 'support', 'need', 'struggling'],
    response: "I'm here for you. What's the biggest thing on your mind right now?"
  },
  {
    trigger: ['sleep', 'insomnia', 'tired', 'rest'],
    response: "Sleep issues are so draining. Is your mind racing or something else keeping you up?"
  },
  {
    trigger: ['work', 'job', 'boss', 'colleague'],
    response: "Work stress hits different. What's the situation?"
  },
  {
    trigger: ['relationship', 'partner', 'boyfriend', 'girlfriend', 'friend'],
    response: "Relationship stuff can be messy. What's going on?"
  },
  {
    trigger: ['school', 'study', 'exam', 'grade'],
    response: "School pressure is real. What's stressing you out?"
  }
];

const defaultResponse = "Tell me more about that. What's really bothering you?";

export default function InlineChat({ onUpgrade }: InlineChatProps) {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisTriggerWord, setCrisisTriggerWord] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle } = useAuth();
  const { selectedAvatar, themeClasses } = useTheme();
  const { avatar } = useThemeInfo();

  // Memoize avatar data to prevent unnecessary re-renders
  const avatarData = useMemo(
    () => avatars[selectedAvatar as keyof typeof avatars] || avatars.lumo,
    [selectedAvatar]
  );
  const maxMessages = MESSAGE_LIMITS.DEMO_FREE_MESSAGES;

  // Load saved chat state from encrypted localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChat = getEncryptedStorage<{ messages: any[]; count: number; lastUsed?: string }>(
        'mindgleam_inline_chat'
      );
      if (savedChat) {
        setMessages(savedChat.messages || []);
        setUserMessageCount(savedChat.count || 0);
        if (savedChat.messages && savedChat.messages.length > 0) {
          setIsExpanded(true);
        }
      }
    }
  }, []);

  // Save chat state to encrypted localStorage
  const saveChatState = (newMessages: typeof messages, newCount: number) => {
    if (typeof window !== 'undefined') {
      setEncryptedStorage('mindgleam_inline_chat', {
        messages: newMessages,
        count: newCount,
        lastUsed: new Date().toISOString()
      });
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const getFallbackResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    const matchedResponse = demoResponses.find(response => 
      response.trigger.some(trigger => lowerMessage.includes(trigger))
    );
    const responseText = matchedResponse ? matchedResponse.response : defaultResponse;
    return responseText.replace('{name}', avatar.name);
  };

  const getResponse = async (userMessage: string) => {
    try {
      // Get personality and mood from localStorage
      const selectedPersonality = localStorage.getItem('selectedPersonality') || selectedAvatar;
      const currentMood = localStorage.getItem('currentMood') || 'neutral';

      const personalityData = avatars[selectedPersonality as keyof typeof avatars] || avatars.lumo;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are ${personalityData.name}, a ${personalityData.personality} AI friend.

Personality: ${personalityData.chatStyle}
User's mood: ${currentMood}

Be conversational, direct, and helpful. Skip the fluff - get straight to the point. Use simple language like you're texting a friend. Keep responses under 100 words. Ask follow-up questions to understand what's really going on.

Tone guidelines:
- Anxious/stressed: Be calming but not preachy
- Sad/down: Be supportive without being overly sympathetic
- Okay/good: Be encouraging and curious
- Don't use excessive emojis or hearts
- Sound like a real person, not a therapist`
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          isDemo: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.message;
      } else {
        return getFallbackResponse(userMessage);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Inline chat API error:', error);
      }
      return getFallbackResponse(userMessage);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || userMessageCount >= maxMessages || isTyping) return;
    
    const userMessage = inputValue.trim();
    
    // Check for crisis keywords
    const crisisKeyword = detectCrisisKeywords(userMessage);
    if (crisisKeyword) {
      setCrisisTriggerWord(crisisKeyword);
      setShowCrisisModal(true);
      return;
    }

    setInputValue('');
    setIsExpanded(true);
    
    // Add user message
    const newUserMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    
    const newUserMessageCount = userMessageCount + 1;
    setUserMessageCount(newUserMessageCount);
    
    // Save state
    saveChatState(updatedMessages, newUserMessageCount);
    
    setIsTyping(true);
    
    try {
      const aiResponseText = await getResponse(userMessage);
      const aiResponse = {
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      saveChatState(finalMessages, newUserMessageCount);
    } catch (error) {
      const fallbackResponse = {
        text: getFallbackResponse(userMessage),
        isUser: false,
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, fallbackResponse];
      setMessages(finalMessages);
      saveChatState(finalMessages, newUserMessageCount);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpgrade = () => {
    signInWithGoogle();
    if (onUpgrade) {
      onUpgrade();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setUserMessageCount(0);
    setIsExpanded(false);
    if (typeof window !== 'undefined') {
      clearEncryptedStorage('mindgleam_inline_chat');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Chat Interface with Enhanced Frosted Glass */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 'auto',
          transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
        }}
        className="border-0 rounded-3xl overflow-hidden backdrop-blur-xl"
      >
        {/* Enhanced Chat Header with Improved Avatar Layout */}
        <div className="p-4 border-b border-white/10 dark:border-gray-700/10 bg-white/5 dark:bg-gray-800/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Avatar thumbnail closer to name */}
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/30 dark:border-gray-600/30 flex-shrink-0">
                <Image
                  src={avatarData.src}
                  alt={`${avatarData.name} avatar`}
                  width={28}
                  height={28}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-wide">{avatarData.name}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                        i < (maxMessages - userMessageCount)
                          ? 'bg-emerald-400 shadow-sm'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>


        {/* Messages */}
        <div
          ref={chatRef}
          className={`${isExpanded && messages.length > 0 ? 'max-h-64' : 'max-h-0'} overflow-y-auto transition-all duration-500 ease-out minimal-scrollbar`}
        >
          <div className="p-4 space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl backdrop-blur-sm border ${
                    message.isUser
                      ? `bg-gradient-to-br ${avatarData.gradient} text-gray-900 dark:text-white border-white/30 dark:border-gray-700/30 shadow-lg`
                      : `bg-white/40 dark:bg-gray-800/40 text-gray-800 dark:text-gray-200 border-white/30 dark:border-gray-700/30`
                  }`}
                >
                  <p className={`leading-relaxed ${
                    message.isUser
                      ? 'text-sm font-medium'
                      : 'text-sm font-normal'
                  }`}>{message.text}</p>
                  <span className="text-xs opacity-60 mt-2 block font-medium tracking-wide">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Enhanced Input Area with frosted glass */}
        <div className="p-4 border-t border-white/10 dark:border-gray-700/10 bg-white/5 dark:bg-gray-800/5 backdrop-blur-sm">
          {userMessageCount >= maxMessages ? (
            <div className="text-center space-y-4">
              <div className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border border-white/30 dark:border-gray-700/30 rounded-xl p-5">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                  🎉 Ready to continue your wellness journey?
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed mb-4">
                  Sign up to unlock 20 free messages with personalized guidance, mood tracking, and 24/7 support.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleUpgrade}
                    className={`flex-1 bg-gradient-to-br ${avatarData.gradient} backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:opacity-90 hover:scale-105 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg tracking-wide`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-bold tracking-wide">Continue with Google</span>
                  </button>
                  <button
                    onClick={resetChat}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-semibold tracking-wide transition-all duration-200 hover:scale-105"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Engaging Input Section */}
              <div className="relative">
                <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/30 dark:border-gray-600/30">
                    <Image
                      src={avatarData.src}
                      alt={`${avatarData.name} avatar`}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0
                    ? `What's weighing on your mind today, ${avatarData.name} is here to listen...`
                    : `Keep the conversation going...`}
                  className="w-full pl-12 pr-16 py-3 rounded-xl border border-white/20 dark:border-gray-700/20 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-white/40 dark:focus:border-gray-600/40 resize-none text-sm font-medium leading-relaxed transition-all duration-200 focus:ring-2 focus:ring-white/10 dark:focus:ring-gray-600/20"
                  rows={2}
                  disabled={isTyping}
                  aria-label={`Send message to ${avatarData.name}`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`absolute right-3 bottom-3 bg-gradient-to-br ${avatarData.gradient} backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white p-2.5 rounded-lg transition-all duration-300 shadow-lg ${
                    inputValue.trim() ? 'scale-110' : 'scale-100'
                  }`}
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Enhanced Disclaimer */}
              <div className="mt-3 text-center">
                <div className="text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-400">
                  🔒 Private & secure • Crisis? Call 988 (US)
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Crisis Resource Modal */}
      <CrisisResourceModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
        triggerWord={crisisTriggerWord || undefined}
      />
    </div>
  );
}
