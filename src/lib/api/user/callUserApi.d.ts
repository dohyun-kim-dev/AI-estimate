import { ApiResponse } from './userApi.types';
export declare function callUserApi<T>({ title, url, method, // 기본 메서드를 GET으로 변경하거나
body, isCallPageLoader, }: {
    title: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: Record<string, unknown>;
    isCallPageLoader?: boolean;
}): Promise<ApiResponse<T>>;
