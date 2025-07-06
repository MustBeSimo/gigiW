'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface DemoChatProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar: string;
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
    trigger: ['hello', 'hi', 'hey'],
    response: "Hello! I'm {name}, your AI mental wellness companion. I'm here to help you work through thoughts and feelings using evidence-based CBT techniques. What's on your mind today?"
  },
  {
    trigger: ['anxious', 'anxiety', 'worried', 'stress'],
    response: "I understand you're feeling anxious. That's a very common experience. Let's try a simple technique: Can you tell me what specific thoughts are making you feel this way? Sometimes just naming them helps reduce their power."
  },
  {
    trigger: ['sad', 'depressed', 'down', 'low'],
    response: "I hear that you're feeling down. It takes courage to reach out. One thing that often helps is identifying what we call 'thought patterns.' What thoughts have been going through your mind lately?"
  },
  {
    trigger: ['angry', 'frustrated', 'mad', 'upset'],
    response: "Anger can be really intense. Let's work with it constructively. Can you describe the situation that triggered these feelings? Often there are underlying thoughts that fuel our anger."
  },
  {
    trigger: ['help', 'support', 'need'],
    response: "I'm here to support you. CBT helps us understand the connection between our thoughts, feelings, and behaviors. What specific area would you like to focus on today - thoughts, emotions, or behaviors?"
  }
];

const defaultResponse = "Thank you for sharing that with me. In CBT, we believe that our thoughts, feelings, and behaviors are all connected. I'd love to help you explore this further. To continue our conversation and access personalized guidance, would you like to sign up for your 50 free sessions?";

export default function DemoChat({ isOpen, onClose, selectedAvatar }: DemoChatProps) {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean, timestamp: Date}>>([]);
  const [inputValue, setInputValue] = useState('');
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const { signInWithGoogle } = useAuth();

  const avatar = avatars[selectedAvatar as keyof typeof avatars] || avatars.gigi;

  const getResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find matching response
    const matchedResponse = demoResponses.find(response => 
      response.trigger.some(trigger => lowerMessage.includes(trigger))
    );
    
    const responseText = matchedResponse ? matchedResponse.response : defaultResponse;
    return responseText.replace('{name}', avatar.name);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || messageCount >= 3) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message
    const newUserMessage = {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setMessageCount(prev => prev + 1);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = {
        text: getResponse(userMessage),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSignUpAndContinue = () => {
    signInWithGoogle();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.gradient} p-1`}>
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={avatar.src}
                    alt={avatar.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{avatar.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Demo Chat • {3 - messageCount} messages remaining</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Try a conversation with {avatar.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your {avatar.personality} AI companion is ready to help. Try saying hello or share what's on your mind.
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm md:text-base">{message.text}</p>
                  <span className="text-xs opacity-70 mt-2 block">
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
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {messageCount >= 3 ? (
              <div className="text-center space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    🎉 Enjoyed your chat with {avatar.name}?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Get 50 free sessions with personalized guidance, mood tracking, and 24/7 support.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSignUpAndContinue}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
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
                      onClick={onClose}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Type your message to ${avatar.name}...`}
                  className="w-full p-4 pr-16 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  rows={2}
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-4 bottom-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 