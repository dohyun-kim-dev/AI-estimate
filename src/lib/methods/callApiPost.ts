// src/lib/methods/callApiPost.ts

import { requestPost } from '@/lib/methods/requestPost';
import { ApiResponse } from '@/lib/types/ApiResponse';
import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { devLog, devWarn } from "../utils/devLogger";

interface CallApiPostParams {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData; // FormData 타입 포함
  isCallPageLoader?: boolean;
  headers?: Record<string, string>;
  isFormData?: boolean; 
}

export async function callApiPost<T = unknown>({
  title,
  url,
  method = 'POST',
  body = {},
  isCallPageLoader = false,
  headers = {},
  isFormData = false,
}: CallApiPostParams): Promise<T> {
  devLog(`📱 [${title}]`, url, body);
  if (isCallPageLoader) pageLoaderController.open();

  let returnValue = '';

  try {
    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
    };

    // FormData가 아닌 경우에만 Content-Type을 JSON으로 설정
    if (!isFormData) {
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      };
      fetchOptions.body = method !== 'GET' ? JSON.stringify(body) : undefined;
    } else {
      // FormData인 경우, Content-Type은 브라우저가 자동으로 multipart/form-data로 설정
      fetchOptions.headers = headers;
      fetchOptions.body = body as FormData;
    }

    const response = await fetch(url, fetchOptions);

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    
    if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러`, error);
    returnValue = '[]';
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }

  try {
    return JSON.parse(returnValue);
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
    return [] as T;
  }
}