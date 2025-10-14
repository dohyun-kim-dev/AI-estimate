import { callUserApi } from '../../methods/callUserApi';
import { GoogleLoginInitialParams, GoogleLoginUpdateParams, GoogleLoginResponse } from './userApi.types';
import { ApiResponse } from './userApi.types';
import { devLog } from '@/utils/devLogger';

function resolveCompanyCode() {
  let companyCode = 'heredot';
  const parts = window.location.pathname.split('/');
  const idx = parts.indexOf('aiclient') + 1;
  if (idx > 0 && parts.length > idx) companyCode = parts[idx];
  return companyCode;
}

// API URL 생성 헬퍼 함수
const getApiUrl = (path: string) => {
  // path가 이미 /로 시작하면 그대로 사용, 아니면 /를 추가
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  // 모든 환경에서 /api 프리픽스 사용 (프록시가 처리)
  return `/api${normalizedPath}`;
};


// ***************** 약관 관련
export async function termsGetList() {
  return callUserApi({
    title: '약관 목록 조회',
    url: getApiUrl('/terms?language=KOR'),
    method: 'GET',
    isCallPageLoader: true,
  });
}

// ***************** 휴대폰 인증 관련
export async function sendAuthCode(cellphone) {
  return callUserApi({
    title: '인증번호 전송',
    url: getApiUrl('/users/send-auth-code'),
    method: 'POST',
    body: { cellphone },
    isCallPageLoader: false, // 로딩 인디케이터는 필요에 따라 조절하세요
  });
}

export async function validateAuthCode(cellphone, authCode) {
  return callUserApi({
    title: '인증번호 검증',
    url: getApiUrl('/users/validate-auth-code'),
    method: 'POST',
    body: { cellphone, authCode },
    isCallPageLoader: false,
  });
}



// ***************** 소셜 로그인 관련
export async function googleLoginInitial(params: GoogleLoginInitialParams) {
  return callUserApi({
    title: '구글 로그인 초기화',
    url: getApiUrl('/users/login/google'),
    body: {
      providerId: params.providerId,
    },
    isCallPageLoader: true,
  });
}

