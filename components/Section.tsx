'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
  id: string;
  title?: string;
  children: ReactNode;
  darkMode: boolean;
  className?: string;
}

export default function Section({ id, title, children, darkMode, className = '' }: SectionProps) {
  return (
    <section
      id={id}
      className={`min-h-screen py-20 px-4 sm:px-6 lg:px-8 ${
        darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            {title}
          </motion.h2>
        )}
        {children}
      </div>
    </section>
  );
}
