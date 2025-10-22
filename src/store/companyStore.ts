import { create } from 'zustand';
import { CompanyInfoResponse } from '@/lib/api/user/userApi.types';

// 회사 정보 타입은 API 응답 타입을 재사용
export type CompanyInfo = CompanyInfoResponse;

interface CompanyStore {
  companyInfo: CompanyInfo | null;
  isLoading: boolean;
  error: string | null;
  setCompanyInfo: (companyInfo: CompanyInfo) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearCompanyInfo: () => void;
}

export const useCompanyStore = create<CompanyStore>()((set) => ({
  companyInfo: null,
  isLoading: false,
  error: null,
  
  setCompanyInfo: (companyInfo: CompanyInfo) => 
    set({ companyInfo, error: null }),
  
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
  
  setError: (error: string | null) => 
    set({ error }),
  
  clearCompanyInfo: () => 
    set({ companyInfo: null, error: null }),
}));
