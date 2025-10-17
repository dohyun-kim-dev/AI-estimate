import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GoogleLoginResponse, UserInfoResponse } from '@/lib/api/user/userApi.types';
import { useChatStore } from '@/store/chatStore';
import { clearAllTokens } from '@/lib/utils/tokenUtils';
import { getUserInfo } from '@/lib/api/user/userApi';

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
  // 새로운 함수 추가
  fetchAndUpdateUserInfo: () => Promise<void>;
  getUserDailyQueryLimit: (companyId: string) => number;
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
        localStorage.removeItem('chatSessionId');
        sessionStorage.removeItem('chatSessionId');

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

      // 사용자 정보 가져오기 및 업데이트
      fetchAndUpdateUserInfo: async () => {
        try {
          const response = await getUserInfo();
          console.log('📊 fetchAndUpdateUserInfo 응답:', response);
          if (response.statusCode === 200 && response.data) {
            const userData = {
              ...response.data,
              isLoggedIn: true,
              isNew: false, // 기존 사용자이므로 false
            };
            console.log('📊 authStore에 설정될 userData:', userData);
            console.log('📊 usingService:', userData.usingService);
            set({ user: userData });
          }
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error);
        }
      },

      // 회사 ID에 맞는 일일 쿼리 제한 가져오기
      getUserDailyQueryLimit: (companyId: string) => {
        const state = get();
        console.log('🎯 getUserDailyQueryLimit - companyId:', companyId);
        console.log('🎯 state.user?.usingService:', state.user?.usingService);
        
        if (!state.user?.usingService || state.user.usingService.length === 0) return 0;
        
        // 1. 먼저 companyId로 정확히 매칭 시도 (company가 객체인 경우와 문자열인 경우 모두 처리)
        const service = state.user.usingService.find(s => {
          console.log('🎯 검사중인 service:', s);
          console.log('🎯 s.company type:', typeof s.company);
          console.log('🎯 s.company value:', s.company);
          
          if (typeof s.company === 'object' && s.company !== null && s.company !== undefined) {
            const company = s.company as any; // 타입 단언
            const match = company._id === companyId || company.companyCode === companyId;
            console.log('🎯 객체 비교:', { companyId, company_id: company._id, companyCode: company.companyCode, match });
            return match;
          } else if (typeof s.company === 'string') {
            const match = s.company === companyId;
            console.log('🎯 문자열 비교:', { companyId, s_company: s.company, match });
            return match;
          }
          return false;
        });
        
        // 2. 매칭되는 서비스가 없다면 첫 번째 서비스 사용 (단일 회사 사용자인 경우)
        const finalService = service || state.user.usingService[0];
        
        console.log('🎯 찾은 service:', finalService);
        console.log('🎯 dailyQueryUsage:', finalService?.dailyQueryUsage);
        
        return finalService?.dailyQueryUsage || 0;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // 로그인 상태만 저장
    }
  )
);