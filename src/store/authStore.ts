import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleLoginResponse } from '@/lib/api/user/userApi.types';

export interface UserData extends GoogleLoginResponse {
  isLoggedIn: boolean;
  updateAt?: string;
  cellphone?: string;
}

interface AuthState {
  user: UserData | null;
  isAdditionalInfoModalOpen: boolean;
  login: (userData: GoogleLoginResponse) => void;
  logout: () => void;
  openAdditionalInfoModal: () => void;
  closeAdditionalInfoModal: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdditionalInfoModalOpen: false,

      login: (userData: GoogleLoginResponse) =>
        set({
          user: {
            ...userData,
            isLoggedIn: true,
          },
        }),

      logout: () =>
        set({
          user: null,
        }),

      isAuthenticated: () => {
        const state = get();
        return !!(state.user?.isLoggedIn);
      },

      openAdditionalInfoModal: () =>
        set({
          isAdditionalInfoModalOpen: true,
        }),

      closeAdditionalInfoModal: () =>
        set({
          isAdditionalInfoModalOpen: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // 로그인 상태만 저장
    }
  )
);
