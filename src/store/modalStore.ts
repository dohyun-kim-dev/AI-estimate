import { create } from 'zustand';

interface ModalState {
  isLoginModalOpen: boolean;
  loginModalPurpose: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded' | 'default';
  openLoginModal: (purpose?: 'contact' | 'download' | 'share' | 'limitReached' | 'limitExceeded' | 'default') => void;
  closeLoginModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isLoginModalOpen: false,
  loginModalPurpose: 'default',
  openLoginModal: (purpose = 'default') => set({ 
    isLoginModalOpen: true, 
    loginModalPurpose: purpose 
  }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));

