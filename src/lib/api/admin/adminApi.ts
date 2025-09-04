import { callAdminApi } from './callAdminApi';
import {
  AdminLoginParams,
  AdminGetListParams,
  AdminCreateParams,
  AdminUpdateParams,
  TermGetListParams,
  PromptGetListParams,
  PromptHistoryGetListParams,
  PromptUpdateParams,
  AdminPasswordUpdateParams,
  UnitPriceGetListParams,
} from './adminApi.types';

// API URL 생성 헬퍼 함수
const getBaseUrl = () => {
  const ENV_NAME = import.meta.env.VITE_ENV_NAME;
  return '/api';
  // if (ENV_NAME === 'dev') {
  //   // 개발 환경: /api 프리픽스 사용
  //   return '/api';
  // } else {
  //   // 운영 환경: 직접 API 서버로 요청
  //   return 'https://api.aigopartners.com';
  // }
};

const BASE_URL = getBaseUrl();

// ***************** 인증 관련

export async function adminLogin(
  params: AdminLoginParams) {
  return callAdminApi({
    title: '로그인',
    url: `${BASE_URL}/cms/login`,
    body: { adminId: params.userId, password: params.password },
    isCallPageLoader: true,
  });
}

// ***************** 관리자

export async function   adminGetList(params: AdminGetListParams) {
  const queryParams = new URLSearchParams();
  
  // 필수 파라미터
  queryParams.append('isRoot', params.isRoot.toString());
  
  // 선택적 파라미터들
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if(params.companyCode) queryParams.append('companyCode', params.companyCode);


  return callAdminApi({
    title: params.isRoot ? '슈퍼 관리자 목록' : '고객사 관리자 목록',
    url: `${BASE_URL}/cms/admins?${queryParams.toString()}`,
    method: 'GET',
    isCallPageLoader: true,
  });
}

export async function adminCreate(
  params: AdminCreateParams) {

    console.log('params', params);

  const requestBody: any = {
    adminId: params.adminId,
    password: params.password,
    name: params.name,
    email: params.email,
    cellphone: params.cellphone,
    memo: params.memo || null,
  };

  // companyCode가 있으면 추가 (고객사 관리자 생성)
  if (params.companyCode) {
    requestBody.companyCode = params.companyCode;
  }

  // emailYn, smsYn이 있으면 추가
  if (params.emailYn) {
    requestBody.emailYn = params.emailYn;
  }
  if (params.smsYn) {
    requestBody.smsYn = params.smsYn;
  }

  return callAdminApi({
    title: params.companyCode ? '고객사 관리자 생성' : '통합 관리자 생성',
    url: `${BASE_URL}/cms/admins`,
    method: 'POST',
    body: requestBody,
    isCallPageLoader: true,
  });
} 

//test0521 a!111111
//관리자 수정
export async function adminUpdate(params: AdminUpdateParams) {
  // body에 들어갈 데이터 객체 생성
  const requestBody: any = {
    name: params.name,
    email: params.email,
    cellphone: params.cellphone,
    memo: params.description || null, // description을 memo로 매핑
  };

  // password 필드는 선택적이므로, 존재할 때만 추가
  if (params.password) {
    requestBody.password = params.password;
  }

  // companyCode 필드도 선택적이므로, 존재할 때만 추가
  if (params.companyCode) {
    requestBody.companyCode = params.companyCode;
  }

  // 이메일 및 SMS 수신 여부 필드 추가
  if (params.emailYn) {
    requestBody.emailYn = params.emailYn;
  }
  if (params.smsYn) {
    requestBody.smsYn = params.smsYn;
  }

  return callAdminApi({
    title: '관리자 수정',
    url: `${BASE_URL}/cms/admins/${params.targetAdminId}`, // URL에 :id 부분 추가
    method: 'PATCH', // PUT 메서드로 변경
    body: requestBody,
    isCallPageLoader: true,
  });
}

export async function adminPasswordUpdate(
  params: AdminPasswordUpdateParams) {
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
export async function termUpdate(params: TermGetListParams) {
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

export async function promptGetList(
  params: PromptGetListParams) {
  return callAdminApi({
    title: '프롬프트 목록',
    url: `${BASE_URL}/cms/ai/prompt/get-list`,
    body: { keyword: params.keyword },
    isCallPageLoader: true,
  });
}
export async function promptHistoryGetList(
  params: PromptHistoryGetListParams) {
  return callAdminApi({
    title: '프롬프트 히스토리 목록',
    url: `${BASE_URL}/cms/ai/prompt/history/get-list`,
    body: { index: params.index },
    isCallPageLoader: true,
  });
}

export async function promptUpdate(
  params: PromptUpdateParams) {
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
export async function unitPriceGetList(
  params: UnitPriceGetListParams) {
  return callAdminApi({
    title: '단가 리스트 조회',
    url: `${BASE_URL}/cms/ai/unit-price/get-list`,
    isCallPageLoader: true,
  });
}