export async function googleLoginUpdate(params: GoogleLoginUpdateParams) {
  return callUserApi<GoogleLoginResponse>({
    title: '구글 로그인 정보 업데이트',
    url: getApiUrl('/users/login/google'),
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

export async function companyRegister() {
  return callUserApi({
    title: '고객사 등록',
    url: getApiUrl('/company/register'),
    method: 'POST',
    body: {},
    isCallPageLoader: false,
  });
}

// 채팅방 세션 응답 데이터 타입
export interface ChatSessionData {
  _id: string;
  user: string;
  title: string;
  createAt: string;
  updateAt: string;
}

// 메시지 페이로드 타입
export interface ChatMessageResponseData {
  data:{
  session: string;
  role: 'USER' | 'AI';
  content: {
    content: string;
  };
  _id: string; // 채팅 메시지 ID
  createAt: string;
}
}


// 메시지 데이터 타입 (공유용 API 응답 형식)
export interface ChatMessage {
  _id: string;
  session: string;
  role: 'USER' | 'AI';
  content: {
    type: string;
    value: string;
    content?: string;
  };
  createAt: string;
}

// 메시지 API 응답 타입
export interface ChatMessageApiResponse {
  statusCode: number;
  message: string;
  data: ChatMessage[];
  metadata: null;
  error: null;
}

export async function createChatSession(firstQuestion: string) {
  return callUserApi<ChatSessionData>({
    title: '새 채팅 세션 생성',
    url: getApiUrl('/company/chat/sessions'),
    method: 'PUT',
    body: { 
      title: '새로운 채팅', // 기본 제목
      firstQuestion: firstQuestion.substring(0, 20) // 20글자 제한
    },
    isCallPageLoader: true,
  });
}

export async function createGuestChatSession(firstQuestion: string, uuid: string) {
  return callUserApi<ChatSessionData>({
    title: '비회원 채팅 세션 생성',
    url: getApiUrl('/company/chat/sessions/guest'),
    method: 'POST',
    body: { 
      title: '새로운 채팅', // 기본 제목
      firstQuestion: firstQuestion.substring(0, 20), // 20글자 제한
      uuid 
    },
    isCallPageLoader: true,
  });
}

export async function sendChatMessage(sessionId: string, messagePayload: ChatMessagePayload) {
  return callUserApi<null>({
    title: '채팅 메시지 전송',
    url: getApiUrl(`/company/chat/sessions/${sessionId}/messages`),
    method: 'POST',
    body: {
      content: messagePayload.content,
      role: messagePayload.role,
      uid: messagePayload.uid,
    },
    isCallPageLoader: false,
  });
}
export interface ChatMessagePayload {
  content: object;
  role: 'USER' | 'AI';
  uid?: string;  // uid 필드 추가
}


export async function getChatSession(sessionId: string) {
  return callUserApi<ChatSessionData>({
    title: '채팅 세션 불러오기',
    url: getApiUrl(`/company/chat/sessions?id=${sessionId}`),
    method: 'PUT',
    isCallPageLoader: true,
  });
}


export async function getChatSessions() {
  return callUserApi<ChatSessionData[]>({
    title: '유저별 채팅 세션 목록 조회',
    url: getApiUrl('/company/chat/sessions'),
    method: 'GET',
    isCallPageLoader: true,
  });
}

export async function getChatMessages(sessionId: string) {
  return callUserApi<ChatMessage[]>({
    title: '채팅 메시지 불러오기 (공유용)',
    url: getApiUrl(`/company/chat/sessions/${sessionId}/messages/share`),
    method: 'GET',
    isCallPageLoader: true,
  });
}

export async function getChatSessionMessages(sessionId: string) {
  return callUserApi<ChatMessage[]>({
    title: '채팅 세션 메시지 불러오기',
    url: getApiUrl(`/company/chat/sessions/${sessionId}/messages`),
    method: 'GET',
    isCallPageLoader: true,
  });
}

export async function transferChatSessionToUser(sessionId: string) {
  return callUserApi<ChatSessionData>({
    title: '채팅 세션 소유권 이전',
    url: getApiUrl(`/company/chat/sessions/${sessionId}/owner`),
    method: 'PATCH',
    isCallPageLoader: true,
  });
}



// 🔥 채팅 세션 제목 업데이트 API (updateChatSession API 사용)
export async function updateChatSessionTitle(sessionId: string, title: string, firstQuestion?: string) {
  return callUserApi<ChatSessionData>({
    title: '채팅 세션 제목 업데이트',
    url: getApiUrl(`/company/chat/sessions/${sessionId}`),
    method: 'PATCH',
    body: { 
      title,
      ...(firstQuestion && { firstQuestion })
    },
    isCallPageLoader: false,
  });
}

export async function patchChatMessages(messageId:string, content:any) {
  return callUserApi({
    title: '채팅 메시지 수정',
    url: getApiUrl(`/company/chat/messages/${messageId}`),
    method: 'PATCH',
    body: {
      content: content,
    },
    isCallPageLoader: false,
  });
}

// ***************** 견적 관련
export async function fetchEstimateById(id: string) {
  return callUserApi<{
    statusCode: number;
    message: string;
    data: {
      _id: string;
      chatSession: string;
      companyCode: string;
      createAt: string;
      data: string; // ★ 여기 안에 invoiceData 포함된 HTML 문자열
      title: string;
      user: string;
    };
    metadata: any;
    error: any;
  }>({
    title: '견적 단건 조회',
    url: getApiUrl(`/users/company/estimate/${id}`),
    method: 'GET',
    isCallPageLoader: true,
  });
}
export async function uploadEstimatePdf(
  sessionId: string,
  title: string,
  userId: string,
  data?: string,
  estimateId?: string,
  userInfo?: { id: string; name: string; email: string; cellphone: string },
  amount?: number
) {
  const companyCode = resolveCompanyCode();

  const payload: Record<string, any> = {
    id: estimateId || userId,
    user: userId,
    chatSession: sessionId,
    title,
    data,
    companyCode,
    amount,
  };

  // userInfo가 유효한 값일 경우에만 payload에 추가합니다.
  if (userInfo && Object.values(userInfo).some(value => value)) {
    payload.userInfo = {
      name: userInfo.name || '',
      email: userInfo.email || '',
      cellphone: userInfo.cellphone || '',
    };
  }

  devLog("uploadEstimatePdf payload:", payload);
  return callUserApi({
    title: '견적 저장',
    url: getApiUrl('/users/company/estimate/upload'),
    method: 'POST',
    body: payload,
    isCallPageLoader: false,
  });
}

export function getDownloadEstimateUrl(companyCode: string, uuid: string) {
  const filePath = `${companyCode}/${uuid}.pdf`;
  return getApiUrl(`/file/estimate/download/${filePath}`);
}

export async function getDownloadEstimateUrlWithUserInfo(
  companyCode: string,
  uuid: string,
  userInfo?: { id: string; name: string; email: string; cellphone: string }
) {
  const filePath = `${uuid}`;
  const params = new URLSearchParams();
  if (userInfo?.id) params.append('id', userInfo.id);
  if (userInfo?.name) params.append('name', userInfo.name);
  if (userInfo?.email) params.append('email', userInfo.email);
  if (userInfo?.cellphone) params.append('cellphone', userInfo.cellphone);
  const queryString = params.toString();
  const url = getApiUrl(`/users/company/estimate/${filePath}?${queryString}`);
  // callUserApi를 사용해 GET 요청 (회사코드 헤더 자동 포함)
  return callUserApi({
    title: '견적서 다운로드 카운트',
    url,
    method: 'GET',
    isCallPageLoader: false,
  });
}

export async function uploadFiles(files: File[]) {
  devLog('📤 uploadFiles 함수 호출 - 파일 개수:', files.length);
  devLog('📤 파일 리스트:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
  
  const formData = new FormData();
  files.forEach((file, index) => {
    devLog(`📤 FormData에 파일 추가 [${index}]:`, file.name);
    formData.append('files', file);
  });

  // FormData 내용 확인
  devLog('📤 생성된 FormData:', formData);
  for (const [key, value] of formData.entries()) {
    devLog(`📤 FormData 엔트리 - ${key}:`, value);
  }

  return callUserApi<{
    statusCode: number;
    message: string;
    data: string[];
    metadata: any;
    error: any;
  }>({
    title: '파일 업로드',
    url: getApiUrl('/file/upload'),
    method: 'POST',
    body: formData,
    isCallPageLoader: false,
  });
}

export function validateFileSize(file: File, maxSizeMB: number = 20): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

export function validateFileType(file: File): boolean {
  const SUPPORTED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/x-hwp'
  ];
  return SUPPORTED_FILE_TYPES.includes(file.type);
}

export function getFileUrl(fileName: string) {
  return getApiUrl(`/file/${fileName}`);
}

export async function sendMessageWithFiles(sessionId: string, message: string, files: File[]) {
  const formData = new FormData();
  formData.append('message', message);
  files.forEach(file => {
    formData.append('files', file);
  });

  return callUserApi<{fileUrls: string[]}>({
    title: '메시지와 파일 전송',
    url: getApiUrl(`/company/chat/sessions/${sessionId}/messages`),
    method: 'POST',
    body: formData,
    isCallPageLoader: false,
  });
}

export async function requestEstimateConsult(
  estimateId: string,
  title: string,
  chatSession: string,
  user: { id: string; name: string; cellphone: string; email: string }
) {
  return callUserApi<any>({
    title: '견적 상담 요청',
    url: getApiUrl('/company/estimate-request'),
    method: 'POST',
    body: {
      estimateId,
      title,
      chatSession,
      user,
    },
    isCallPageLoader: true,
  });
}

export interface EstimateHistory {
  _id: string;
  user: string;
  chatSession: string;
  title: string;
  companyCode: string;
  file: string;
  createAt: string;
}

export async function getEstimateHistory(offset: number = 0) {
  return callUserApi<EstimateHistory[]>({
    title: '견적서 목록 조회',
    url: getApiUrl(`/users/company/estimate/history?offset=${offset}`),
    method: 'GET',
    isCallPageLoader: false,
  });
}

// 단가표(유닛프라이스) 전체 조회 API (파라미터 없이 호출)
export async function getAllUnitPrices() {
  const url = getApiUrl('/company/unit-prices');
  return callUserApi({
    title: '단가표 전체 조회',
    url,
    method: 'GET',
    isCallPageLoader: true,
  });
}

// ==================== 에러 처리 유틸리티 함수들 ====================

/**
 * API 응답이 성공인지 확인하는 함수
 * @param response API 응답 객체
 * @returns 성공 여부
 */
export function isApiSuccess<T>(response: ApiResponse<T>): boolean {
  return response.statusCode >= 200 && response.statusCode < 300;
}

/**
 * API 응답에서 사용자 친화적인 에러 메시지를 추출하는 함수
 * @param response API 응답 객체
 * @param defaultMessage 기본 에러 메시지
 * @returns 사용자 친화적인 에러 메시지
 */
export function getApiErrorMessage<T>(response: ApiResponse<T>, defaultMessage: string = '오류가 발생했습니다.'): string {
  if (response.error?.customMessage) {
    return response.error.customMessage;
  }
  if (response.error?.message) {
    return response.error.message;
  }
  if (response.message && response.message !== 'null') {
    return response.message;
  }
  return defaultMessage;
}

/**
 * API 호출 결과를 처리하는 유틸리티 함수
 * @param apiCall API 호출 Promise
 * @param successCallback 성공 시 콜백 함수
 * @param errorCallback 에러 시 콜백 함수
 * @returns API 응답
 */
export async function handleApiCall<T>(
  apiCall: Promise<ApiResponse<T>>,
  successCallback?: (data: T) => void,
  errorCallback?: (errorMessage: string) => void
): Promise<ApiResponse<T>> {
  try {
    const response = await apiCall;
    
    if (isApiSuccess(response)) {
      if (successCallback && response.data) {
        successCallback(response.data);
      }
    } else {
      const errorMessage = getApiErrorMessage(response);
      if (errorCallback) {
        errorCallback(errorMessage);
      }
    }
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('API 호출 중 예외 발생:', error);
    
    if (errorCallback) {
      errorCallback(errorMessage);
    }
    
    // 예외 발생 시 표준 에러 응답 반환
    return {
      statusCode: 500,
      message: errorMessage,
      data: null as T,
      metadata: null,
      error: {
        statusCode: 500,
        message: errorMessage,
        customMessage: '서버와의 통신 중 오류가 발생했습니다.'
      }
    };
  }
}

export async function getAiPrompts() {
  return callUserApi({
    title: 'AI 프롬프트 조회',
    url: getApiUrl('/users/company/ai-prompts'),
    method: 'GET'
  });
}

// URL 크롤링 API
export async function crawlUrl(url: string) {
  return callUserApi<{
    statusCode: number;
    message: string;
    data: string;
    metadata: any;
    error: any;
  }>({
    title: 'URL 크롤링',
    url: getApiUrl('/croller'),
    method: 'POST',
    body: { url },
    isCallPageLoader: false,
  });
}

export async function fillGuestInfo(
  user: string,
  chatSession: string,
  userInfo: { name: string; email: string; cellphone: string }
) {
  return callUserApi<any>({
    title: '게스트 정보 업데이트',
    url: getApiUrl('/users/company/estimate/fill-guest-info'),
    method: 'PATCH',
    body: {
      user,
      chatSession,
      userInfo
    },
    isCallPageLoader: false,
  });
}
