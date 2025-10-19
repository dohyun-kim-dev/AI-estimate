/**
 * 현재 URL에서 회사 코드를 추출하는 함수
 * 지원하는 패턴:
 * - /aiclient/{companyCode}/...
 * - /{companyCode}/cms/...
 * 
 * @returns {string} 회사 코드 (기본값: 'heredot')
 */
export function getCompanyCodeFromUrl(): string {
  // 브라우저 환경이 아닌 경우 기본값 반환
  if (typeof window === 'undefined') {
    return '';
  }

  const pathname = window.location.pathname;
  
  // /aiclient/{companyCode}/... 패턴 매칭
  const aiClientMatch = pathname.match(/^\/aiclient\/([^\/]+)/);
  if (aiClientMatch) {
    return aiClientMatch[1];
  }
  
  // /{companyCode}/cms 패턴 매칭
  const cmsMatch = pathname.match(/^\/([^\/]+)\/cms/);
  if (cmsMatch) {
    return cmsMatch[1];
  }
  
  // 기본값으로 'heredot' 반환
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
