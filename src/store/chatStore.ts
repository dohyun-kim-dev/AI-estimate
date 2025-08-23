"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 메시지 타입에 선택적인 'isLoading' 속성을 추가합니다.
export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean; // 로딩 상태를 나타내는 불리언 값
};

interface ChatState {
  messages: ChatMessage[];
  addMessage: (m: ChatMessage) => void;
  updateLastMessage: (newContent: string) => void; // 마지막 메시지를 업데이트하는 새 함수
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      // 마지막 메시지를 찾아 'isLoading'을 false로 바꾸고, 내용을 새 응답으로 업데이트합니다.
      updateLastMessage: (newContent) => set((s) => {
        const lastMessage = s.messages[s.messages.length - 1];
        if (lastMessage) {
          const updatedMessage = { ...lastMessage, content: newContent, isLoading: false };
          return {
            messages: [
              ...s.messages.slice(0, s.messages.length - 1),
              updatedMessage,
            ],
          };
        }
        return s; // 마지막 메시지가 없으면 상태를 변경하지 않습니다.
      }),
      clear: () => set({ messages: [] }),
    }),
    {
      name: 'ai-chat-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
