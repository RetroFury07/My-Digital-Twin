# 🎨 Portfolio Quick Start Guide

## 🚀 Your Portfolio is Live!

Your fully interactive personal portfolio is now running at: **http://localhost:3001**

## ✨ Features Overview

### 1️⃣ Navigation Bar
- **Smooth Scrolling**: Click any menu item to smoothly scroll to that section
- **Active Highlighting**: Current section is highlighted in the navbar
- **Dark Mode Toggle**: Click the sun/moon icon to switch themes
- **Mobile Responsive**: Hamburger menu on mobile devices

### 2️⃣ Sections

#### Home 🏠
- Hero section with your name and title
- 3-sentence introduction
- "View My Work" button scrolls to Projects

#### About 👤
- Personal story and background
- 4 highlight cards:
  - Tech Enthusiast
  - Problem Solver
  - Goal-Driven
  - Impact Focused

#### Experience 💼
- Timeline of your work/projects
- Includes thesis research
- Technologies used for each role

#### Projects 🚀
- 6 placeholder project cards
- Each shows:
  - Title & Description
  - Technologies
  - GitHub & Demo links

#### Skills 🛠️
- Technical skills organized by category:
  - Programming Languages
  - AI/ML & Computer Vision
  - Web Development
  - Tools & Technologies
- Soft skills section

#### Education 🎓
- University details
- Thesis information
- Key focus areas
- Achievements

#### Contact 📧
- Contact form (currently logs to console)
- Social media buttons
- Email link
- Footer with copyright

### 3️⃣ Digital Twin Assistant 🤖
- **Floating Chat Button**: Bottom-right corner
- **AI-Powered Responses**: Connected to your Digital Twin API
- **Interactive Chat**: Ask about skills, projects, experience
- Click the message icon to open/close

## 🎯 How to Use

### Testing the Portfolio

1. **Navigation**: Click menu items to jump between sections
2. **Dark Mode**: Toggle between light/dark themes
3. **Chat Assistant**: Click the chat bubble and ask questions like:
   - "What are your skills?"
   - "Tell me about your projects"
   - "What's your educational background?"
4. **Responsive Design**: Resize browser to see mobile layout

### Customizing Content

#### Update Projects
Edit `components/sections/Projects.tsx`:
```typescript
const projects = [
  {
    title: 'Your Project Name',
    description: 'Project description...',
    technologies: ['Tech1', 'Tech2'],
    github: 'https://github.com/...',
    demo: 'https://...',
  },
  // Add more projects...
];
```

#### Update Experience
Edit `components/sections/Experience.tsx`:
```typescript
const experiences = [
  {
    title: 'Your Role',
    organization: 'Company/School',
    period: '2024 - Present',
    description: 'What you did...',
    skills: ['Skill1', 'Skill2'],
  },
];
```

#### Update Skills
Edit `components/sections/Skills.tsx`:
```typescript
// Modify skillCategories array
```

#### Update Contact Info
Edit `components/sections/Contact.tsx`:
- Change email address
- Update social media links
- Modify form behavior

## 🎨 Customization Options

### Change Colors
Edit `tailwind.config.ts` to modify the color scheme:
```typescript
colors: {
  primary: '#your-color',
  secondary: '#your-color',
}
```

### Modify Animations
Each section uses Framer Motion. Adjust animation settings in component files:
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
```

### Add New Sections
1. Create component in `components/sections/`
2. Import in `app/page.tsx`
3. Add to navigation in `components/Navigation.tsx`

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (md)
- **Tablet**: 768px - 1024px (lg)
- **Desktop**: > 1024px

## 🔧 Common Tasks

### Update Profile Image
Replace the placeholder in `components/sections/Home.tsx`:
```typescript
<Image src="/profile.jpg" alt="Profile" ... />
```

### Change Font
Update `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google';
```

### Add SEO Metadata
Update `app/layout.tsx`:
```typescript
export const metadata = {
  title: 'Xevi Olivas - Portfolio',
  description: 'Your description...',
};
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial portfolio"
git push origin main
```

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Click "Deploy"

3. **Add Environment Variables**:
   - In Vercel dashboard, add your `.env` variables

### Alternative: Deploy via CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📊 Performance Tips

1. **Optimize Images**: Use Next.js Image component
2. **Lazy Loading**: Sections load as you scroll
3. **Code Splitting**: Automatic with Next.js
4. **Caching**: API responses can be cached

## 🐛 Troubleshooting

### Port Already in Use
The dev server will automatically use the next available port (3001, 3002, etc.)

### Dark Mode Not Persisting
Add localStorage to save theme preference:
```typescript
useEffect(() => {
  localStorage.setItem('darkMode', darkMode.toString());
}, [darkMode]);
```

### Chat Not Working
1. Check if MCP API is running
2. Verify `.env` variables are set
3. Check browser console for errors

## 📞 Need Help?

- **Documentation**: Check `PORTFOLIO_README.md`
- **Component Files**: Each section is in `components/sections/`
- **Styling**: Global styles in `app/globals.css`

## 🎉 Next Steps

1. ✅ Test all sections and navigation
2. ✅ Try dark mode toggle
3. ✅ Chat with your Digital Twin
4. 📝 Customize project content
5. 🖼️ Add real images
6. 🚀 Deploy to production

---

**Your portfolio is ready to impress! 🌟**

Navigate to: http://localhost:3001
