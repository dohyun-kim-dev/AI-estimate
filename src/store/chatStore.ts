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
  isProcessing: boolean; // 추가: AI 처리 중 상태
  addMessage: (m: ChatMessage) => void;
  updateLastMessage: (payload: Partial<Omit<ChatMessage, 'role'>>) => void; 
  updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => void;
  setChatSessionId: (id: string | null) => void;
  setIsProcessing: (processing: boolean) => void; // 추가: 처리 상태 설정
  clear: () => void;
  removeLastAiLoadingMessage: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        chatSessionId: null,
        isProcessing: false, // 추가: 초기값 false
        addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
        // 변경됨: 객체를 받아 마지막 메시지를 업데이트하도록 수정
        // Update the last AI message (searching from the end) with the provided payload.
        // Do NOT force isLoading to false here; preserve or use payload.isLoading if provided.
        updateLastMessage: (payload) => set((s) => {
          const messages = [...s.messages];
          // find last index of an 'ai' message; if none, fall back to last message
          let idx = -1;
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'ai') { idx = i; break; }
          }
          if (idx === -1 && messages.length > 0) idx = messages.length - 1;

          if (idx >= 0) {
            const lastMessage = messages[idx];
            const updatedMessage = {
              ...lastMessage,
              ...payload,
              // if payload explicitly sets isLoading, use it; otherwise keep existing value
              isLoading: typeof payload.isLoading === 'boolean' ? payload.isLoading : lastMessage.isLoading,
            } as typeof lastMessage;

            messages[idx] = updatedMessage;
            return { messages };
          }
          return s;
        }),
        // 특정 messageId로 메시지를 찾아 업데이트합니다.
        updateMessageById: (messageId: string, payload: Partial<Omit<ChatMessage, 'role'>>) => set((s) => {
 const messages = s.messages.map((m) => {
            if (m.messageId === messageId) {
              return {
                ...m,
                ...payload,
                estimateId: m.estimateId ?? payload.estimateId,
                isLoading: false,
              };
            }
            return m;
          });          return { messages };
        }),
        setChatSessionId: (id) => set({ chatSessionId: id }),
        setIsProcessing: (processing) => set({ isProcessing: processing }), // 추가: 처리 상태 설정
        clear: () => {
          const { setChatSessionId } = get();
          setChatSessionId(null); // 세션 ID 초기화
          set({ messages: [] }); // 메시지 초기화
        },
        removeLastAiLoadingMessage: () => set((s) => {
          const messages = [...s.messages];
          for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'ai' && messages[i].isLoading) {
              messages.splice(i, 1);
              break;
            }
          }
          return { messages };
        }),
      }),
      {
        name: 'ai-chat-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
