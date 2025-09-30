import { callAdminApi } from './callAdminApi';
import { devLog } from '@/lib/utils/devLogger';
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
  AllUnitPricesParams,
  CompanyGetListParams,
  UnitPriceUploadParams,
  UserGetListParams,
  AIPromptGetListParams,
  AIPromptCreateParams,
  AIPromptUpdateParams,
  AIPromptDeleteParams,
  UserUpdateParams,
  CompanyCreateParams,
  CompanyUpdateParams,
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

// 헤더 정보도 함께 반환하는 로그인 함수
export async function adminLoginWithHeaders(
  params: AdminLoginParams) {
  const url = `${BASE_URL}/cms/login`;
  const body = { adminId: params.userId, password: params.password };
  
  // 환경에 따른 URL 설정
  let fullUrl = url;
  if (import.meta.env.VITE_ENV_NAME !== 'dev' && !url.startsWith('http')) {
    fullUrl = `${import.meta.env.VITE_API_HOST}${url}`;
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-company-code': 'heredot',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json();
    
    return {
      data: data,
      headers: response.headers,
      status: response.status,
    };
  } catch (error) {
    console.error('로그인 API 에러:', error);
    throw error;
  }
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
    isWithToken: true, // 토큰 필요
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

  // receiveEmail, receiveAlimtalk이 있으면 추가 (boolean 값이므로 !== undefined로 체크)
  if (params.receiveEmail !== undefined) {
    requestBody.receiveEmail = params.receiveEmail;
  }
  if (params.receiveAlimtalk !== undefined) {
    requestBody.receiveAlimtalk = params.receiveAlimtalk;
  }

  return callAdminApi({
    title: params.companyCode ? '고객사 관리자 생성' : '통합 관리자 생성',
    url: `${BASE_URL}/cms/admins`,
    method: 'POST',
    body: requestBody,
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
} 

//test0521 a!111111
//관리자 수정
export async function adminUpdate(params: AdminUpdateParams) {
  // body에 들어갈 데이터 객체 생성 (변경된 필드만 포함)
  const requestBody: any = {};

  // 각 필드를 개별적으로 체크하여 값이 있을 때만 추가
  if (params.name !== undefined) {
    requestBody.name = params.name;
  }
  if (params.email !== undefined) {
    requestBody.email = params.email;
  }
  if (params.cellphone !== undefined) {
    requestBody.cellphone = params.cellphone;
  }
  if (params.description !== undefined) {
    requestBody.memo = params.description || null; // description을 memo로 매핑
  }

  // password 필드는 선택적이므로, 존재할 때만 추가
  if (params.password !== undefined) {
    requestBody.password = params.password;
  }

  // companyCode 필드도 선택적이므로, 존재할 때만 추가
  if (params.companyCode !== undefined) {
    requestBody.companyCode = params.companyCode;
  }

  // 이메일 및 SMS 수신 여부 필드 추가 (boolean 값이므로 !== undefined로 체크)
  if (params.receiveEmail !== undefined) {
    requestBody.receiveEmail = params.receiveEmail;
  }
  if (params.receiveAlimtalk !== undefined) {
    requestBody.receiveAlimtalk = params.receiveAlimtalk;
  }

  return callAdminApi({
    title: '관리자 수정',
    url: `${BASE_URL}/cms/admins/${params._id}`, // URL에 :id 부분 추가
    method: 'PATCH', // PUT 메서드로 변경
    body: requestBody,
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

export async function adminPasswordUpdate(
  params: AdminPasswordUpdateParams) {
  return callAdminApi({
    title: '관리자 비밀번호 수정',
    url: `${BASE_URL}/cms/admin/password/update`,
    body: {
      targetAdminId: params._id,
      password: params.password,
    },
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

//관리자 삭제 요청바디 옵셔널하게     "companyCode": "" // 옵션

export async function adminDelete(_id: string) {  
  return callAdminApi({
    title: '관리자 삭제',
    url: `${BASE_URL}/cms/admins/${_id}`,
    body:{
      // companyCode: companyCode || undefined
    },
    method: 'DELETE',
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}


// ***************** 약관
export async function termGetList() {
  return callAdminApi({
    title: '약관 목록',
    url: `${BASE_URL}/cms/terms`,
    method: 'GET', // GET 방식으로 변경
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

// 약관 수정 (PUT) 또는 생성 (POST)
export async function termUpdate( index: number, params: TermGetListParams) {
  return callAdminApi({
    title: "약관 생성",
    url: `${BASE_URL}/api/cms/terms?index=${index}`,
    method: "PUT",
    body: params,
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
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
    isWithToken: true, // 토큰 필요
  });
}
export async function promptHistoryGetList(
  params: PromptHistoryGetListParams) {
  return callAdminApi({
    title: '프롬프트 히스토리 목록',
    url: `${BASE_URL}/cms/ai/prompt/history/get-list`,
    body: { index: params.index },
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
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
    isWithToken: true, // 토큰 필요
  });
}

// ***************** 가격
export async function unitPriceGetList(
  params: UnitPriceGetListParams) {
  return callAdminApi({
    title: '단가 리스트 조회',
    url: `${BASE_URL}/cms/ai/unit-price/get-list`,
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

// 모든 단가 조회 API
export async function getAllUnitPrices(
  params: AllUnitPricesParams = {}) {
  const queryParams = new URLSearchParams();
  
  // companyCode 파라미터 (필수)
  if (params.companyCode) {
    queryParams.append('companyCode', params.companyCode);
  }
  
  // 선택적 파라미터들
  if (params.keyword) {
    queryParams.append('keyword', params.keyword); 
  }
  
  // fromDate, toDate 처리 (기본값 설정)
  const fromDate = params.fromDate || '2025-01-01';
  const toDate = params.toDate || '2025-12-31';
  queryParams.append('fromDate', fromDate);
  queryParams.append('toDate', toDate);

  const queryString = queryParams.toString();
  console.log("query url",queryParams.toString());
  const url = `${BASE_URL}/cms/unit-prices?${queryString}`;

  return callAdminApi({
    title: '모든 단가 조회',
    url: url,
    method: 'GET',
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

// ***************** 고객사

// 고객사 생성 API
export async function createCompany(params: CompanyCreateParams) {
  return callAdminApi({
    title: '고객사 생성',
    url: `${BASE_URL}/cms/company`,
    method: 'POST',
    body: params,
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// 고객사 수정 API
export async function updateCompany(companyCode: string, params: CompanyUpdateParams) {
  // undefined 값들을 제거한 body 객체 생성
  const body = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== undefined)
  );

  return callAdminApi({
    title: '고객사 수정',
    url: `${BASE_URL}/cms/company?companyCode=${companyCode}`,
    method: 'PATCH',
    body: body,
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// 고객 회원 목록 조회 API
export async function getUserList(
  params: UserGetListParams = {}) {
  const queryParams = new URLSearchParams();
  
  // 선택적 파라미터들
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);
  if (params.companyCode) queryParams.append('companyCode', params.companyCode);

  const queryString = queryParams.toString();
  const url = `${BASE_URL}/cms/users${queryString ? `?${queryString}` : ''}`;

  try {
    devLog('🚀 [getUserList API 호출]', { params, url });
    
    const result = await callAdminApi({
      title: '고객 회원 목록 조회',
      url: url,
      method: 'GET',
      isCallPageLoader: true,
      isWithToken: true,
    });
    
    devLog('✅ [getUserList API 응답]', result);
    return result;
  } catch (error) {
    devLog('❌ [getUserList API 에러]', error);
    throw error;
  }
}

// 모든 고객사 조회 API
export async function getCompanyList(
  params: CompanyGetListParams = {}) {
  const queryParams = new URLSearchParams();
  
  // 선택적 파라미터들
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.fromDate) queryParams.append('fromDate', params.fromDate);
  if (params.toDate) queryParams.append('toDate', params.toDate);

  const queryString = queryParams.toString();
  const url = `${BASE_URL}/cms/company${queryString ? `?${queryString}` : ''}`;

  // 토큰 확인 및 디코드
  const adminToken = localStorage.getItem('admin_access_token');
  console.log('🔍 [getCompanyList] 토큰 상태 확인:', {
    params,
    queryString,
    fullUrl: url,
    hasToken: !!adminToken,
    tokenPrefix: adminToken ? adminToken.substring(0, 10) + '...' : 'null',
    localStorage: typeof localStorage !== 'undefined'
  });

  // JWT 토큰 디코드해서 권한 확인
  if (adminToken) {
    try {
      const payload = JSON.parse(atob(adminToken.split('.')[1]));
      console.log('🔓 [JWT 토큰 디코드]', {
        payload: payload,
        isRoot: payload.isRoot,
        role: payload.role || 'unknown',
        exp: payload.exp ? new Date(payload.exp * 1000) : 'no expiry'
      });
    } catch (error) {
      console.error('❌ JWT 토큰 디코드 실패:', error);
    }
  }

  try {
    const result = await callAdminApi({
      title: '고객사 목록 조회',
      url: url,
      method: 'GET',
      isCallPageLoader: true,
      isWithToken: true, // 토큰 필요
    });
    
    console.log('getCompanyList 응답:', result);
    return result;
  } catch (error) {
    console.error('getCompanyList 에러:', error);
    throw error;
  }
}

// *************** 카테고리

// 카테고리 조회
export async function getCategoryList() {
  return callAdminApi({
    title: '카테고리 목록 조회',
    url: `${BASE_URL}/cms/company/category`,
    method: 'GET',
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// 카테고리 생성
export async function createCategory(params: { name: string; code: string }) {
  return callAdminApi({
    title: '카테고리 생성',
    url: `${BASE_URL}/cms/company/category`,
    method: 'POST',
    body: params,
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// 카테고리 수정
export async function updateCategory(id: string, params: { name?: string; code?: string }) {
  return callAdminApi({
    title: '카테고리 수정',
    url: `${BASE_URL}/cms/company/category/${id}`,
    method: 'PATCH',
    body: params,
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// 단가 업로드 API
export async function uploadUnitPrices(
  params: UnitPriceUploadParams) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);

  return callAdminApi({
    title: '단가 업로드',
    url: `${BASE_URL}/cms/unit-prices?${queryParams.toString()}`,
    method: 'POST',
    body: {
      columns: params.columns,
      data: params.data
    },
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

// 단가표 개별 삭제 API
export async function deleteUnitPrice(id: string, companyCode: string) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', companyCode);

  return callAdminApi({
    title: '단가표 삭제',
    url: `${BASE_URL}/cms/unit-prices/${id}?${queryParams.toString()}`,
    method: 'DELETE',
    isCallPageLoader: true,
    isWithToken: true, // 토큰 필요
  });
}

// ***************** AI 프롬프트

// AI 프롬프트 목록 조회
export async function getAIPromptList(
  params: AIPromptGetListParams
) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);
  
  if (params.keyword) {
    queryParams.append('keyword', params.keyword);
  }

  return callAdminApi({
    title: 'AI 프롬프트 목록 조회',
    url: `${BASE_URL}/cms/ai-prompts?${queryParams.toString()}`,
    method: 'GET',
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// AI 프롬프트 생성
export async function createAIPrompt(
  params: AIPromptCreateParams
) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);

  return callAdminApi({
    title: 'AI 프롬프트 생성',
    url: `${BASE_URL}/cms/ai-prompts?${queryParams.toString()}`,
    method: 'POST',
    body: {
      name: params.name,
      description: params.description,
      content: params.content,
    },
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// AI 프롬프트 수정
export async function updateAIPrompt(
  params: AIPromptUpdateParams
) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);

  const requestBody: any = {};
  if (params.name !== undefined) requestBody.name = params.name;
  if (params.description !== undefined) requestBody.description = params.description;
  if (params.content !== undefined) requestBody.content = params.content;

  return callAdminApi({
    title: 'AI 프롬프트 수정',
    url: `${BASE_URL}/cms/ai-prompts/${params.id}?${queryParams.toString()}`,
    method: 'PATCH',
    body: requestBody,
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// AI 프롬프트 삭제
export async function deleteAIPrompt(
  params: AIPromptDeleteParams
) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);

  return callAdminApi({
    title: 'AI 프롬프트 삭제',
    url: `${BASE_URL}/cms/ai-prompts/${params.id}?${queryParams.toString()}`,
    method: 'DELETE',
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// AI 프롬프트 수정 이력 조회
export async function getAIPromptHistory(
  params: { id: string; companyCode: string }
) {
  const queryParams = new URLSearchParams();
  queryParams.append('companyCode', params.companyCode);

  return callAdminApi({
    title: 'AI 프롬프트 수정 이력 조회',
    url: `${BASE_URL}/cms/ai-prompts/${params.id}/history?${queryParams.toString()}`,
    method: 'GET',
    isCallPageLoader: true,
    isWithToken: true,
  });
}

// ***************** 회원 정보 수정

// 회원 정보 수정
export async function updateUser(params: UserUpdateParams) {
  const requestBody: any = {};
  
  // 옵션 값들을 body에 추가
  if (params.cellphone !== undefined) requestBody.cellphone = params.cellphone;
  if (params.email !== undefined) requestBody.email = params.email;
  if (params.memo !== undefined) requestBody.memo = params.memo;

  return callAdminApi({
    title: '회원 정보 수정',
    url: `${BASE_URL}/cms/users/${params.id}`,
    method: 'PATCH',
    body: requestBody,
    isCallPageLoader: true,
    isWithToken: true,
  });
}