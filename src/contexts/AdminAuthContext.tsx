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

  // 초기 로딩 시에만 localStorage에서 상태 복원
  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminIsRoot = localStorage.getItem('admin_isRoot') === 'true';
    
    devLog('🔄 [AdminAuthContext] 초기 상태 복원:', {
      hasAdminId: !!adminId,
      adminId,
      adminIsRoot,
      hasAdminInfo: !!adminInfo
    });
    
    // adminStore에서 정보 가져오기
    if (adminId || adminInfo) {
      setIsLoggedIn(true);
      setIsRoot(adminIsRoot || !!adminInfo?.isRoot);
    }
    setReady(true);
  }, []); // 빈 의존성 배열 - 초기 마운트 시에만 실행

  // storage 이벤트 감지 (다른 탭에서의 변경사항 동기화)
  useEffect(() => {
    const syncAuthState = () => {
      const currentAdminId = localStorage.getItem('adminId');
      const currentIsRoot = localStorage.getItem('admin_isRoot') === 'true';
      
      devLog('🔄 [AdminAuthContext] storage 이벤트 동기화:', {
        hasAdminId: !!currentAdminId,
        currentIsRoot
      });
      
      setIsLoggedIn(!!currentAdminId);
      setIsRoot(currentIsRoot);
    };

    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const login = (id: string, token?: string, isRoot?: boolean, adminData?: AdminInfo) => {
    devLog('🚀 [AdminAuthContext] login 함수 호출됨:', {
      id,
      tokenProvided: !!token,
      tokenPrefix: token?.substring(0, 20) + '...',
      fullToken: token,
      isRootProvided: isRoot !== undefined,
      isRootValue: isRoot,
      adminDataProvided: !!adminData
    });

    // localStorage에 먼저 저장
    localStorage.setItem('adminId', id);
    
    // 토큰이 제공된 경우 저장
    if (token) {
      const existingToken = localStorage.getItem('admin_access_token');
      devLog('🔍 [AdminAuthContext] 토큰 저장 전 기존 토큰:', {
        hasExisting: !!existingToken,
        existingPrefix: existingToken?.substring(0, 20) + '...',
        newTokenPrefix: token.substring(0, 20) + '...',
        isSame: existingToken === token
      });
      
      localStorage.setItem('admin_access_token', token);
      
      const savedToken = localStorage.getItem('admin_access_token');
      devLog('🔑 [AdminAuthContext] 토큰 저장됨:', {
        id,
        tokenPrefix: token.substring(0, 20) + '...',
        tokenLength: token.length,
        savedCorrectly: savedToken === token,
        fullToken: token
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
      devLog('✅ [AdminAuthContext] 관리자 정보 저장:', {
        name: adminData.name,
        adminId: adminData.adminId,
        isRoot: adminData.isRoot
      });
    }
    
    // 마지막에 로그인 상태 변경
    setIsLoggedIn(true);
    
    devLog('✅ [AdminAuthContext] 로그인 완료:', {
      id,
      isLoggedIn: true,
      isRoot: isRoot !== undefined ? isRoot : false
    });
  };

  const logout = () => {
    devLog('🚪 [AdminAuthContext] 로그아웃 실행');
    
    // localStorage 먼저 삭제
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_isRoot');
    
    // adminStore 정보 삭제
    clearAdminInfo();
    
    // 상태 변경
    setIsLoggedIn(false);
    setIsRoot(false);
    
    devLog('✅ [AdminAuthContext] 로그아웃 완료');
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
