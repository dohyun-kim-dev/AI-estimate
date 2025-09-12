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
  try {
    const user = useAuthStore.getState().user;
    const usingServices = user?.usingService;

    
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
    console.log('[API Request]', {
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
        response = await callApiGet({
          title,
          url,
          isCallPageLoader,
          headers, 
        });
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
            headers, 
          });
        }
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
          body: body as Record<string, unknown> | FormData,
          isCallPageLoader,
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

    console.log(`[API Response] Title: ${title}`);
    console.log('API Response:', response);

    // HTTP 상태 코드에 따른 에러 처리
    if (response.statusCode >= 400) {
      let errorMessage = '알 수 없는 오류가 발생했습니다.';
      
      switch (response.statusCode) {
        case 400:
          errorMessage = '잘못된 요청입니다. 입력값을 확인해주세요.';
          break;
        case 401:
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
          break;
        case 403:
          errorMessage = '접근 권한이 없습니다.';
          break;
        case 404:
          errorMessage = '요청한 리소스를 찾을 수 없습니다.';
          break;
        case 408:
          errorMessage = '요청 시간이 초과되었습니다. 다시 시도해주세요.';
          break;
        case 413:
          errorMessage = '업로드 파일 크기가 너무 큽니다.';
          break;
        case 422:
          errorMessage = '입력 데이터 형식이 올바르지 않습니다.';
          break;
        case 429:
          errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 500:
          errorMessage = '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 502:
          errorMessage = '서버 게이트웨이 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 503:
          errorMessage = '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 504:
          errorMessage = '서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
          break;
        default:
          if (response.statusCode >= 500) {
            errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
          } else if (response.statusCode >= 400) {
            errorMessage = '요청 처리 중 오류가 발생했습니다.';
          }
          break;
      }

      console.error(`[API Error] ${title}: ${response.statusCode} - ${errorMessage}`);
      
      return {
        statusCode: response.statusCode,
        message: errorMessage,
        data: null as T,
        metadata: null,
        error: {
          statusCode: response.statusCode,
          message: response.message || 'API Error',
          customMessage: errorMessage
        }
      };
    }

    // 성공 응답인 경우
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response as ApiResponse<T>;
    }

    // 기타 상태 코드 처리
    return {
      statusCode: response.statusCode || 500,
      message: response.message || '알 수 없는 응답입니다.',
      data: response.data || null as T,
      metadata: response.metadata || null,
      error: null
    };

  } catch (error) {
    console.error('[API Unexpected Error]', error);
    
    // 예기치 않은 에러 처리
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    
    return {
      statusCode: 500,
      message: '예기치 않은 오류가 발생했습니다.',
      data: null as T,
      metadata: null,
      error: {
        statusCode: 500,
        message: errorMessage,
        customMessage: '예기치 않은 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      }
    };
  }
}