import { ApiStatus } from '@lib/utils/apiStatus';
type HandleApiStatusProps = {
    status: ApiStatus;
    customMessageIfAny: string;
    onSuccess: () => void;
    onFail?: () => void;
    onNoData?: () => void;
    onUnknown?: () => void;
    customUI?: (message: string) => void;
};
export declare function handleApiStatus({ status, customMessageIfAny, onSuccess, onFail, onNoData, onUnknown, customUI, }: HandleApiStatusProps): void;
export {};
