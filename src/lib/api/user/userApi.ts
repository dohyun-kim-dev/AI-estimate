// src/lib/api/userApi.ts

import { callUserApi } from './callUserApi';
import { GoogleLoginInitialParams, GoogleLoginUpdateParams, GoogleLoginResponse } from './userApi.types';
import { ApiResponse } from './userApi.types';

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
  return callUserApi<GoogleLoginResponse>({
    title: '구글 로그인 초기화',
    url: getApiUrl('/users/login/google'),
    method: 'POST',
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

export async function logoutUser() {
  return callUserApi<null>({
    title: '로그아웃',
    url: getApiUrl('/users/logout'),
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
export interface ChatMessagePayload {
  content: object;
  role: 'USER' | 'AI';
  uid?: string;  // uid 필드 추가
}

// 메시지 데이터 타입 (공유용 API 응답 형식)
export interface ChatMessage {
  _id: string;
  session: string;
  role: 'USER' | 'AI';
  content: {
    type: string;
    value: string;
  };
  createAt: string;
}

export async function createChatSession(title: string) {
  return callUserApi<ChatSessionData>({
    title: '새 채팅 세션 생성',
    url: getApiUrl('/company/chat/sessions'),
    method: 'PUT',
    body: { title },
    isCallPageLoader: true,
  });
}

export async function createGuestChatSession(title: string, uuid: string) {
  return callUserApi<ChatSessionData>({
    title: '비회원 채팅 세션 생성',
    url: getApiUrl('/company/chat/sessions/guest'),
    method: 'POST',
    body: { title, uuid },
    isCallPageLoader: true,
  });
}

export async function sendChatMessage(sessionId: string, messagePayload: ChatMessagePayload, uid: string) {
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

export async function getChatSession(sessionId: string) {
  return callUserApi<ChatSessionData>({
    title: '채팅 세션 불러오기',
    url: getApiUrl(`/company/chat/sessions?id=${sessionId}`),
    method: 'PUT',
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

export async function uploadEstimatePdf(sessionId: string, title: string,  userId: string, data: string, estimateId?: string) {
  const formData = new FormData();
  // formData.append('file', file);
  formData.append('title', title);
  formData.append('chatSession', sessionId);
  formData.append('user', userId);
  if (estimateId) formData.append('id', estimateId);
  formData.append('data', data);


  return callUserApi({
    title: '견적서 PDF 업로드',
    url: getApiUrl('/file/estimate/upload'),
    method: 'POST',
    body: formData,
    isCallPageLoader: true,
  });
}

export function getDownloadEstimateUrl(companyCode: string, uuid: string) {
  const filePath = `${companyCode}/${uuid}.pdf`;
  return getApiUrl(`/file/estimate/download/${filePath}`);
}

export function getDownloadEstimateUrlWithUserInfo(
  companyCode: string, 
  uuid: string, 
  userInfo?: { id: string; name: string; email: string; cellphone: string }
) {
  const filePath = `${companyCode}/${uuid}`;
  const params = new URLSearchParams();
  
  if (userInfo?.id) {
    params.append('id', userInfo.id);
  }

  if (userInfo?.name) params.append('name', userInfo.name);
  if (userInfo?.email) params.append('email', userInfo.email);
  if (userInfo?.cellphone) params.append('cellphone', userInfo.cellphone);

  const queryString = params.toString();
  return getApiUrl(`/file/estimate/download/${filePath}?${queryString}`);
}

export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return callUserApi<string[]>({
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
  title: string,
  estimateFile: string,
  chatSession: string,
  user: { id: string; name: string; cellphone: string; email: string }
) {
  return callUserApi<null>({
    title: '견적 상담 요청',
    url: getApiUrl('/company/estimate-request'),
    method: 'POST',
    body: {
      title,
      estimateFile,
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