import { callApiPost } from './callApiPost';
import { getToken, removeToken } from '@/lib/utils/tokenUtils';
import { devLog } from '@/lib/utils/devLogger';

export async function callUserApi<T = any>({
  title,
  url,
  method = 'POST',
  body,
  isCallPageLoader = false,
  reqHeaders = {},
}: {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, any> | FormData; // 🔥 FormData 타입 추가
  isCallPageLoader?: boolean;
  reqHeaders?: Record<string, string>;
}): Promise<T> {
  const token = getToken("user");
  const accessToken = token ?? undefined;

  // 🔥 FormData 여부 감지
  const isFormData = body instanceof FormData;

  const { data, headers } = await callApiPost({
    title,
    url,
    method,
    body,
    accessToken,
    isCallPageLoader,
    headers: reqHeaders,
    isFormData, // 🔥 FormData 플래그 전달
  });

  // 401 에러 감지 및 처리 (개선된 로직)
  if (data && (
    data.statusCode === 401 || 
    (data.error && data.error.statusCode === 401) ||
    (Array.isArray(data) && data[0]?.statusCode === "401" && data[0]?.message === "token is invalid")
  )) {
    devLog('🚫 토큰 만료 또는 무효 - 자동 로그아웃 처리');
    removeToken("user");
    
    // 인증이 필요한 페이지에서 로그인 페이지로 리다이렉트할지 결정
    // 또는 전역 상태 업데이트로 로그인 모달 표시
    if (typeof window !== 'undefined') {
      // 현재 페이지가 보호된 경로인지 확인
      const protectedPaths = ['/my-estimate', '/profile', '/admin'];
      const currentPath = window.location.pathname;
      
      if (protectedPaths.some(path => currentPath.includes(path))) {
        // 보호된 페이지에서는 홈으로 리다이렉트
        window.location.href = '/';
      } else {
        // 일반 페이지에서는 페이지 새로고침으로 상태 초기화
        window.location.reload();
      }
    }
  }

  // 항상 { data, headers } 형태로 반환
  return { ...data, headers } as T;
}
