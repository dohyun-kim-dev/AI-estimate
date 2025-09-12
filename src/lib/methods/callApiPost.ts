import { requestPost } from '@/lib/methods/requestPost';
import { ApiResponse } from '@/lib/types/ApiResponse';
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
}

export async function callApiPost<T = unknown>({
  title,
  url,
  method = 'POST',
  body = {},
  isCallPageLoader = false,
  headers = {},
  isFormData = false,
}: CallApiPostParams): Promise<T> {
  let fullUrl = url;

  // 프로덕션 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  // 개발 환경에서는 프록시가 있으므로 상대 경로를 사용합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    const API_HOST = (import.meta.env.VITE_API_HOST || 'https://aigopartners.com').replace(/\/$/, '')
    // URL이 /api로 시작하면 제거하여 중복 방지
    const cleanUrl = url.replace(/^\/api/, '')
    fullUrl = `${API_HOST}${cleanUrl}`;
  }

  devLog(`📱 [${title}]`, fullUrl, body);
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const fetchOptions: RequestInit = {
      method,
      credentials: 'include', // 쿠키를 항상 포함
      mode: 'cors' as RequestMode,
    };

    // 상위에서 전달받은 헤더 사용
    fetchOptions.headers = headers;
    
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
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    returnValue = '[]';
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }

  try {
    return JSON.parse(returnValue);
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
    return [] as T;
  }
}
