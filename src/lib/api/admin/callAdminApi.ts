import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { triggerAdminLogout } from '@/contexts/AdminAuthContext';
import { devLog } from '@/lib/utils/devLogger';
import { de } from 'date-fns/locale';

export async function callAdminApi<T = unknown>({
  title,
  url,
  body,
  method = 'POST',
  isCallPageLoader = false,
  isWithToken = false,
}: {
  title: string;
  url: string;
  body?: Record<string, unknown>;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  isCallPageLoader?: boolean;
  isWithToken?: boolean;
}): Promise<T[]> {
  // Company Code 설정
  let companyCode = 'heredot';  // 기본값
  const pathParts = window.location.pathname.split('/');
  const companyCodeIndex = pathParts.indexOf('aiclient') + 1;
  if (companyCodeIndex > 0 && pathParts.length > companyCodeIndex) {
    companyCode = pathParts[companyCodeIndex];
  }

devLog('url:', url);  
devLog('body:', JSON.stringify(body, null, 2));

  

  // 공통 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-company-code': companyCode,
  };

  // 로컬/HTTP 환경에서 토큰이 필요한 경우 localStorage에서 가져오기
  if (isWithToken && (import.meta.env.VITE_ENV_NAME === 'dev' || window.location.protocol === 'http:')) {
    const adminToken = localStorage.getItem('admin_access_token');
    console.log('🔑 [callAdminApi 토큰 체크]', {
      title,
      url,
      isWithToken,
      envName: import.meta.env.VITE_ENV_NAME,
      protocol: window.location.protocol,
      adminToken: adminToken ? 'exists' : 'not found'
    });
    devLog('🔑 [callAdminApi 토큰 체크]', {
      title,
      url,
      isWithToken,
      envName: import.meta.env.VITE_ENV_NAME,
      protocol: window.location.protocol,
      adminToken: adminToken ? 'exists' : 'not found'
    });
    
    if (adminToken) {
      // 서버가 기대하는 헤더명 사용 (admin_token으로 수정)
      headers['admin_token'] = adminToken;
      console.log('🔑 [admin_token 토큰 추가됨]', { admin_token: adminToken });
      devLog('🔑 [admin_token 토큰 추가됨]', { admin_token: adminToken });
    } else {
      devLog('⚠️ [토큰 없음] localStorage에 admin_access_token이 없습니다');
    }
  }

  let raw: any;

  // 'method' 값에 따라 다른 API 호출 함수를 사용
  try {
    if (method === 'GET') {
      raw = await callApiGet({
        title,
        url,
        isCallPageLoader,
        headers,
      });
    } else if (method === 'PUT') {
      raw = await callApiPut({
        title,
        url,
        body,
        isCallPageLoader,
        headers,
      });
    } else if (method === 'PATCH') {
      raw = await callApiPatch({
        title,
        url,
        body,
        isCallPageLoader,
        headers,
      });
    } else if (method === 'DELETE') {
      raw = await callApiDelete({
        title,
        url,
        isCallPageLoader,
        headers,
      });
    } else {
      // 기본적으로 POST를 사용
      raw = await callApiPost({
        title,
        url,
        body,
        isCallPageLoader,
        headers,
      });
    }
  } catch (error) {
    console.error('❌ [API 요청 에러]', error);
    devLog('❌ [API 요청 에러]', error);
    throw error;
  }

  // API 응답을 배열로 변환
  const responseArray = Array.isArray(raw) ? raw : [raw];

  // 401 에러 감지 (쿠키 인증에서도 유지)
  if (
    responseArray[0]?.statusCode === 401 &&
    (responseArray[0]?.message === 'token is invalid' || responseArray[0]?.message === 'Unauthorized')
  ) {
    triggerAdminLogout();
    return [];
  }

  // 응답이 배열이 아닌 경우 배열로 변환하여 처리
  return callNullCheck(responseArray);
}