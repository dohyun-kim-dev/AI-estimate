import { getEstimateRequestList, getSiteEstimateRequestList } from '@/lib/api/admin/adminApi';
import { EstimateRequestGetListParams, SiteEstimateRequestGetListParams } from '@/lib/api/admin/adminApi.types';
import { getAdminIsRoot } from '@/store/authStorage';
import { devLog } from '@/utils/devLogger'

/**
 * 관리자 권한에 따라 적절한 상담요청 조회 API를 호출하는 함수
 * @param params 공통 파라미터 (keyword, fromDate, toDate)
 * @param companyCode 회사 코드 (사이트관리자의 경우 필수)
 * @returns API 응답
 */
export async function getEstimateRequestListByRole(
  params: {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
  },
  companyCode?: string
) {
  const isRoot = getAdminIsRoot();
  
  devLog('🔧 [adminApiRouter] getEstimateRequestListByRole 호출:', {
    params,
    companyCode,
    isRoot,
    localStorage_adminIsRoot: localStorage.getItem('admin_isRoot'),
    getAdminIsRoot_result: getAdminIsRoot(),
  });
  
  if (isRoot) {
    // 통합관리자인 경우
    const apiParams: EstimateRequestGetListParams = {
      ...params,
      companyCode, // 통합관리자는 companyCode를 쿼리 파라미터로 사용
    };
    
    devLog('🔧 [통합관리자] 상담요청 조회 API 호출:', apiParams);
    return await getEstimateRequestList(apiParams);
  } else {
    // 사이트관리자인 경우
    if (!companyCode) {
      throw new Error('사이트관리자는 companyCode가 필수입니다.');
    }
    
    const apiParams: SiteEstimateRequestGetListParams = {
      ...params,
      companyCode, // 사이트관리자는 companyCode를 헤더로 사용
    };
    
    devLog('🔧 [사이트관리자] 상담요청 조회 API 호출:', apiParams);
    return await getSiteEstimateRequestList(apiParams);
  }
}

/**
 * 현재 로그인한 관리자가 통합관리자인지 확인하는 함수
 * @returns 통합관리자 여부
 */
export function isIntegratedAdmin(): boolean {
  return getAdminIsRoot();
}

/**
 * 현재 로그인한 관리자가 사이트관리자인지 확인하는 함수
 * @returns 사이트관리자 여부
 */
export function isSiteAdmin(): boolean {
  return !getAdminIsRoot();
}
