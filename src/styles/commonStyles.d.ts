/**
 * 사용자 정의 스크롤바 스타일 Mixin 옵션 인터페이스
 */
interface CustomScrollbarOptions {
    trackColor?: string;
    thumbColor?: string;
}
/**
 * 사용자 정의 스크롤바 스타일 Mixin
 * @param options - 스크롤바 색상 옵션 객체 ({ trackColor, thumbColor })
 */
export declare const customScrollbar: (options?: CustomScrollbarOptions) => import("styled-components").RuleSet<object>;
export {};
