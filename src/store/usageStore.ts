import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UsageState {
  remainingCount: number;
  hasUsedExtraCount: boolean;
  lastResetDate: string;
  maxSubmissions: number;
  setRemainingCount: (count: number) => void;
  decreaseCount: () => void;
  setHasUsedExtraCount: (used: boolean) => void;
  addExtraCount: () => void;
  resetDailyCount: () => void;
  checkAndResetIfNewDay: () => void;
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
      
      addExtraCount: () => {
        set({ remainingCount: 10, hasUsedExtraCount: true });
        localStorage.setItem('remainingCount', '10');
        localStorage.setItem('hasUsedExtraCount', 'true');
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
      }
    }),
    {
      name: 'usage-storage',
      partialize: (state) => ({
        remainingCount: state.remainingCount,
        hasUsedExtraCount: state.hasUsedExtraCount,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);
