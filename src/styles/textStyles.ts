// src/lib/styles/textStyles.ts

/**
 * AppTextStyles는 애플리케이션 전반에 걸쳐 사용하는 텍스트 스타일을 정의합니다.
 * 텍스트 계층 구조를 통일하고, UI 전반에 일관된 타이포그래피를 적용하기 위한 목적으로 사용됩니다.
 * 변수명은 유지하고, 값은 프로젝트 디자인 가이드에 맞게 변경해주세요
 * AppTextStyles defines the text styles used throughout the application.
 * It ensures a consistent typography system and text hierarchy across the UI.
 * Please keep the variable names and change the values according to your project design guidelines.
 */

export const AppTextStyles = {
  // Display (히어로 영역, 페이지 메인 타이틀)
  // Display (Hero sections, main page titles)
  display1: {
    fontSize: "57px",
    fontWeight: 400,
    lineHeight: "57px",
  },
  // Header에 사용
  display2: { 
    fontSize: "50px",
    fontWeight: 700,
    lineHeight: "50px",
  },
  // 색션에 사용
  display3: {
    fontSize: "40px",
    fontWeight: 700,
    lineHeight: "40px",
  },

  // Headline (섹션 타이틀, 구역 헤더)
  // Headline (Section titles, area headers)
  headline1: {
    fontSize: "32px",
    fontWeight: 400,
    lineHeight: "32px",
  },
  //파트너에 사용
  headline2: {
    fontSize: "35px",
    fontWeight: 700,
  },
  headline3: {
    fontSize: "24px",
    fontWeight: 400,
    lineHeight: "24px",
  },

  // Title (카드, 폼 타이틀 등)
  // Title (Card titles, form headers, etc.)
  //네비에 사용, 색션 하단에 사용
  title1: {
    fontWeight: 700,
    fontSize: "22px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  title2: {
    fontWeight: 700,
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  // 연락 카드에
  title3: {
    fontWeight: 700,
    fontSize: "25px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },

  // Body (본문)
  // Body (Main content text)
  // 카드 내용에 사용
  body1: {
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  //푸터
  body2: {
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  // body3: {
  //   fontSize: "12px",
  //   fontWeight: 400,
  //   lineHeight: "16px",
  // },

  // Label (버튼, 태그, UI 요소)
  // Label (Buttons, tags, UI elements)
  label1: {
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  // 공통 버튼에 사용
  label2: {
    fontWeight: 500,
    fontSize: "25px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  //앱바에 사용
  label3: {
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  //모바일 메뉴바에 사용
  label4: {
    fontWeight: 700,
    fontSize: "18px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  label5: {
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },

  caption1: {
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  caption2: {
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },

  //임의 추가
  button: {
    fontWeight: 500,
    fontSize: "16px",
    lineHeight: "100%",
    letterSpacing: "0%",
  },
  // *************** 추가 ***********
  // Additional Styles
  // 프로젝트에 필요한 추가적인 텍스트 스타일을 여기에 정의할 수 있습니다.
  // You can define additional text styles needed for your project here.
} as const;
