'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiCpu, FiZap } from 'react-icons/fi';
import { ConversationManager } from '@/lib/conversation-manager';
import { analyzeSentiment, getTonePrompt, addPersonalityMarkers, detectInterviewQuestionType, getResponseFramework } from '@/lib/emotional-intelligence';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

interface DigitalTwinChatProps {
  darkMode: boolean;
}

export default function DigitalTwinChat({ darkMode }: DigitalTwinChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Xevi's Digital Twin. Ask me anything about Xevi's skills, projects, or experience!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [followUpSuggestions, setFollowUpSuggestions] = useState<string[]>([]);
  const conversationManager = useRef(new ConversationManager());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate progressive typing for assistant responses
  const simulateTyping = async (fullText: string) => {
    setIsTyping(true);
    
    // Start with empty message
    const messageIndex = messages.length;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', 
      timestamp: new Date(),
      isStreaming: true 
    }]);

    // Stream text word by word for more natural feel
    const words = fullText.split(' ');
    let accumulated = '';

    for (let i = 0; i < words.length; i++) {
      accumulated += (i > 0 ? ' ' : '') + words[i];
      
      setMessages(prev => {
        const updated = [...prev];
        updated[messageIndex] = {
          role: 'assistant',
          content: accumulated,
          timestamp: new Date(),
          isStreaming: true,
        };
        return updated;
      });

      // Realistic delay between words (100-200ms)
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
    }

    // Mark streaming complete
    setMessages(prev => {
      const updated = [...prev];
      updated[messageIndex].isStreaming = false;
      return updated;
    });

    setIsTyping(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    
    // Add to conversation context
    conversationManager.current.addTurn('user', input);

    // Analyze sentiment
    const sentiment = analyzeSentiment(input);
    const questionType = detectInterviewQuestionType(input);
    
    console.log('Detected sentiment:', sentiment.sentiment);
    console.log('Question type:', questionType);

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Get contextual query (handles follow-ups)
      const contextualQuery = conversationManager.current.getContextualQuery(currentInput);
      
      // Show thinking indicator
      setIsTyping(true);
      
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: contextualQuery,
          sentiment: sentiment.sentiment,
          questionType,
          tone: sentiment.suggestedTone,
          conversationContext: conversationManager.current.getContextForLLM(),
        }),
      });

      const data = await response.json();
      let responseText = data.response || "I'm here to help! Ask me about Xevi's background.";

      // Add personality markers based on sentiment
      responseText = addPersonalityMarkers(responseText, sentiment.sentiment, true);

      // Add to conversation context
      conversationManager.current.addTurn('assistant', responseText);

      // Generate follow-up suggestions
      const suggestions = conversationManager.current.generateFollowUps(responseText);
      setFollowUpSuggestions(suggestions);

      // Simulate progressive typing
      setIsTyping(false);
      await simulateTyping(responseText);
      
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg ${
          darkMode
            ? 'bg-gradient-to-r from-blue-600 to-purple-600'
            : 'bg-gradient-to-r from-blue-500 to-purple-500'
        } text-white`}
      >
        {isOpen ? <FiX size={24} /> : <FiMessageCircle size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-24 right-6 z-50 w-96 h-[500px] rounded-lg shadow-2xl overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
              <h3 className="font-bold text-lg">Digital Twin Assistant</h3>
              <p className="text-sm opacity-90">Ask me about Xevi</p>
            </div>

            {/* Messages */}
            <div className="h-[360px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : darkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-200 text-gray-900'
                      } ${msg.isStreaming ? 'streaming-cursor' : ''}`}
                    >
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-0.5 h-4 ml-1 bg-current animate-pulse" />
                      )}
                    </div>
                    {msg.timestamp && (
                      <span className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'} ${msg.role === 'user' ? 'text-right' : ''}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* Enhanced Typing Indicator */}
              {(loading || isTyping) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center space-x-2`}>
                    <FiCpu className="animate-spin text-blue-500" size={16} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isTyping ? 'Typing...' : 'Thinking...'}
                    </span>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up Suggestions */}
            {followUpSuggestions.length > 0 && !loading && (
              <div className={`px-4 py-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <FiZap className="inline mr-1" size={12} />
                  Suggested questions:
                </p>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.slice(0, 2).map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        darkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className={`flex-1 px-4 py-2 rounded-lg ${
                    darkMode
                      ? 'bg-gray-700 text-white placeholder-gray-400'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
