import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devLog } from '@/utils/devLogger';

// 관리자 정보 타입 정의
export interface AdminInfo {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  isRoot: boolean;
  receiveAlimtalk: boolean;
  receiveEmail: boolean;
  memo?: string;
  createAt: string;
  lastLoginAt: string;
  updateBy: string;
}

interface AdminStore {
  adminInfo: AdminInfo | null;
  isLoggedIn: boolean;
  
  // Actions
  setAdminInfo: (adminInfo: AdminInfo) => void;
  clearAdminInfo: () => void;
  updateAdminInfo: (updates: Partial<AdminInfo>) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      adminInfo: null,
      isLoggedIn: false,

      setAdminInfo: (adminInfo: AdminInfo) => {
        devLog('🔐 [AdminStore] 관리자 정보 저장:', {
          adminId: adminInfo.adminId,
          name: adminInfo.name,
          isRoot: adminInfo.isRoot
        });
        
        set({
          adminInfo,
          isLoggedIn: true
        });
      },

      clearAdminInfo: () => {
        devLog('🚪 [AdminStore] 관리자 정보 삭제 (로그아웃)');
        
        set({
          adminInfo: null,
          isLoggedIn: false
        });
      },

      updateAdminInfo: (updates: Partial<AdminInfo>) => {
        const currentInfo = get().adminInfo;
        if (currentInfo) {
          devLog('📝 [AdminStore] 관리자 정보 업데이트:', updates);
          
          set({
            adminInfo: {
              ...currentInfo,
              ...updates
            }
          });
        }
      }
    }),
    {
      name: 'admin-storage', // localStorage 키 이름
      partialize: (state) => ({
        adminInfo: state.adminInfo,
        isLoggedIn: state.isLoggedIn
      })
    }
  )
);
