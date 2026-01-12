import { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';

const ChatContext = createContext<ReturnType<typeof useChat> | null>(null);

export function ChatProvider({ children, userId }: { children: ReactNode; userId: string | undefined }) {
  const chatData = useChat(userId);

  return (
    <ChatContext.Provider value={chatData}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}

