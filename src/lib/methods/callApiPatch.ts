import { devLog } from '@/lib/utils/devLogger';

export async function callApiPatch({
  title,
  url,
  body,
  isCallPageLoader = false,
}: {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
}) {
  try {
    if (isCallPageLoader) {
      // 로더를 보여주는 함수 호출
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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