'use client';  // これを追加

import React, { createContext, useContext, useState } from 'react';

interface ConversationContextType {
  conversationIndex: number;
  setConversationIndex: (index: number) => void;
  chatLength: number;
  setChatLength: (index: number) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

export const ConversationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [conversationIndex, setConversationIndex] = useState<number>(1); // 初期値は1
  const [chatLength, setChatLength] = useState<number>(2); // 初期値は2

  return (
    <ConversationContext.Provider value={{ conversationIndex, setConversationIndex, chatLength, setChatLength }}>
      {children}
    </ConversationContext.Provider>
  );
};
