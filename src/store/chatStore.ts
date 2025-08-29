import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
};

interface ChatState {
  messages: ChatMessage[];
  chatSessionId: string | null; // ⭐️ chatSessionId 상태 추가
  addMessage: (m: ChatMessage) => void;
  updateLastMessage: (newContent: string) => void;
  setChatSessionId: (id: string | null) => void; // ⭐️ 세션 ID 설정 함수 추가
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      chatSessionId: null, // ⭐️ 초기값 설정
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      updateLastMessage: (newContent) => set((s) => {
        const messages = s.messages;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage) {
          const updatedMessage = {
            ...lastMessage,
            content: newContent,
            isLoading: false
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
      setChatSessionId: (id) => set({ chatSessionId: id }), // ⭐️ 함수 구현
      clear: () => set({ messages: [], chatSessionId: null }), // ⭐️ clear 함수에 세션 ID 초기화 추가
    }),
    {
      name: 'ai-chat-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);