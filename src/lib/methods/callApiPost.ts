import { pageLoaderController } from "@/contexts/PageLoaderContext";
import { devLog, devWarn } from "../utils/devLogger";
import { triggerAdminLogout } from "@/contexts/AdminAuthContext";
import { getCompanyCodeFromUrl } from "@/utils/companyUtils";
import { useAuthStore } from "@/store/authStore"; // ✅ 추가

interface CallApiPostParams {
  title: string;
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown> | FormData;
  isCallPageLoader?: boolean;
  loadingMessage?: string; // 추가: 로딩 메시지 커스터마이징
  headers?: Record<string, string>;
  isFormData?: boolean;
  accessToken?: string; // 추가
}

export async function callApiPost<T = unknown>({
  title,
  url,
  method = 'POST',
  body = {},
  isCallPageLoader = false,
  loadingMessage = 'Loading...',
  headers = {},
  isFormData = false,
  accessToken, // 추가
}: CallApiPostParams): Promise<{ data: any, headers: Headers }> {
  let fullUrl = url;

  // 배포 환경에서 API_HOST를 사용하여 완전한 URL을 구성합니다.
  // import.meta.env는 Vite가 환경 변수를 노출하는 방식입니다.
  // 개발 환경에서는 프록시가 있으므로 상대 경로를 사용합니다.
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  devLog(`📱 [${title}]`, fullUrl, body);
  if (isCallPageLoader) pageLoaderController.open(loadingMessage);

  let returnValue = '';

  try {
    // 🔥 매번 최신 companyCode를 가져오도록 수정
    const companyCode = getCompanyCodeFromUrl();
    
    devLog(`🔍 [callApiPost] Company Code 추출:`, companyCode);
    devLog(`🔍 [callApiPost] Current URL:`, window.location.href);
    devLog(`🔍 [callApiPost] Pathname:`, window.location.pathname);
    devLog(`🔍 [callApiPost] Search:`, window.location.search);
    
    const fetchOptions: RequestInit = {
      method,
      // credentials: 'include',
      mode: 'cors' as RequestMode,
    };

    // 상위에서 전달받은 헤더 사용
    fetchOptions.headers = { 
      'x-company-code': `${companyCode}`,
      ...headers 
    };
    
    devLog(`📤 [callApiPost] 최종 헤더:`, fetchOptions.headers);
    
    // JSON body인 경우 Content-Type 추가
    if (!isFormData && method !== 'GET') {
      (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    
    // accessToken이 있으면 Authorization 헤더 추가
    if (accessToken) {
      (fetchOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
    }
    
    // body 설정
    if (!isFormData && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    } else if (isFormData) {
      fetchOptions.body = body as FormData;
    }

    // 수정된 fullUrl 변수를 사용합니다.
    const response = await fetch(fullUrl, fetchOptions);

    devLog(`📱 [${title}] 응답 상태:`, response.status, response.statusText);
    if (response.status === 401) {
      devLog(`❌ [${title}] 인증 오류:`, response.status, response.statusText);
      
      // URL 경로에 따라 적절한 페이지로 리다이렉트
      const currentPath = window.location.pathname;
      
      // aiclient 경로 확인
      const aiclientMatch = currentPath.match(/\/aiclient\/([^/]+)/);
      if (aiclientMatch) {
        const companyCode = aiclientMatch[1];
        
        // ✅ authStore의 logout 함수 사용
        await useAuthStore.getState().logout();
        
        alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
        window.location.href = `/aiclient/${companyCode}/ai`;
        return;
      }
      
      // cms 경로 확인
      const cmsMatch = currentPath.match(/\/([^/]+)\/cms/);
      if (cmsMatch) {
        const companyCode = cmsMatch[1];
        triggerAdminLogout();
        alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
        window.location.href = `/${companyCode}/cms/login`;
        return;
      }
      
      // 기본: 슈퍼어드민 로그인
      triggerAdminLogout();
      alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
      window.location.href = '/superadmin/login';
    } else if (!response.ok) {
      devLog(`❌ [${title}] HTTP 에러:`, response.status, response.statusText);
    }

    returnValue = await response.text();
    devLog(`📱 [${title}] 응답 내용:`, returnValue);
    
    let parsedData;
    try {
      parsedData = JSON.parse(returnValue);
    } catch (e) {
      devWarn(`⚠️ [${title}] JSON 파싱 실패`, e);
      // JSON 파싱 실패 시에도 적절한 에러 구조 반환
      if (response.ok) {
        // 응답이 성공이지만 JSON이 아닌 경우 (예: HTML, 텍스트)
        parsedData = {
          statusCode: 200,
          data: returnValue, // 원본 텍스트 반환
          message: 'success'
        };
      } else {
        // 응답이 실패이고 JSON도 아닌 경우
        parsedData = {
          statusCode: response.status,
          error: {
            message: `HTTP ${response.status}: ${response.statusText}`,
            customMessage: returnValue || '알 수 없는 오류가 발생했습니다.'
          }
        };
      }
    }

    // 항상 { data, headers } 형태로 반환
    return { data: parsedData, headers: response.headers };
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러: 네트워크 문제 또는 CORS 정책 위반이 원인일 수 있습니다.`, error);
    return { 
      data: {
        statusCode: 500,
        error: {
          message: '네트워크 오류가 발생했습니다.',
          customMessage: '네트워크 연결을 확인해주세요.'
        }
      }, 
      headers: new Headers() 
    };
  } finally {
    if (isCallPageLoader) pageLoaderController.close();
  }
}
