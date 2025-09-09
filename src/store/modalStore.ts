import { create } from 'zustand';

interface ModalState {
  isLoginModalOpen: boolean;
  loginModalPurpose: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded' | 'shareChat' | 'default';
  shareChatModal: boolean;
  shareModal: boolean;
  shareUrl: string;
  openLoginModal: (purpose?: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded' | 'shareChat' | 'default') => void;
  closeLoginModal: () => void;
  openShareChatModal: () => void;
  closeShareChatModal: () => void;
  openShareModal: (url: string) => void;
  closeShareModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  loginModalPurpose: 'default',
  shareChatModal: false,
  shareModal: false,
  shareUrl: '',
  openShareChatModal: () => set({ shareChatModal: true }),
  closeShareChatModal: () => set({ shareChatModal: false }),
  openLoginModal: (purpose = 'default') => set({
    isLoginModalOpen: true,
    loginModalPurpose: purpose
  }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
  openShareModal: (url: string) => set({ shareModal: true, shareUrl: url }),
  closeShareModal: () => set({ shareModal: false, shareUrl: '' }),
}));

