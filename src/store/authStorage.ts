type StoreAdminTokenProps = {
  id: string;
  accessToken: string;
  isRoot?: boolean; // isRoot 추가
};
import { devLog } from '@/utils/devLogger'

/**
 * 관리자 로그인 토큰 및 ID를 localStorage에 저장
 */
export function storeAdminToken({ id, accessToken, isRoot }: StoreAdminTokenProps) {
  localStorage.setItem('adminId', id);
  localStorage.setItem('admin_access_token', accessToken);
  if (isRoot !== undefined) {
    localStorage.setItem('admin_isRoot', isRoot.toString());
  }
}

/**
 * 관리자 토큰 제거 (로그아웃 등)
 */
export function clearAdminToken() {
  localStorage.removeItem('adminId');
  localStorage.removeItem('admin_access_token');
  localStorage.removeItem('admin_isRoot');
}

/**
 * 관리자 isRoot 값을 가져오기
 */
export function getAdminIsRoot(): boolean {
  const isRoot = localStorage.getItem('admin_isRoot');
  const result = isRoot === 'true';
  
  devLog('📦 [authStorage] getAdminIsRoot 호출:', {
    localStorage_adminIsRoot: isRoot,
    parsedResult: result,
    typeOfStoredValue: typeof isRoot,
    allAdminItems: {
      adminId: localStorage.getItem('adminId'),
      adminToken: !!localStorage.getItem('admin_access_token'),
      adminIsRoot: localStorage.getItem('admin_isRoot'),
    }
  });
  
  return result;
}
  