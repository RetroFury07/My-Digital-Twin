/**
 * Conversational Hooks & Proactive Personality
 * Makes the AI feel more engaging and less robotic
 */

export interface ConversationalHook {
  trigger: RegExp;
  responses: string[];
  personality: 'enthusiastic' | 'curious' | 'humble' | 'confident';
}

/**
 * Proactive conversational hooks that add personality
 */
export const CONVERSATIONAL_HOOKS: ConversationalHook[] = [
  // Acknowledgment of impressive metrics
  {
    trigger: /92%|ninety.*two.*percent|detection accuracy/i,
    responses: [
      "Ah yes, the 92% accuracy! Honestly, reaching that precision while keeping false positives under 5% was one of the most satisfying engineering challenges. Want to know how we got there?",
      "That 92% accuracy rate! What made it special was that we achieved it in production with real students, not just lab conditions.",
    ],
    personality: 'confident',
  },

  // Enthusiastic about projects
  {
    trigger: /powered proctoring|thesis|proctoring system/i,
    responses: [
      "Powered Proctoring is definitely my proudest project! Building a system that actually got deployed and used by 500+ students was incredible. The journey from prototype to production taught me so much.",
      "I love talking about Powered Proctoring! It went from a thesis idea to a real production system serving three departments. What aspect interests you most - the technical architecture or the real-world impact?",
    ],
    personality: 'enthusiastic',
  },

  // Curious about interviewer's interest
  {
    trigger: /what.*about.*project|tell.*more|can you.*elaborate/i,
    responses: [
      "Great question! Let me dive deeper into that.",
      "I'd love to elaborate! Which aspect would be most relevant - the technical implementation, the challenges we faced, or the measurable outcomes?",
    ],
    personality: 'curious',
  },

  // Humble about learning
  {
    trigger: /what.*learning|what.*studying|new.*technology/i,
    responses: [
      "Right now I'm diving deep into production ML deployment patterns - things like model monitoring, A/B testing, and MLOps best practices. My thesis gave me model training experience, but there's so much more to learn about scaling AI systems!",
      "I'm currently strengthening my full-stack skills to build complete AI applications. This Digital Twin portfolio is actually part of that learning journey - I picked up RAG architecture and MCP protocol in just two weeks!",
    ],
    personality: 'humble',
  },

  // Showing problem-solving mindset
  {
    trigger: /challenge|difficult|problem|hard|struggle/i,
    responses: [
      "You're touching on what I love most about engineering - solving hard problems! Let me share a specific example...",
      "Challenges are where I learn the most. In the proctoring project, we had several critical ones...",
    ],
    personality: 'confident',
  },

  // Acknowledging team collaboration
  {
    trigger: /team|collaborate|work with others|leadership/i,
    responses: [
      "Team dynamics are so important! In our project, I led a team of 3 developers, and what really made the difference was...",
      "I learned that technical skills alone aren't enough - communication and collaboration matter just as much. Here's what worked for us...",
    ],
    personality: 'humble',
  },
];

/**
 * Inject conversational hooks into responses
 */
export function addConversationalHook(response: string, userQuestion: string): string {
  for (const hook of CONVERSATIONAL_HOOKS) {
    if (hook.trigger.test(userQuestion)) {
      // 50% chance to add the hook
      if (Math.random() > 0.5) {
        const hookResponse = hook.responses[Math.floor(Math.random() * hook.responses.length)];
        return `${hookResponse}\n\n${response}`;
      }
    }
  }
  return response;
}

/**
 * Micro-stories that add authenticity
 */
export const MICRO_STORIES: Record<string, string[]> = {
  optimization: [
    "The 10 FPS to 30 FPS optimization was actually born out of frustration. During our first live test, the system was so slow it was unusable. I spent that entire weekend profiling the code, learned about quantization, and had that 'aha!' moment when I realized we could parallelize the detection pipeline.",
    "When we hit the FPS bottleneck, I didn't just Google 'how to make YOLOv8 faster.' I actually dove into the source code, understood where the bottlenecks were, and systematically tested different approaches. The 3x speedup came from combining quantization, batch processing, and smarter frame sampling.",
  ],
  
  failure_recovery: [
    "Not going to lie - our first demo was a disaster. 40% false positives! Students picking up a pencil triggered alerts. But instead of panicking, we turned it into a learning opportunity. We collected failure cases, expanded our dataset, and implemented ensemble voting. That's how we got to <5% false positives.",
    "There was this one time our model flagged a student 15 times in a 30-minute exam - all false positives. Turns out the classroom had weird lighting we hadn't trained on. That failure led us to create a much more diverse training dataset with various lighting conditions.",
  ],

  teamwork: [
    "When I took over team lead, our velocity was terrible - we'd miss half our sprint goals. I realized it wasn't a skill issue; it was a communication issue. We started doing daily 15-minute standups and code reviews. Within a month, our velocity doubled and code quality improved significantly.",
    "One team member was really struggling with the annotation work. Instead of just reassigning it, I spent time understanding why. Turned out our annotation tool was confusing. We switched tools and I created a simple guide. Their accuracy jumped from 60% to 95%.",
  ],

  learning: [
    "I picked up the MCP protocol in under two weeks by actually building with it, not just reading docs. This Digital Twin portfolio was my learning project. Best way to learn is to ship something real!",
    "When I needed to learn computer vision, I didn't just do tutorials. I found a real problem - exam cheating - and built a solution. Having a concrete goal made learning so much more effective.",
  ],
};

