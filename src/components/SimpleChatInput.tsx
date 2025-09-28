'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Avatar {
  id: 'gigi' | 'vee' | 'lumo';
  name: string;
  src: string;
  gradient: string;
}

const avatars: Avatar[] = [
  {
    id: 'gigi',
    name: 'Gigi',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-400 to-rose-400'
  },
  {
    id: 'vee',
    name: 'Vee',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-400 to-indigo-400'
  },
  {
    id: 'lumo',
    name: 'Lumo',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-emerald-400 to-teal-400'
  }
];

interface SimpleChatInputProps {
  selectedAvatar: 'gigi' | 'vee' | 'lumo';
  onSendMessage?: (message: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  chatHistory?: Array<{role: 'user' | 'assistant', content: string, timestamp: number}>;
  hasStartedChat?: boolean;
}

const SimpleChatInput: React.FC<SimpleChatInputProps> = ({
  selectedAvatar,
  onSendMessage,
  placeholder,
  className = '',
  disabled = false,
  isLoading = false,
  chatHistory = [],
  hasStartedChat = false
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentAvatar = avatars.find(avatar => avatar.id === selectedAvatar) || avatars[0];

  // Expand chat when there's history (always keep expanded once chat starts)
  useEffect(() => {
    if ((hasStartedChat || chatHistory.length > 0) && !isExpanded) {
      setIsExpanded(true);
    }
  }, [hasStartedChat, chatHistory.length, isExpanded]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current && isExpanded) {
      const scrollToBottom = () => {
        chatContainerRef.current!.scrollTop = chatContainerRef.current!.scrollHeight;
      };
      // Small delay to allow DOM updates
      requestAnimationFrame(scrollToBottom);
    }
  }, [chatHistory.length, isLoading, isExpanded]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && onSendMessage && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const defaultPlaceholder = `Share what's on your mind with ${currentAvatar.name}...`;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div
        className={`
          relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-lg transition-all duration-200
          ${isFocused || isExpanded
            ? `border-2 shadow-xl`
            : 'border-2 border-gray-200/50 dark:border-gray-700/50'
          }
          ${disabled ? 'opacity-75 cursor-not-allowed' : ''}
        `}
        style={(isFocused || isExpanded) ? {
          borderColor: currentAvatar.id === 'gigi' ? '#ec4899' : currentAvatar.id === 'vee' ? '#3b82f6' : '#10b981'
        } : {}}
      >

        {/* Chat History - Shows above input when expanded */}
        {isExpanded && chatHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="border-b border-gray-100 dark:border-gray-700"
          >
              <div className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Chat with {currentAvatar.name}
                  </span>
                </div>
                <div
                  ref={chatContainerRef}
                  className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
                >
                  {chatHistory.map((message, index) => (
                    <motion.div
                      key={`${message.timestamp}-${index}`}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className={`max-w-[85%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? `bg-gradient-to-r ${currentAvatar.gradient} text-white shadow-sm`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
        )}

        <div className="flex items-start gap-4 p-4 md:p-6">
          {/* Avatar */}
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-200 ${
                isFocused ? 'border-2 shadow-lg' : 'border-2 border-gray-300/50 dark:border-gray-600/50'
              }`}
              style={isFocused ? {
                borderColor: currentAvatar.id === 'gigi' ? '#ec4899' : currentAvatar.id === 'vee' ? '#3b82f6' : '#10b981'
              } : {}}
            >
              <Image
                src={currentAvatar.src}
                alt={`${currentAvatar.name} avatar`}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Input Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-semibold text-lg transition-colors duration-200 ${
                isFocused
                  ? (currentAvatar.id === 'gigi' ? 'text-pink-600 dark:text-pink-400' :
                     currentAvatar.id === 'vee' ? 'text-blue-600 dark:text-blue-400' :
                     'text-emerald-600 dark:text-emerald-400')
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                Chat with {currentAvatar.name}
              </h3>
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-green-600 font-medium">Online</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                disabled={disabled || isLoading}
                placeholder={isLoading ? `${currentAvatar.name} is thinking...` : (placeholder || defaultPlaceholder)}
                className={`
                  w-full min-h-[60px] max-h-[200px] p-4 pr-16 rounded-2xl resize-none
                  bg-gray-50/80 dark:bg-gray-700/80 border-0 outline-none transition-all duration-200
                  placeholder-gray-500 dark:placeholder-gray-400
                  text-gray-800 dark:text-gray-200
                  focus:bg-white/90 dark:focus:bg-gray-600/90
                  ${disabled ? 'cursor-not-allowed' : ''}
                `}
                rows={1}
              />

              {/* Character count indicator when approaching limit */}
              {message.length > 500 && (
                <motion.div
                  className="absolute bottom-2 left-4 text-xs text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {message.length}/1000
                </motion.div>
              )}

              {/* Send Button */}
              <motion.button
                onClick={handleSend}
                disabled={!message.trim() || disabled || isLoading}
                className={`
                  absolute bottom-2 right-2 w-10 h-10 rounded-xl flex items-center justify-center
                  transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
                  ${message.trim() && !disabled && !isLoading
                    ? (currentAvatar.id === 'gigi' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg hover:shadow-xl' :
                       currentAvatar.id === 'vee' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl' :
                       'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:shadow-xl')
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                  }
                `}
                whileHover={message.trim() && !disabled && !isLoading ? { scale: 1.1 } : {}}
                whileTap={message.trim() && !disabled && !isLoading ? { scale: 0.95 } : {}}
                transition={{ duration: 0.1 }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </motion.button>
            </div>

            {/* Quick suggestions */}
            <AnimatePresence mode="wait">
              {isFocused && !message && !isLoading && (
                <motion.div
                  key="suggestions"
                  className="mt-3 flex flex-wrap gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                >
                {getQuickSuggestions(currentAvatar.id).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (!isLoading && !disabled) {
                        setMessage(suggestion);
                        // Auto-send the message after a brief delay to show the text
                        setTimeout(() => {
                          if (onSendMessage && !disabled && !isLoading) {
                            onSendMessage(suggestion);
                            setMessage('');
                          }
                        }, 100);
                      }
                    }}
                    disabled={disabled || isLoading}
                    className={`
                      px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
                      bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
                      hover:text-white hover:shadow-md
                      ${currentAvatar.id === 'gigi' ? 'hover:bg-gradient-to-r hover:from-pink-400 hover:to-rose-400' :
                        currentAvatar.id === 'vee' ? 'hover:bg-gradient-to-r hover:from-blue-400 hover:to-indigo-400' :
                        'hover:bg-gradient-to-r hover:from-emerald-400 hover:to-teal-400'}
                    `}
                  >
                    {suggestion}
                  </button>
                ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Helper text */}
      <motion.p
        className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Enter</kbd> to send,
        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono ml-1">Shift + Enter</kbd> for new line
      </motion.p>
    </div>
  );
};

// Helper function for avatar-specific quick suggestions
const getQuickSuggestions = (avatarId: 'gigi' | 'vee' | 'lumo'): string[] => {
  switch (avatarId) {
    case 'gigi':
      return [
        "I'm feeling creative today!",
        "What fun activity should I try?",
        "Tell me something inspiring",
        "I want to laugh and have fun"
      ];
    case 'vee':
      return [
        "I need some guidance",
        "Help me think through this",
        "I'm feeling overwhelmed",
        "What's your perspective on..."
      ];
    case 'lumo':
      return [
        "I need to relax and unwind",
        "Let's do some mindfulness",
        "I want to feel more peaceful",
        "Help me find my center"
      ];
    default:
      return [
        "How are you today?",
        "I'd like to chat",
        "Tell me something interesting",
        "Let's have a conversation"
      ];
  }
};

export default SimpleChatInput;