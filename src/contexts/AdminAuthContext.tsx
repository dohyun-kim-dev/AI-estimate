'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AdminAuthContextType = {
  isLoggedIn: boolean;
  ready: boolean;
  login: (id: string, token?: string) => void;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);
let externalLogout: (() => void) | null = null;

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    setIsLoggedIn(!!adminId);
    setReady(true);

    const syncAuthState = () => {
      const currentAdminId = localStorage.getItem('adminId');
      setIsLoggedIn(!!currentAdminId);
    };

    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const login = (id: string, token?: string) => {
    localStorage.setItem('adminId', id);
    
    // 토큰이 제공된 경우 저장
    if (token) {
      localStorage.setItem('admin_access_token', token);
      console.log('🔑 [AdminAuthContext] 토큰 저장됨:', {
        id,
        tokenPrefix: token.substring(0, 10) + '...',
        tokenLength: token.length
      });
    }
    
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
    setIsLoggedIn(false);
  };

  // 외부에서 사용할 수 있게 등록
  externalLogout = logout;

  return (
    <AdminAuthContext.Provider value={{ isLoggedIn, ready, login, logout }}>
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
