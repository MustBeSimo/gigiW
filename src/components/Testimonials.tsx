'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  location: string;
  rating: number;
  duration: string;
  imagePlaceholder: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "I enjoy the conversations and find the AI companions entertaining. It's nice to have someone to chat with about wellness topics when I'm curious to learn more.",
    author: "Sarah M.",
    role: "Teacher",
    location: "San Francisco",
    rating: 5,
    duration: "Using for 6 weeks",
    imagePlaceholder: "from-pink-400 to-rose-400",
    gradient: "from-pink-50 to-rose-50",
  },
  {
    id: 2,
    quote: "It's a fun way to explore wellness concepts without pressure. I like that I can chat anytime and learn about mindfulness techniques at my own pace.",
    author: "Marcus T.",
    role: "Software Engineer",
    location: "Austin",
    rating: 5,
    duration: "4 months exploring",
    imagePlaceholder: "from-blue-400 to-indigo-400",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    id: 3,
    quote: "The late-night availability is convenient. When I can't sleep and want to journal my thoughts, having an AI companion to talk through ideas with is entertaining.",
    author: "Jennifer K.",
    role: "Entrepreneur",
    location: "NYC",
    rating: 5,
    duration: "8 weeks enjoying",
    imagePlaceholder: "from-emerald-400 to-teal-400",
    gradient: "from-emerald-50 to-teal-50",
  },
];

const stats = [
  { percentage: '100K+', label: 'conversations started for wellness exploration' },
  { percentage: '4.9/5', label: 'average user rating for entertainment value' },
  { percentage: '24/7', label: 'availability for educational chats' },
];

export default function Testimonials() {
  return (
    <section className="w-full py-16 px-4 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why People Actually Use It
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
            Real conversations. Real breakthroughs.
          </p>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              className={`bg-gradient-to-br ${testimonial.gradient} dark:from-gray-800 dark:to-gray-750 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-800 dark:text-gray-200 text-base leading-relaxed mb-6 italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.imagePlaceholder} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {testimonial.role}, {testimonial.location}
                  </p>
                </div>
              </div>

              {/* Duration Badge */}
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {testimonial.duration}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Usage Statistics */}
        <motion.div
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 rounded-2xl p-8 border border-purple-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Platform Usage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {stat.percentage}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
            * Usage statistics only. Educational and entertainment purposes only. Not medical advice, therapy, or health claims.
          </p>
        </motion.div>

        {/* Note for Implementation */}
        <motion.div
          className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>⚠️ ACTION REQUIRED:</strong> These are placeholder testimonials. Replace with real user feedback
            that focuses on entertainment/educational value only. Obtain written permission. DO NOT include medical outcomes,
            therapeutic claims, or health improvements. Focus on user experience, convenience, and entertainment value only.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
