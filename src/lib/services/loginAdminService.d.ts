type LoginAdminServiceParams = {
    id: string;
    password: string;
    showMessage?: (msg: string) => void;
    onSuccess?: (result: {
        id: string;
    }) => void;
};
/**
 * 관리자 로그인 서비스 / Admin login flow
 */
export declare function loginAdminService({ id, password, showMessage, onSuccess, }: LoginAdminServiceParams): Promise<void>;
export {};
