import { callApiPost } from '@/lib/methods/callApiPost';
import { callApiGet } from '@/lib/methods/callApiGet';
import { callApiPut } from '@/lib/methods/callApiPut';
import { callApiPatch } from '@/lib/methods/callApiPatch';
import { callApiDelete } from '@/lib/methods/callApiDelete';
import { callNullCheck } from '@/lib/utils/nullChecker';
import { triggerAdminLogout } from '@/contexts/AdminAuthContext';
import { devLog } from '@/lib/utils/devLogger';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
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
  // Company Code 설정 - 유틸 함수 사용
  const companyCode = getCompanyCodeFromUrl();

devLog('🔍 [API 요청]', { title, method, url });  
devLog('📄 [요청 body]:', body);

  

  // 공통 헤더 설정
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-company-code': companyCode,
  };

  // 토큰이 필요한 경우 localStorage에서 가져오기
  if (isWithToken) {
    const adminToken = localStorage.getItem('admin_access_token');
    const adminStorage = localStorage.getItem('admin-storage');
    const currentPath = window.location.pathname;
    const isCompanyCMS = currentPath.match(/^\/([^\/]+)\/cms/);
    
    devLog('🔑 [callAdminApi 토큰 체크]', {
      title,
      url,
      isWithToken,
      envName: import.meta.env.VITE_ENV_NAME,
      protocol: window.location.protocol,
      adminToken: adminToken ? `exists (${adminToken.length} chars)` : 'not found',
      adminTokenPrefix: adminToken?.substring(0, 20) + '...',
      fullToken: adminToken,
      adminStorage: adminStorage ? 'exists' : 'not found',
      currentPath,
      isCompanyCMS: !!isCompanyCMS,
      localStorageKeys: Object.keys(localStorage)
    });
    
    if (adminToken) {
      if (isCompanyCMS) {
        // 회사별 CMS: Bearer 토큰 사용
        headers['Authorization'] = `Bearer ${adminToken}`;
        devLog('🔑 [company CMS Authorization 헤더 추가됨]', { 
          Authorization: `Bearer ${adminToken.substring(0, 20)}...`
        });
      } else {
        // 슈퍼어드민: Bearer 토큰 사용
        headers['Authorization'] = `Bearer ${adminToken}`;
        devLog('🔑 [super admin Authorization 헤더 추가됨]', { 
          Authorization: `Bearer ${adminToken.substring(0, 20)}...`
        });
      }
    } else {
      devLog('⚠️ [토큰 없음] localStorage에 admin_access_token이 없습니다');
      // 디버깅용: localStorage의 모든 키 확인
      const allKeys = Object.keys(localStorage);
      devLog('📦 [localStorage 키 목록]', allKeys);
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

  // 401/403/500 에러 감지 및 토큰 관련 에러 처리 (raw.data에서 실제 응답 추출)
  const response = raw?.data || raw;
  const isUnauthorized = response?.statusCode === 401;
  const isForbidden = response?.statusCode === 403;

  const unauthorizedMessages = [
    'token is invalid',
    'Unauthorized',
    'unauthorized',
    '시스템 관리자 인증이 필요합니다.',
    'Invalid token type for admin strategy',
    'Invalid token type for company strategy',  // 고객사 CMS용 추가
    'forbidden',
    '허가 받지 않은 접근입니다.'
  ];

  // 디버깅 로그 추가
  devLog('🔍 [인증 체크]', {
    statusCode: response?.statusCode,
    message: response?.message,
    errorCustomMessage: response?.error?.customMessage,
    hasError: !!response?.error,
    errorObject: response?.error
  });

  // 401, 403 에러이거나, 500 에러이면서 인증 관련 메시지가 있는 경우
  // ⚠️ 중요: statusCode가 401, 403 또는 500일 때만 메시지 체크
  const is401or403or500 = response?.statusCode === 401 || response?.statusCode === 403 || response?.statusCode === 500 
  
  const messageStr = String(response?.message || '');
  const customMessageStr = String(response?.error?.customMessage || '');
  
  let hasUnauthorizedMessage = false;
  if (is401or403or500) {
    hasUnauthorizedMessage = unauthorizedMessages.some(msg => 
      messageStr.includes(msg) || customMessageStr.includes(msg)
    );
  }
  
  const isTokenError = response?.statusCode === 500 && hasUnauthorizedMessage;
  
  const shouldLogout = isUnauthorized || isForbidden || isTokenError;

  devLog('🔍 [로그아웃 판단]', {
    isUnauthorized,
    isForbidden,
    isTokenError,
    hasUnauthorizedMessage,
    shouldLogout,
    is401or403or500,
    statusCode: response?.statusCode,
    messageStr,
    customMessageStr
  });

  if (shouldLogout) {
    devLog('🚫 [callAdminApi] 인증 에러 - 자동 로그아웃 처리', {
      statusCode: response?.statusCode,
      message: response?.message,
      customMessage: response?.error?.customMessage,
      adminId: localStorage.getItem('adminId')
    });
    triggerAdminLogout();
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin-storage');
    alert('인증이 만료되어 로그아웃되었습니다. 다시 로그인해 주세요.'); 
    return [];
  }

  // API 응답을 배열로 변환
  const responseArray = Array.isArray(raw) ? raw : [raw];

  // 응답이 배열이 아닌 경우 배열로 변환하여 처리
  return callNullCheck(responseArray);
}