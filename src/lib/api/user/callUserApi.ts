// src/lib/api/user/callUserApi.ts

import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { ApiResponse } from './userApi.types';
import { useAuthStore } from '@/store/authStore';
import { interceptApiResponse } from '@/utils/authHandler';
import { devLog } from '@/utils/devLogger';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';

export async function callUserApi<T>({
  title,
  url,
  method = 'POST',
  body,
  isCallPageLoader = false,
  loadingMessage,
}: {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData; 
  isCallPageLoader?: boolean;
  loadingMessage?: string;
}): Promise<ApiResponse<T>> {
  try {
    const user = useAuthStore.getState().user;
    const usingServices = user?.usingService;

    
    // Company Code 설정
    let companyCode = '';  // 기본값
    
    // URL에서 company code 추출 시도
    const pathParts = window.location.pathname.split('/');
    const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
    if (companyCodeIndex > 0 && pathParts.length > companyCodeIndex) {
      companyCode = pathParts[companyCodeIndex];
    }
    
    devLog('[Company Code]', {
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

    // user_token 추가
    const userToken = localStorage.getItem('user_token');
    if (userToken) {
      commonHeaders['user_token'] = userToken;
    }

    // FormData 여부에 따른 헤더 설정
    const isFormData = body instanceof FormData;
    const headers = isFormData ? 
      { 'x-company-code': companyCode } : 
      { ...commonHeaders };

    // user_token이 빈 값일 경우 헤더에서 제거
    if (headers['user_token'] === '') {
      delete headers['user_token'];
    }

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      mode: 'cors',
      headers,
    };

    // body 타입에 따른 처리
    if (!isFormData && body && typeof body === 'object') {
      fetchOptions.body = JSON.stringify(body);
    } else if (isFormData && body instanceof FormData) {
      fetchOptions.body = body;
    }

    // API 요청 정보 로깅
    devLog('[API Request]', {
      title,
      method,
      url,
      companyCode,
      headers,
      body: body instanceof FormData ? 'FormData {}' : body
    });

    let response: any;
    
    try {
      if (method === 'GET') {
        // GET 요청을 직접 fetch로 처리
        const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_HOST}${url}`;
        const directResponse = await fetch(fullUrl, {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
          headers,
        });
        const responseText = await directResponse.text();
        try {
          const parsedData = JSON.parse(responseText);
          response = {
            statusCode: directResponse.status,
            data: parsedData,
            headers: directResponse.headers,
            message: 'Success'
          };
        } catch (e) {
          // JSON 파싱 실패 시 텍스트 그대로 반환 (HTML 응답 등)
          response = {
            statusCode: directResponse.status,
            data: responseText,
            headers: directResponse.headers,
            message: 'Success'
          };
        }
      } else if (method === 'PUT') {
        // FormData인 경우 직접 fetch 사용
        if (isFormData && body instanceof FormData) {
          const fetchOptions: RequestInit = {
            method: 'PUT',
            credentials: 'include',
            mode: 'cors',
            headers: { 'x-company-code': companyCode },
            body: body,
          };
          const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_HOST}${url}`;
          const directResponse = await fetch(fullUrl, fetchOptions);
          const responseText = await directResponse.text();
          try {
            response = JSON.parse(responseText);
            response.statusCode = directResponse.status;
          } catch (e) {
            response = { 
              statusCode: directResponse.status, 
              message: responseText, 
              data: null, 
              error: null 
            };
          }
        } else {
          response = await callApiPut({
            title,
            url,
            body: body as Record<string, unknown>,
            isCallPageLoader,
            loadingMessage,
            headers, 
          });
        }
      } else if (method === 'PATCH') {
        // FormData인 경우 직접 fetch 사용
        if (isFormData && body instanceof FormData) {
          const fetchOptions: RequestInit = {
            method: 'PATCH',
            credentials: 'include',
            mode: 'cors',
            headers: { 'x-company-code': companyCode },
            body: body,
          };
          const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_HOST}${url}`;
          const directResponse = await fetch(fullUrl, fetchOptions);
          const responseText = await directResponse.text();
          try {
            response = JSON.parse(responseText);
            response.statusCode = directResponse.status;
          } catch (e) {
            response = { 
              statusCode: directResponse.status, 
              message: responseText, 
              data: null, 
              error: null 
            };
          }
        } else {
          response = await callApiPatch({
            title,
            url,
            body: body as Record<string, unknown>,
            isCallPageLoader,
            loadingMessage,
            headers, 
          });
        }
      } else if (method === 'DELETE') {
        response = await callApiDelete({
          title,
          url,
          isCallPageLoader,
          loadingMessage,
          headers, 
        });
      } else {
        // FormData 타입에 따른 조건부 처리
        const isFormData = body instanceof FormData;
        response = await callApiPost({
          title,
          url,
          body: body as Record<string, unknown> | FormData,
          isCallPageLoader,
          loadingMessage,
          headers,
          isFormData, // isFormData 플래그 전달
        });
      }
    } catch (networkError) {
      console.error('[API Network Error]', networkError);
      
      // 네트워크 에러 처리
      return {
        statusCode: 0,
        message: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.',
        data: null as T,
        metadata: null,
        error: {
          statusCode: 0,
          message: 'Network Error',
          customMessage: '네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.'
        }
      };
    }
  } catch (error) {
    console.error('❌ [API 호출 에러]', error);
    devLog('❌ [API 호출 에러]', error);
    throw error;
  }
}