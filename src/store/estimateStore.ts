// src/store/estimateStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';

interface EstimateState {
  aiResponseText: string;
  projectEstimate: ProjectEstimate | null;
  projectPeriod: number;
  setAiResponseText: (text: string) => void;
  setProjectEstimate: (estimate: ProjectEstimate) => void;
  setProjectPeriod: (weeks: number) => void;
  reset: () => void;
}

const initialState = {
  aiResponseText: '',
  projectEstimate: null,
  projectPeriod: 12, // 초기값 예시
};

export const useEstimateStore = create<EstimateState>()(
  persist(
    (set) => ({
      ...initialState,
      setAiResponseText: (text) => set({ aiResponseText: text }),
      setProjectEstimate: (estimate) => set({ projectEstimate: estimate }),
      setProjectPeriod: (weeks) => set({ projectPeriod: weeks }),
      reset: () => set(initialState),
    }),
    {
      name: 'estimate-storage', // localStorage에 저장될 때 사용될 키
      storage: createJSONStorage(() => sessionStorage), // or localStorage
    }
  )
);
