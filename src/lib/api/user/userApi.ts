// src/lib/api/userApi.ts (예시)

import { callUserApi } from './callUserApi'; // 수정된 callUserApi
import { GoogleLoginInitialParams, GoogleLoginUpdateParams, GoogleLoginResponse } from './userApi.types';
import { ApiResponse } from './userApi.types';

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
export async function googleLoginInitial(params: GoogleLoginInitialParams) {
  return callUserApi<GoogleLoginResponse>({
    title: '구글 로그인 초기화',
    url: `${BASE_URL}/users/login/google`,
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

export async function companyRegister() {
  return callUserApi({
    title: '고객사 등록',
    url: '/api/company/register',
    method: 'POST',
    // body에 필요하다면 추가 데이터를 넣을 수 있습니다. 현재는 비어있음.
    body: {}, 
    isCallPageLoader: false,
  });
}

/**
 * @description 로그아웃 API 호출 함수
 * @returns {Promise<ApiResponse<null>>} 성공 응답 (데이터 없음)
 */
export async function logoutUser() {
  return callUserApi<null>({
    title: '로그아웃',
    url: '/api/users/logout',
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

/**
 * @description 새 채팅방 세션을 생성하는 API 호출 함수
 * @param {string} title - 채팅방 제목 (예: "임시제목")
 * @returns {Promise<ApiResponse<ChatSessionData>>} 생성된 채팅 세션 정보
 */
export async function createChatSession(title: string) {
  return callUserApi<ChatSessionData>({
    title: '새 채팅 세션 생성',
    url: '/api/company/chat/sessions',
    method: 'PUT',
    body: {
      title,
    },
    isCallPageLoader: true,
  });
}

/**
 * @description 비회원 전용 채팅방 세션을 생성하는 API 호출 함수
 * @param {string} title - 채팅방 제목 (예: "임시제목")
 * @param {string} uuid - 비회원 UUID
 * @returns {Promise<ApiResponse<ChatSessionData>>} 생성된 채팅 세션 정보
 */
export async function createGuestChatSession(title: string, uuid: string) {
  return callUserApi<ChatSessionData>({
    title: '비회원 채팅 세션 생성',
    url: '/api/company/chat/sessions/guest',
    method: 'POST',
    body: {
      title,
      uuid,
    },
    isCallPageLoader: true,
  });
}

/**
 * @description 특정 채팅방에 메시지를 전송하는 API 호출 함수
 * @param {string} sessionId - 메시지를 전송할 채팅 세션 ID
 * @param {ChatMessagePayload} messagePayload - 전송할 메시지 내용과 역할
 * @returns {Promise<ApiResponse<null>>} 성공 응답 (데이터 없음)
 */
export async function sendChatMessage(sessionId: string, messagePayload: ChatMessagePayload, uid: string) {
  return callUserApi<null>({
    title: '채팅 메시지 전송',
    url: `/api/company/chat/sessions/${sessionId}/messages`,
    method: 'POST',
    body: {
      content: messagePayload.content,
      role: messagePayload.role,
      uid: messagePayload.uid,
    },
    isCallPageLoader: false, // 메시지 전송은 로더를 표시하지 않아도 좋습니다.
  });
}

/**
 * @description 특정 채팅방 세션의 정보를 불러오는 API 호출 함수
 * @param {string} sessionId - 불러올 채팅 세션 ID
 * @returns {Promise<ApiResponse<ChatSessionData>>} 불러온 채팅 세션 정보
 */
export async function getChatSession(sessionId: string) {
  return callUserApi<ChatSessionData>({
    title: '채팅 세션 불러오기',
    url: `/api/company/chat/sessions?id=${sessionId}`,
    method: 'PUT', // PUT 메서드를 사용한다고 명시하셨지만, 일반적으로는 GET 메서드를 사용합니다.
    isCallPageLoader: true,
  });
}

/**
 * @description 특정 채팅방 세션의 메시지들을 불러오는 API 호출 함수 (공유용)
 * @param {string} sessionId - 메시지를 불러올 채팅 세션 ID
 * @returns {Promise<ApiResponse<ChatMessage[]>>} 불러온 메시지 목록
 */
export async function getChatMessages(sessionId: string) {
  return callUserApi<ChatMessage[]>({
    title: '채팅 메시지 불러오기 (공유용)',
    url: `/api/company/chat/sessions/${sessionId}/messages/share`,
    method: 'GET',
    isCallPageLoader: true,
  });
}


export async function uploadEstimatePdf(sessionId: string, title: string, file: File, userId: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('chatSession', sessionId);
  formData.append('id', userId); // 회원 ID 또는 비회원 UUID

  return callUserApi({
    title: '견적서 PDF 업로드',
    url: '/api/file/estimate/upload',
    method: 'POST',
    body: formData, // FormData는 JSON.stringify를 하지 않습니다.
    isCallPageLoader: true,
  });
}

export function getDownloadEstimateUrl(companyCode: string, uuid: string) {
  // UUID를 받아서 전체 파일 경로를 생성
  const filePath = `${companyCode}/${uuid}.pdf`;
  const BASE_URL = '/api';
  console.log('companyCode', companyCode);
  console.log('uuid', uuid);
  console.log('filePath', filePath);
  return `${BASE_URL}/file/estimate/download/${filePath}`;
}

/**
 * @description 견적서 다운로드 URL을 생성하는 함수 (사용자 정보 포함)
 * @param {string} companyCode - 회사 코드
 * @param {string} uuid - 견적서 UUID
 * @param {object} userInfo - 사용자 정보 (id, name, email, cellphone)
 * @returns {string} 다운로드 URL
 */
export function getDownloadEstimateUrlWithUserInfo(
  companyCode: string, 
  uuid: string, 
  userInfo: { id: string; name: string; email: string; cellphone: string }
) {
  const filePath = `${companyCode}/${uuid}.pdf`;
  const BASE_URL = '/api';
  
  const params = new URLSearchParams({
    id: userInfo.id,
    name: userInfo.name,
    email: userInfo.email,
    cellphone: userInfo.cellphone
  });
  
  const url = `${BASE_URL}/file/estimate/download/${filePath}?${params.toString()}`;
  console.log('다운로드 URL:', url);
  return url;
}

/**
 * @description 파일을 업로드하는 API 호출 함수
 * @param {File[]} files - 업로드할 파일들
 * @returns {Promise<ApiResponse<string[]>>} 성공 응답 (업로드된 파일명들)
 */
export async function uploadFiles(files: File[]) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return callUserApi<string[]>({
    title: '파일 업로드',
    url: '/api/file/upload',
    method: 'POST',
    body: formData,
    isCallPageLoader: false,
  });
}

// ⭐️ 추가: 파일 크기 검증 함수 (20MB 제한)
export function validateFileSize(file: File, maxSizeMB: number = 20): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

// ⭐️ 추가: 파일 형식 검증 함수
export function validateFileType(file: File): boolean {
  const SUPPORTED_FILE_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'application/x-hwp'
  ];
  return SUPPORTED_FILE_TYPES.includes(file.type);
}

/**
 * @description 업로드된 파일의 URL을 생성하는 함수
 * @param {string} fileName - 파일명
 * @returns {string} 파일 접근 URL
 */
export function getFileUrl(fileName: string) {
  const BASE_URL = '/api';
  return `${BASE_URL}/file/${fileName}`;
}

/**
 * @description 파일과 메시지를 함께 전송하는 API 호출 함수
 * @param {string} sessionId - 채팅 세션 ID
 * @param {string} message - 사용자 메시지
 * @param {File[]} files - 첨부 파일들
 * @returns {Promise<ApiResponse<{fileUrls: string[]}>>} 성공 응답 (업로드된 파일 URL들 포함)
 */
export async function sendMessageWithFiles(sessionId: string, message: string, files: File[]) {
  const formData = new FormData();
  formData.append('message', message);
  files.forEach(file => {
    formData.append('files', file);
  });

  return callUserApi<{fileUrls: string[]}>({
    title: '메시지와 파일 전송',
    url: `/api/company/chat/sessions/${sessionId}/messages`,
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
    url: '/api/company/estimate-request',
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
