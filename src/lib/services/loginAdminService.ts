import { adminLogin } from '@/lib/api/admin';
import { getLoginStatus } from '@/lib/utils/apiLoginStatus';
import { handleLoginStatus } from '@/lib/utils/handleLoginStatus';
import { devError, devWarn } from '@lib/utils/devLogger';

type LoginAdminServiceParams = {
  id: string;
  password: string;
  showMessage?: (msg: string) => void;
  onSuccess?: (result: { id: string }) => void;
};

interface LoginResponse {
  message?: string;
  statusCode?: number;
  data?: unknown;
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
    const response = await adminLogin({ userId: id, password });
    devWarn('로그인 응답:', response);

    // 응답이 배열인 경우 첫 번째 항목 사용
    const responseData = (Array.isArray(response) ? response[0] : response) as LoginResponse;
    const message = responseData?.message ?? 'unknown';
    const status = getLoginStatus(message);

    handleLoginStatus({
      status,
      message,
      showMessage,
      onSuccess: () => {
        // ✅ 외부로 로그인 정보 전달 (context login에서 처리)
        onSuccess?.({ id });
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
