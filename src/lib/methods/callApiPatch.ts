import { devLog, devWarn } from '@/lib/utils/devLogger'; // devWarn 추가

// headers 매개변수 추가
export async function callApiPatch({
  title,
  url,
  body = {}, // body 기본값 설정
  isCallPageLoader = false,
  headers = {}, // ⭐️ 추가
}: {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>; // ⭐️ 추가
}) {
  try {
    if (isCallPageLoader) {
      // 로더를 보여주는 함수 호출
    }

    // ⭐️ 전달받은 헤더와 기본 헤더를 병합합니다.
    const mergedHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json', // 추가
      ...headers, // ⭐️ 전달받은 헤더를 덮어씁니다.
    };

    const response = await fetch(url, {
      method: 'PATCH',
      headers: mergedHeaders, // ⭐️ 병합된 헤더 사용
      body: JSON.stringify(body),
      credentials: 'include', // 추가
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