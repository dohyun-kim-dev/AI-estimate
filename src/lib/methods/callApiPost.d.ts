interface CallApiPostParams {
    title: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: Record<string, unknown>;
    isCallPageLoader?: boolean;
}
export declare function callApiPost<T = unknown>({ title, url, method, body, isCallPageLoader, }: CallApiPostParams): Promise<T>;
export {};
