import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlgorithmFunction, AIAnalysisData } from '../lib/api';

interface Repository {
  id: number;
  name: string;
}

interface SelectedAlgorithm {
  algorithm: AlgorithmFunction;
  aiAnalysis?: AIAnalysisData;
  code?: string;
}

interface ChatContextType {
  currentRepository: Repository | null;
  setCurrentRepository: (repo: Repository | null) => void;
  selectedAlgorithm: SelectedAlgorithm | null;
  setSelectedAlgorithm: (algorithm: SelectedAlgorithm | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRepository, setCurrentRepository] = useState<Repository | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SelectedAlgorithm | null>(null);

  return (
    <ChatContext.Provider value={{ 
      currentRepository, 
      setCurrentRepository,
      selectedAlgorithm,
      setSelectedAlgorithm
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};