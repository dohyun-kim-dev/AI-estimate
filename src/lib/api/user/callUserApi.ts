// src/lib/api/user/callUserApi.ts

import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { ApiResponse } from './userApi.types';
import { useAuthStore } from '@/store/authStore';

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
  body?: Record<string, unknown> | FormData; 
  isCallPageLoader?: boolean;
}): Promise<ApiResponse<T>> {
  const user = useAuthStore.getState().user;
  const usingServices = user?.data?.usingService;

  // Company Code 설정
  let companyCode = 'heredot';  // 기본값
  
  // URL에서 company code 추출 시도
  const pathParts = window.location.pathname.split('/');
  const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
  if (companyCodeIndex > 0 && pathParts.length > companyCodeIndex) {
    companyCode = pathParts[companyCodeIndex];
  }
  
  console.log('[Company Code]', {
    path: window.location.pathname,
    pathParts,
    companyCodeIndex,
    finalCompanyCode: companyCode
  });

  // 공통 헤더 설정
  const commonHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-company-code': companyCode
  };

  // FormData 여부에 따른 헤더 설정
  const isFormData = body instanceof FormData;
  const headers = isFormData ? 
    { 'x-company-code': companyCode } : 
    { ...commonHeaders };

  // API 요청 정보 로깅
  console.log('[API Request]', {
    title,
    method,
    url,
    companyCode,
    headers,
    body: body instanceof FormData ? 'FormData {}' : body
  });

  let response: any;
  
  if (method === 'GET') {
    response = await callApiGet({
      title,
      url,
      isCallPageLoader,
      headers, 
    });
  } else if (method === 'PUT') {
    response = await callApiPut({
      title,
      url,
      body,
      isCallPageLoader,
      headers, 
    });
  } else if (method === 'PATCH') {
    response = await callApiPatch({
      title,
      url,
      body,
      isCallPageLoader,
      headers, 
    });
  } else if (method === 'DELETE') {
    response = await callApiDelete({
      title,
      url,
      isCallPageLoader,
      headers, 
    });
  } else {
    // FormData 타입에 따른 조건부 처리
    const isFormData = body instanceof FormData;
    response = await callApiPost({
      title,
      url,
      body,
      isCallPageLoader,
      headers,
      isFormData, // isFormData 플래그 전달
    });
  }

  console.log(`[API Response] Title: ${title}`);
  console.log('API Response:', response);

  if (response.statusCode === 401) {
    return response as ApiResponse<T>;
  }

  return response as ApiResponse<T>;
}