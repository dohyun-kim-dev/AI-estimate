import { create } from 'zustand';

interface PromptStoreState {
  priceList: any[];
  priceListMarkdown: string;
  isPriceDataReady: boolean;
  setPriceList: (list: any[]) => void;
  getPriceList: () => any[];
  setPriceListMarkdown: (markdown: string) => void;
  getPriceListMarkdown: () => string;
  setPriceDataReady: (ready: boolean) => void;
  getIsPriceDataReady: () => boolean;
}

export const usePromptStore = create<PromptStoreState>((set, get) => ({
  priceList: [],
  priceListMarkdown: '',
  isPriceDataReady: false,
  setPriceList: (list) => set({ priceList: list }),
  getPriceList: () => get().priceList,
  setPriceListMarkdown: (markdown) => set({ priceListMarkdown: markdown }),
  getPriceListMarkdown: () => get().priceListMarkdown,
  setPriceDataReady: (ready) => set({ isPriceDataReady: ready }),
  getIsPriceDataReady: () => get().isPriceDataReady,
}));
