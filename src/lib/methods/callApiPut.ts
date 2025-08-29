// ✅ 수정된 callApiPut 함수 (callApiPost와 동일한 로직)
import { devLog, devWarn } from '../utils/devLogger';

interface CallApiPutParams {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
  headers?: Record<string, string>; // ⭐️ headers 매개변수 추가
}

export async function callApiPut({
  title,
  url,
  body = {},
  isCallPageLoader = false,
  headers = {}, // ⭐️ 기본값 설정
}: CallApiPutParams) {
  try {
    // 로더 표시 로직 (isCallPageLoader가 true일 경우)
    if (isCallPageLoader) {
      // 로더를 보여주는 함수 호출
    }

    // ⭐️ 전달받은 헤더를 기존 헤더와 병합
    const mergedHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers, // ⭐️ 전달받은 헤더를 병합
    };

    const response = await fetch(url, {
      method: 'PUT',
      headers: mergedHeaders, // ⭐️ 병합된 헤더 사용
      body: JSON.stringify(body),
    });

    const data = await response.json();
    devLog(`✨ ${title} 응답`, data);

    // 로더 숨김
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