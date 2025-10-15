import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * URL에서 companyCode를 추출하는 Hook
 * /{companyCode}/cms 패턴에서 companyCode를 가져옵니다
 */
export const useCompanyCode = () => {
  const location = useLocation();
  
  const companyCode = useMemo(() => {
    const pathParts = location.pathname.split('/');
    // /{companyCode}/cms 패턴에서 companyCode 추출
    if (pathParts.length >= 3 && pathParts[2] === 'cms') {
      return pathParts[1];
    }
    return null;
  }, [location.pathname]);
  
  return companyCode;
};
