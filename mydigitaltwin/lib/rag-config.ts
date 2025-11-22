/**
 * RAG Configuration for Different Interview Scenarios
 * Fine-tuned settings for optimal interview preparation
 */

export interface RAGConfig {
  queryModel: string;
  responseModel: string;
  queryTemperature: number;
  responseTemperature: number;
  focusAreas: string[];
  responseStyle: string;
  maxTokens: number;
  emphasizeMetrics: boolean;
  useSTARFormat: boolean;
}

/**
 * Pre-configured settings for different interview types
 * Updated to use currently supported Groq models
 */
export const RAG_CONFIGS = {
  technical_interview: {
    queryModel: 'llama-3.1-8b-instant',
    responseModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    queryTemperature: 0.3,
    responseTemperature: 0.4,
    focusAreas: ['technical skills', 'problem solving', 'architecture', 'code quality', 'debugging', 'optimization'],
    responseStyle: 'detailed technical examples with specific technologies, metrics, and quantifiable improvements',
    maxTokens: 600,
    emphasizeMetrics: true,
    useSTARFormat: true,
  } as RAGConfig,
  
  behavioral_interview: {
    queryModel: 'llama-3.1-8b-instant', 
    responseModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    queryTemperature: 0.3,
    responseTemperature: 0.7,
    focusAreas: ['leadership', 'teamwork', 'communication', 'conflict resolution', 'adaptability', 'growth mindset'],
    responseStyle: 'STAR format stories with emotional intelligence, team dynamics, and lessons learned',
    maxTokens: 500,
    emphasizeMetrics: false,
    useSTARFormat: true,
  } as RAGConfig,
  
  executive_interview: {
    queryModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    responseModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    queryTemperature: 0.4,
    responseTemperature: 0.5,
    focusAreas: ['strategic thinking', 'business impact', 'vision', 'leadership', 'stakeholder management', 'ROI'],
    responseStyle: 'high-level strategic responses with business metrics, revenue impact, and organizational influence',
    maxTokens: 550,
    emphasizeMetrics: true,
    useSTARFormat: false,
  } as RAGConfig,

  system_design_interview: {
    queryModel: 'llama-3.1-8b-instant',
    responseModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    queryTemperature: 0.3,
    responseTemperature: 0.4,
    focusAreas: ['scalability', 'architecture', 'trade-offs', 'distributed systems', 'performance', 'reliability'],
    responseStyle: 'architectural decisions with scalability metrics, trade-off analysis, and real-world constraints',
    maxTokens: 650,
    emphasizeMetrics: true,
    useSTARFormat: false,
  } as RAGConfig,

  general_interview: {
    queryModel: 'llama-3.1-8b-instant',
    responseModel: 'llama-3.3-70b-versatile', // Updated from decommissioned model
    queryTemperature: 0.3,
    responseTemperature: 0.6,
    focusAreas: ['experience', 'skills', 'achievements', 'growth', 'passion', 'culture fit'],
    responseStyle: 'balanced professional responses highlighting unique value and authentic personality',
    maxTokens: 500,
    emphasizeMetrics: false,
    useSTARFormat: true,
  } as RAGConfig,
};

/**
 * Detect interview type from question content
 */
export function detectInterviewType(question: string): keyof typeof RAG_CONFIGS {
  const q = question.toLowerCase();

  // Technical keywords
  if (q.match(/code|algorithm|debug|optimize|performance|architecture|design pattern|api|database|sql/)) {
    if (q.match(/system design|scale|distributed|microservice|architecture/)) {
      return 'system_design_interview';
    }
    return 'technical_interview';
  }

  // Behavioral keywords
  if (q.match(/conflict|team|leader|manage|communicate|challenge|difficult|failure|learn/)) {
    return 'behavioral_interview';
  }

  // Executive keywords
  if (q.match(/strategy|vision|business|roi|revenue|stakeholder|executive|director|organization/)) {
    return 'executive_interview';
  }

  return 'general_interview';
}

/**
 * Build context-aware query enhancement prompt
 */
export function buildQueryEnhancementPrompt(
  question: string,
  config: RAGConfig
): string {
  return `You are an interview preparation assistant optimizing search queries for professional profile data.

Original Question: "${question}"

Interview Context:
- Focus Areas: ${config.focusAreas.join(', ')}
- Response Style: ${config.responseStyle}

Enhance this query to search for relevant experience by:
- Adding synonyms and related terms from the focus areas
- Including both technical and professional terminology
- Emphasizing ${config.emphasizeMetrics ? 'quantifiable achievements and metrics' : 'qualitative experiences and growth'}
- Expanding to cover ${config.useSTARFormat ? 'Situation-Task-Action-Result components' : 'strategic and high-level concepts'}

Return only the enhanced search query (no explanation):`;
}

/**
 * Build context-aware response formatting prompt
 */
export function buildResponseFormattingPrompt(
  question: string,
  context: string,
  config: RAGConfig
): string {
  const starInstruction = config.useSTARFormat
    ? `- Structure using STAR format (Situation, Task, Action, Result) when describing experiences
- Include specific examples and stories`
    : `- Provide strategic, high-level responses
- Focus on outcomes and business impact`;

  const metricsInstruction = config.emphasizeMetrics
    ? `- Include specific metrics, percentages, and quantifiable results
- Mention technologies, tools, and technical details`
    : `- Focus on qualitative impact and personal growth
- Emphasize soft skills and team dynamics`;

  return `You are an expert interview coach preparing responses for a professional interview.

Interview Type Context:
- Focus Areas: ${config.focusAreas.join(', ')}
- Response Style: ${config.responseStyle}

Question: "${question}"

Professional Background Data:
${context}

Create an interview-ready response that:
${starInstruction}
${metricsInstruction}
- Sounds confident, natural, and conversational
- Speaks in first person as the candidate
- Directly addresses the question
- Highlights unique value and differentiators
- Is concise but impactful (aim for ${Math.floor(config.maxTokens / 2)}-${config.maxTokens} words)

Interview Response:`;
}

/**
 * Get configuration for specific interview type
 */
export function getRAGConfig(interviewType?: keyof typeof RAG_CONFIGS): RAGConfig {
  return RAG_CONFIGS[interviewType || 'general_interview'];
}

/**
 * Auto-detect and get appropriate configuration
 */
export function getAutoConfig(question: string): {
  config: RAGConfig;
  detectedType: keyof typeof RAG_CONFIGS;
} {
  const detectedType = detectInterviewType(question);
  return {
    config: RAG_CONFIGS[detectedType],
    detectedType,
  };
}
