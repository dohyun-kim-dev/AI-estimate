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

  let companyCode = 'heredot';
  const pathParts = window.location.pathname.split('/');
  const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
  if (companyCodeIndex > 0 && pathParts.length > companyCodeIndex) {
    companyCode = pathParts[companyCodeIndex];
  }

  const headers = new Headers();
  if (companyCode) {
    headers.append('x-company-code', companyCode);
  }
  
  const headersAsRecord = Object.fromEntries(headers.entries());

  console.log(`[API Request] Title: ${title}`);
  console.log(`[API Request] Method: ${method}`);
  console.log(`[API Request] URL: ${url}`);
  if (body) {
    // FormData일 경우 `API Request Body: FormData {}`로 출력
    console.log('API Request Body:', body); 
  }
  console.log('API Request Headers:', headersAsRecord); 

  let response: any;
  
  if (method === 'GET') {
    response = await callApiGet({
      title,
      url,
      isCallPageLoader,
      headers: headersAsRecord, 
    });
  } else if (method === 'PUT') {
    response = await callApiPut({
      title,
      url,
      body,
      isCallPageLoader,
      headers: headersAsRecord, 
    });
  } else if (method === 'PATCH') {
    response = await callApiPatch({
      title,
      url,
      body,
      isCallPageLoader,
      headers: headersAsRecord, 
    });
  } else if (method === 'DELETE') {
    response = await callApiDelete({
      title,
      url,
      isCallPageLoader,
      headers: headersAsRecord, 
    });
  } else {
    // FormData 타입에 따른 조건부 처리
    const isFormData = body instanceof FormData;
    response = await callApiPost({
      title,
      url,
      body,
      isCallPageLoader,
      headers: headersAsRecord,
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