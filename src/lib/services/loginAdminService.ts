import { adminLogin, adminLoginWithHeaders } from '@/lib/api/admin';
import { getLoginStatus } from '@/lib/utils/apiLoginStatus';
import { handleLoginStatus } from '@/lib/utils/handleLoginStatus';
import { devError, devWarn } from '@lib/utils/devLogger';
import { devLog } from '@/utils/devLogger';
import type { AdminInfo } from '@/store/adminStore';

type LoginAdminServiceParams = {
  id: string;
  password: string;
  showMessage?: (msg: string) => void;
  onSuccess?: (result: { id: string; token?: string; isRoot?: boolean; adminData?: AdminInfo }) => void;
};

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
    receiveAlimtalk?: boolean;
    receiveEmail?: boolean;
    memo?: string;
    createAt?: string;
    lastLoginAt?: string;
    updateBy?: string;
    [key: string]: unknown;
  };
}

/**
 * 관리자 로그인 서비스 / Admin login flow
 */
export async function loginAdminService({
  id,
  password,
  showMessage = (msg) => alert(msg),
  onSuccess,
}: LoginAdminServiceParams) {
  try {
    // 헤더도 함께 받을 수 있는 로그인 함수 사용
    const response = await adminLoginWithHeaders({ userId: id, password });
    devWarn('로그인 응답:', response);

    // 응답 데이터 추출
    const responseData = response.data as LoginResponse;
    const message = responseData?.message ?? 'unknown';
    const status = getLoginStatus(message);

    // 토큰 추출 시도 - 우선순위: 헤더 > 응답 데이터
    let token: string | undefined;
    
    // 1. 헤더에서 토큰 찾기
    const authHeader = response.headers.get('authorization') || response.headers.get('Authorization');
    const adminTokenHeader = response.headers.get('admin_token') || response.headers.get('admin-token');
    
    if (authHeader) {
      token = authHeader.replace('Bearer ', '');
    } else if (adminTokenHeader) {
      token = adminTokenHeader;
    }
    
    // 2. 응답 데이터에서 토큰 찾기
    if (!token && responseData?.data) {
      token = responseData.data.token || responseData.data.accessToken;
    }

    // 3. 관리자 정보 추출
    const adminData = responseData?.data;
    const isRoot = adminData?.isRoot;

    // AdminInfo 객체 생성
    let adminInfo: AdminInfo | undefined;
    if (adminData && adminData._id && adminData.adminId && adminData.name) {
      adminInfo = {
        _id: adminData._id,
        adminId: adminData.adminId,
        name: adminData.name,
        email: adminData.email || '',
        cellphone: adminData.cellphone || '',
        isRoot: adminData.isRoot || false,
        receiveAlimtalk: adminData.receiveAlimtalk || false,
        receiveEmail: adminData.receiveEmail || false,
        memo: adminData.memo || undefined,
        createAt: adminData.createAt || '',
        lastLoginAt: adminData.lastLoginAt || '',
        updateBy: adminData.updateBy || ''
      };
    }

    devLog('� [loginAdminService] 로그인 응답 처리:', {
      hasResponseData: !!responseData,
      hasData: !!responseData?.data,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'null',
      isRoot: isRoot,
      adminInfo: adminInfo ? {
        name: adminInfo.name,
        adminId: adminInfo.adminId,
        isRoot: adminInfo.isRoot
      } : null,
      status: response.status
    });

    handleLoginStatus({
      status,
      message,
      showMessage,
      onSuccess: () => {
        // ✅ 토큰 저장
        if (token) {
          localStorage.setItem('admin_access_token', token);
          devLog('🔐 [loginAdminService] 관리자 토큰 저장 완료:', token.substring(0, 10) + '...');
        } else {
          devWarn('⚠️ [loginAdminService] 토큰이 없습니다');
        }
        
        // ✅ 외부로 로그인 정보 전달 (관리자 데이터 포함)
        onSuccess?.({ id, token, isRoot, adminData: adminInfo });
      },
      onFail: () => {
        devWarn('로그인 실패:', message);
      },
    });
  } catch (error) {
    devError('로그인 요청 중 오류 발생:', error);
    showMessage('로그인 중 오류가 발생했습니다.');
  }
}
