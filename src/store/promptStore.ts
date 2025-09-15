import { create } from 'zustand';

interface PromptStoreState {
  priceList: any[];
  priceListMarkdown: string;
  isPriceDataReady: boolean;
  aiPrompts: string;
  greeting: string;
  setPriceList: (list: any[]) => void;
  getPriceList: () => any[];
  setPriceListMarkdown: (markdown: string) => void;
  getPriceListMarkdown: () => string;
  setPriceDataReady: (ready: boolean) => void;
  getIsPriceDataReady: () => boolean;
  setAiPrompts: (prompts: string) => void;
  getAiPrompts: () => string;
  setGreeting: (greeting: string) => void;
  getGreeting: () => string;
}

export const usePromptStore = create<PromptStoreState>((set, get) => ({
  priceList: [],
  priceListMarkdown: '',
  isPriceDataReady: false,
  aiPrompts: '',
  greeting: '',
  setPriceList: (list) => set({ priceList: list }),
  getPriceList: () => get().priceList,
  setPriceListMarkdown: (markdown) => set({ priceListMarkdown: markdown }),
  getPriceListMarkdown: () => get().priceListMarkdown,
  setPriceDataReady: (ready) => set({ isPriceDataReady: ready }),
  getIsPriceDataReady: () => get().isPriceDataReady,
  setAiPrompts: (prompts) => set({ aiPrompts: prompts }),
  getAiPrompts: () => get().aiPrompts,
  setGreeting: (greeting) => set({ greeting }),
  getGreeting: () => get().greeting,
}));
