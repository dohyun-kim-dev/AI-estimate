import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  messageId?: string;
  estimateId?: string;
};



interface ChatState {
  messages: ChatMessage[];
  chatSessionId: string | null;
  addMessage: (m: ChatMessage) => void;
  // 변경됨: 객체를 인자로 받도록 수정
  updateLastMessage: (payload: Partial<Omit<ChatMessage, 'role'>>) => void; 
  updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => void;
  setChatSessionId: (id: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        chatSessionId: null,
        addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
        // 변경됨: 객체를 받아 마지막 메시지를 업데이트하도록 수정
        updateLastMessage: (payload) => set((s) => {
          const messages = s.messages;
          const lastMessage = messages[messages.length - 1];
          console.log('Updating last message with payload:', payload);

          if (lastMessage) {
            const updatedMessage = {
              ...lastMessage,
              ...payload,
              isLoading: false,
            };
            return {
              messages: [
                ...messages.slice(0, messages.length - 1),
                updatedMessage,
              ],
            };
          }
          return s;
        }),
        // 특정 messageId로 메시지를 찾아 업데이트합니다.
        updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => set((s) => {
          const messages = s.messages.map((m) => (m.messageId === messageId ? { ...m, ...payload, isLoading: false } : m));
          return { messages };
        }),
        setChatSessionId: (id) => set({ chatSessionId: id }),
        clear: () => set({ messages: [], chatSessionId: null }),
      }),
      {
        name: 'ai-chat-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
