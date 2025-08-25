/**
 * 개발 환경에서만 콘솔 로그를 출력하는 유틸 함수
 * Dev-only logger to prevent logs in production
 */
export declare const devLog: (...args: any[]) => void;
export declare const devWarn: (...args: any[]) => void;
export declare const devError: (...args: any[]) => void;
