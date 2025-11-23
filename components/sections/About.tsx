'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiCode, FiHeart, FiTarget, FiZap } from 'react-icons/fi';

interface AboutProps {
  darkMode: boolean;
}

const highlights = [
  {
    icon: FiCode,
    title: 'Tech Enthusiast',
    description: 'Passionate about AI, machine learning, and building innovative solutions',
  },
  {
    icon: FiHeart,
    title: 'Problem Solver',
    description: 'Love tackling complex challenges with creative and efficient approaches',
  },
  {
    icon: FiTarget,
    title: 'Goal-Driven',
    description: 'Committed to continuous learning and professional growth',
  },
  {
    icon: FiZap,
    title: 'Impact Focused',
    description: 'Dedicated to creating AI-driven solutions that make a real difference',
  },
];

export default function About({ darkMode }: AboutProps) {
  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Hello! I'm <span className="font-bold text-blue-500">Xevi Olivas</span>, an aspiring AI
          Data Analyst and Developer based in the Philippines. I'm currently completing my Bachelor
          of Science in Information Technology at St. Paul University Philippines, with a focus on
          artificial intelligence and computer vision.
        </p>

        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          My journey into technology began with a curiosity about how machines can learn and make
          decisions. This curiosity evolved into a deep passion for developing intelligent systems
          that can solve real-world problems. I specialize in machine learning, computer vision, and
          data analysis, with hands-on experience in building AI-powered applications.
        </p>

        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          What drives me is the potential of AI to transform industries and improve lives. Whether
          it's detecting anomalies in exam proctoring systems, analyzing data patterns, or building
          intelligent chatbots, I'm always excited to explore new technologies and push the
          boundaries of what's possible. I believe in writing clean, maintainable code and creating
          solutions that are not just technically sound but also user-friendly and impactful.
        </p>

        <p className={`text-lg leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Beyond coding, I enjoy collaborating with teams, sharing knowledge, and staying up-to-date
          with the latest advancements in AI and data science. My goal is to leverage technology to
          create meaningful innovations that contribute to a better future.
        </p>
      </motion.div>

      {/* Highlights Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {highlights.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-gray-50 hover:bg-gray-100'
            } transition-all duration-300 shadow-lg`}
          >
            <item.icon className="text-blue-500 text-3xl mb-4" />
            <h3 className="font-bold text-xl mb-2">{item.title}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
