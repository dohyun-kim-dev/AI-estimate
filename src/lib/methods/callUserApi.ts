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


  // 401 에러 감지 및 처리
  if (
    Array.isArray(data) &&
    data[0]?.statusCode === "401" &&
    data[0]?.message === "token is invalid"
  ) {
    removeToken("user");
    // 페이지 새로고침으로 context 업데이트
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  // 항상 { data, headers } 형태로 반환
  return { ...data, headers } as T;
}
