// SpotlightChat.tsx – Chat UI for SpotlightCard powered by Together LLM

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface Message {
  text: string;
  isUser: boolean;
}

export default function SpotlightChat() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi! I'm your AI Spotlight. Ask me anything! ✨", isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { text: input, isUser: true };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text,
          })),
        }),
      });
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content ?? data.text ?? 'No response.';
      setMessages(prev => [...prev, { text: aiText, isUser: false }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: 'Error fetching AI response.', isUser: false }]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        if (chatRef.current) {
          chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={chatRef} className="max-h-60 overflow-y-auto flex flex-col gap-2 bg-black/10 rounded-lg p-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className={`max-w-[80%] ${msg.isUser ? 'self-end bg-pink-600 text-white' : 'self-start bg-white/10 text-white'} p-2 rounded-xl text-sm`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {msg.text}
          </motion.div>
        ))}
        {loading && <LoadingSpinner />}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none bg-black/20 text-white"
          rows={2}
          disabled={loading}
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg shadow-md"
          disabled={loading}
        >
          Send
        </motion.button>
      </form>
    </div>
  );
}
