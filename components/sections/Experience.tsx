'use client';

import { motion } from 'framer-motion';
import { FiBriefcase, FiCalendar } from 'react-icons/fi';

interface ExperienceProps {
  darkMode: boolean;
}

const experiences = [
  {
    title: 'Thesis Researcher',
    organization: 'St. Paul University Philippines',
    period: '2024 - 2025',
    description:
      'Developing "Powered Proctoring," a real-time exam cheating detection system using computer vision and AI. Implementing YOLOv8 and MediaPipe for advanced detection capabilities.',
    skills: ['Python', 'YOLOv8', 'MediaPipe', 'Computer Vision', 'Machine Learning'],
  },
  {
    title: 'AI/ML Student Projects',
    organization: 'Academic & Personal',
    period: '2023 - Present',
    description:
      'Building various AI and machine learning projects including digital twins, RAG systems, and intelligent chatbots. Exploring cutting-edge technologies in natural language processing and data analysis.',
    skills: ['TensorFlow', 'Python', 'Next.js', 'TypeScript', 'Vector Databases'],
  },
  {
    title: 'Software Development Training',
    organization: 'Self-Directed Learning',
    period: '2022 - Present',
    description:
      'Continuous learning and skill development through online courses, coding challenges, and hands-on projects. Focus on full-stack development, AI/ML, and modern web technologies.',
    skills: ['React', 'Node.js', 'Git', 'Linux', 'Cloud Computing'],
  },
];

export default function Experience({ darkMode }: ExperienceProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {experiences.map((exp, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`relative p-6 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          } shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          {/* Timeline Line */}
          {index < experiences.length - 1 && (
            <div
              className={`absolute left-6 top-full h-8 w-0.5 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            />
          )}

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <FiBriefcase className="text-white text-xl" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{exp.title}</h3>
              <p className="text-blue-500 font-semibold mb-2">{exp.organization}</p>

              <div className="flex items-center space-x-2 mb-3">
                <FiCalendar className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {exp.period}
                </span>
              </div>

              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {exp.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm ${
                      darkMode
                        ? 'bg-gray-700 text-blue-400'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
