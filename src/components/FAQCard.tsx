import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is Mind Gleam and how does it work?",
    answer: "Mind Gleam is an AI-powered wellness app that provides educational support and CBT-inspired techniques. Our AI companions (Gigi, Vee, and Lumo) help you explore thought patterns, practice journaling, and learn evidence-based wellness strategies. This is NOT therapy, medical advice, or professional mental health treatment."
  },
  {
    question: "Is Mind Gleam a replacement for therapy or medical care?",
    answer: "❌ NO - Mind Gleam is NOT a replacement for professional therapy, medical care, or mental health treatment. We are an educational wellness app only. If you're experiencing mental health issues, please consult with licensed mental health professionals, your doctor, or contact crisis services immediately."
  },
  {
    question: "What are the limitations and risks I should know about?",
    answer: "⚠️ IMPORTANT LIMITATIONS: This AI may provide inaccurate, incomplete, or inappropriate responses. It cannot diagnose conditions, provide medical advice, or handle crisis situations. Do not rely on this app for urgent mental health needs. Always seek professional help for serious mental health concerns, suicidal thoughts, or medical emergencies."
  },
  {
    question: "Who should NOT use Mind Gleam?",
    answer: "🚫 Do not use if you are: Under 18, in a mental health crisis, experiencing suicidal thoughts, have severe mental health conditions requiring professional care, or are seeking medical/therapeutic advice. This app is for educational wellness support only for adults 18+ who are not in crisis."
  },
  {
    question: "What should I do in a mental health emergency?",
    answer: "🚨 CRISIS RESOURCES: If you're having suicidal thoughts or in crisis, contact emergency services immediately: • US: 988 (Suicide & Crisis Lifeline) • Australia: 13 11 14 (Lifeline) • UK: 116 123 (Samaritans) • Emergency: 911/000. Do NOT use this app for crisis situations."
  },
  {
    question: "How do the AI coaching sessions work?",
    answer: "You get 50 free educational conversations when you sign up, then 200 more for $4.99. These are AI-generated responses for educational purposes only - NOT professional therapy or medical advice. The AI provides CBT-inspired techniques and wellness education, but cannot replace professional mental health care."
  },
  {
    question: "Is my data private and secure?",
    answer: "We prioritize your privacy with encrypted conversations. However, remember that this is an AI system, not a human therapist. There is no doctor-patient confidentiality. For truly confidential mental health support, please consult with licensed mental health professionals."
  },
  {
    question: "What are your legal disclaimers?",
    answer: "📋 LEGAL DISCLAIMER: Mind Gleam provides educational content only. We make no medical claims and provide no professional mental health services. Use at your own risk. We are not liable for any decisions made based on AI responses. This service is provided 'as is' without warranties. See our Terms of Service for full legal terms."
  },
  {
    question: "How do I get started safely?",
    answer: "Sign in with Google to access 50 free educational conversations. Remember: This is supplemental wellness education, not therapy. Continue seeing your healthcare providers and mental health professionals. Never stop prescribed treatments without consulting your doctor."
  }
];



const FAQCard = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl backdrop-blur-sm shadow-xl">
      <h2 className="text-3xl font-bold text-white mb-8 text-center">Important Information & FAQ</h2>
      
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-colors duration-300"
          >
            <button
              className="w-full px-6 py-4 flex justify-between items-center text-left"
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
            >
              <span className="text-white font-medium">{faq.question}</span>
              <motion.div
                animate={{ rotate: activeIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDownIcon className="w-5 h-5 text-purple-400" />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 py-4 text-gray-300 bg-gray-800/50">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQCard; 