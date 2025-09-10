import { create } from 'zustand';
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
}

export const useShareChatStore = create<ShareChatStore>((set) => ({
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
}));
