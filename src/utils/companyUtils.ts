/**
 * 현재 URL에서 회사 코드를 추출하는 함수
 * @returns {string} 회사 코드 (기본값: 'heredot')
 */
export function getCompanyCodeFromUrl(): string {
  // 브라우저 환경이 아닌 경우 기본값 반환
  if (typeof window === 'undefined') {
    return 'heredot';
  }

  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  
  // /aiclient/{companyCode} 패턴에서 companyCode 추출
  const aiclientIndex = parts.indexOf('aiclient');
  if (aiclientIndex !== -1 && parts.length > aiclientIndex + 1) {
    return parts[aiclientIndex + 1];
  }
  
  // 기본값으로 'heredot' 반환
  return 'heredot';
}
