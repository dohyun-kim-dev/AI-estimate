'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { devLog } from '@/utils/devLogger';
import { useAdminStore, type AdminInfo } from '@/store/adminStore';

type AdminAuthContextType = {
  isLoggedIn: boolean;
  ready: boolean;
  isRoot: boolean;
  adminInfo: AdminInfo | null;
  login: (id: string, token?: string, isRoot?: boolean, adminData?: AdminInfo) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);
let externalLogout: (() => void) | null = null;

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [isRoot, setIsRoot] = useState(false);
  
  // adminStore 훅 사용
  const { adminInfo, setAdminInfo, clearAdminInfo } = useAdminStore();

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminIsRoot = localStorage.getItem('admin_isRoot') === 'true';
    
    // adminStore에서 정보 가져오기
    setIsLoggedIn(!!adminId || !!adminInfo);
    setIsRoot(adminIsRoot || !!adminInfo?.isRoot);
    setReady(true);

    const syncAuthState = () => {
      const currentAdminId = localStorage.getItem('adminId');
      const currentIsRoot = localStorage.getItem('admin_isRoot') === 'true';
      setIsLoggedIn(!!currentAdminId);
      setIsRoot(currentIsRoot);
    };

    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, [adminInfo]);

  const login = (id: string, token?: string, isRoot?: boolean, adminData?: AdminInfo) => {
    devLog('🚀 [AdminAuthContext] login 함수 호출됨:', {
      id,
      tokenProvided: !!token,
      tokenPrefix: token?.substring(0, 10) + '...',
      isRootProvided: isRoot !== undefined,
      isRootValue: isRoot,
      adminDataProvided: !!adminData
    });

    localStorage.setItem('adminId', id);
    
    // 토큰이 제공된 경우 저장
    if (token) {
      localStorage.setItem('admin_access_token', token);
      devLog('🔑 [AdminAuthContext] 토큰 저장됨:', {
        id,
        tokenPrefix: token.substring(0, 10) + '...',
        tokenLength: token.length
      });
    }

    // isRoot 값 저장
    if (isRoot !== undefined) {
      localStorage.setItem('admin_isRoot', isRoot.toString());
      setIsRoot(isRoot);
    }

    // adminData가 제공된 경우 adminStore에 저장
    if (adminData) {
      setAdminInfo(adminData);
      devLog('� [AdminAuthContext] 관리자 정보 저장:', {
        name: adminData.name,
        adminId: adminData.adminId,
        isRoot: adminData.isRoot
      });
    }
    
    setIsLoggedIn(true);
  };

  const logout = () => {

    clearAdminInfo();
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_isRoot');
    
    // adminStore 정보도 삭제
    
    setIsLoggedIn(false);
    setIsRoot(false);
  };

  // 외부에서 사용할 수 있게 등록
  externalLogout = logout;

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, ready, isRoot, adminInfo, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// 외부에서 호출 가능하도록 export
export const triggerAdminLogout = () => {
  if (externalLogout) externalLogout();
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};
