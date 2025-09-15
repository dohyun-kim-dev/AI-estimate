import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleLoginResponse } from '@/lib/api/user/userApi.types';
import { useChatStore } from '@/store/chatStore';
import { clearAllTokens } from '@/lib/utils/tokenUtils';

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
  // ✅ 견적 모달 상태 추가
  isEstimateModalOpen: boolean;
  login: (userData: GoogleLoginResponse) => void;
  logout: () => void;
  openAdditionalInfoModal: (userInfo?: { providerId: string; profileImage: string; email: string; name: string }) => void;
  closeAdditionalInfoModal: () => void;
  // ✅ 견적 모달 상태 함수 추가
  openEstimateModal: () => void;
  closeEstimateModal: () => void;
  isAuthenticated: () => boolean;
  setUser: (userData: GoogleLoginResponse | null) => void;
  persistUser: (userData: GoogleLoginResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdditionalInfoModalOpen: false,
      additionalInfoUser: null,
      // ✅ 초기 상태 설정
      isEstimateModalOpen: false,

      login: (userData: GoogleLoginResponse) =>
        set({
          user: {
            ...userData,
            isLoggedIn: true,
          },
        }),

      setUser: (userData: GoogleLoginResponse | null) =>
        set({
          user: userData
            ? {
                ...userData,
                isLoggedIn: true,
              }
            : null,
        }),

      persistUser: (userData: GoogleLoginResponse) =>
        set({
          user: {
            ...userData,
            isLoggedIn: true,
          },
        }),

      logout: async () => {
        // 로컬 토큰 삭제
        clearAllTokens();
        
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

      // ✅ 견적 모달을 여는 함수
      openEstimateModal: () => {
        set({ isEstimateModalOpen: true });
      },

      // ✅ 견적 모달을 닫는 함수
      closeEstimateModal: () => {
        set({ isEstimateModalOpen: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // 로그인 상태만 저장
    }
  )
);