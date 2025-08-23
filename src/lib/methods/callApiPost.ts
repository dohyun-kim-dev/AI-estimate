import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { devLog, devWarn } from "../utils/devLogger";

interface CallApiPostParams {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
}

export async function callApiPost<T = unknown>({
  title,
  url,
  method = 'POST',
  body = {},
  isCallPageLoader = false,
}: CallApiPostParams): Promise<T> {
  devLog(`📱 [${title}]`, url, body);
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 쿠키 인증으로 변경 - 액세스 토큰 제거
    // if (accessToken) {
    //   headers['Authorization'] = `Bearer ${accessToken}`;
    // }

    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
      credentials: 'include', // 쿠키를 포함하기 위해 추가
    });

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    
    if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러`, error);
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
