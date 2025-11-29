/**
 * Conversation Memory Manager
 * Tracks conversation context for more human-like, contextual responses
 */

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  topic?: string;
  sentiment?: 'positive' | 'neutral' | 'curious' | 'skeptical';
}

export interface ConversationContext {
  sessionId: string;
  turns: ConversationTurn[];
  topics: string[];
  userIntent?: string;
  followUpSuggestions?: string[];
}

export class ConversationManager {
  private context: ConversationContext;
  private maxTurns: number = 10; // Keep last 10 exchanges

  constructor(sessionId: string = crypto.randomUUID()) {
    this.context = {
      sessionId,
      turns: [],
      topics: [],
    };
  }

  /**
   * Add a new turn to the conversation
   */
  addTurn(role: 'user' | 'assistant', content: string, metadata?: Partial<ConversationTurn>) {
    const turn: ConversationTurn = {
      role,
      content,
      timestamp: new Date(),
      ...metadata,
    };

    this.context.turns.push(turn);

    // Trim to max turns
    if (this.context.turns.length > this.maxTurns) {
      this.context.turns = this.context.turns.slice(-this.maxTurns);
    }

    // Extract topics
    if (role === 'user') {
      this.extractTopics(content);
    }
  }

  /**
   * Get conversation history formatted for LLM context
   */
  getContextForLLM(): string {
    if (this.context.turns.length === 0) return '';

    const history = this.context.turns
      .map(turn => `${turn.role === 'user' ? 'User' : 'Xevi'}: ${turn.content}`)
      .join('\n');

    return `Previous conversation:\n${history}\n\nCurrent topics discussed: ${this.context.topics.join(', ')}`;
  }

  /**
   * Detect if current question is a follow-up
   */
  isFollowUpQuestion(question: string): boolean {
    const followUpIndicators = [
      'what about',
      'how about',
      'and that',
      'tell me more',
      'can you elaborate',
      'what else',
      'also',
      'additionally',
      'regarding that',
      'speaking of',
    ];

    const lowerQuestion = question.toLowerCase();
    return followUpIndicators.some(indicator => lowerQuestion.includes(indicator));
  }

  /**
   * Get enhanced query with conversation context
   */
  getContextualQuery(question: string): string {
    if (this.context.turns.length === 0 || !this.isFollowUpQuestion(question)) {
      return question;
    }

    const recentContext = this.context.turns.slice(-3)
      .map(t => t.content)
      .join(' ');

    return `Context: ${recentContext}\n\nCurrent question: ${question}`;
  }

  /**
   * Extract topics from user input
   */
  private extractTopics(userInput: string) {
    const topicKeywords = {
      skills: ['skill', 'technology', 'programming', 'code', 'framework'],
      projects: ['project', 'built', 'developed', 'portfolio', 'work'],
      experience: ['experience', 'worked', 'job', 'role', 'position'],
      education: ['education', 'university', 'degree', 'thesis', 'school'],
      achievements: ['achievement', 'award', 'success', 'accomplish'],
      personality: ['who are you', 'about yourself', 'personality', 'values'],
    };

    const lowerInput = userInput.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        if (!this.context.topics.includes(topic)) {
          this.context.topics.push(topic);
        }
      }
    }
  }

  /**
   * Generate smart follow-up suggestions based on context
   */
  generateFollowUps(lastResponse: string): string[] {
    const lastTopic = this.context.topics[this.context.topics.length - 1];

    const followUpMap: Record<string, string[]> = {
      skills: [
        "What's your strongest technical skill?",
        "How did you learn computer vision?",
        "What technologies are you learning next?",
      ],
      projects: [
        "What was the biggest challenge in that project?",
        "How did you measure success?",
        "What would you improve if you rebuilt it?",
      ],
      experience: [
        "What did you learn from that experience?",
        "How did you handle setbacks?",
        "Can you share a specific achievement?",
      ],
      education: [
        "What was your favorite course?",
        "How did your thesis influence your career goals?",
        "What research interests you most?",
      ],
      achievements: [
        "What are you most proud of?",
        "How did you achieve those results?",
        "What metrics improved?",
      ],
    };

    return followUpMap[lastTopic] || [
      "Tell me about your projects",
      "What are your top skills?",
      "Why should I hire you?",
    ];
  }

  /**
   * Get conversation summary
   */
  getSummary(): string {
    return `Session: ${this.context.sessionId}
Topics covered: ${this.context.topics.join(', ')}
Turns: ${this.context.turns.length}`;
  }

  /**
   * Reset conversation
   */
  reset() {
    this.context = {
      sessionId: crypto.randomUUID(),
      turns: [],
      topics: [],
    };
  }

  /**
   * Export conversation for analytics
   */
  export(): ConversationContext {
    return { ...this.context };
  }
}
