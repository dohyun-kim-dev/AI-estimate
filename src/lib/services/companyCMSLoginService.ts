/**
 * Company CMS 로그인 서비스
 */

import { companyCMSLogin } from '@/lib/api/companyApi';
import { devLog } from '@/lib/utils/devLogger';

export interface CompanyCMSLoginServiceParams {
  id: string;
  password: string;
  showMessage: (msg: string) => void;
  onSuccess: (response: any) => void;
}

export async function companyCMSLoginService({
  id,
  password,
  showMessage,
  onSuccess,
}: CompanyCMSLoginServiceParams) {
  try {
    devLog('🔐 [Company CMS Login] 로그인 시도:', { id });

    const response = await companyCMSLogin({
      userId: id,
      password,
    });

    devLog('📡 [Company CMS Login] API 응답:', response);

    // callAdminApi는 배열로 응답을 감싸므로 첫 번째 요소 추출
    const actualResponse = Array.isArray(response) ? response[0] : response;
    
    if ((actualResponse as any)?.data?.statusCode === 200) {
      devLog('✅ [Company CMS Login] 로그인 성공');
      const responseData = (actualResponse as any).data.data;
      onSuccess({
        id: responseData.id,
        token: responseData.token,
        isRoot: responseData.isRoot,
        adminData: responseData.adminData,
      });
    } else {
      const errorMessage = (actualResponse as any)?.data?.message || '로그인에 실패했습니다.';
      devLog('❌ [Company CMS Login] 로그인 실패:', errorMessage);
      showMessage(errorMessage);
    }
  } catch (error: any) {
    devLog('💥 [Company CMS Login] 에러 발생:', error);
    
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        '네트워크 오류가 발생했습니다.';
    showMessage(errorMessage);
  }
}
