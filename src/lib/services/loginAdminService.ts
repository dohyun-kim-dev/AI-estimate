import { adminLogin, adminLoginWithHeaders } from '@/lib/api/admin';
import { getLoginStatus } from '@/lib/utils/apiLoginStatus';
import { handleLoginStatus } from '@/lib/utils/handleLoginStatus';
import { devError, devWarn } from '@lib/utils/devLogger';

type LoginAdminServiceParams = {
  id: string;
  password: string;
  showMessage?: (msg: string) => void;
  onSuccess?: (result: { id: string; token?: string; isRoot?: boolean }) => void;
};

interface LoginResponse {
  message?: string;
  statusCode?: number;
  data?: {
    adminId?: string;
    token?: string;
    accessToken?: string;
    isRoot?: boolean; // isRoot 추가
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

    // 3. isRoot 값 추출
    const isRoot = responseData?.data?.isRoot;

    console.log('🔍 [loginAdminService] 토큰 추출 결과:', {
      hasResponseData: !!responseData,
      hasData: !!responseData?.data,
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 10) + '...' : 'null',
      isRoot: isRoot,
      isRootType: typeof isRoot,
      authHeader: !!authHeader,
      adminTokenHeader: !!adminTokenHeader,
      dataKeys: responseData?.data ? Object.keys(responseData.data) : [],
      status: response.status
    });

    console.log('📋 [loginAdminService] onSuccess 콜백 호출 예정:', {
      id,
      hasToken: !!token,
      isRoot,
      isRootType: typeof isRoot
    });

    handleLoginStatus({
      status,
      message,
      showMessage,
      onSuccess: () => {
        // ✅ 외부로 로그인 정보 전달 (context login에서 처리)
        onSuccess?.({ id, token, isRoot });
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
