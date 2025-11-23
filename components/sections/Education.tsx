'use client';

import { motion } from 'framer-motion';
import { FiBook, FiCalendar, FiAward } from 'react-icons/fi';

interface EducationProps {
  darkMode: boolean;
}

export default function Education({ darkMode }: EducationProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`p-8 rounded-xl ${
          darkMode ? 'bg-gray-800' : 'bg-gray-50'
        } shadow-xl hover:shadow-2xl transition-all duration-300`}
      >
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <FiBook className="text-white text-2xl" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-2">Bachelor of Science in Information Technology</h3>
            <p className="text-xl text-blue-500 font-semibold mb-4">
              St. Paul University Philippines
            </p>

            <div className="flex items-center space-x-2 mb-6">
              <FiCalendar className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Expected Graduation: June 2025
              </span>
            </div>

            <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} mb-6`}>
              <div className="flex items-start space-x-3 mb-3">
                <FiAward className="text-yellow-500 text-2xl flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Thesis Project</h4>
                  <p className={`italic mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    "Powered Proctoring: Real-time Exam Cheating Detection System Using Computer Vision"
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Developing an advanced AI-powered system that utilizes YOLOv8 and MediaPipe for
                    real-time detection of exam cheating behaviors. The system employs computer
                    vision techniques for object detection, pose estimation, and behavioral analysis
                    to ensure exam integrity.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <h5 className="font-semibold mb-2 text-blue-500">Key Focus Areas</h5>
                <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Artificial Intelligence</li>
                  <li>• Machine Learning</li>
                  <li>• Computer Vision</li>
                  <li>• Data Analytics</li>
                </ul>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
              >
                <h5 className="font-semibold mb-2 text-purple-500">Achievements</h5>
                <ul className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li>• Dean's List Recognition</li>
                  <li>• Best Thesis Proposal</li>
                  <li>• AI/ML Certification</li>
                  <li>• Leadership Award</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
