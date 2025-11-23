# Xevi Olivas - Personal Portfolio

A fully interactive personal portfolio website built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## 🌟 Features

### Navigation & UI
- **Smooth Scrolling**: Seamless navigation between sections
- **Active Section Highlighting**: Navigation menu highlights the current section
- **Dark Mode Toggle**: Switch between light and dark themes
- **Responsive Design**: Mobile-first design that works on all devices
- **Animated Transitions**: Smooth animations using Framer Motion

### Sections

#### 🏠 Home
- Hero section with profile display
- Animated title and subtitle
- Introduction paragraph
- Call-to-action button scrolling to Projects

#### 👤 About
- Personal introduction about Xevi Olivas
- Highlight cards showcasing:
  - Tech Enthusiasm
  - Problem-Solving Skills
  - Goal-Driven Mindset
  - Impact Focus

#### 💼 Experience
- Timeline-based experience cards
- Academic and personal projects
- Technologies used in each role
- Current research work on "Powered Proctoring"

#### 🚀 Projects
- Grid layout of project cards
- Project descriptions and technologies
- GitHub and Demo links
- Featured projects including:
  - Powered Proctoring System
  - Digital Twin Portfolio
  - AI Data Analysis Dashboard
  - Computer Vision Object Tracker
  - NLP Chatbot Framework
  - Automated ML Pipeline

#### 🛠️ Skills
- Programming Languages: Python, JavaScript, TypeScript
- AI/ML: TensorFlow, PyTorch, YOLOv8, MediaPipe
- Web Development: React, Next.js
- Tools: Git, VS Code, Linux, Docker
- Soft Skills: Problem Solving, Communication, Teamwork

#### 🎓 Education
- Bachelor of Science in Information Technology
- St. Paul University Philippines
- Expected Graduation: June 2025
- Thesis: "Powered Proctoring: Real-time Exam Cheating Detection System Using Computer Vision"

#### 📧 Contact
- Contact form with validation
- Social media links:
  - GitHub
  - LinkedIn
  - Facebook
- Email: xevi.olivas@example.com

### 🤖 Digital Twin Assistant
- **Floating Chat Widget**: Interactive AI assistant
- **Real-time Responses**: Powered by your Digital Twin API
- **Contextual Answers**: Answers questions about skills, projects, and experience
- **Smooth Animations**: Elegant chat interface with message animations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-twin-workshop
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with necessary API keys:
```env
GROQ_API_KEY=your_groq_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Main portfolio page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/
│       └── mcp/              # Digital Twin API
├── components/
│   ├── Navigation.tsx        # Top navigation bar
│   ├── Section.tsx           # Reusable section wrapper
│   ├── DigitalTwinChat.tsx   # Chat widget
│   └── sections/
│       ├── Home.tsx          # Home section
│       ├── About.tsx         # About section
│       ├── Experience.tsx    # Experience section
│       ├── Projects.tsx      # Projects section
│       ├── Skills.tsx        # Skills section
│       ├── Education.tsx     # Education section
│       └── Contact.tsx       # Contact section
└── public/                   # Static assets
```

## 🎨 Customization

### Updating Personal Information

1. **Profile Data**: Edit content directly in component files under `components/sections/`
2. **Projects**: Modify the `projects` array in `Projects.tsx`
3. **Skills**: Update skill categories in `Skills.tsx`
4. **Experience**: Edit the `experiences` array in `Experience.tsx`

### Styling

- **Colors**: Modify Tailwind configuration in `tailwind.config.ts`
- **Fonts**: Update font settings in `app/layout.tsx`
- **Animations**: Adjust Framer Motion settings in individual components

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

```bash
# Or use Vercel CLI
vercel --prod
```

## 📝 Features Implemented

✅ Top navigation with smooth scrolling  
✅ Active section highlighting in navbar  
✅ Dark mode toggle with persistent theme  
✅ Fully responsive mobile → desktop  
✅ Home section with hero layout  
✅ About section with personality highlights  
✅ Experience timeline  
✅ Projects grid with placeholder cards  
✅ Skills categorization  
✅ Education section with thesis details  
✅ Contact form with social media links  
✅ Digital Twin chat assistant integration  
✅ Framer Motion animations throughout  
✅ Custom scrollbar styling  

## 🔧 Future Enhancements

- [ ] Add real project links and images
- [ ] Integrate contact form with email service
- [ ] Add blog section
- [ ] Implement project filtering
- [ ] Add loading states and error boundaries
- [ ] Include testimonials section
- [ ] Add resume download feature

## 📄 License

MIT License - Feel free to use this template for your own portfolio!

## 👨‍💻 Author

**Xevi Olivas**
- Aspiring AI Data Analyst / Developer
- Email: xevi.olivas@example.com
- GitHub: [Your GitHub]
- LinkedIn: [Your LinkedIn]

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
