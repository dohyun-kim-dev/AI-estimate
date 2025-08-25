import { GoogleLoginInitialParams, GoogleLoginUpdateParams, GoogleLoginResponse } from './userApi.types';
import { ApiResponse } from './userApi.types';
/**
 * @description 약관 목록을 가져오는 API 호출 함수
 * @returns {ApiResponse} 약관 목록 데이터
 */
export declare function termsGetList(): Promise<ApiResponse<unknown>>;
export declare function googleLoginInitial(params: GoogleLoginInitialParams): Promise<ApiResponse<GoogleLoginResponse>>;
export declare function googleLoginUpdate(params: GoogleLoginUpdateParams): Promise<ApiResponse<GoogleLoginResponse>>;
