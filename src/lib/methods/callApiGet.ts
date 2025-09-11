import { devLog, devWarn } from '@/lib/utils/devLogger';
import { pageLoaderController } from "@/contexts/PageLoaderContext";

export async function callApiGet<T = unknown>({
  title,
  url,
  isCallPageLoader = false,
  headers = {},
}: {
  title: string;
  url: string;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>;
}): Promise<T> {
  let fullUrl = url;

  // 배포 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  devLog(`🌐 [${title}]`, fullUrl);
  console.log(`🌐 [${title}] 요청 URL:`, fullUrl);
  console.log(`📋 [${title}] 요청 헤더:`, headers);
  
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const fetchOptions: RequestInit = {
      method: 'GET',
      credentials: 'include',
      mode: 'cors' as RequestMode,
      headers,
    };

    const response = await fetch(fullUrl, fetchOptions);

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    console.log(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    
    if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
      console.log(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);
    console.log(`📱 [${title}] 응답 내용:`, returnValue);
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    console.log(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    returnValue = '[]';
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }

  try {
    return JSON.parse(returnValue);
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
    console.log(`⚠️ [${title}] JSON 파싱 실패`, e);
    return [] as T;
  }
}