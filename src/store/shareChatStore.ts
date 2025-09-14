import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { FileUploadData } from '@/firebase.functions';

export interface ShareChatMessage {
  role: 'user' | 'ai';
  content: string;
  isLoading?: boolean;
  messageId?: string;
  estimateId?: string;
  files?: FileUploadData[];
}

interface ShareChatStore {
  messages: ShareChatMessage[];
  sessionId: string | null;
  addMessage: (message: ShareChatMessage) => void;
  setMessages: (messages: ShareChatMessage[]) => void;
  setSessionId: (sessionId: string) => void;
  clearMessages: () => void;
  clearSession: () => void;
  updateLastMessage: (payload: Partial<Omit<ShareChatMessage, 'role'>>) => void;
  updateMessageById: (messageId: string, payload: Partial<Omit<ShareChatMessage, 'role'>>) => void;
  removeLastAiLoadingMessage: () => void;
}

export const useShareChatStore = create<ShareChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        sessionId: null,
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),
        setMessages: (messages) =>
          set(() => ({
            messages,
          })),
        setSessionId: (sessionId) =>
          set(() => ({
            sessionId,
          })),
        clearMessages: () =>
          set(() => ({
            messages: [],
          })),
        clearSession: () =>
          set(() => ({
            messages: [],
            sessionId: null,
          })),
        updateLastMessage: (payload) => set((state) => {
          const messages = [...state.messages];
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
              isLoading: typeof payload.isLoading === 'boolean' ? payload.isLoading : lastMessage.isLoading,
            } as typeof lastMessage;

            messages[idx] = updatedMessage;
            return { messages };
          }
          return state;
        }),
        updateMessageById: (messageId: string, payload: Partial<Omit<ShareChatMessage, 'role'>>) => set((state) => {
          const messages = state.messages.map((m) => {
            if (m.messageId === messageId) {
              return {
                ...m,
                ...payload,
                estimateId: m.estimateId ?? payload.estimateId,
                isLoading: false,
              };
            }
            return m;
          });
          return { messages };
        }),
        removeLastAiLoadingMessage: () => set((state) => {
          const messages = [...state.messages];
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
        name: 'share-chat-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
);
