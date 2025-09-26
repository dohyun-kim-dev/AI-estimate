// 전역 인증 에러 처리 유틸리티

export function handleAuthError(statusCode: number, errorMessage?: string): boolean {
  const isAuthError = 
    statusCode === 401 || 
    statusCode === 403 ||
    errorMessage?.includes('token') ||
    errorMessage?.includes('unauthorized') ||
    errorMessage?.includes('forbidden') ||
    errorMessage?.includes('토큰') ||
    errorMessage?.includes('인증');

  if (isAuthError) {
    console.warn('인증 에러 감지:', { statusCode, errorMessage });
    
    // 인증 정보 초기화
    localStorage.removeItem('auth-storage');
    sessionStorage.removeItem('auth-storage');
    
    // companyCode 추출
    const companyCode = resolveCompanyCode();
    
    // 현재 URL 저장 (로그인 후 돌아오기 위해)
    const currentPath = window.location.pathname + window.location.search;
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    console.log('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
    
    // aiclient/{companyCode}로 리다이렉트
    setTimeout(() => {
      window.location.href = `/aiclient/${companyCode}`;
    }, 100);
    
    return true; // 처리됨을 표시
  }
  
  return false; // 처리되지 않음
}

function resolveCompanyCode(): string {
  let companyCode = 'heredot';
  try {
    const parts = window.location.pathname.split('/');
    const idx = parts.indexOf('aiclient') + 1;
    if (idx > 0 && parts.length > idx) {
      companyCode = parts[idx];
    }
  } catch (error) {
    console.warn('companyCode 추출 실패, 기본값 사용:', error);
  }
  return companyCode;
}

// API 응답 인터셉터 - 모든 API 응답에 대해 인증 에러를 체크
export function interceptApiResponse(data: any): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // 다양한 에러 형태 처리
  const statusCode = data.statusCode || data.status;
  const errorMessage = 
    data.error?.message || 
    data.error?.customMessage || 
    data.message || 
    data.error;

  return handleAuthError(statusCode, errorMessage);
}
