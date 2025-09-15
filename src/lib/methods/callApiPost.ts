import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { devLog, devWarn } from "../utils/devLogger";

interface CallApiPostParams {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>;
  isFormData?: boolean;
  accessToken?: string; // 추가
}

export async function callApiPost<T = unknown>({
  title,
  url,
  method = 'POST',
  body = {},
  isCallPageLoader = false,
  headers = {},
  isFormData = false,
  accessToken, // 추가
}: CallApiPostParams): Promise<{ data: any, headers: Headers }> {
  let fullUrl = url;

  // 배포 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  // import.meta.env는 Vite가 환경 변수를 노출하는 방식입니다.
  // 개발 환경에서는 프록시가 있으므로 상대 경로를 사용합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  devLog(`📱 [${title}]`, fullUrl, body);
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const fetchOptions: RequestInit = {
      method,
      // credentials: 'include',
      mode: 'cors' as RequestMode,
    };

    // 상위에서 전달받은 헤더 사용
    fetchOptions.headers = { 
      'x-company-code': 'heredot',
      ...headers 
    };
    
    // JSON body인 경우 Content-Type 추가
    if (!isFormData && method !== 'GET') {
      (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    
    // accessToken이 있으면 Authorization 헤더 추가
    if (accessToken) {
      (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // body 설정
    if (!isFormData && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    } else if (isFormData) {
      fetchOptions.body = body as FormData;
    }

    // 수정된 fullUrl 변수를 사용합니다.
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

    // 항상 { data, headers } 형태로 반환
    return { data: parsedData, headers: response.headers };
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    return { data: [], headers: new Headers() };
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }
}
