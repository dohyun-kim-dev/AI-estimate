export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    metadata: unknown | null;
    error: {
        statusCode: number;
        message: string;
        customMessage?: string;
    } | null;
}
export interface GoogleLoginInitialParams {
    providerId: string;
}
export interface GoogleLoginUpdateParams {
    providerId: string;
    name: string;
    email: string;
    profileImage: string;
    cellphone: string;
}
export interface GoogleLoginResponse {
    _id: string;
    providerId: string;
    createAt: string;
    profileImage?: string;
    email?: string;
    name?: string;
    usingService: string[];
    isNew: boolean;
}
