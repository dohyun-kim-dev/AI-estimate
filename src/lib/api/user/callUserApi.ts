import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { ApiResponse } from './userApi.types';
import { useAuthStore } from '@/store/authStore'; // ⭐️ useAuthStore 임포트

export async function callUserApi<T>({
  title,
  url,
  method = 'POST',
  body,
  isCallPageLoader = false,
}: {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  isCallPageLoader?: boolean;
}): Promise<ApiResponse<T>> {
  // ⭐️ zustand 스토어에서 user 정보 가져오기
  const user = useAuthStore.getState().user;
  // ⭐️ usingService 배열을 직접 가져오도록 수정
  const usingServices = user?.data?.usingService;

  // ⭐️ 헤더 객체 생성 및 조건부 추가
  const headers = new Headers();
  if (usingServices && usingServices.length > 0) {
    // ⭐️ 배열의 모든 값을 헤더에 추가 (쉼표로 구분)
    headers.append('x-company-code', usingServices.join(','));
  }

  let response: any;
  
  // 'method' 값에 따라 다른 API 호출 함수를 사용
  if (method === 'GET') {
    response = await callApiGet({
      title,
      url,
      isCallPageLoader,
      headers, // ⭐️ 헤더 전달
    });
  } else if (method === 'PUT') {
    response = await callApiPut({
      title,
      url,
      body,
      isCallPageLoader,
      headers, // ⭐️ 헤더 전달
    });
  } else if (method === 'PATCH') {
    response = await callApiPatch({
      title,
      url,
      body,
      isCallPageLoader,
      headers, // ⭐️ 헤더 전달
    });
  } else if (method === 'DELETE') {
    response = await callApiDelete({
      title,
      url,
      isCallPageLoader,
      headers, // ⭐️ 헤더 전달
    });
  } else {
    // 기본적으로 POST를 사용
    response = await callApiPost({
      title,
      url,
      body,
      isCallPageLoader,
      headers, // ⭐️ 헤더 전달
    });
  }

  // 401 에러 처리 (기존 로직 유지)
  if (response.statusCode === 401) {
    return response as ApiResponse<T>;
  }

  return response as ApiResponse<T>;
}
