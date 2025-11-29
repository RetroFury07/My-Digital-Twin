/**
 * Emotional Intelligence Module
 * Detects user sentiment and adjusts tone for more human-like responses
 */

export type Sentiment = 'enthusiastic' | 'curious' | 'skeptical' | 'formal' | 'casual' | 'concerned';
export type EmotionalTone = 'confident' | 'humble' | 'enthusiastic' | 'thoughtful' | 'reassuring';

export interface SentimentAnalysis {
  sentiment: Sentiment;
  confidence: number;
  indicators: string[];
  suggestedTone: EmotionalTone;
}

/**
 * Analyze user sentiment from their question
 */
export function analyzeSentiment(question: string): SentimentAnalysis {
  const lowerQuestion = question.toLowerCase();

  // Enthusiastic indicators
  const enthusiasticPatterns = [
    'amazing', 'awesome', 'impressive', 'wow', 'great', 'excellent',
    '!', 'love', 'excited', 'can\'t wait'
  ];

  // Skeptical indicators
  const skepticalPatterns = [
    'really?', 'are you sure', 'actually', 'prove', 'how can you',
    'doubt', 'but', 'however', 'seems unlikely'
  ];

  // Curious indicators
  const curiousPatterns = [
    'how', 'why', 'what', 'when', 'where', 'tell me more',
    'explain', 'curious', 'wonder', 'interested'
  ];

  // Formal indicators
  const formalPatterns = [
    'could you please', 'would you kindly', 'i would like to know',
    'please provide', 'can you describe', 'what is your'
  ];

  // Concerned indicators
  const concernedPatterns = [
    'worried', 'concern', 'problem', 'issue', 'challenge',
    'difficult', 'struggle', 'hard', 'fail'
  ];

  const indicators: string[] = [];
  let sentiment: Sentiment = 'casual';
  let confidence = 0;

  // Check patterns
  if (enthusiasticPatterns.some(p => lowerQuestion.includes(p))) {
    indicators.push('enthusiastic language');
    sentiment = 'enthusiastic';
    confidence = 0.8;
  } else if (skepticalPatterns.some(p => lowerQuestion.includes(p))) {
    indicators.push('skeptical language');
    sentiment = 'skeptical';
    confidence = 0.7;
  } else if (concernedPatterns.some(p => lowerQuestion.includes(p))) {
    indicators.push('concerned language');
    sentiment = 'concerned';
    confidence = 0.7;
  } else if (formalPatterns.some(p => lowerQuestion.includes(p))) {
    indicators.push('formal language');
    sentiment = 'formal';
    confidence = 0.6;
  } else if (curiousPatterns.some(p => lowerQuestion.includes(p))) {
    indicators.push('curious language');
    sentiment = 'curious';
    confidence = 0.5;
  }

  // Determine suggested tone
  const suggestedTone = getSuggestedTone(sentiment);

  return {
    sentiment,
    confidence,
    indicators,
    suggestedTone,
  };
}

/**
 * Get appropriate response tone based on detected sentiment
 */
function getSuggestedTone(sentiment: Sentiment): EmotionalTone {
  const toneMap: Record<Sentiment, EmotionalTone> = {
    enthusiastic: 'enthusiastic',
    curious: 'thoughtful',
    skeptical: 'confident',
    formal: 'confident',
    casual: 'enthusiastic',
    concerned: 'reassuring',
  };

  return toneMap[sentiment];
}

/**
 * Get tone-specific prompt additions
 */
export function getTonePrompt(tone: EmotionalTone): string {
  const tonePrompts: Record<EmotionalTone, string> = {
    confident: `Be confident and specific. Back claims with concrete metrics and examples. 
Show expertise without arrogance.`,

    humble: `Be humble yet competent. Acknowledge what you're still learning while highlighting
what you've achieved. Show growth mindset.`,

    enthusiastic: `Show genuine excitement about your work! Use energetic language while
staying professional. Let your passion for AI/ML shine through.`,

    thoughtful: `Be reflective and analytical. Explain your reasoning and decision-making process.
Show depth of understanding beyond surface-level knowledge.`,

    reassuring: `Be empathetic and reassuring. Address concerns directly with evidence.
Show how challenges were overcome with specific examples.`,
  };

  return tonePrompts[tone];
}

/**
 * Add personality markers to make responses more human
 */
export interface PersonalityMarkers {
  openings: string[];
  transitions: string[];
  emphasizers: string[];
  closings: string[];
}

