/**
 * Company CMS 로그인 서비스
 */

import { companyCMSLogin } from '@/lib/api/admin/adminApi';
import { devLog, devWarn, devError } from '@/lib/utils/devLogger';

export interface CompanyCMSLoginServiceParams {
  id: string;
  password: string;
  showMessage: (msg: string) => void;
  onSuccess: (response: any) => void;
  skipLocalStorage?: boolean; // OTP 인증을 위해 localStorage 저장을 건너뛸지 여부
}

interface LoginResponse {
  message?: string;
  statusCode?: number;
  data?: {
    _id?: string;
    adminId?: string;
    name?: string;
    email?: string;
    cellphone?: string;
    token?: string;
    accessToken?: string;
    isRoot?: boolean;
    companyCode?: string;
    receiveAlimtalk?: boolean;
    receiveEmail?: boolean;
    memo?: string;
    createAt?: string;
    lastLoginAt?: string;
    [key: string]: unknown;
  };
  error?: {
    statusCode?: number;
    message?: string;
    customMessage?: string;
  };
}

export async function companyCMSLoginService({
  id,
  password,
  showMessage,
  onSuccess,
  skipLocalStorage = false, // 기본값: localStorage에 저장
}: CompanyCMSLoginServiceParams) {
  try {
    devLog('🔐 [Company CMS Login] 로그인 시도:', { id, skipLocalStorage });

    const response = await companyCMSLogin({
      userId: id,
      password,
    });

    devLog('📡 [Company CMS Login] API 응답:', response);

    // 응답 데이터 추출
    const responseData = response.data as LoginResponse;
    const statusCode = responseData?.statusCode || response.status;

    if (statusCode === 200 && responseData?.data) {
      devLog('✅ [Company CMS Login] 로그인 성공');
      
      // 토큰 추출 - 회사별 CMS는 company_admin_token 헤더 사용
      let token: string | undefined;
      const companyAdminTokenHeader = response.headers.get('company_admin_token') || response.headers.get('Company-Admin-Token');
      const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
      const adminTokenHeader = response.headers.get('admin_token') || response.headers.get('admin-token');
      
      if (companyAdminTokenHeader) {
        token = companyAdminTokenHeader;
      } else if (authHeader) {
        token = authHeader.replace('Bearer ', '');
      } else if (adminTokenHeader) {
        token = adminTokenHeader;
      } else if (responseData.data) {
        token = responseData.data.token || responseData.data.accessToken;
      }

      // 토큰 저장 (skipLocalStorage가 false일 때만)
      if (token && !skipLocalStorage) {
        localStorage.setItem('admin_access_token', token);
        devLog('🔐 [Company CMS Login] 관리자 토큰 저장 완료');
      } else if (token && skipLocalStorage) {
        devLog('🔐 [Company CMS Login] OTP 모드 - 토큰 저장 건너뜀 (임시 보관)');
      }

      // admin-storage에 관리자 정보 저장 (skipLocalStorage가 false일 때만)
      const adminData = responseData.data;
      const adminStorageData = {
        adminId: adminData.adminId || id,
        name: adminData.name || '',
        email: adminData.email || '',
        cellphone: adminData.cellphone || '',
        isRoot: adminData.isRoot || false,
        companyCode: adminData.companyCode || '',
        memo: adminData.memo || '',
        receiveAlimtalk: adminData.receiveAlimtalk || false,
        receiveEmail: adminData.receiveEmail || false,
        createAt: adminData.createAt || '',
        lastLoginAt: adminData.lastLoginAt || '',
        _id: adminData._id || ''
      };
      
      if (!skipLocalStorage) {
        localStorage.setItem('admin-storage', JSON.stringify(adminStorageData));
        devLog('💾 [Company CMS Login] admin-storage 저장:', adminStorageData);
      } else {
        devLog('💾 [Company CMS Login] OTP 모드 - admin-storage 저장 건너뜀');
      }

      onSuccess({
        id: adminData.adminId || id,
        token: token,
        isRoot: adminData.isRoot || false,
        adminData: adminStorageData,
      });
    } else {
      // 에러 처리
      const errorMessage = responseData?.error?.customMessage || 
                          responseData?.error?.message || 
                          responseData?.message || 
                          '로그인에 실패했습니다.';
      devLog('❌ [Company CMS Login] 로그인 실패:', errorMessage);
      showMessage(errorMessage);
    }
  } catch (error: any) {
    devError('💥 [Company CMS Login] 에러 발생:', error);
    
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        '네트워크 오류가 발생했습니다.';
    showMessage(errorMessage);
  }
}
