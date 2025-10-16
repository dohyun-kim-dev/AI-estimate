import { useEffect } from 'react';
import { useCompanyStore } from '@/store/companyStore';
import { getCompanyInfo } from '@/lib/api/user/userApi';
import { useToast } from '@/components/common/ToastProvider';

export const useCompanyInfo = () => {
  const { companyInfo, isLoading, error, setCompanyInfo, setLoading, setError } = useCompanyStore();
  const { error: showError } = useToast();

  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCompanyInfo();
      
      if (response.statusCode === 200 && response.data) {
        setCompanyInfo(response.data);
      } else {
        const errorMessage = response.error?.customMessage || '회사 정보를 불러오는데 실패했습니다.';
        setError(errorMessage);
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = '회사 정보 조회 중 오류가 발생했습니다.';
      setError(errorMessage);
      showError(errorMessage);
      console.error('회사 정보 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCompanyInfo = () => {
    fetchCompanyInfo();
  };

  return {
    companyInfo,
    isLoading,
    error,
    fetchCompanyInfo,
    refreshCompanyInfo,
  };
};
