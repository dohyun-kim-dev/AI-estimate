import { ApiLoginStatus } from '@lib/utils/apiLoginStatus';
type HandleLoginStatusProps = {
    status: ApiLoginStatus;
    message: string;
    onSuccess: () => void;
    onFail?: () => void;
    showMessage?: (msg: string) => void;
};
export declare function handleLoginStatus({ status, message, onSuccess, onFail, showMessage, }: HandleLoginStatusProps): void;
export {};
