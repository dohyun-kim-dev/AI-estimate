import { callAdminApi } from './callAdminApi';
const BASE_URL = '/api';
// ***************** 인증 관련
export async function adminLogin(params) {
    return callAdminApi({
        title: '로그인',
        url: `${BASE_URL}/cms/login`,
        body: { adminId: params.userId, password: params.password },
        isCallPageLoader: true,
    });
}
// ***************** 관리자
export async function adminGetList(params) {
    const queryParams = new URLSearchParams();
    if (params.keyword)
        queryParams.append('keyword', params.keyword);
    if (params.fromDate)
        queryParams.append('fromDate', params.fromDate);
    if (params.toDate)
        queryParams.append('toDate', params.toDate);
    return callAdminApi({
        title: '관리자 목록',
        url: `${BASE_URL}/cms/admins${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        method: 'GET',
        isCallPageLoader: true,
    });
}
export async function adminCreate(params) {
    console.log('params', params);
    return callAdminApi({
        title: '관리자 생성',
        url: `${BASE_URL}/cms/admin/create`,
        body: {
            adminId: params.adminId,
            password: params.password,
            name: params.name,
            cellphone: params.cellphone,
            description: params.description,
            email: params.email,
            emailYn: params.emailYn,
            smsYn: params.smsYn,
        },
        isCallPageLoader: true,
    });
}
//test0521 a!111111
export async function adminUpdate(params) {
    console.log('params', params);
    return callAdminApi({
        title: '관리자 수정',
        url: `${BASE_URL}/cms/admin/update`,
        body: {
            targetAdminId: params.targetAdminId,
            name: params.name,
            cellphone: params.cellphone,
            description: params.description,
            email: params.email,
            emailYn: params.emailYn,
            smsYn: params.smsYn,
        },
        isCallPageLoader: true,
    });
}
export async function adminPasswordUpdate(params) {
    return callAdminApi({
        title: '관리자 비밀번호 수정',
        url: `${BASE_URL}/cms/admin/password/update`,
        body: {
            targetAdminId: params.targetAdminId,
            password: params.password,
        },
        isCallPageLoader: true,
    });
}
// ***************** 약관
export async function termGetList() {
    return callAdminApi({
        title: '약관 목록',
        url: `${BASE_URL}/cms/terms`,
        method: 'GET', // GET 방식으로 변경
        isCallPageLoader: true,
    });
}
// 약관 수정 (PUT) 또는 생성 (POST)
export async function termUpdate(params) {
    const isCreate = params.index === undefined || params.index === null; // index가 없으면 생성으로 판단
    const url = isCreate
        ? `${BASE_URL}/cms/terms`
        : `${BASE_URL}/cms/terms?id=${params.index}`;
    const method = isCreate ? 'POST' : 'PUT';
    return callAdminApi({
        title: '약관 수정/생성',
        url: url,
        method: method,
        body: {
            content: params.content,
            language: params.language, // language는 요청 바디에 포함
        },
        isCallPageLoader: true,
    });
}
// ***************** 프롬프트
export async function promptGetList(params) {
    return callAdminApi({
        title: '프롬프트 목록',
        url: `${BASE_URL}/cms/ai/prompt/get-list`,
        body: { keyword: params.keyword },
        isCallPageLoader: true,
    });
}
export async function promptHistoryGetList(params) {
    return callAdminApi({
        title: '프롬프트 히스토리 목록',
        url: `${BASE_URL}/cms/ai/prompt/history/get-list`,
        body: { index: params.index },
        isCallPageLoader: true,
    });
}
export async function promptUpdate(params) {
    return callAdminApi({
        title: '프롬프트 수정',
        url: `${BASE_URL}/cms/ai/prompt/update`,
        body: {
            index: params.index,
            content: params.content,
        },
        isCallPageLoader: true,
    });
}
// ***************** 가격
export async function unitPriceGetList(params) {
    return callAdminApi({
        title: '단가 리스트 조회',
        url: `${BASE_URL}/cms/ai/unit-price/get-list`,
        isCallPageLoader: true,
    });
}