export const HUMAN_MARKERS: PersonalityMarkers = {
  openings: [
    "That's a great question!",
    "I'm glad you asked about that.",
    "Absolutely, let me share...",
    "Great question -",
    "I love talking about this!",
    "This is actually one of my favorite topics.",
  ],
  transitions: [
    "Here's what I mean:",
    "Let me give you a concrete example:",
    "To put this in perspective:",
    "What made this interesting was:",
    "The breakthrough came when:",
    "Here's how it worked:",
  ],
  emphasizers: [
    "honestly",
    "frankly",
    "to be clear",
    "the key thing is",
    "what's really cool is",
    "what I learned was",
  ],
  closings: [
    "Happy to dive deeper into any aspect!",
    "Want to know more about the technical details?",
    "I could talk about this all day!",
    "Let me know if you want specifics on any part.",
    "There's more to this story if you're interested!",
  ],
};

/**
 * Enhance response with personality markers
 */
export function addPersonalityMarkers(
  response: string,
  sentiment: Sentiment,
  includeClosing: boolean = true
): string {
  let enhanced = response;

  // Add opening for enthusiastic or curious sentiments
  if (sentiment === 'enthusiastic' || sentiment === 'curious') {
    const opening = HUMAN_MARKERS.openings[Math.floor(Math.random() * HUMAN_MARKERS.openings.length)];
    enhanced = `${opening} ${enhanced}`;
  }

  // Add closing suggestion
  if (includeClosing && Math.random() > 0.5) {
    const closing = HUMAN_MARKERS.closings[Math.floor(Math.random() * HUMAN_MARKERS.closings.length)];
    enhanced = `${enhanced}\n\n${closing}`;
  }

  return enhanced;
}

/**
 * Detect interview question type for specialized handling
 */
export type InterviewQuestionType = 
  | 'behavioral' 
  | 'technical' 
  | 'situational' 
  | 'strength_weakness'
  | 'motivation'
  | 'salary'
  | 'general';

export function detectInterviewQuestionType(question: string): InterviewQuestionType {
  const lowerQuestion = question.toLowerCase();

  // Behavioral (STAR format)
  if (/(tell me about a time|give me an example|describe a situation|walk me through)/i.test(question)) {
    return 'behavioral';
  }

  // Technical
  if (/(how would you|implement|design|optimize|debug|algorithm|architecture)/i.test(question)) {
    return 'technical';
  }

  // Strength/Weakness
  if (/(strength|weakness|good at|struggle with|improve|challenge)/i.test(question)) {
    return 'strength_weakness';
  }

  // Motivation
  if (/(why|motivate|interest|passion|career goal|why this|why here)/i.test(question)) {
    return 'motivation';
  }

  // Salary
  if (/(salary|compensation|pay|wage|expect|budget)/i.test(question)) {
    return 'salary';
  }

  // Situational
  if (/(what would you|if you were|imagine|hypothetical)/i.test(question)) {
    return 'situational';
  }

  return 'general';
}

/**
 * Get response framework based on question type
 */
export function getResponseFramework(questionType: InterviewQuestionType): string {
  const frameworks: Record<InterviewQuestionType, string> = {
    behavioral: `Use STAR format:
- Situation: Set the context (1 sentence)
- Task: Your responsibility (1 sentence)  
- Action: What you did with specific details (2-3 sentences)
- Result: Quantifiable outcomes (1-2 sentences with metrics)`,

    technical: `Structure: Problem → Approach → Implementation → Results
- State the technical challenge clearly
- Explain your reasoning and trade-offs
- Describe implementation details
- Share performance metrics or outcomes`,

    strength_weakness: `Be authentic:
- State the strength/weakness clearly
- Give concrete example from your experience
- For weaknesses: show what you're doing to improve
- Include measurable evidence`,

    motivation: `Show genuine passion:
- Connect to personal story or experience
- Explain what excites you about it
- Link to career goals
- Be specific, not generic`,

    salary: `Be professional and prepared:
- State your research-based range
- Explain what factors matter to you
- Show flexibility based on full package
- Emphasize value over just numbers`,

    situational: `Think through systematically:
- Clarify assumptions
- Break down the problem
- Explain your approach step-by-step
- Consider edge cases and trade-offs`,

    general: `Be conversational yet professional:
- Answer directly and concisely
- Use specific examples
- Show personality
- Keep it relevant`,
  };

  return frameworks[questionType];
}
