/**
 * 이 파일은 반응형 레이아웃을 구성하는 데 필요한 상수값들을 정의합니다.
 * 화면 너비 기준점(Breakpoints), 기본 레이아웃 여백(LayoutConstants),
 * 변수명은 유지하고, 값은 프로젝트 디자인 가이드에 맞게 변경해주세요
 * This file defines constants used for responsive layout configuration.
 * It includes screen breakpoints, layout paddings, input field styles,
 * Please keep the variable names and change the values according to your project design guidelines.
 */
export declare const Breakpoints: {
    readonly mobile: 770;
    readonly tablet: 1024;
    readonly desktop: 1200;
};
export declare const LayoutConstants: {
    screenPadding: {
        horizontal: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
        top: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
        bottom: {
            mobile: string;
            tablet: string;
            desktop: string;
        };
    };
};
