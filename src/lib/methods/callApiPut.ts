import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { devLog, devWarn } from '../utils/devLogger';

interface CallApiPutParams {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>;
}

export async function callApiPut<T = unknown>({
  title,
  url,
  body = {},
  isCallPageLoader = false,
  headers = {},
}: CallApiPutParams): Promise<{ data: any, headers: Headers }> {
  let fullUrl = url;

  // 배포 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  devLog(`� [${title}]`, fullUrl, body);
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const fetchOptions: RequestInit = {
      method: 'PUT',
      credentials: 'include',
      mode: 'cors' as RequestMode,
      headers,
      body: JSON.stringify(body),
    };

    const response = await fetch(fullUrl, fetchOptions);

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    
    if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);

    let parsedData;
    try {
      parsedData = JSON.parse(returnValue);
    } catch (e) {
      devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
      parsedData = {};
    }

    return { data: parsedData, headers: response.headers };
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    return { data: {}, headers: new Headers() };
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }
}