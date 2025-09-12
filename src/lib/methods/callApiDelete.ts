import { devLog, devWarn } from '@/lib/utils/devLogger'; // devWarn 추가

// headers 매개변수 추가
export async function callApiDelete({
  title,
  url,
  isCallPageLoader = false,
  headers = {}, // ⭐️ 추가
}: {
  title: string;
  url: string;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>; // ⭐️ 추가
}) {
  try {
    if (isCallPageLoader) {
      // 로더를 보여주는 함수 호출
    }

    // 프로덕션 환경에서 API URL 구성
    let fullUrl = url;
    if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
      const API_HOST = (import.meta.env.VITE_API_HOST || 'https://aigopartners.com').replace(/\/$/, '')
      // URL이 /api로 시작하면 제거하여 중복 방지
      const cleanUrl = url.replace(/^\/api/, '')
      fullUrl = `${API_HOST}${cleanUrl}`;
    }
    
    // ⭐️ 전달받은 헤더와 기본 헤더를 병합합니다.
    const mergedHeaders = {
      'Accept': 'application/json', // 추가
      ...headers, // ⭐️ 전달받은 헤더를 덮어씁니다.
    };

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers: mergedHeaders, // ⭐️ 병합된 헤더 사용
      credentials: 'include', // 쿠키를 항상 포함
      mode: 'cors', // CORS 모드 명시
    });

    const data = await response.json();
    devLog(`✨ ${title} 응답`, data);

    if (isCallPageLoader) {
      // 로더를 숨기는 함수 호출
    }

    return data;
  } catch (error) {
    console.error(`❌ ${title} 오류:`, error);
    if (isCallPageLoader) {
      // 로더를 숨기는 함수 호출
    }
    throw error;
  }
}