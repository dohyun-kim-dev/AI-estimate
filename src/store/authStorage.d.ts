type StoreAdminTokenProps = {
    id: string;
    accessToken: string;
};
/**
 * 관리자 로그인 토큰 및 ID를 localStorage에 저장
 */
export declare function storeAdminToken({ id, accessToken }: StoreAdminTokenProps): void;
/**
 * 관리자 토큰 제거 (로그아웃 등)
 */
export declare function clearAdminToken(): void;
export {};
