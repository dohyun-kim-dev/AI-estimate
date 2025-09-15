/**
 * 토큰 관리 유틸리티 - localStorage 기반
 * admin, dealer, user 모든 토큰을 통일된 방식으로 관리
 */

import { devLog, devError } from './devLogger';

// 토큰 키 상수
export const TOKEN_KEYS = {
  admin: 'admin_access_token',
  dealer: 'dealer_access_token', 
  user: 'user_access_token'
} as const;

/**
 * 토큰 저장
 */
export function setToken(key: keyof typeof TOKEN_KEYS, token: string): void {
  if (typeof window === 'undefined') {
    devError('setToken: window is undefined (SSR 환경)');
    return;
  }
  
  try {
    localStorage.setItem(TOKEN_KEYS[key], token);
    devLog(`✅ ${key} 토큰 저장 성공:`, token.substring(0, 10) + '...');
  } catch (error) {
    devError(`❌ ${key} 토큰 저장 실패:`, error);
  }
}

/**
 * 토큰 조회
 */
export function getToken(key: keyof typeof TOKEN_KEYS): string | null {
  if (typeof window === 'undefined') {
    devLog('getToken: window is undefined (SSR 환경)');
    return null;
  }
  
  try {
    const token = localStorage.getItem(TOKEN_KEYS[key]);
    devLog(`🔍 ${key} 토큰 조회:`, token ? 'Found' : 'Not found');
    return token;
  } catch (error) {
    devError(`❌ ${key} 토큰 조회 실패:`, error);
    return null;
  }
}

/**
 * 토큰 삭제
 */
export function removeToken(key: keyof typeof TOKEN_KEYS): void {
  if (typeof window === 'undefined') {
    devError('removeToken: window is undefined (SSR 환경)');
    return;
  }
  
  try {
    localStorage.removeItem(TOKEN_KEYS[key]);
    devLog(`🗑️ ${key} 토큰 삭제 완료`);
  } catch (error) {
    devError(`❌ ${key} 토큰 삭제 실패:`, error);
  }
}

/**
 * 모든 토큰 삭제 (로그아웃용)
 */
export function clearAllTokens(): void {
  if (typeof window === 'undefined') {
    devError('clearAllTokens: window is undefined (SSR 환경)');
    return;
  }
  
  try {
    Object.values(TOKEN_KEYS).forEach(tokenKey => {
      localStorage.removeItem(tokenKey);
    });
    devLog('🧹 모든 토큰 삭제 완료');
  } catch (error) {
    devError('❌ 토큰 일괄 삭제 실패:', error);
  }
}

/**
 * 토큰 존재 여부 확인
 */
export function hasToken(key: keyof typeof TOKEN_KEYS): boolean {
  const token = getToken(key);
  return !!token && token.trim().length > 0;
}

/**
 * 로그인 상태 확인
 */
export function isLoggedIn(key: keyof typeof TOKEN_KEYS): boolean {
  return hasToken(key);
}
