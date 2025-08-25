export declare function callAdminApi<T = unknown>({ title, url, body, method, isCallPageLoader, }: {
    title: string;
    url: string;
    body?: Record<string, unknown>;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    isCallPageLoader?: boolean;
}): Promise<T[]>;
