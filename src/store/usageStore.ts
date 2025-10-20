import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getGuestToken, addGuestAdditionalCharge } from '@/lib/api/user/userApi';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import { useAuthStore } from './authStore';
import { useCompanyStore } from './companyStore';
import { devLog } from '@/utils/devLogger';

interface UsageState {
  remainingCount: number;
  hasUsedExtraCount: boolean;
  lastResetDate: string;
  maxSubmissions: number;
  isLoading: boolean;
  setRemainingCount: (count: number) => void;
  decreaseCount: () => void;
  setHasUsedExtraCount: (used: boolean) => void;
  addExtraCount: () => Promise<void>;
  resetDailyCount: () => void;
  checkAndResetIfNewDay: () => void;
  fetchGuestUsage: (companyCode: string) => Promise<void>;
  fetchUserUsage: (companyId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      remainingCount: 10,
      hasUsedExtraCount: false,
      lastResetDate: new Date().toDateString(),
      maxSubmissions: 10,
      isLoading: false,
      
      setRemainingCount: (count: number) => {
        set({ remainingCount: count });
        localStorage.setItem('remainingCount', String(count));
      },
      
      decreaseCount: () => {
        const currentCount = get().remainingCount;
        if (currentCount > 0) {
          const newCount = currentCount - 1;
          set({ remainingCount: newCount });
          localStorage.setItem('remainingCount', String(newCount));
        }
      },
      
      setHasUsedExtraCount: (used: boolean) => {
        set({ hasUsedExtraCount: used });
        localStorage.setItem('hasUsedExtraCount', String(used));
      },
      
      addExtraCount: async () => {
        try {
          const guestUuid = localStorage.getItem('guest-uuid');
          if (guestUuid) {
            // 게스트 사용자인 경우 추가 과금 API 호출
            const response = await addGuestAdditionalCharge(guestUuid);
            if (response.statusCode === 200) {
              devLog('게스트 추가 과금 API 호출 성공 - 게스트 토큰 재조회');
              
              // API 성공 시 현재 회사 코드로 게스트 토큰 재호출하여 최신 사용량 반영
              const companyCode = getCompanyCodeFromUrl();
              if (companyCode) {
                const tokenResponse = await getGuestToken(guestUuid, companyCode);
                if (tokenResponse.statusCode === 200 && tokenResponse.data) {
                  const { dailyQueryCount, isAdditionalCharge } = tokenResponse.data;
                  
                  // 서버에서 받은 최신 사용량으로 업데이트
                  set({ 
                    remainingCount: dailyQueryCount,
                    hasUsedExtraCount: isAdditionalCharge || false
                  });
                  localStorage.setItem('remainingCount', String(dailyQueryCount));
                  localStorage.setItem('hasUsedExtraCount', String(isAdditionalCharge || false));
                  
                  devLog('게스트 추가 과금 후 사용량 업데이트 완료:', {
                    remainingCount: dailyQueryCount,
                    hasUsedExtraCount: isAdditionalCharge
                  });
                } else {
                  console.error('게스트 토큰 재조회 실패:', tokenResponse.error);
                  // 재조회 실패 시 회사 설정값 또는 기본값으로 업데이트
                  const fallbackCount = useCompanyStore.getState().companyInfo?.guestDailyQueryLimit || 10;
                  set({ remainingCount: fallbackCount, hasUsedExtraCount: true });
                  localStorage.setItem('remainingCount', String(fallbackCount));
                  localStorage.setItem('hasUsedExtraCount', 'true');
                }
              }
            } else {
              console.error('게스트 추가 과금 API 호출 실패:', response.error);
              // API 실패 시 회사 설정값 또는 기본값으로 업데이트
              const fallbackCount = useCompanyStore.getState().companyInfo?.guestDailyQueryLimit || 10;
              set({ remainingCount: fallbackCount, hasUsedExtraCount: true });
              localStorage.setItem('remainingCount', String(fallbackCount));
              localStorage.setItem('hasUsedExtraCount', 'true');
            }
          } else {
            // 게스트 UUID가 없는 경우 회사 설정값 또는 기본값으로 업데이트
            const fallbackCount = useCompanyStore.getState().companyInfo?.guestDailyQueryLimit || 10;
            set({ remainingCount: fallbackCount, hasUsedExtraCount: true });
            localStorage.setItem('remainingCount', String(fallbackCount));
            localStorage.setItem('hasUsedExtraCount', 'true');
          }
        } catch (error) {
          console.error('addExtraCount 중 오류:', error);
          // 오류가 발생해도 로컬 상태는 회사 설정값 또는 기본값으로 업데이트
          const fallbackCount = useCompanyStore.getState().companyInfo?.guestDailyQueryLimit || 10;
          set({ remainingCount: fallbackCount, hasUsedExtraCount: true });
          localStorage.setItem('remainingCount', String(fallbackCount));
          localStorage.setItem('hasUsedExtraCount', 'true');
        }
      },
      
      resetDailyCount: () => {
        const today = new Date().toDateString();
        set({ 
          remainingCount: 10, 
          hasUsedExtraCount: false, 
          lastResetDate: today 
        });
        localStorage.setItem('remainingCount', '10');
        localStorage.setItem('hasUsedExtraCount', 'false');
        localStorage.setItem('lastResetDate', today);
      },
      
      checkAndResetIfNewDay: () => {
        const today = new Date().toDateString();
        const { lastResetDate } = get();
        
        if (lastResetDate !== today) {
          // 새로운 날이면 리셋
          get().resetDailyCount();
          
          // deviceId가 없으면 생성
          if (!localStorage.getItem('deviceId')) {
            localStorage.setItem('deviceId', generateUUID());
          }
        } else {
          // 같은 날이면 localStorage에서 값 동기화
          const storedCount = localStorage.getItem('remainingCount');
          const storedHasUsedExtra = localStorage.getItem('hasUsedExtraCount');
          
          if (storedCount) {
            set({ remainingCount: Number(storedCount) });
          }
          // hasUsedExtraCount는 명시적으로 'true'일 때만 true로 설정
          if (storedHasUsedExtra === 'true') {
            set({ hasUsedExtraCount: true });
          } else {
            // 'false' 또는 null/undefined인 경우 모두 false로 설정
            set({ hasUsedExtraCount: false });
          }
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      fetchGuestUsage: async (companyCode: string) => {
        try {
          set({ isLoading: true });
          
          // guest-uuid 가져오기
          const guestUuid = localStorage.getItem('guest-uuid');
          if (!guestUuid) {
            devLog('게스트 UUID가 없어 서버 사용량 조회를 건너뜁니다.');
            return;
          }

          const response = await getGuestToken(guestUuid, companyCode);
          
          if (response.statusCode === 200 && response.data) {
            const { dailyQueryCount, isAdditionalCharge } = response.data;
            
            // 서버에서 받은 사용량으로 업데이트
            set({ 
              remainingCount: dailyQueryCount,
              hasUsedExtraCount: isAdditionalCharge || false
            });
            localStorage.setItem('remainingCount', String(dailyQueryCount));
            localStorage.setItem('hasUsedExtraCount', String(isAdditionalCharge || false));
            
            devLog('서버에서 게스트 사용량 업데이트:', {
              remainingCount: dailyQueryCount,
              hasUsedExtraCount: isAdditionalCharge
            });
          } else {
            console.error('게스트 토큰 조회 실패:', response.error);
          }
        } catch (error) {
          console.error('게스트 사용량 조회 중 오류:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserUsage: async (companyId: string) => {
        try {
          set({ isLoading: true });
          
          // AuthStore에서 사용자 정보 및 사용량 가져오기
          const authStore = useAuthStore.getState();
          devLog('🔄 fetchUserUsage - companyId:', companyId);
          devLog('🔄 authStore.user:', authStore.user);
          devLog('🔄 authStore.user.usingService:', authStore.user?.usingService);
          
          const dailyLimit = authStore.getUserDailyQueryLimit(companyId);
          devLog('🔄 getUserDailyQueryLimit 결과:', dailyLimit);
          
          // dailyLimit이 0이어도 업데이트 (0 = 다 씀)
          set({ remainingCount: dailyLimit });
          localStorage.setItem('remainingCount', String(dailyLimit));
          
          devLog('🔄 회원 사용량 업데이트 완료:', dailyLimit);
        } catch (error) {
          console.error('회원 사용량 조회 중 오류:', error);
        } finally {
          set({ isLoading: false });
        }
      },

    }),
    {
      name: 'usage-storage',
      partialize: (state) => ({
        remainingCount: state.remainingCount,
        hasUsedExtraCount: state.hasUsedExtraCount,
        lastResetDate: state.lastResetDate,
        maxSubmissions: state.maxSubmissions,
      }),
    }
  )
);
