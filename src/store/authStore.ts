import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleLoginResponse } from '@/lib/api/user/userApi.types';
import { logoutUser } from '@/lib/api/user/userApi';
import { useChatStore } from '@/store/chatStore';

export interface UserData extends GoogleLoginResponse {
  isLoggedIn: boolean;
  updateAt?: string;
  cellphone?: string;
}

interface AuthState {
  user: UserData | null;
  isAdditionalInfoModalOpen: boolean;
  additionalInfoUser: {
    providerId: string;
    profileImage: string;
    email: string;
    name: string;
  } | null;
  login: (userData: GoogleLoginResponse) => void;
  logout: () => void;
  openAdditionalInfoModal: (userInfo?: { providerId: string; profileImage: string; email: string; name: string }) => void;
  closeAdditionalInfoModal: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdditionalInfoModalOpen: false,
      additionalInfoUser: null,

      login: (userData: GoogleLoginResponse) =>
        set({
          user: {
            ...userData,
            isLoggedIn: true,
          },
        }),

      logout: async () => {
        try {
          // 로그아웃 API 호출
          await logoutUser();
        } catch (error) {
          console.error('로그아웃 API 호출 실패:', error);
          // API 호출이 실패해도 로컬 로그아웃은 진행
        }
        
        // 로컬 상태 초기화
        set({
          user: null,
        });
        
        // 채팅 스토어도 클리어
        useChatStore.getState().clear();
      },

      isAuthenticated: () => {
        const state = get();
        return !!(state.user?.isLoggedIn);
      },

      openAdditionalInfoModal: (userInfo) =>
        set({
          isAdditionalInfoModalOpen: true,
          additionalInfoUser: userInfo || null,
        }),

      closeAdditionalInfoModal: () =>
        set({
          isAdditionalInfoModalOpen: false,
          additionalInfoUser: null,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // 로그인 상태만 저장
    }
  )
);
