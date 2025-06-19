import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SelectedFunction {
  name: string;
  code: string;
  filePath: string;
}

interface ChatContextType {
  selectedFunction: SelectedFunction | null;
  setSelectedFunction: (func: SelectedFunction | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [selectedFunction, setSelectedFunction] = useState<SelectedFunction | null>(null);

  return (
    <ChatContext.Provider value={{ selectedFunction, setSelectedFunction }}>
      {children}
    </ChatContext.Provider>
  );
}; 