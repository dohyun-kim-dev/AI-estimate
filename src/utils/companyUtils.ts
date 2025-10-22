import { devLog } from "./devLogger";


/**
 * 현재 URL에서 회사 코드를 추출하는 함수
 * 지원하는 패턴:
 * 1. URL 파라미터의 companyCode (최우선) - ?companyCode=heredot
 * 2. /aiclient/{companyCode}/...
 * 3. /{companyCode}/cms/...
 * 
 * @returns {string} 회사 코드 (기본값: '')
 */
export function getCompanyCodeFromUrl(): string {
  // 브라우저 환경이 아닌 경우 기본값 반환
  if (typeof window === 'undefined') {
    return '';
  }

  // 1. URL 파라미터에서 companyCode 추출 (최우선)
  const urlParams = new URLSearchParams(window.location.search);
  const companyCodeParam = urlParams.get('companyCode');
  if (companyCodeParam) {
    devLog('🔍 [companyUtils] URL 파라미터에서 추출:', companyCodeParam);
    return companyCodeParam;
  }

  const pathname = window.location.pathname;
  
  // 2. /aiclient/{companyCode}/... 패턴 매칭
  const aiClientMatch = pathname.match(/^\/aiclient\/([^\/]+)/);
  if (aiClientMatch) {
    devLog('🔍 [companyUtils] aiclient 경로에서 추출:', aiClientMatch[1]);
    return aiClientMatch[1];
  }
  
  // 3. /{companyCode}/cms 패턴 매칭
  const cmsMatch = pathname.match(/^\/([^\/]+)\/cms/);
  if (cmsMatch) {
    devLog('🔍 [companyUtils] cms 경로에서 추출:', cmsMatch[1]);
    return cmsMatch[1];
  }
  
  // 기본값으로 빈 문자열 반환
  devLog('🔍 [companyUtils] 회사 코드를 찾을 수 없음 - 빈 문자열 반환');
  return '';
}

/**
 * API 요청용 company code 헤더를 생성합니다
 * @returns x-company-code 헤더 객체
 */
export const getCompanyHeaders = (): Record<string, string> => {
  const companyCode = getCompanyCodeFromUrl();
  return { 'x-company-code': companyCode };
};
