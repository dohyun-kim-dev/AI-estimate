type StoreAdminTokenProps = {
    id: string;
    accessToken: string;
  };
  
  /**
   * 관리자 로그인 토큰 및 ID를 localStorage에 저장
   */
  export function storeAdminToken({ id, accessToken }: StoreAdminTokenProps) {
    localStorage.setItem('adminId', id);
    localStorage.setItem('admin_access_token', accessToken);
  }
  
  /**
   * 관리자 토큰 제거 (로그아웃 등)
   */
  export function clearAdminToken() {
    localStorage.removeItem('adminId');
    localStorage.removeItem('admin_access_token');
  }
  