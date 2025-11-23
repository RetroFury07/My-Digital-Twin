'use client';

import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';

interface ProjectsProps {
  darkMode: boolean;
}

const projects = [
  {
    title: 'Powered Proctoring System',
    description:
      'Real-time exam cheating detection system using computer vision. Leverages YOLOv8 for object detection and MediaPipe for pose estimation to ensure exam integrity.',
    technologies: ['Python', 'YOLOv8', 'MediaPipe', 'OpenCV', 'Machine Learning'],
    github: '#',
    demo: '#',
  },
  {
    title: 'Digital Twin Portfolio',
    description:
      'Interactive personal portfolio with an AI-powered digital twin assistant. Features RAG-based query system and real-time chat capabilities.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Python', 'Vector DB'],
    github: '#',
    demo: '#',
  },
  {
    title: 'AI Data Analysis Dashboard',
    description:
      'Comprehensive data analysis and visualization platform using machine learning for predictive insights and pattern recognition.',
    technologies: ['Python', 'Pandas', 'TensorFlow', 'Plotly', 'FastAPI'],
    github: '#',
    demo: '#',
  },
  {
    title: 'Computer Vision Object Tracker',
    description:
      'Advanced object tracking system for real-time video analysis with multi-object detection and classification capabilities.',
    technologies: ['Python', 'YOLOv8', 'OpenCV', 'Deep Learning'],
    github: '#',
    demo: '#',
  },
  {
    title: 'NLP Chatbot Framework',
    description:
      'Intelligent chatbot framework with natural language understanding and context-aware responses using transformer models.',
    technologies: ['Python', 'Transformers', 'FastAPI', 'MongoDB'],
    github: '#',
    demo: '#',
  },
  {
    title: 'Automated ML Pipeline',
    description:
      'End-to-end machine learning pipeline for data preprocessing, model training, and deployment with monitoring capabilities.',
    technologies: ['Python', 'Scikit-learn', 'Docker', 'MLflow', 'AWS'],
    github: '#',
    demo: '#',
  },
];

export default function Projects({ darkMode }: ProjectsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map((project, index) => (
        <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -10 }}
          className={`p-6 rounded-xl ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          } shadow-lg hover:shadow-2xl transition-all duration-300`}
        >
          <h3 className="text-xl font-bold mb-3">{project.title}</h3>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className={`px-2 py-1 rounded text-xs ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex space-x-4">
            <motion.a
              href={project.github}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-1 text-blue-500 hover:text-blue-600"
            >
              <FiGithub />
              <span className="text-sm">GitHub</span>
            </motion.a>
            <motion.a
              href={project.demo}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center space-x-1 text-purple-500 hover:text-purple-600"
            >
              <FiExternalLink />
              <span className="text-sm">Demo</span>
            </motion.a>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
