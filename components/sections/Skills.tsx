'use client';

import { motion } from 'framer-motion';
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiTensorflow,
  SiPytorch,
  SiOpencv,
  SiGit,
  SiLinux,
  SiDocker,
  SiReact,
  SiNextdotjs,
} from 'react-icons/si';
import { FiCpu, FiUsers, FiMessageSquare, FiTarget, FiCode } from 'react-icons/fi';

interface SkillsProps {
  darkMode: boolean;
}

const skillCategories = [
  {
    title: 'Programming Languages',
    skills: [
      { name: 'Python', icon: SiPython, color: 'text-yellow-500' },
      { name: 'JavaScript', icon: SiJavascript, color: 'text-yellow-400' },
      { name: 'TypeScript', icon: SiTypescript, color: 'text-blue-500' },
    ],
  },
  {
    title: 'AI/ML & Computer Vision',
    skills: [
      { name: 'TensorFlow', icon: SiTensorflow, color: 'text-orange-500' },
      { name: 'PyTorch', icon: SiPytorch, color: 'text-red-500' },
      { name: 'OpenCV', icon: SiOpencv, color: 'text-green-500' },
      { name: 'YOLOv8', icon: FiCpu, color: 'text-purple-500' },
    ],
  },
  {
    title: 'Web Development',
    skills: [
      { name: 'React', icon: SiReact, color: 'text-cyan-400' },
      { name: 'Next.js', icon: SiNextdotjs, color: 'text-gray-700' },
    ],
  },
  {
    title: 'Tools & Technologies',
    skills: [
      { name: 'Git', icon: SiGit, color: 'text-orange-600' },
      { name: 'VS Code', icon: FiCode, color: 'text-blue-600' },
      { name: 'Linux', icon: SiLinux, color: 'text-yellow-600' },
      { name: 'Docker', icon: SiDocker, color: 'text-blue-400' },
    ],
  },
];

const softSkills = [
  { name: 'Problem Solving', icon: FiCpu },
  { name: 'Communication', icon: FiMessageSquare },
  { name: 'Teamwork', icon: FiUsers },
  { name: 'Goal-Oriented', icon: FiTarget },
];

export default function Skills({ darkMode }: SkillsProps) {
  return (
    <div className="space-y-12">
      {/* Technical Skills */}
      <div className="grid md:grid-cols-2 gap-8">
        {skillCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            className={`p-6 rounded-xl ${
              darkMode ? 'bg-gray-800' : 'bg-gray-50'
            } shadow-lg`}
          >
            <h3 className="text-xl font-bold mb-6 text-blue-500">{category.title}</h3>
            <div className="grid grid-cols-2 gap-4">
              {category.skills.map((skill, skillIndex) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: skillIndex * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-100'
                  } transition-all duration-200`}
                >
                  <skill.icon className={`text-2xl ${skill.color}`} />
                  <span className="font-medium">{skill.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Soft Skills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-6 text-center text-purple-500">Soft Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {softSkills.map((skill, index) => (
            <motion.div
              key={skill.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-xl ${
                darkMode ? 'bg-gradient-to-br from-purple-900 to-blue-900' : 'bg-gradient-to-br from-purple-100 to-blue-100'
              } shadow-lg text-center`}
            >
              <skill.icon className="text-4xl mx-auto mb-3 text-purple-500" />
              <p className="font-semibold">{skill.name}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
