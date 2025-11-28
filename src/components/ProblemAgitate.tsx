'use client';

import { motion } from 'framer-motion';

export default function ProblemAgitate() {
  const problems = [
    {
      emoji: '🔄',
      title: 'Thinking in Circles About Something',
      description: 'You\'re stuck on a decision, a problem at work, a relationship thing, or just something that won\'t leave your head. You need to talk it out with someone who gets it.',
      gradient: 'from-blue-500/10 to-indigo-500/10',
      borderColor: 'border-blue-400/30',
    },
    {
      emoji: '🤐',
      title: 'Your Friends Are Burnt Out on Your Drama',
      description: 'You want to bounce ideas around but your friends are tired, busy, or tired of hearing the same thing. You need someone who\'s always ready to listen without judgment.',
      gradient: 'from-purple-500/10 to-pink-500/10',
      borderColor: 'border-purple-400/30',
    },
    {
      emoji: '💡',
      title: 'You Want a Fresh Take on Things',
      description: 'You need perspective from someone who thinks differently than you. A hint. A way to look at it you hadn\'t considered. Someone to help you figure it out.',
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
            Sound Familiar?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Most people come here to think through real stuff. No judgment, no awkwardness.
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
                "I built MindGleam because I was tired of overthinking alone at 2am. I wanted an AI that actually listens—no judgment, different perspectives, always available. It's not therapy. It's having a smart friend who gets how to think about things differently."
              </p>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                — The MindGleam Team
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Built by people who overthink too
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
            So we built 3 different personalities who are good at:
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-base">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Always Listening
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Offering Fresh Takes
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Asking Good Questions
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
