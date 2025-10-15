import { devLog, devWarn } from '@/lib/utils/devLogger';
import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { triggerAdminLogout } from "@/contexts/AdminAuthContext";

export async function callApiPatch<T = unknown>({
  title,
  url,
  body = {},
  isCallPageLoader = false,
  headers = {},
  loadingMessage,
}: {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>;
  loadingMessage?: string;
}): Promise<{ data: any, headers: Headers }> {
  let fullUrl = url;

  // 배포 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  devLog(`📱 [${title}]`, fullUrl, body);
  if (isCallPageLoader) pageLoaderController.open(loadingMessage);

  let returnValue = '';
  let response: Response | null = null;

  try {
    const fetchOptions: RequestInit = {
      method: 'PATCH',
      credentials: 'include',
      mode: 'cors' as RequestMode,
      headers,
      body: JSON.stringify(body),
    };

    response = await fetch(fullUrl, fetchOptions);

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
     if (response.status === 401) {
      devLog(`❌ [${title}] 인증 오류:`, response.status, response.statusText);
      triggerAdminLogout();
      alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
      
      // URL에 'cms'가 포함되어 있으면 회사별 CMS 로그인으로, 아니면 슈퍼어드민 로그인으로
      const currentPath = window.location.pathname;
      const cmsMatch = currentPath.match(/\/([^/]+)\/cms/);
      
      if (cmsMatch) {
        const companyCode = cmsMatch[1];
        window.location.href = `/${companyCode}/cms/login`;
      } else {
        window.location.href = '/superadmin/login';
      }
    } else if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    returnValue = '[]';
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }

  try {
    const parsedData = JSON.parse(returnValue);
    return { data: parsedData, headers: response?.headers || new Headers() };
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
    return { data: [], headers: new Headers() };
  }
}