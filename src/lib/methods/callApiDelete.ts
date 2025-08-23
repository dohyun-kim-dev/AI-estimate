import { devLog } from '@/lib/utils/devLogger';

export async function callApiDelete({
  title,
  url,
  isCallPageLoader = false,
}: {
  title: string;
  url: string;
  isCallPageLoader?: boolean;
}) {
  try {
    if (isCallPageLoader) {
      // 로더를 보여주는 함수 호출
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      // DELETE는 보통 바디가 없지만, 서버에 따라 바디를 포함할 수도 있음
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