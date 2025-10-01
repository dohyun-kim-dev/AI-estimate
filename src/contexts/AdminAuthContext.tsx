'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { devLog } from '@/utils/devLogger'

type AdminAuthContextType = {
  isLoggedIn: boolean;
  ready: boolean;
  isRoot: boolean; // isRoot 추가
  login: (id: string, token?: string, isRoot?: boolean) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);
let externalLogout: (() => void) | null = null;

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const [isRoot, setIsRoot] = useState(false); // isRoot 상태 추가

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminIsRoot = localStorage.getItem('admin_isRoot') === 'true';
    setIsLoggedIn(!!adminId);
    setIsRoot(adminIsRoot);
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
  }, []);

  const login = (id: string, token?: string, isRoot?: boolean) => {
    devLog('🚀 [AdminAuthContext] login 함수 호출됨:', {
      id,
      tokenProvided: !!token,
      tokenPrefix: token?.substring(0, 10) + '...',
      isRootProvided: isRoot !== undefined,
      isRootValue: isRoot,
      typeOfIsRoot: typeof isRoot
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
      devLog('👑 [AdminAuthContext] isRoot 저장됨:', {
        isRoot,
        stored: localStorage.getItem('admin_isRoot')
      });
    } else {
      console.warn('⚠️ [AdminAuthContext] isRoot 값이 undefined로 전달됨');
    }
    
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_isRoot');
    setIsLoggedIn(false);
    setIsRoot(false);
  };

  // 외부에서 사용할 수 있게 등록
  externalLogout = logout;

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, ready, isRoot, login, logout }}>
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
