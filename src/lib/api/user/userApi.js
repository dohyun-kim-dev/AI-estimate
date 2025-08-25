// src/lib/api/userApi.ts (예시)
import { callUserApi } from './callUserApi'; // 수정된 callUserApi
// BASE_URL은 환경 변수 등으로 정의되어 있어야 합니다.
const BASE_URL = '/api';
// ***************** 약관 관련
/**
 * @description 약관 목록을 가져오는 API 호출 함수
 * @returns {ApiResponse} 약관 목록 데이터
 */
export async function termsGetList() {
    return callUserApi({
        title: '약관 목록 조회',
        url: `${BASE_URL}/terms?language=KOR`, // 👈 API URL에 language 쿼리 추가
        method: 'GET', // GET 메서드 사용
        isCallPageLoader: true,
    });
}
// ***************** 소셜 로그인 관련 (기존 코드 유지)
export async function googleLoginInitial(params) {
    return callUserApi({
        title: '구글 로그인 초기화',
        url: `${BASE_URL}/users/login/google`,
        method: 'POST',
        body: {
            providerId: params.providerId,
        },
        isCallPageLoader: true,
    });
}
export async function googleLoginUpdate(params) {
    return callUserApi({
        title: '구글 로그인 정보 업데이트',
        url: `${BASE_URL}/users/login/google`,
        method: 'POST',
        body: {
            providerId: params.providerId,
            name: params.name,
            email: params.email,
            profileImage: params.profileImage,
            cellphone: params.cellphone,
        },
        isCallPageLoader: true,
    });
}
