'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedText from '@/components/AnimatedText';

interface ChatCardProps {
  className?: string;
}

export default function ChatCard({ className = '' }: ChatCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hey there! I'm Gigi AI. How can I help you today? 💁‍♀️", isUser: false },
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newUserMsg = { text: message, isUser: true };
    const updatedMsgs = [...chatMessages, newUserMsg];
    setChatMessages(updatedMsgs);
    setMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMsgs.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        })
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content ?? data.text;
      setChatMessages(prev => [...prev, { text: aiText, isUser: false }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { text: 'Error fetching AI response.', isUser: false }]);
    }
  };

  return (
    <div className={className}>
      <motion.div
        className="relative bg-gradient-to-br from-purple-800 to-pink-600 rounded-2xl overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Chat header */}
        <div 
          className="p-4 flex items-center justify-between border-b border-white/10 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white overflow-hidden flex-shrink-0">
              <img 
                src="/images/avatars/gigi-ai.jpg" 
                alt="Gigi AI" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image doesn't exist
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 className="text-white font-bold">
                <AnimatedText text="Let's Chat with Gigi AI" className="inline-block" />
              </h3>
              <p className="text-white/70 text-sm">
                <AnimatedText text="Your favorite AI gal" className="inline-block" />
              </p>
            </div>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.div>
        </div>
        
        {/* Chat content - conditionally shown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Chat messages */}
              <div className="p-4 bg-gray-900/50 h-64 overflow-y-auto flex flex-col gap-3">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    className={`max-w-[80%] ${msg.isUser ? 'self-end bg-pink-600 text-white' : 'self-start bg-white/10 text-white'} p-3 rounded-xl`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {msg.text}
                  </motion.div>
                ))}
              </div>
              
              {/* Chat input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-gray-800/50 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-pink-500"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    className="bg-pink-500 text-white p-2 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!message.trim()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 