import { AppColors } from "@/styles/colors";
import { AppTextStyles } from "@/styles/textStyles";

/**
 * 이 파일은 반응형 레이아웃을 구성하는 데 필요한 상수값들을 정의합니다.
 * 화면 너비 기준점(Breakpoints), 기본 레이아웃 여백(LayoutConstants),
 * 변수명은 유지하고, 값은 프로젝트 디자인 가이드에 맞게 변경해주세요
 * This file defines constants used for responsive layout configuration.
 * It includes screen breakpoints, layout paddings, input field styles,
 * Please keep the variable names and change the values according to your project design guidelines.
 */

export const Breakpoints = {
  mobile: 770,
  tablet: 1024,
  desktop: 1200,
} as const; // 화면 너비 기준점 | Screen width breakpoints

export const LayoutConstants = {
  screenPadding: {
    horizontal: {
      mobile: "20px",
      tablet: "32px",
      desktop: "64px",
    },
    top: {
      mobile: "24px",
      tablet: "32px",
      desktop: "48px",
    },
    bottom: {
      mobile: "24px",
      tablet: "32px",
      desktop: "48px",
    },
  },
}; // 화면 외곽 여백 | Outer screen padding
