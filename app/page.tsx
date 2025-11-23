'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import Section from '@/components/Section';
import Home from '@/components/sections/Home';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Projects from '@/components/sections/Projects';
import Skills from '@/components/sections/Skills';
import Education from '@/components/sections/Education';
import Contact from '@/components/sections/Contact';
import DigitalTwinChat from '@/components/DigitalTwinChat';

export default function Portfolio() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Navigation darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      {/* Home Section */}
      <section id="home" className={`${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <Home darkMode={darkMode} />
      </section>

      {/* About Section */}
      <Section id="about" title="About Me" darkMode={darkMode}>
        <About darkMode={darkMode} />
      </Section>

      {/* Experience Section */}
      <Section id="experience" title="Experience" darkMode={darkMode} className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
        <Experience darkMode={darkMode} />
      </Section>

      {/* Projects Section */}
      <Section id="projects" title="Projects" darkMode={darkMode}>
        <Projects darkMode={darkMode} />
      </Section>

      {/* Skills Section */}
      <Section id="skills" title="Skills" darkMode={darkMode} className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
        <Skills darkMode={darkMode} />
      </Section>

      {/* Education Section */}
      <Section id="education" title="Education" darkMode={darkMode}>
        <Education darkMode={darkMode} />
      </Section>

      {/* Contact Section */}
      <Section id="contact" title="Get In Touch" darkMode={darkMode} className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
        <Contact darkMode={darkMode} />
      </Section>

      {/* Digital Twin Chat Widget */}
      <DigitalTwinChat darkMode={darkMode} />
    </div>
  );
}