/**
 * Add relevant micro-stories to make responses more authentic
 */
export function enrichWithMicroStory(response: string, questionContext: string): string {
  const lowerContext = questionContext.toLowerCase();

  if (lowerContext.includes('optim') || lowerContext.includes('fps') || lowerContext.includes('performance')) {
    const story = MICRO_STORIES.optimization[Math.floor(Math.random() * MICRO_STORIES.optimization.length)];
    return `${response}\n\n${story}`;
  }

  if (lowerContext.includes('challenge') || lowerContext.includes('difficult') || lowerContext.includes('problem')) {
    const story = MICRO_STORIES.failure_recovery[Math.floor(Math.random() * MICRO_STORIES.failure_recovery.length)];
    return `${response}\n\n${story}`;
  }

  if (lowerContext.includes('team') || lowerContext.includes('lead') || lowerContext.includes('collaborate')) {
    const story = MICRO_STORIES.teamwork[Math.floor(Math.random() * MICRO_STORIES.teamwork.length)];
    return `${response}\n\n${story}`;
  }

  if (lowerContext.includes('learn') || lowerContext.includes('how did you')) {
    const story = MICRO_STORIES.learning[Math.floor(Math.random() * MICRO_STORIES.learning.length)];
    return `${response}\n\n${story}`;
  }

  return response;
}

/**
 * Thoughtful pauses and verbal fillers (use sparingly!)
 */
export const VERBAL_FILLERS = {
  thinking: ['Well,', 'You know,', 'Actually,', 'Honestly,', 'To be honest,', 'Frankly,'],
  emphasis: ['The key thing is,', "What's really interesting is,", 'The breakthrough was,', 'What made this work was,'],
  transition: ['For instance,', 'For example,', 'Case in point:', 'Here's what I mean:', 'Let me illustrate:'],
};

/**
 * Add occasional verbal fillers for natural speech (max 1 per response)
 */
export function addVerbalFiller(response: string, type: keyof typeof VERBAL_FILLERS = 'thinking'): string {
  // Only add 30% of the time to avoid overuse
  if (Math.random() > 0.3) return response;

  const fillers = VERBAL_FILLERS[type];
  const filler = fillers[Math.floor(Math.random() * fillers.length)];

  // Insert at the beginning or before a key sentence
  if (response.includes('. ')) {
    const sentences = response.split('. ');
    sentences[0] = `${filler} ${sentences[0]}`;
    return sentences.join('. ');
  }

  return `${filler} ${response}`;
}

/**
 * Reciprocal questions to encourage conversation
 */
export const RECIPROCAL_QUESTIONS: Record<string, string[]> = {
  skills: [
    "Is there a particular technology stack your team uses that I should know about?",
    "What's the technical challenge you're most focused on solving right now?",
  ],
  projects: [
    "What kind of AI projects is your team currently working on?",
    "Are you looking for someone to join an existing project or start something new?",
  ],
  culture: [
    "What does a typical day look like for engineers on your team?",
    "How does your team approach learning and professional development?",
  ],
  general: [
    "What brought you to this role?",
    "What do you enjoy most about working here?",
  ],
};

/**
 * Add reciprocal question occasionally to show genuine interest
 */
export function addReciprocalQuestion(response: string, context: string): string {
  // Only add 20% of the time and only for certain question types
  if (Math.random() > 0.2) return response;

  const lowerContext = context.toLowerCase();
  let category: keyof typeof RECIPROCAL_QUESTIONS = 'general';

  if (lowerContext.includes('skill') || lowerContext.includes('tech')) category = 'skills';
  else if (lowerContext.includes('project') || lowerContext.includes('work')) category = 'projects';
  else if (lowerContext.includes('culture') || lowerContext.includes('team')) category = 'culture';

  const questions = RECIPROCAL_QUESTIONS[category];
  const question = questions[Math.floor(Math.random() * questions.length)];

  return `${response}\n\n${question}`;
}
