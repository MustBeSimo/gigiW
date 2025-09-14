'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import CrisisResourceModal, { detectCrisisKeywords } from './CrisisResourceModal';
import { getAvatarTheme, getAvatarClasses, type AvatarId } from '@/utils/avatarThemes';

interface InlineChatProps {
  selectedAvatar: string;
  onUpgrade?: () => void;
}

const avatars = {
  'gigi': {
    name: 'Gigi',
    src: '/images/avatars/Gigi_avatar.png',
    gradient: 'from-pink-200 to-purple-200',
    personality: 'empathetic and warm'
  },
  'vee': {
    name: 'Vee',
    src: '/images/avatars/Vee_avatar.png',
    gradient: 'from-blue-200 to-cyan-200',
    personality: 'logical and structured'
  },
  'lumo': {
    name: 'Lumo',
    src: '/images/avatars/Lumo_avatar.png',
    gradient: 'from-teal-200 to-emerald-200',
    personality: 'creative and inspiring'
  }
};

const demoResponses = [
  {
    trigger: ['hello', 'hi', 'hey', 'start'],
    response: "Hello! I'm {name}, your AI mental wellness companion. I'm here to help you work through thoughts and feelings using evidence-based CBT techniques. What's on your mind today?"
  },
  {
    trigger: ['anxious', 'anxiety', 'worried', 'stress', 'nervous'],
    response: "I understand you're feeling anxious. That's completely normal and you're not alone. Let's try a simple technique: Can you tell me what specific thoughts are making you feel this way? Sometimes just naming them helps reduce their power."
  },
  {
    trigger: ['sad', 'depressed', 'down', 'low', 'upset'],
    response: "I hear that you're feeling down. It takes courage to reach out. One thing that often helps is identifying what we call 'thought patterns.' What thoughts have been going through your mind lately?"
  },
  {
    trigger: ['angry', 'frustrated', 'mad', 'furious'],
    response: "Anger can be really intense. Let's work with it constructively. Can you describe the situation that triggered these feelings? Often there are underlying thoughts that fuel our anger."
  },
  {
    trigger: ['help', 'support', 'need', 'struggling'],
    response: "I'm here to support you. CBT helps us understand the connection between our thoughts, feelings, and behaviors. What specific area would you like to focus on - thoughts, emotions, or daily challenges?"
  },
  {
    trigger: ['sleep', 'insomnia', 'tired', 'rest'],
    response: "Sleep troubles often come from racing thoughts. Let's work on calming your mind. What thoughts are keeping you awake? We can practice some techniques to quiet that mental chatter."
  }
];

const defaultResponse = "Thank you for sharing that with me. In CBT, we explore how thoughts, feelings, and behaviors are connected. I'd love to help you explore this further and provide personalized guidance tailored to your specific situation.";

export default function InlineChat({ selectedAvatar, onUpgrade }: InlineChatProps) {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisTriggerWord, setCrisisTriggerWord] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { signInWithGoogle } = useAuth();

  const avatar = avatars[selectedAvatar as keyof typeof avatars] || avatars.lumo;
  const avatarTheme = getAvatarTheme(selectedAvatar as AvatarId);
  const avatarClasses = getAvatarClasses(selectedAvatar as AvatarId);
  const maxMessages = 5;

  // Load saved chat state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChat = localStorage.getItem('mindgleam_inline_chat');
      if (savedChat) {
        const parsedData = JSON.parse(savedChat);
        setMessages(parsedData.messages || []);
        setUserMessageCount(parsedData.count || 0);
        if (parsedData.messages && parsedData.messages.length > 0) {
          setIsExpanded(true);
        }
      }
    }
  }, []);

  // Save chat state to localStorage
  const saveChatState = (newMessages: typeof messages, newCount: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindgleam_inline_chat', JSON.stringify({
        messages: newMessages,
        count: newCount,
        lastUsed: new Date().toISOString()
      }));
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are ${avatar.name}, a ${avatar.personality} AI mental wellness companion. You use CBT-inspired techniques to help users reframe thoughts and manage emotions. Keep responses helpful, empathetic, and under 150 words. This is an inline chat demo on the landing page, so be engaging and showcase your capabilities while encouraging the user to continue their wellness journey.`
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
      console.error('Inline chat API error:', error);
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
      localStorage.removeItem('mindgleam_inline_chat');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Chat Interface */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 'auto' }}
        className={`${avatarClasses.background} backdrop-blur-sm rounded-2xl shadow-lg border ${avatarClasses.border}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.gradient} p-1`}>
              <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                <Image
                  src={avatar.src}
                  alt={avatar.name}
                  width={32}
                  height={32}
                  className="object-contain avatar-image"
                  sizes="32px"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat with {avatar.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userMessageCount >= maxMessages 
                  ? 'Free messages used' 
                  : `${maxMessages - userMessageCount} free messages left`}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              onClick={resetChat}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-sm"
              title="Start new chat"
            >
              Reset
            </button>
          )}
        </div>

        {/* Messages */}
        <div
          ref={chatRef}
          className={`${isExpanded && messages.length > 0 ? 'max-h-64' : 'max-h-0'} overflow-y-auto transition-all duration-300`}
        >
          <div className="p-4 space-y-3">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    message.isUser
                      ? `${avatarClasses.accent} text-white`
                      : `bg-white/60 dark:bg-gray-700/60 ${avatarClasses.textPrimary}`
                  }`}
                >
                  <p>{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
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
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {userMessageCount >= maxMessages ? (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🎉 Ready to continue your wellness journey?
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Sign up to get 20 free messages with personalized guidance, mood tracking, and 24/7 support.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleUpgrade}
                    className={`flex-1 ${avatarClasses.accent} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <button
                    onClick={resetChat}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Start over
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={messages.length === 0 
                    ? `Hi ${avatar.name}, I'm feeling...` 
                    : `Continue chatting with ${avatar.name}...`}
                  className="w-full p-3 pr-16 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
                  rows={2}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className={`absolute right-3 bottom-3 ${avatarClasses.accent} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              
              {/* Disclaimer */}
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Educational content only • Not medical advice • Ages 18+ • Crisis? Call 988 (US)
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
