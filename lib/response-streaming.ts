/**
 * Progressive Response Streaming
 * Makes AI responses feel more human with realistic typing delays
 */

export interface StreamConfig {
  wordsPerMinute?: number; // Realistic human typing speed
  pauseOnPunctuation?: boolean;
  showThinkingIndicator?: boolean;
  minDelay?: number;
  maxDelay?: number;
}

export class ResponseStreamer {
  private config: Required<StreamConfig>;

  constructor(config: StreamConfig = {}) {
    this.config = {
      wordsPerMinute: 150, // Average human typing speed
      pauseOnPunctuation: true,
      showThinkingIndicator: true,
      minDelay: 20,
      maxDelay: 100,
      ...config,
    };
  }

  /**
   * Calculate realistic delay based on human typing patterns
   */
  private calculateDelay(char: string, prevChar: string): number {
    const baseDelay = 60000 / (this.config.wordsPerMinute * 5); // 5 chars per word avg

    // Longer pauses after punctuation (more human-like)
    if (this.config.pauseOnPunctuation && /[.!?;:]/.test(prevChar)) {
      return baseDelay * 3;
    }

    // Slight pause after commas
    if (prevChar === ',') {
      return baseDelay * 2;
    }

    // Faster typing for common combinations
    const fastCombos = ['th', 'he', 'in', 'er', 'an', 'ed', 'nd', 'to', 'en', 'ing'];
    const combo = prevChar + char;
    if (fastCombos.includes(combo.toLowerCase())) {
      return baseDelay * 0.7;
    }

    // Add slight randomness (humans don't type at constant speed)
    const randomFactor = 0.8 + Math.random() * 0.4;
    return Math.min(
      Math.max(baseDelay * randomFactor, this.config.minDelay),
      this.config.maxDelay
    );
  }

  /**
   * Stream response character by character with realistic delays
   */
  async *streamResponse(text: string): AsyncGenerator<string, void, unknown> {
    // Optional: Initial "thinking" delay
    if (this.config.showThinkingIndicator) {
      await this.sleep(300 + Math.random() * 200); // 300-500ms thinking
    }

    let accumulated = '';
    let prevChar = '';

    for (const char of text) {
      const delay = this.calculateDelay(char, prevChar);
      await this.sleep(delay);
      
      accumulated += char;
      yield accumulated;
      
      prevChar = char;
    }
  }

  /**
   * Stream response word by word (faster, less granular)
   */
  async *streamWords(text: string): AsyncGenerator<string, void, unknown> {
    const words = text.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      accumulated += (i > 0 ? ' ' : '') + word;
      
      // Delay proportional to word length
      const delay = (word.length * 60000) / (this.config.wordsPerMinute * 5);
      await this.sleep(delay);
      
      yield accumulated;
    }
  }

  /**
   * Stream response by chunks (fastest, maintains readability)
   */
  async *streamChunks(text: string, chunkSize: number = 3): AsyncGenerator<string, void, unknown> {
    const words = text.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      accumulated += (i > 0 ? ' ' : '') + chunk;
      
      await this.sleep(100 + Math.random() * 50);
      yield accumulated;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Thinking indicators for different states
 */
export const THINKING_STATES = {
  searching: ['Searching my experience...', 'Looking through my projects...', 'Let me think about that...'],
  analyzing: ['Analyzing your question...', 'Processing...', 'Hmm, let me recall...'],
  formulating: ['Formulating my response...', 'Putting my thoughts together...', 'Almost there...'],
} as const;

export function getRandomThinkingMessage(state: keyof typeof THINKING_STATES = 'searching'): string {
  const messages = THINKING_STATES[state];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Simulate human-like typing with corrections (advanced)
 */
export class HumanTypingSimulator extends ResponseStreamer {
  private typoRate: number;

  constructor(config: StreamConfig & { typoRate?: number } = {}) {
    super(config);
    this.typoRate = config.typoRate || 0.02; // 2% typo rate
  }

  async *streamWithTypos(text: string): AsyncGenerator<string, void, unknown> {
    let accumulated = '';
    let prevChar = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Occasionally make a "typo" then correct it
      if (Math.random() < this.typoRate && /[a-z]/i.test(char)) {
        // Type wrong character
        const wrongChar = this.getAdjacentKey(char);
        accumulated += wrongChar;
        yield accumulated;
        await this.sleep(100);

        // Delete it (backspace)
        accumulated = accumulated.slice(0, -1);
        yield accumulated;
        await this.sleep(50);
      }

      // Type correct character
      const delay = this.calculateDelay(char, prevChar);
      await this.sleep(delay);
      
      accumulated += char;
      yield accumulated;
      
      prevChar = char;
    }
  }

  private getAdjacentKey(char: string): string {
    const keyboard: Record<string, string> = {
      q: 'wa', w: 'qes', e: 'wrd', r: 'etf', t: 'rgy', y: 'tuh', u: 'yij', i: 'uok', o: 'ipl', p: 'ol',
      a: 'qwsz', s: 'awedxz', d: 'serfcx', f: 'drtgvc', g: 'ftyhbv', h: 'gyujnb', j: 'huikmn', k: 'jiolm',
      z: 'asx', x: 'zsdc', c: 'xdfv', v: 'cfgb', b: 'vghn', n: 'bhjm', m: 'njk',
    };

    const lowerChar = char.toLowerCase();
    const adjacent = keyboard[lowerChar];
    
    if (!adjacent) return char;
    
    const randomAdjacent = adjacent[Math.floor(Math.random() * adjacent.length)];
    return char === char.toUpperCase() ? randomAdjacent.toUpperCase() : randomAdjacent;
  }
}
