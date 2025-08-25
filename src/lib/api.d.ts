interface CallApiPostParams {
    title: string;
    url: string;
    body?: Record<string, unknown>;
    isCallPageLoader?: boolean;
}
export declare function callApiPost<T = unknown>({ title, url, body, isCallPageLoader, }: CallApiPostParams): Promise<T>;
export {};
