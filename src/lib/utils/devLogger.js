/**
 * 개발 환경에서만 콘솔 로그를 출력하는 유틸 함수
 * Dev-only logger to prevent logs in production
 */
export const devLog = (...args) => {
    if (import.meta.env.NODE_ENV === 'development') {
        console.log('devLog:', ...args);
    }
};
export const devWarn = (...args) => {
    if (import.meta.env.NODE_ENV === 'development') {
        console.warn('devWarn:', ...args);
    }
};
export const devError = (...args) => {
    if (import.meta.env.NODE_ENV === 'development') {
        console.error('devError:', ...args);
    }
};
