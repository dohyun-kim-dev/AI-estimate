export const navigationBarItems = [
  {
    label: "비즈니스 맞춤분석",
    path: "/report",
  },
  {
    label: "효과영상",
    path: "/video",
  },
  {
    label: "시나리오",
    path: "/scenario",
  },
  {
    label: "추천 및 요금",
    path: "/pricing",
  },
  {
    label: "후기 및 FAQ",
    path: "/review",
  },
];

export const industryOptions = [
  {
    label: "에이전시",
    number: "option_1",
  },
  {
    label: "유통 산업",
    number: "option_2",
  },
  {
    label: "제조 산업",
    number: "option_3",
  },
  {
    label: "기자재",
    number: "option_4",
  },
];

export const planDetails = [
  {
    title: "고객상담 챗봇",
    subtitle: "별도문의",
    badge: "고객 PRO",
    description: "고객에게 견적을 노출하고, 리드를 확보해보세요",
    sections: [
      {
        title: "사용료 상세 (VAT 별도)",
        items: [
          { title: "1회성 기술지원료 300만원" },
          { title: "에이고 사용료 별도문의" },
          {
            title: "AI 엔진 사용료 종량제 (고객사 부담)",
            details: [
              {
                detail: "구글 Vertex AI 신용카드 등록 및 결제",
                subdetail: "AI 제한 1회당 평균 10~20원 소요",
              },
            ],
          },
        ],
      },
      {
        title: "1회성 기술지원",
        items: [
          { title: "고객사 견적표 양식 지원(1.5주)" },
          { title: "AI 맞춤 프롬프트 지원(1.5주)" },
        ],
      },
      {
        title: "고객상담 기본기능",
        items: [
          {
            title: "AI 다국어 답변 적용",
          },
          {
            title: "AI 접속국가 견적환율 적용",
          },
          {
            title: "자연어 기반 상담",
            details: [
              {
                detail: "첨부 파일 및 URL 인식 제공",
              },
            ],
          },
          {
            title: "견적서 발행",
            details: [
              {
                detail: "PDF 견적 다운로드",
              },
              {
                detail: "견적 대화 공유, 파일 공유",
              },
            ],
          },
        ],
      },
      {
        title: "관리자 기능",
        items: [
          { title: "대시보드" },
          {
            title: "계정 관리",
            details: [
              { detail: "고객 계정 관리" },
              {
                detail: "관리자 계정 관리",
              },
            ],
          },
          {
            title: "AI 데이터 관리",
            details: [
              {
                detail: "AI프롬프트 관리 (수정가능)",
              },
              {
                detail: "AI 대화이력 관리 (챗봇 대화내용 열람가능)",
              },
            ],
          },
          {
            title: "AI 설정",
            details: [
              {
                detail: "견적서 내 회사정보 설정",
              },
              {
                detail: "비회원·회원 AI 채팅 횟수 설정",
              },
              {
                detail: "월 총사용(횟수) 채팅 설정",
              },
              {
                detail: "AI추론 능력 설정 ( 0~100% )",
              },
              {
                detail: "컬러 테마 설정 ( 다크모드 , 라이트 모드)",
              },
            ],
          },
          {
            title: "고객 데이터 관리",
            details: [
              { detail: "단가표 관리\\n(회사 단가정보 추가,수정,삭제 가능)" },
              { detail: "견적다운로드 관리" },
              { detail: "견적 상담 요청 관리" },
            ],
          },
          {
            title: "유입 트레픽 분석",
            detail: [
              { detail: "트레픽 분석\\n(기기구분, 접속일시, 방문 통계 등)" },
            ],
          },
        ],
      },
      {
        title: "알림 서비스",
        items: [
          { title: "고객 견적 PDF 다운 알림" },
          { title: "고객 회원 가입 알림" },
          { title: "고객 견적 문의 알림" },
          { title: "AI 종합 리포트 매일 발송 (오전 8시)" },
        ],
      },
    ],
  },
  {
    title: "직원지원 챗봇",
    subtitle: "별도문의",
    badge: "직원 PRO",
    description:
      "우리 회사 견적 단가 노출이 우려스럽다면, \\n직원용 PRO로 해결하세요",
    sections: [
      {
        title: "사용료 상세 (VAT 별도)",
        items: [
          { title: "1회성 기술지원료 300만원" },
          { title: "에이고 사용료 별도문의" },
          {
            title: "AI 엔진 사용료 종량제 (고객사 부담)",
            details: [
              {
                detail: "구글 Vertex AI 신용카드 등록 및 결제",
                subdetail: "AI 채팅 1회당 평균 10~20원 소요",
              },
            ],
          },
        ],
      },
      {
        title: "1회성 기술지원",
        items: [
          { title: "고객사 견적표 양식 지원(1.5주)" },
          { title: "AI 맞춤 프롬프트 지원(1.5주)" },
        ],
      },
      {
        title: "직원상담 기본기능",
        items: [
          {
            title: "자연어 기반 상담",
            details: [
              {
                detail: "첨부 파일 및 URL 인식 제공",
              },
            ],
          },
          {
            title: "견적 보안기능",
            details: [
              {
                detail: "견적서 패스워드 설정 (숫자 6자리)",
              },
              {
                detail: "지정기간 열람기능 (2주간 견적 유효)",
              },
            ],
          },
          {
            title: "견적서 발행",
            details: [
              {
                detail: "PDF 견적 다운로드",
              },
              {
                detail: "엑셀 견적 다운로드 (수정용이)",
              },
              {
                detail: "견적 대화 공유, 파일 공유",
              },
            ],
          },
        ],
      },
      {
        title: "관리자 기능",
        items: [
          {
            title: "계정 관리",
            details: [{ detail: "관리자 계정 관리" }],
          },
          {
            title: "AI 데이터 관리",
            details: [
              {
                detail: "AI프롬프트 관리 (수정가능)",
              },
              {
                detail: "AI 대화이력 관리 (챗봇 대화내용 열람가능)",
              },
            ],
          },
          {
            title: "AI 설정",
            details: [
              {
                detail: "견적서 내 회사정보 설정",
              },
              {
                detail: "직원 AI 채팅 횟수 설정",
              },
              {
                detail: "월 총사용(횟수) 채팅 설정",
              },
              {
                detail: "AI추론 능력 설정 ( 0~100% )",
              },
              {
                detail: "컬러 테마 설정 ( 다크모드 , 라이트 모드)",
              },
            ],
          },
          {
            title: "고객 데이터 관리",
            details: [
              {
                detail: "단가표 관리",
                subdetail: "(회사 단가정보 추가,수정,삭제 가능)",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    title: "고객사 맞춤 개발",
    subtitle: "3천만원+α",
    badge: "CUSTOM",
    description: "우리 회사에 필요한 맞춤 기능 개발",
    sections: [
      {
        title: "커스텀 구축 (별도 문의필요)",
        items: [
          { title: "독립형 서비스 구축" },
          { title: "ERP, MES, WMS 연계 지원 가능" },
          {
            title: "기타 시스템 연계 or SSO 연계 등",
            asterisk: "구축형 프로젝트는 코드반출 지원 불가합니다",
          },
        ],
      },
    ],
  },
];

export const gridOptions = [
  {
    index: 0,
    image: "/images/option_1.svg",
    label: ["누적", "가입고객수"],
  },
  {
    index: 1,
    image: "/images/option_2.svg",
    label: ["방문자 수"],
  },
  {
    index: 2,
    image: "/images/option_3.svg",
    label: ["방문 유형"],
  },
  {
    index: 3,
    image: "/images/option_4.svg",
    label: ["견적 문의", "요청"],
  },
  {
    index: 4,
    image: "/images/option_5.svg",
    label: ["견적 문의", "요청 대상"],
  },
  {
    index: 5,
    image: "/images/option_6.svg",
    label: ["AI 답변", "확인 필요"],
  },
  {
    index: 6,
    image: "/images/option_7.svg",
    label: ["견적 PDF", "다운로드"],
  },
  {
    index: 7,
    image: "/images/option_8.svg",
    label: ["견적 다운로드", "TOP 5"],
  },
  {
    index: 8,
    image: "/images/option_9.svg",
    label: ["자주 접속", "TOP 5"],
  },
];

export const testimonials = [
  {
    name: "박",
    title: "IT 프로젝트 매니저",
    content:
      "이전에는 견적을 받으려면 일주일 이상이 걸렸는데, 에이고 덕분에 {{단 몇 분 만에 예산을 확인}} 할 수 있었습니다. 프로젝트 계획이 훨씬 빨라졌어요.",
  },
  {
    name: "송",
    title: "D 유통시장 부시장",
    content:
      "에이고의 다국어 지원 덕분에 해외 바이어와 {{언어 장벽}} 없이 소통할 수 있었어요. 다양한 국가 고객들의 문의를 {{실시간}} 대응하면서 글로벌 시장 진출에 성공했습니다!",
  },
  {
    name: "강",
    title: "IT 에이전시 대표",
    content:
      "에이고의 업무 자동화 기능 덕분에 반복 작업이 줄고, 팀이 더 중요한 업무에 집중할 수 있게 됐어요. {{시간과 인력을 절약}}하며 {{업무 효율}}이 크게 개선됐습니다.",
  },
  {
    name: "A",
    title: "PR Agency Director",
    content:
      "Managing {{multilingual quotations}} was always a challenge, but AIGO made it seamless. It's helped us win more {{global projects}}",
  },
  {
    name: "백",
    title: "A 제조사 임원",
    content:
      "에이고의 AI 기반 데이터 분석과 리포트 기능이 우리 영업과 마케팅 {{전략 최적화}}에 큰 도움이 됐어요. 고객 패턴과 시장 트렌드를 한눈에 파악하며 {{맞춤 대응}}이 가능해졌습니다.",
  },
  {
    name: "권",
    title: "L인테리어 업체 사장",
    content:
      "정확하고 신뢰할 수 있는 견적으로 {{비용 예측이 훨씬 명확}}해졌어요. 고객과의 상담이 원활해지고 프로젝트 진행도 안정적으로 관리할 수 있어 만족합니다.",
  },
];

export const marqueeImages = [
  "/images/hybridge_logo.svg",
  "/images/everitday_logo.svg",
  "/images/maru_logo.svg",
  "/images/onbit_logo.svg",
  "/images/moon_logo.svg",
  "/images/nurion_logo.svg",
  "/images/optivio_logo.svg",
  "/images/heredot_logo.svg",
];

export const faqItems = [
  {
    id: 1,
    question: "질문 이런거이런건가요?",
    answer: "네, 답변답변이 이렇게 나옵니다답변답변이 이렇게 나옵니다",
  },
  {
    id: 2,
    question: "질문 이런거이런건가요?",
    answer: "네, 답변답변이 이렇게 나옵니다답변답변이 이렇게 나옵니다",
  },
  {
    id: 3,
    question: "질문 이런거이런건가요?",
    answer: "네, 답변답변이 이렇게 나옵니다답변답변이 이렇게 나옵니다",
  },
  {
    id: 4,
    question: "질문 이런거이런건가요?",
    answer: "네, 답변답변이 이렇게 나옵니다답변답변이 이렇게 나옵니다",
  },
  {
    id: 5,
    question: "질문 이런거이런건가요?",
    answer: "네, 답변답변이 이렇게 나옵니다답변답변이 이렇게 나옵니다",
  },
];
