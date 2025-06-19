import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithAI, ChatMessage, ChatRequest } from '../lib/api';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatAssistantProps {
  functionInfo?: {
    name: string;
    code?: string;
  } | null;
  repositoryInfo?: {
    name: string;
    totalFunctions: number;
    languages: string[];
    structure?: string;
  } | null;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ functionInfo, repositoryInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('🔄 Messages state changed:', messages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message when context changes
  useEffect(() => {
    if (messages.length === 0) {
      let welcomeMessage = '';
      
      if (functionInfo) {
        welcomeMessage = `Hi! I'm here to help you understand the **${functionInfo.name}** function. You can ask me about its logic, optimization opportunities, potential issues, or anything else!`;
      } else if (repositoryInfo) {
        welcomeMessage = `Hi! I'm here to help you analyze the **${repositoryInfo.name}** repository. You can ask me about the codebase structure, functions, optimization opportunities, or general questions!`;
      } else {
        welcomeMessage = `Hi! I'm your AI coding assistant. I can help you with code analysis, optimization, debugging, and general programming questions!`;
      }
      
      console.log('🏠 Setting welcome message:', welcomeMessage);
      setMessages([{
        id: Date.now().toString(),
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [functionInfo, repositoryInfo]);

  const suggestedQuestions = functionInfo ? [
    "What does this function do?",
    "How can I optimize this code?",
    "Are there any potential bugs?",
    "Explain the algorithm step by step"
  ] : repositoryInfo ? [
    "What's the overall structure of this codebase?",
    "Which functions should I focus on first?",
    "Are there any code quality issues?",
    "How can I improve this repository?"
  ] : [
    "Help me analyze some code",
    "Explain a programming concept",
    "Review my implementation",
    "Suggest best practices"
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    console.log('🚀 Sending message:', text);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    console.log('📝 Adding user message:', userMessage);
    setMessages(prev => {
      console.log('📝 Previous messages:', prev);
      const newMessages = [...prev, userMessage];
      console.log('📝 New messages after user message:', newMessages);
      return newMessages;
    });
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for AI - use messages before adding the current user message
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp.toISOString()
      }));

      // Determine context type and prepare request
      let contextType: string = 'general';
      let requestFunctionInfo = undefined;
      let requestRepositoryInfo = undefined;

      if (functionInfo) {
        contextType = 'function';
        requestFunctionInfo = {
          name: functionInfo.name,
          code: functionInfo.code || ''
        };
      } else if (repositoryInfo) {
        contextType = 'repository';
        requestRepositoryInfo = {
          name: repositoryInfo.name,
          totalFunctions: repositoryInfo.totalFunctions,
          languages: repositoryInfo.languages,
          structure: repositoryInfo.structure
        };
      }

      const request: ChatRequest = {
        message: text.trim(),
        contextType,
        conversationHistory,
        functionInfo: requestFunctionInfo,
        repositoryInfo: requestRepositoryInfo
      };

      // Debug: Log the request structure
      console.log('Chat request:', JSON.stringify(request, null, 2));
      
      // Get AI response
      console.log('🤖 Calling AI API...');
      const aiResponseText = await chatWithAI(request);
      console.log('🤖 AI Response received:', aiResponseText);

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      console.log('🤖 Adding AI response:', aiResponse);
      setMessages(prev => {
        console.log('🤖 Previous messages before AI response:', prev);
        const newMessages = [...prev, aiResponse];
        console.log('🤖 New messages after AI response:', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error while processing your request. Please try again later. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    // Reset to welcome message
    let welcomeMessage = '';
    
    if (functionInfo) {
      welcomeMessage = `Hi! I'm here to help you understand the **${functionInfo.name}** function. You can ask me about its logic, optimization opportunities, potential issues, or anything else!`;
    } else if (repositoryInfo) {
      welcomeMessage = `Hi! I'm here to help you analyze the **${repositoryInfo.name}** repository. You can ask me about the codebase structure, functions, optimization opportunities, or general questions!`;
    } else {
      welcomeMessage = `Hi! I'm your AI coding assistant. I can help you with code analysis, optimization, debugging, and general programming questions!`;
    }
    
    setMessages([{
      id: Date.now().toString(),
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date()
    }]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Chat Toggle Button - Fixed Position */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white flex items-center justify-center`}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Panel - Fixed Position */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-semibold">AI Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearChat}
                  title="Clear chat"
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={toggleChat}
                  title="Minimize chat"
                  className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
                         {functionInfo ? (
               <p className="text-blue-100 text-sm mt-1 truncate">
                 Analyzing: {functionInfo.name}
               </p>
             ) : repositoryInfo ? (
               <p className="text-blue-100 text-sm mt-1 truncate">
                 Repository: {repositoryInfo.name}
               </p>
             ) : (
               <p className="text-blue-100 text-sm mt-1">
                 General Assistant
               </p>
             )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              console.log('💬 Rendering message:', message);
              return (
              <div
                key={`${message.id}-${index}-${message.timestamp.getTime()}`}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  {message.isUser ? (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  ) : (
                    <div className="text-sm prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.slice(0, 2).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputText);
                  }
                }}
                placeholder="Ask about this function..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant; 