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
 * @description 특정 채팅방에 메시지를 전송하는 API 호출 함수
 * @param {string} sessionId - 메시지를 전송할 채팅 세션 ID
 * @param {ChatMessagePayload} messagePayload - 전송할 메시지 내용과 역할
 * @returns {Promise<ApiResponse<null>>} 성공 응답 (데이터 없음)
 */
export async function sendChatMessage(sessionId: string, messagePayload: ChatMessagePayload) {
  return callUserApi<null>({
    title: '채팅 메시지 전송',
    url: `/api/company/chat/sessions/${sessionId}/messages`,
    method: 'POST',
    body: {
      content: messagePayload.content,
      role: messagePayload.role,
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


export async function uploadEstimatePdf(sessionId: string, title: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('chatSession', sessionId);

  return callUserApi({
    title: '견적서 PDF 업로드',
    url: '/api/file/estimate/upload',
    method: 'POST',
    body: formData, // FormData는 JSON.stringify를 하지 않습니다.
    isCallPageLoader: true,
  });
}
