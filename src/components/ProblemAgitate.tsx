'use client';

import { motion } from 'framer-motion';

export default function ProblemAgitate() {
  const problems = [
    {
      emoji: '😰',
      title: 'Racing Thoughts at 2 AM',
      description: 'You lie awake, replaying conversations, worrying about tomorrow. Your mind won\'t stop. Sleep feels impossible.',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'border-blue-400/30',
    },
    {
      emoji: '😔',
      title: 'Anxiety That Won\'t Quit',
      description: 'Every task feels overwhelming. You know you "should" feel better, but the worry follows you everywhere—work, home, even fun moments.',
      gradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-400/30',
    },
    {
      emoji: '😤',
      title: 'Expensive Therapy Waitlists',
      description: 'You want help, but therapy costs $200+/session and waitlists are 8+ weeks. You need support NOW, not next quarter.',
      gradient: 'from-rose-500/10 to-orange-500/10',
      borderColor: 'border-rose-400/30',
    },
  ];

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            You're Not Alone
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Millions struggle with these same challenges every day
          </p>
        </motion.div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              className={`p-6 rounded-2xl bg-gradient-to-br ${problem.gradient} border ${problem.borderColor} backdrop-blur-sm`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="text-5xl mb-4">{problem.emoji}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {problem.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Founder Story / Personal Transition */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                💜
              </div>
            </div>
            <div className="flex-1">
              <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed italic mb-4">
                "I built MindGleam after my own burnout showed me that mental wellness shouldn't be gatekept by cost or availability. Everyone deserves a companion who's there at 2 AM."
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                — The MindGleam Team
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Mental wellness advocates & builders
              </p>
            </div>
          </div>
        </motion.div>

        {/* Transition to Solution */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            That's why we created AI companions that are:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-base">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Available 24/7
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Affordable
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Evidence-Based
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
