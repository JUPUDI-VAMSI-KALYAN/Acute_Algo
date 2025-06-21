'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAI, ChatMessage, ChatRequest, getRepositoryFunctions, AlgorithmFunction, getAlgorithmWithAIAnalysis, AIAnalysisData } from '../lib/api';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { useChatContext } from '../contexts/ChatContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface PlaygroundChatRef {
  clearChat: () => void;
}

const PlaygroundChat = forwardRef<PlaygroundChatRef>((props, ref) => {
  const { currentRepository, setSelectedAlgorithm } = useChatContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAlgorithmSuggestions, setShowAlgorithmSuggestions] = useState(false);
  const [algorithmSuggestions, setAlgorithmSuggestions] = useState<AlgorithmFunction[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAlgorithms = async (query: string = '') => {
    if (!currentRepository?.id) return;
    
    try {
      const response = await getRepositoryFunctions(currentRepository.id, 1, 50, true);
      let algorithms = response.functions as AlgorithmFunction[];
      
      if (query) {
        algorithms = algorithms.filter(algo => 
          algo.name.toLowerCase().includes(query.toLowerCase()) ||
          algo.type.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      setAlgorithmSuggestions(algorithms.slice(0, 10)); // Limit to 10 suggestions
    } catch (error) {
      console.error('Error fetching algorithms:', error);
      setAlgorithmSuggestions([]);
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    
    // Always show algorithm suggestions when repository is available
    if (currentRepository?.id) {
      // Check for @ mentions first
      const cursorPosition = textareaRef.current?.selectionStart || 0;
      const textBeforeCursor = value.substring(0, cursorPosition);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
        const hasSpaceAfterAt = textAfterAt.includes(' ');
        
        if (!hasSpaceAfterAt) {
          setMentionStartIndex(lastAtIndex);
          setSearchQuery(textAfterAt);
          setShowAlgorithmSuggestions(true);
          fetchAlgorithms(textAfterAt);
          return;
        }
      }
      
      // If no @ mention, treat the entire input as search query
      const trimmedValue = value.trim();
      if (trimmedValue.length > 0) {
        setMentionStartIndex(0);
        setSearchQuery(trimmedValue);
        setShowAlgorithmSuggestions(true);
        fetchAlgorithms(trimmedValue);
      } else {
        setShowAlgorithmSuggestions(false);
      }
    } else {
      setShowAlgorithmSuggestions(false);
    }
  };

  const loadAlgorithmDetails = async (algorithm: AlgorithmFunction) => {
    try {
      // Fetch AI analysis for the algorithm
      const analysisData = await getAlgorithmWithAIAnalysis(algorithm.id);
      
      // Set the selected algorithm with analysis data
      setSelectedAlgorithm({
        algorithm,
        aiAnalysis: analysisData as AIAnalysisData,
        code: undefined // Will be loaded separately if needed
      });
      
      console.log('Algorithm loaded successfully:', algorithm.name);
    } catch (error) {
      console.error('Failed to load algorithm details:', error);
      // Still set the algorithm even if analysis fails
      setSelectedAlgorithm({
        algorithm,
        aiAnalysis: undefined,
        code: undefined
      });
    }
  };

  const selectAlgorithm = async (algorithm: AlgorithmFunction) => {
    let newText: string;
    let newCursorPosition: number;
    
    // Check if we're in @ mention mode or regular input mode
    const hasAtMention = input.includes('@') && mentionStartIndex > 0;
    
    if (hasAtMention) {
      // @ mention mode: replace the @query with @algorithmName
      const beforeMention = input.substring(0, mentionStartIndex);
      const afterMention = input.substring(mentionStartIndex + 1 + searchQuery.length);
      const algorithmMention = `@${algorithm.name}`;
      
      newText = beforeMention + algorithmMention + afterMention;
      newCursorPosition = beforeMention.length + algorithmMention.length;
    } else {
      // Regular input mode: replace entire input with @algorithmName
      const algorithmMention = `@${algorithm.name}`;
      newText = algorithmMention;
      newCursorPosition = algorithmMention.length;
    }
    
    setInput(newText);
    setShowAlgorithmSuggestions(false);
    
    // Load algorithm details for the analysis panel
    await loadAlgorithmDetails(algorithm);
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = `# 🚀 Welcome to Algorithm Playground!

I'm **Acute AI**, ready to help with algorithms and coding!

**💡 Get Started:** Ask any coding question or write code in the editor!

What would you like to explore first?`;
      setMessages([{
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [messages.length, currentRepository?.id]);

  const handleClearChat = () => {
    const welcomeMessage = `# 🚀 Welcome to Algorithm Playground!

I'm **Acute AI**, ready to help with algorithms and coding!

**💡 Get Started:** Ask any coding question or write code in the editor!

What would you like to explore first?`;
    
    setMessages([{
      id: Date.now().toString(),
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }]);
    
    // Reset the input field and related states
    setInput('');
    setShowAlgorithmSuggestions(false);
    setSearchQuery('');
    setMentionStartIndex(-1);
  };

  useImperativeHandle(ref, () => ({
    clearChat: handleClearChat
  }));

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp.toISOString()
      }));

      const request: ChatRequest = {
        message: text.trim(),
        contextType: 'general',
        conversationHistory,
      };
      
      const aiResponseText = await chatWithAI(request);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error. Please try again.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="font-semibold text-foreground">Acute AI</h3>
          </div>
          <button
            onClick={handleClearChat}
            title="Clear chat"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        {currentRepository?.id && (
          <p className="text-muted-foreground text-sm mt-1 truncate">
            Repository: {currentRepository.name}
          </p>
        )}
      </div>
      <ScrollArea className="flex-1 p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-3 rounded-lg ${
                  message.isUser
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t shrink-0 bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="relative"
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(input);
              }
              if (e.key === 'Escape') {
                setShowAlgorithmSuggestions(false);
              }
            }}
            placeholder={currentRepository?.id ? "Type your message here. Start typing to see algorithm suggestions or use @ to mention specific algorithms. Press Enter to send, Shift+Enter for new line." : "Type your message here. Press Enter to send, Shift+Enter for new line."}
            className="w-full pr-12 text-foreground min-h-[80px] resize-none"
            disabled={isLoading}
          />
          {showAlgorithmSuggestions && algorithmSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-12 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
              {algorithmSuggestions.map((algorithm) => (
                <div
                  key={algorithm.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectAlgorithm(algorithm)}
                >
                  <div className="font-medium text-sm text-gray-900">{algorithm.name}</div>
                  <div className="text-xs text-gray-500">
                    {algorithm.type} • Line {algorithm.start_line}-{algorithm.end_line}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 bottom-3 p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
});

PlaygroundChat.displayName = 'PlaygroundChat';

export default PlaygroundChat;