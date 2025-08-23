import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';

export const mockEstimateData: ProjectEstimate = {
  project_name: "중고 명품 딜러-사용자 거래 플랫폼 (AOS/IOS)",
  total_price: "90,120,000",
  vat_included_price: "99,132,000",
  estimated_period: "22주",
  categories: [
    {
      category_name: "⚙️ 기본 공통",
      sub_categories: [
        {
          sub_category_name: "기반 공통",
          items: [
            {
              name: "화면설계",
              price: "10,000,000",
              description: "IT프로젝트를 진행하기 위한 전반적인 설계를 정의합니다. (본수 기준 1장당 10만원) 참고: AOS/IOS 합계 100장 기준",
            },
            {
              name: "UI/UX디자인",
              price: "10,000,000",
              description: "스토리보드 기반 UI/UX 디자인을 정의합니다. (본수 기준 1장당 10만원) 참고: AOS/IOS 합계 100장 기준",
            },
            {
              name: "퍼블리싱",
              price: "10,000,000",
              description: "디자인기반 화면 UI/UX 코드를 개발합니다. (본수 기준 1장당 10만원) 참고: AOS/IOS 합계 100장 기준",
            },
            {
              name: "환경구축",
              price: "500,000",
              description: "고객사 서버내 도커 기반 Back / Front 개발 환경을 조성합니다.",
            },
          ],
        },
      ],
    },
    {
      category_name: "👤 사용자 및 딜러 관리",
      sub_categories: [
        {
          sub_category_name: "회원가입/로그인",
          items: [
            {
              name: "ID/PW 타입",
              price: "300,000",
              description: "ID/PW 타입으로 회원가입 및 이용약관 동의(이용약관/개인정보수집 동의)를 포함합니다.",
            },
            {
              name: "SNS 타입 (앱)",
              price: "2,400,000",
              description: "SNS(카카오/애플/구글/네이버) 로그인 (ID/PW 입력없이 즉시 로그인) 및 이용약관 동의를 포함합니다. 참고: SNS 로그인 4개 기준",
            },
            {
              name: "통합회원관리",
              price: "2,120,000",
              description: "ID/PW 타입 + SNS 로그인 여러 개 계정으로 로그인 시 하나의 계정으로 묶어서 회원 관리합니다.",
            },
            {
              name: "사용자 승인 절차 운영",
              price: "300,000",
              description: "특정 회원이 심사/승인 시에만 로그인할 수 있는 기능",
            },
            {
              name: "실명 / 통신사 인증",
              price: "600,000",
              description: "실제 본인인지 생년월일과 휴대폰 번호 등을 함께 인증합니다.",
            },
          ],
        },
        {
          sub_category_name: "My 페이지",
          items: [
            {
              name: "My 페이지",
              price: "2,400,000",
              description: "로그아웃 / 회원탈퇴 / 서비스 해지 / 이용약관, 나의 이력, 나의 관리 등",
            },
          ],
        },
        {
          sub_category_name: "계정 관리",
          items: [
            {
              name: "ID찾기",
              price: "300,000",
              description: "ID 찾기 (앞뒤 2자리만 보이고 중간은 * 마스킹 처리됨)",
            },
            {
              name: "PW찾기",
              price: "600,000",
              description: "본인 인증 후 PW 초기화/변경 기능 지원",
            },
          ],
        },
      ],
    },
    {
      category_name: "🛍️ 상품 등록 및 관리",
      sub_categories: [
        {
          sub_category_name: "상품 관리",
          items: [
            {
              name: "아이템 목록 / 상세 페이지",
              price: "600,000",
              description: "아이템 목록 및 상세 페이지는 일반적인 페이지에 비해 복잡도가 높음",
            },
            {
              name: "FILE or 이미지 업로드",
              price: "1,600,000",
              description: "이미지 압축 저장 기능 포함 + 파일 업로드 (최대 10건 이내)",
            },
            {
              name: "상세조건 필터링",
              price: "600,000",
              description: "아이템 가격, 카테고리, 기타 부가 정보를 바탕으로 필터링하는 기능",
            },
            {
              name: "검색",
              price: "600,000",
              description: "아이템명/설명 검색",
            },
            {
              name: "컨텐츠 신고하기",
              price: "600,000",
              description: "게시물 또는 사용자를 신고하는 기능 (구글/애플 앱스토어 출시를 위해선 필수)",
            },
            {
              name: "AI 이미지 인식",
              price: "2,800,000",
              description: "이미지 등을 AI를 활용하여 객체 인식 후 정보 획득",
            },
          ],
        },
      ],
    },
    {
      category_name: "💳 거래 및 결제",
      sub_categories: [
        {
          sub_category_name: "결제",
          items: [
            {
              name: "장바구니",
              price: "1,800,000",
              description: "특정 상품 장바구니 담기 기능",
            },
            {
              name: "1차 PG 연계 - 메이저 기업",
              price: "1,200,000",
              description: "1차 PG사에 가이드에 따라 모든 카드 결제 관련 절차를 Interface 합니다.",
            },
            {
              name: "결제 취소(환불) / 부분 취소",
              price: "600,000",
              description: "국내 PG사를 통해 카드 결제 연동 / 가상계좌 결제 / 해외 결제 등을 가능하게 합니다. / 취소 포함",
            },
          ],
        },
        {
          sub_category_name: "정산 및 매출",
          items: [
            {
              name: "정산 관리",
              price: "1,200,000",
              description: "정산 대상별 정산 현황 관리",
            },
            {
              name: "매출 관리",
              price: "1,200,000",
              description: "결제 이력 기반 매출 관리",
            },
          ],
        },
      ],
    },
    {
      category_name: "💬 소통 및 알림",
      sub_categories: [
        {
          sub_category_name: "채팅",
          items: [
            {
              name: "1:1 채팅 - 고급",
              price: "6,000,000",
              description: "텍스트 + 이미지 + 파일 + URL + 푸시 알람 On/Off 기능",
            },
          ],
        },
        {
          sub_category_name: "알림",
          items: [
            {
              name: "Push 알람",
              price: "200,000",
              description: "절차 기반으로 특정 시점 발송되는 기능 의미",
            },
            {
              name: "Push 항목별 On/Off 기능",
              price: "600,000",
              description: "Push 알람 항목별 수발신 설정을 할 수 있는 기능",
            },
            {
              name: "키워드 알림",
              price: "600,000",
              description: "특정 키워드를 설정했을 때, 해당 키워드가 포함되어 있는 콘텐츠를 push 알림 발송 연계",
            },
            {
              name: "메일발송",
              price: "200,000",
              description: "절차 기반으로 특정 시점 발송되는 기능 의미 (메일 디자인 + 퍼블리싱 필요)",
            },
            {
              name: "카카오 알림톡",
              price: "100,000",
              description: "절차 기반으로 특정 시점 발송되는 기능 의미",
            },
            {
              name: "문자발송",
              price: "100,000",
              description: "절차 기반으로 특정 시점 발송되는 기능 의미",
            },
          ],
        },
      ],
    },
    {
      category_name: "📱 Native 앱 기능",
      sub_categories: [
        {
          sub_category_name: "앱 스토어",
          items: [
            {
              name: "스토어 앱 등록 지원",
              price: "800,000",
              description: "AOS / IOS 앱 등록 절차 진행 (앱 등록 이미지 + 앱 설명 + 앱 심사 요청 등)",
            },
          ],
        },
        {
          sub_category_name: "카메라/QR",
          items: [
            {
              name: "카메라 촬영 / QR 촬영",
              price: "1,200,000",
              description: "카메라 촬영 / QR 촬영",
            },
          ],
        },
        {
          sub_category_name: "푸시 알림",
          items: [
            {
              name: "Push 기초 구성",
              price: "400,000",
              description: "Push 알람 수발신 가능토록 앱내 기초 구성",
            },
          ],
        },
        {
          sub_category_name: "미디어",
          items: [
            {
              name: "비디오 스크롤",
              price: "800,000",
              description: "상하 스와이프를 통해 다음/이전 비디오로 이동하는 기능(틱톡, 릴스와 유사)",
            },
            {
              name: "숏폼 비디오 재생 및 목록",
              price: "3,000,000",
              description: "추천 및 팔로우 기반 숏폼 비디오 무한 스크롤 피드와 비디오 상세 재생 페이지를 구현합니다.",
            },
          ],
        },
        {
          sub_category_name: "Native",
          items: [
            {
              name: "코드푸시 Flutter 전용 (Shorebird) 적용",
              price: "800,000",
              description: "앱내 실시간 코드 배포 체계 구축 - 매번 앱업데이트 할 필요없이 실시간 코드 적용 체계 적용",
            },
          ],
        },
      ],
    },
    {
      category_name: "👨‍💼 관리자 기능",
      sub_categories: [
        {
          sub_category_name: "관리자 로그인",
          items: [
            {
              name: "ID/PW",
              price: "300,000",
              description: "로그인 기능 제공 (관리자 회원 관리에서 계정 추가/삭제/패스워드 수정 기능 제공)",
            },
          ],
        },
        {
          sub_category_name: "관리자 계정 관리",
          items: [
            {
              name: "관리자 관리",
              price: "600,000",
              description: "관리자 회원 관리 (생성, 수정, 삭제, 비번 변경 기능 제공)",
            },
          ],
        },
        {
          sub_category_name: "회원 관리",
          items: [
            {
              name: "사용자 관리",
              price: "600,000",
              description: "사용자 현황 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
            {
              name: "사업자 관리",
              price: "600,000",
              description: "사업자 현황 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
          ],
        },
        {
          sub_category_name: "상품 및 주문",
          items: [
            {
              name: "상품 관리",
              price: "1,800,000",
              description: "상품 현황 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
            {
              name: "주문 관리",
              price: "1,800,000",
              description: "주문 관리 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
            {
              name: "배송 관리",
              price: "1,800,000",
              description: "배송 관리 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
            {
              name: "재고 관리",
              price: "1,800,000",
              description: "재고 현황 리스트 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
          ],
        },
        {
          sub_category_name: "컨텐츠 관리",
          items: [
            {
              name: "컨텐츠 관리",
              price: "1,200,000",
              description: "작성, 신고된 컨텐츠 일괄 관리 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
            {
              name: "팝업 공지 관리",
              price: "1,200,000",
              description: "팝업 게시글 관리 (작성, 수정, 삭제 포함) - 웹에디터 적용",
            },
            {
              name: "배너 관리",
              price: "1,200,000",
              description: "배너 게시글 관리 (작성, 수정, 삭제 포함) - 클릭시 이동 좌표 기능 포함",
            },
            {
              name: "공지 관리",
              price: "1,200,000",
              description: "공지 게시글 관리 (작성, 수정, 삭제 포함) - 웹에디터 적용",
            },
          ],
        },
        {
          sub_category_name: "대시보드",
          items: [
            {
              name: "5~6개 섹션 관리 (그래프 O)",
              price: "3,000,000",
              description: "그래프를 포함한 지표 대시보드",
            },
            {
              name: "섹션별 상세 화면 (그래프 O, 로우 데이터 확인)",
              price: "3,200,000",
              description: "그래프, 검색, 로우데이터 엑셀 다운로드 (2개 페이지 기준)",
            },
          ],
        },
        {
          sub_category_name: "결제 이력",
          items: [
            {
              name: "결제이력 관리",
              price: "1,200,000",
              description: "결제 이력 기반 관리 (조회, 검색, 페이징, 엑셀 다운로드 기능 제공)",
            },
          ],
        },
        {
          sub_category_name: "데이터 관리",
          items: [
            {
              name: "FAQ 관리",
              price: "600,000",
              description: "FAQ 게시글 관리 (작성, 수정, 삭제 포함)",
            },
            {
              name: "1:1 문의 관리",
              price: "600,000",
              description: "1:1 문의 게시글 관리 (답변) - 웹에디터 미적용",
            },
          ],
        },
        {
          sub_category_name: "약관 관리",
          items: [
            {
              name: "약관관리",
              price: "300,000",
              description: "이용약관, 개인정보 방침, 취소 및 환불 규칙, 마케팅 활용 동의, 사업자 정보 등 (수정 기능 포함) - 웹에디터 적용",
            },
          ],
        },
      ],
    },
  ],
};