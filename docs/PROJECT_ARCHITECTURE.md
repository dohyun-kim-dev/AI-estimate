# AI Estimate 프로젝트 아키텍처 문서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [API 설계 및 연결](#api-설계-및-연결)
4. [AI 시스템 아키텍처](#ai-시스템-아키텍처)
5. [상태 관리 (Zustand Store)](#상태-관리-zustand-store)
6. [핵심 페이지 분석](#핵심-페이지-분석)
7. [인증 및 권한 관리](#인증-및-권한-관리)
8. [데이터 흐름](#데이터-흐름)

---

## 프로젝트 개요

### 🎯 목적
AI 기반 프로젝트 견적서 자동 생성 및 관리 시스템

### 🏗️ 기술 스택
- **Frontend**: React 18 + TypeScript + Vite
- **상태 관리**: Zustand
- **스타일링**: Styled-components
- **AI**: Google Gemini API (gemini-2.5-flash, gemini-2.0-flash)
- **통신**: Fetch API + Custom API Wrapper
- **배포**: Firebase Hosting
- **빌드**: Vite

### 🌐 시스템 구성
```
┌─────────────────────────────────────────────────────────┐
│                    AI Estimate 시스템                    │
├─────────────────────────────────────────────────────────┤
│  1. 고객 사이트 (/{companyCode}/ai)                     │
│     - AI 채팅 인터페이스                                 │
│     - 견적서 생성 및 조회                                │
│     - 비회원/회원 지원                                   │
├─────────────────────────────────────────────────────────┤
│  2. 사이트 CMS (/{companyCode}/cms)                     │
│     - 고객사별 관리 페이지                               │
│     - 회원/견적/상담 관리                                │
│     - AI 설정 (프롬프트, 단가표)                         │
├─────────────────────────────────────────────────────────┤
│  3. 통합 관리자 (/superAdmin)                            │
│     - 모든 고객사 관리                                   │
│     - 고객사 생성/수정/삭제                              │
│     - 카테고리/관리자 관리                               │
└─────────────────────────────────────────────────────────┘
```

---

## 프로젝트 구조

```
src/
├── app/                          # 페이지 라우팅
│   ├── ai/                       # 🔥 AI 채팅 페이지 (핵심)
│   │   └── page.tsx              # AI 견적 생성 메인
│   ├── superAdmin/               # 통합 관리자
│   │   ├── companyMng/           # 고객사 관리
│   │   ├── adminMng/             # 관리자 관리
│   │   ├── categoryMng/          # 카테고리 관리
│   │   ├── aiData/               # AI 데이터 관리
│   │   │   ├── conversationHistory/  # 대화 이력
│   │   │   └── estimateDownload/     # 견적 다운로드 현황
│   │   └── userData/             # 회원/견적 관리
│   └── cms/                      # 사이트별 CMS (동적 라우팅)
│       └── [companyCode]/
│           ├── setting/          # 회사 정보 설정
│           ├── aiSetting/        # AI 설정 (프롬프트, 단가표)
│           └── user/             # 회원 관리
│
├── components/                   # 재사용 컴포넌트
│   ├── ai-esti/                  # AI 견적 전용 컴포넌트
│   │   ├── EstimateCard.tsx      # 견적서 카드 (공유/다운로드)
│   │   ├── EstimateAccordion.tsx # 견적서 아코디언 (상세)
│   │   ├── PeriodSlider.tsx      # 기간 연장 슬라이더
│   │   └── ChatInput.tsx         # AI 채팅 입력창
│   ├── common/                   # 공통 컴포넌트
│   └── CustomList/               # 리스트 UI
│
├── store/                        # 🔥 Zustand 상태 관리
│   ├── chatStore.ts              # 채팅 상태 (핵심)
│   ├── authStore.ts              # 인증 상태
│   ├── companyStore.ts           # 회사 정보
│   ├── themeStore.ts             # 테마 상태
│   └── usageStore.ts             # 사용량 관리
│
├── lib/api/                      # 🔥 API 통신 레이어
│   ├── admin/                    # 관리자 API
│   │   ├── adminApi.ts           # 통합/사이트 CMS API
│   │   └── adminApi.types.ts     # API 타입 정의
│   ├── user/                     # 사용자 API
│   │   ├── userApi.ts            # 회원/게스트 API
│   │   └── userApi.types.ts      # API 타입 정의
│   └── callApi.ts                # API 공통 래퍼
│
├── hooks/                        # Custom Hooks
│   ├── useAI.ts                  # 🔥 AI 통신 훅 (핵심)
│   ├── useChatActions.ts         # 채팅 액션 훅
│   ├── useCompanyInfo.ts         # 회사 정보 훅
│   └── estimate.ts               # 견적 계산 로직
│
├── utils/                        # 유틸리티
│   ├── discountCalculator.ts    # 할인 계산
│   └── devLogger.ts              # 개발 로그
│
└── types/                        # 타입 정의
    └── projectEstimate.ts        # 견적서 타입
```

---

## API 설계 및 연결

### 🔑 핵심 개념: BASE_URL 동적 결정

```typescript
// src/lib/api/admin/adminApi.ts

const getBaseUrl = () => {
  if (typeof window === 'undefined') return '/api';
  
  const pathname = window.location.pathname;
  
  // 1. 슈퍼어드민: /api
  if (pathname.includes('/superAdmin')) {
    return '/api';
  }
  
  // 2. 회사별 CMS: /api/company
  const companyMatch = pathname.match(/^\/([^\/]+)\/cms/);
  if (companyMatch) {
    return '/api/company';
  }
  
  // 3. 기본값: /api
  return '/api';
};

const BASE_URL = getBaseUrl();
```

### 📡 API 구조

#### 1. **통합 관리자 API** (`/api/cms/...`)
```typescript
// 고객사 관리
GET    /api/cms/company              # 고객사 목록
POST   /api/cms/company              # 고객사 생성
GET    /api/cms/company/:code        # 고객사 상세
PATCH  /api/cms/company?companyCode= # 고객사 수정
DELETE /api/cms/company/:code        # 고객사 삭제

// 관리자 관리
GET    /api/cms/admins?isRoot=true   # 슈퍼 관리자 목록
POST   /api/cms/admins               # 관리자 생성
PATCH  /api/cms/admins/:id           # 관리자 수정
DELETE /api/cms/admins/:id           # 관리자 삭제

// 카테고리 관리
GET    /api/cms/company/category     # 카테고리 목록
POST   /api/cms/company/category     # 카테고리 생성
PATCH  /api/cms/company/category/:id # 카테고리 수정
DELETE /api/cms/company/category/:id # 카테고리 삭제
```

#### 2. **사이트 CMS API** (`/api/company/...`)
```typescript
// 회사 정보
GET    /api/company/info                    # 회사 정보 조회
PATCH  /api/company/cms/info?companyCode=   # 회사 정보 수정

// 회원 관리
GET    /api/company/cms/users?companyCode=  # 회원 목록

// 견적/상담 관리
GET    /api/company/cms/estimate-requests?companyCode= # 견적 요청 목록
PATCH  /api/company/cms/estimate-requests/:id          # 상태 업데이트

// AI 설정
GET    /api/company/cms/ai/prompt/get-list  # 프롬프트 목록
PATCH  /api/company/cms/ai/prompt/update    # 프롬프트 수정
GET    /api/company/cms/unit-prices?companyCode= # 단가표 조회
POST   /api/company/cms/unit-prices         # 단가표 업로드
```

#### 3. **사용자 API** (`/api/...`)
```typescript
// 인증
POST   /api/user/login/google/initial       # 구글 로그인 초기화
POST   /api/user/login/google/update        # 구글 로그인 업데이트

// 채팅
POST   /api/chat/sessions                   # 채팅 세션 생성
GET    /api/chat/sessions/:id/messages      # 메시지 조회
POST   /api/chat/sessions/transfer          # 비회원→회원 전환

// 견적서
POST   /api/estimate/upload                 # 견적서 업로드
GET    /api/estimate/download/:path         # 견적서 다운로드
```

### 🔐 API 인증 처리

```typescript
// src/lib/api/callApi.ts

async function callApi(options: CallApiOptions) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // 토큰 추가 (선택적)
  if (options.isWithToken) {
    const token = localStorage.getItem('admin_access_token') || 
                  localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Company Code 헤더 추가 (사이트 CMS용)
  const companyCode = getCompanyCodeFromUrl();
  if (companyCode && !window.location.pathname.includes('/superAdmin')) {
    headers['x-company-code'] = companyCode;
  }

  const response = await fetch(fullUrl, {
    method: options.method || 'POST',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return response.json();
}
```

---

## AI 시스템 아키텍처

### 🤖 AI 통신 흐름

```
사용자 입력
    ↓
ChatInput.tsx (UI)
    ↓
useChatActions.ts (파일 처리, 검증)
    ↓
useAI.ts (AI 통신 핵심)
    ↓
Google Gemini API
    ↓
스트리밍 응답 처리
    ↓
chatStore.ts (상태 저장)
    ↓
AiMessageContent.tsx (UI 렌더링)
```

### 📝 useAI.ts - AI 통신 핵심 로직

```typescript
// src/hooks/useAI.ts

export const useAI = (initialModel: ModelName = 'gemini-2.5-flash') => {
  const [modelName, setModelName] = useState<ModelName>(initialModel);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔥 핵심: Gemini API 스트리밍 통신
  const sendChat = async (
    userMessage: string,
    imageDataList?: ImageData[],
    fileDataList?: FileData[],
    options?: SendChatOptions
  ) => {
    try {
      // 1. 회사 정보 및 프롬프트 가져오기
      const companyInfo = useCompanyStore.getState().companyInfo;
      const systemPrompt = await loadSystemPrompt();
      
      // 2. 채팅 세션 생성/조회
      const sessionId = await ensureSession();
      
      // 3. 메시지 히스토리 구성
      const messages = useChatStore.getState().messages;
      const history = buildMessageHistory(messages);
      
      // 4. Gemini API 호출 (스트리밍)
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemPrompt 
      });
      
      const chat = model.startChat({ history });
      
      // 5. 스트리밍 응답 처리
      const result = await chat.sendMessageStream(prompt);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // 실시간 UI 업데이트
        useChatStore.getState().updateLastMessage(fullText);
      }
      
      // 6. 백엔드에 메시지 저장
      await saveMessageToBackend(sessionId, userMessage, fullText);
      
    } catch (error) {
      handleError(error);
    }
  };

  return { sendChat, modelName, setModelName };
};
```

### 🎯 AI 프롬프트 구조

```typescript
// 시스템 프롬프트 구조
const systemPrompt = `
당신은 프로젝트 견적서를 작성하는 전문가입니다.

[현재 단가표]
${unitPriceData}

[견적서 작성 규칙]
1. 사용자 요구사항을 분석하여 필요한 기능 도출
2. 단가표 기반으로 금액 산정
3. JSON 형식으로 견적서 생성

[출력 형식]
\`\`\`json
{
  "project_name": "프로젝트명",
  "categories": [
    {
      "name": "카테고리명",
      "sub_categories": [
        {
          "name": "서브카테고리",
          "items": [
            {
              "name": "항목명",
              "price": 가격,
              "description": "설명"
            }
          ]
        }
      ]
    }
  ],
  "total_amount": 총금액,
  "estimated_period": "예상기간"
}
\`\`\`
`;
```

### 📊 단가표 구조

```typescript
// unitPrice 데이터 구조
interface UnitPrice {
  category: string;           // 대분류 (예: "프론트엔드 개발")
  subCategory: string;        // 중분류 (예: "화면 개발")
  task: string;               // 소분류 (예: "일반 화면")
  unit: string;               // 단위 (예: "페이지")
  unitPrice: number;          // 단가 (원)
  minQuantity?: number;       // 최소 수량
  maxQuantity?: number;       // 최대 수량
}
```

---

## 상태 관리 (Zustand Store)

### 🗂️ Store 구조

```typescript
// src/store/chatStore.ts - 채팅 상태 관리 (가장 중요)

interface ChatStore {
  // 상태
  messages: ChatMessage[];           // 메시지 배열
  chatSessionId: string | null;      // 현재 세션 ID
  isCrawlingUrl: boolean;            // URL 크롤링 중 여부
  
  // 액션
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clear: () => void;
  loadLatestChatSession: () => Promise<void>;
  loadSessionMessages: (sessionId: string) => Promise<ChatMessage[]>;
  getEffectiveSessionId: () => string | null;
}

// 사용 예시
const { messages, addMessage, updateLastMessage } = useChatStore();
```

```typescript
// src/store/authStore.ts - 인증 상태 관리

interface AuthStore {
  user: User | null;
  isAuthenticated: () => boolean;
  login: (userData: User) => void;
  logout: () => void;
  fetchAndUpdateUserInfo: () => Promise<void>;
}
```

```typescript
// src/store/companyStore.ts - 회사 정보 관리

interface CompanyStore {
  companyInfo: CompanyInfo | null;
  isLoading: boolean;
  setCompanyInfo: (info: CompanyInfo) => void;
  clearCompanyInfo: () => void;
}
```

### 🔄 Store 간 상호작용

```typescript
// 예: AI 채팅 페이지에서 여러 Store 사용
function AiChatPage() {
  // 1. 채팅 상태
  const { messages, addMessage, clear } = useChatStore();
  
  // 2. 인증 상태
  const { isAuthenticated, user } = useAuthStore();
  
  // 3. 회사 정보
  const { companyInfo } = useCompanyStore();
  
  // 4. 테마 상태
  const { isDarkMode } = useThemeStore();
  
  // Store 간 데이터 흐름
  useEffect(() => {
    if (isAuthenticated()) {
      loadLatestChatSession(); // chatStore 액션
    }
  }, [user]); // authStore 의존
}
```

---

## 핵심 페이지 분석

### 🎯 AI 채팅 페이지 (`src/app/ai/page.tsx`)

#### 컴포넌트 구조
```
AiChatPage
├── ProfileSpinner (로딩 애니메이션)
├── ChatBox (메시지 표시)
│   ├── UserMessage (사용자 메시지)
│   └── AiMessageContent (AI 응답)
│       ├── EstimateCard (견적서 카드)
│       ├── EstimateAccordion (견적 상세)
│       └── PeriodSlider (기간 조정)
├── ChatInput (입력창)
└── FilePreviewArea (파일 미리보기)
```

#### 핵심 로직

```typescript
// 1. 초기화 (useEffect)
useEffect(() => {
  // 회사 정보 로드
  await fetchCompanyInfo();
  
  // AI 프롬프트 로드
  await loadSystemPrompt();
  
  // 단가표 로드
  await loadUnitPrices();
  
  // 세션 관리
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session');
  
  if (sessionId) {
    // URL에 세션 ID 있으면 해당 세션 로드
    await loadSessionMessages(sessionId);
  } else if (isAuthenticated()) {
    // 로그인 사용자는 최신 세션 로드
    await loadLatestChatSession();
  } else {
    // 비회원은 새 세션 생성
    const guestUuid = ensureGuestUuid();
    const newSession = await createChatSession(guestUuid);
    setChatSessionId(newSession._id);
  }
}, []);

// 2. 메시지 전송
const handleSubmit = async (value: string, options) => {
  // 사용자 메시지 추가
  addMessage({
    role: 'user',
    content: value,
    images: uploadedFiles.images,
    files: uploadedFiles.docs,
  });
  
  // AI에게 전송
  await sendChat(value, uploadedFiles.images, uploadedFiles.docs, {
    displayMessage: options?.displayMessage,
    abortSignal: options?.abortSignal,
  });
};

// 3. 스트리밍 응답 처리
// useAI 훅 내부에서 실시간 업데이트
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  fullText += chunkText;
  
  // Store 업데이트 → UI 자동 반영
  updateLastMessage(fullText);
}
```

#### 견적서 생성 프로세스

```typescript
// 1. AI 응답에서 견적 데이터 추출
const extractEstimateData = (content: string): ProjectEstimate | null => {
  // <script> 태그에서 JSON 추출
  const scriptMatch = content.match(
    /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
  );
  
  if (scriptMatch) {
    const jsonStr = scriptMatch[1];
    return JSON.parse(jsonStr);
  }
  
  // 마크다운 코드블록에서 추출
  const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }
  
  return null;
};

// 2. 견적서 렌더링 (AiMessageContent)
const AiMessageContent = ({ content }) => {
  const estimateData = extractEstimateData(content);
  
  if (estimateData) {
    return (
      <>
        <EstimateCard estimate={estimateData} />
        <EstimateAccordion estimate={estimateData} />
        <PeriodSlider onChange={handlePeriodChange} />
      </>
    );
  }
  
  return <div>{content}</div>;
};
```

### 📊 견적서 카드 (`EstimateCard.tsx`)

#### 주요 기능
1. **견적서 표시**: 프로젝트명, 총액, 기간
2. **공유**: 공유 링크 생성 및 복사
3. **다운로드**: PDF 미리보기 페이지 오픈
4. **비회원 처리**: 소셜 로그인 유도 → 발행자 정보 입력

```typescript
// 공유 링크 생성
const ensureUuidAndGetUrl = async () => {
  // 1. 게스트 정보 업데이트
  await updateGuestInfo();
  
  // 2. 견적서 업로드
  await uploadEstimateForGuest(estimate);
  
  // 3. UUID 보장
  const ensuredUuid = await ensureUuidOnce(estimate, estimate.project_name);
  
  // 4. 공유 URL 생성
  return `${window.location.origin}/pdf-preview?company=${companyCode}&uuid=${ensuredUuid}`;
};

// 다운로드 처리
const handleGeneratePDF = async () => {
  // /share, /cms, /superadmin 경로면 바로 미리보기
  if (window.location.pathname.includes('/share') || 
      window.location.pathname.includes('/cms') ||
      window.location.pathname.includes('/superadmin')) {
    await openPreviewTab();
    return;
  }
  
  // 로그인 사용자는 바로 미리보기
  if (isAuthenticated()) {
    await openPreviewTab();
  } else {
    // 비회원은 로그인 모달 표시
    setSocialLoginPurpose('download');
    setIsSocialLoginModalOpen(true);
  }
};
```

### 🎚️ 기간 슬라이더 (`PeriodSlider.tsx`)

#### FIXED vs DYNAMIC 모드

```typescript
// FIXED 모드: 연속적인 값 선택 가능
const sliderConfig = {
  min: 0,
  max: 8,  // 0~8주
  step: 1
};

// DYNAMIC 모드: 체크포인트만 선택 가능
const checkpoints = [0, 1, 5, 8];  // 0주, 1주, 5주, 8주만
const sliderConfig = {
  min: 0,
  max: checkpoints.length - 1,  // 인덱스: 0~3
  step: 1,
  checkpoints
};
```

#### 할인 계산

```typescript
// src/utils/discountCalculator.ts

export function calculateDiscountInfo(
  periodValue: number,
  basePrice: number,
  discountSettings: DiscountSettings
): DiscountInfo {
  const { checkpointList, rateRule } = discountSettings;

  if (rateRule === 'FIXED') {
    // 누적 할인 (예: 1주당 1.25% 할인)
    const checkpointValue = checkpointList[0]?.checkpoint || 1;
    const discountRatePerCheckpoint = checkpointList[0]?.discountRate || 1.25;
    const totalSteps = Math.floor(periodValue / checkpointValue);
    const percentage = totalSteps * discountRatePerCheckpoint;
    
    return {
      percentage,
      amount: Math.floor(basePrice * percentage / 100)
    };
  } else {
    // DYNAMIC: 체크포인트별 고정 할인율
    const currentCheckpoint = checkpointList.find(
      cp => cp.checkpoint === periodValue
    );
    const percentage = currentCheckpoint?.discountRate || 0;
    
    return {
      percentage,
      amount: Math.floor(basePrice * percentage / 100)
    };
  }
}
```

#### EstimateCard와 연동

```typescript
// EstimateCard.tsx

// 1. 할인 설정 가져오기
const discountSettings = useMemo(() => {
  if (!companyInfo) return defaultSettings;
  
  return {
    checkpointList: companyInfo.checkpointList,
    discountRate: companyInfo.discountRate,  // 'WEEK' | 'MONTH'
    rateRule: companyInfo.rateRule           // 'FIXED' | 'DYNAMIC'
  };
}, [companyInfo]);

// 2. 할인 적용된 총액 계산
const { totalDiscountedPrice, totalDiscountAmount } = useMemo(() => {
  if (projectPeriod === 0) {
    return { totalDiscountedPrice: basePrice, totalDiscountAmount: 0 };
  }
  
  let total = 0;
  let discountTotal = 0;
  
  estimate.categories.forEach(category => {
    category.sub_categories.forEach(subCategory => {
      subCategory.items.forEach(item => {
        if (!item.is_deleted) {
          const basePrice = parseFloat(item.price);
          
          // 할인 제외 항목 체크 (기획/디자인)
          if (isNonDiscountableItem(item)) {
            total += basePrice;
          } else {
            // 할인 적용
            const discountInfo = calculateDiscountInfo(
              projectPeriod,
              basePrice,
              discountSettings
            );
            total += basePrice - discountInfo.amount;
            discountTotal += discountInfo.amount;
          }
        }
      });
    });
  });
  
  return { 
    totalDiscountedPrice: Math.floor(total), 
    totalDiscountAmount: Math.floor(discountTotal) 
  };
}, [estimate, projectPeriod, discountSettings]);

// 3. 기간 표시 (MONTH인 경우 주 단위로 변환)
let extendedWeeks = 0;
if (projectPeriod > 0) {
  if (discountSettings.discountRate === 'MONTH') {
    extendedWeeks = projectPeriod * 4;  // 1개월 = 4주
  } else {
    extendedWeeks = projectPeriod;      // 주 단위 그대로
  }
}

const finalWeekValue = baseWeeks + extendedWeeks;
const monthValue = Math.ceil(finalWeekValue / 4.345);
```

---

## 인증 및 권한 관리

### 🔐 인증 흐름

```
1. 비회원 (Guest)
   - localStorage: guest-uuid 생성
   - 채팅 세션 생성
   - 견적서 조회 제한
   ↓
2. 소셜 로그인 (Google)
   - googleLoginInitial() → providerId로 조회
   - 신규: googleLoginUpdate() → 추가 정보 입력
   - 기존: 토큰 발급 → localStorage 저장
   ↓
3. 회원 전환
   - transferChatSessionToUser() 호출
   - 기존 비회원 세션을 회원 계정으로 이전
   ↓
4. 관리자 로그인
   - adminLogin() → 관리자 토큰 발급
   - localStorage: admin_access_token
   - JWT 디코드로 권한 확인 (isRoot)
```

### 🎭 권한 레벨

```typescript
// 1. 비회원 (Guest)
- 채팅 가능
- 견적서 생성 가능
- 견적서 다운로드 시 정보 입력 필요

// 2. 회원 (User)
- 모든 기능 사용 가능
- 채팅 이력 조회
- 견적서 다운로드 자유

// 3. 사이트 관리자 (Admin)
- 해당 회사의 회원/견적 관리
- AI 설정 (프롬프트, 단가표)
- 상담 요청 관리

// 4. 통합 관리자 (Super Admin)
- 모든 회사 관리
- 회사 생성/수정/삭제
- 카테고리 관리
- 관리자 계정 관리
```

### 🔑 토큰 관리

```typescript
// src/lib/api/callApi.ts

// 토큰 우선순위
const getToken = () => {
  // 1. 관리자 토큰 우선
  const adminToken = localStorage.getItem('admin_access_token');
  if (adminToken) return adminToken;
  
  // 2. 일반 회원 토큰
  const userToken = localStorage.getItem('token');
  if (userToken) return userToken;
  
  return null;
};

// JWT 디코드
const decodeToken = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.userId,
      isRoot: decoded.isRoot,        // 슈퍼 관리자 여부
      companyCode: decoded.companyCode,
      exp: decoded.exp
    };
  } catch {
    return null;
  }
};
```

---

## 데이터 흐름

### 📤 견적서 생성 플로우

```
1. 사용자 입력
   ↓
2. ChatInput → useChatActions
   - 파일 업로드 처리
   - 이미지/문서 분리
   ↓
3. useAI.sendChat()
   - 프롬프트 구성 (시스템 + 단가표 + 메시지)
   - Gemini API 호출
   ↓
4. 스트리밍 응답
   - chunk 단위로 수신
   - updateLastMessage() 실시간 업데이트
   ↓
5. JSON 추출
   - extractEstimateData()
   - <script> 또는 ```json 블록 파싱
   ↓
6. 백엔드 저장
   - saveMessageToBackend()
   - estimateId 생성 및 반환
   ↓
7. UI 렌더링
   - EstimateCard (요약)
   - EstimateAccordion (상세)
   - PeriodSlider (기간 조정)
```

### 🔄 세션 관리 플로우

```
[비회원]
1. 페이지 진입
   ↓
2. guest-uuid 생성/조회
   ↓
3. createChatSession(guestUuid)
   ↓
4. sessionId 저장 (chatStore)
   ↓
5. 채팅 진행
   ↓
6. 로그인 시
   ↓
7. transferChatSessionToUser(sessionId)
   ↓
8. 세션 소유권 이전
   ↓
9. 회원 채팅으로 전환

[회원]
1. 페이지 진입
   ↓
2. loadLatestChatSession()
   ↓
3. 최신 세션 조회
   ↓
4. loadSessionMessages(sessionId)
   ↓
5. 메시지 로드
   ↓
6. 채팅 이어가기
```

### 📊 회사 정보 로딩 플로우

```
1. URL에서 companyCode 추출
   - /{companyCode}/ai
   - /{companyCode}/cms
   ↓
2. fetchCompanyInfo()
   - GET /api/company/info
   - 헤더: x-company-code
   ↓
3. CompanyStore 저장
   - setCompanyInfo(response.data)
   ↓
4. 하위 컴포넌트에서 사용
   - const { companyInfo } = useCompanyStore()
   - 프롬프트, 단가표, 할인 설정 등
```

### 🎨 테마 적용 플로우

```
1. 회사 정보 로드
   ↓
2. companyInfo.mode 확인
   - 'LIGHT' | 'DARK'
   ↓
3. ThemeStore 업데이트
   - useThemeStore.setState({ isDarkMode: mode === 'DARK' })
   ↓
4. ThemeProvider 적용
   - theme 객체 동적 생성
   ↓
5. Styled-components에서 사용
   - ${({ theme }) => theme.primary}
```

---

## 주요 기능 상세

### 🎯 AI 프롬프트 관리

**위치**: `/{companyCode}/cms/aiSetting`

**기능**:
1. 시스템 프롬프트 조회/수정
2. 수정 이력 관리 (버전 관리)
3. 고객사별 독립적인 프롬프트

**API**:
```typescript
GET    /api/company/cms/ai/prompt/get-list
PATCH  /api/company/cms/ai/prompt/update
GET    /api/company/cms/ai/prompt/history/get-list?index=
```

### 💰 단가표 관리

**위치**: `/{companyCode}/cms/aiSetting`

**기능**:
1. 엑셀 업로드 (xlsx)
2. 단가 일괄 삭제
3. 개별 항목 삭제
4. 단가표 조회

**API**:
```typescript
GET    /api/company/cms/unit-prices?companyCode=
POST   /api/company/cms/unit-prices (multipart/form-data)
DELETE /api/company/cms/unit-prices/:id
DELETE /api/company/cms/unit-prices/all?companyCode=
```

**엑셀 구조**:
```
| 대분류 | 중분류 | 소분류 | 단위 | 단가 |
|--------|--------|--------|------|------|
| 프론트엔드 | 화면개발 | 일반화면 | 페이지 | 50000 |
```

### 🎚️ 할인 설정

**위치**: `/superAdmin/companyMng` (고객사 수정 시)

**타입**:
```typescript
interface DiscountSettings {
  discountRate: 'WEEK' | 'MONTH' | 'QUANTITY';  // 할인 단위
  rateRule: 'FIXED' | 'DYNAMIC';                // 할인 방식
  minValue: number;                             // 최소값
  maxValue: number;                             // 최대값
  checkpointList: Array<{
    checkpoint: number;                         // 체크포인트 (예: 1주, 5주)
    discountRate: number;                       // 할인율 (예: 5%, 10%)
  }>;
}
```

**예시**:
```typescript
// FIXED 모드: 1주당 1.25% 누적 할인
{
  discountRate: 'WEEK',
  rateRule: 'FIXED',
  minValue: 0,
  maxValue: 8,
  checkpointList: [{ checkpoint: 1, discountRate: 1.25 }]
}
// → 0주: 0%, 1주: 1.25%, 2주: 2.5%, ..., 8주: 10%

// DYNAMIC 모드: 특정 구간별 고정 할인
{
  discountRate: 'MONTH',
  rateRule: 'DYNAMIC',
  minValue: 0,
  maxValue: 8,
  checkpointList: [
    { checkpoint: 1, discountRate: 5 },
    { checkpoint: 5, discountRate: 10 },
    { checkpoint: 8, discountRate: 20 }
  ]
}
// → 0개월: 0%, 1개월: 5%, 5개월: 10%, 8개월: 20%
```

### 📋 채팅 이력 관리

**위치**: `/superAdmin/aiData/conversationHistory`

**기능**:
1. 모든 채팅방 조회
2. 메시지 상세 보기
3. 고객사별 필터링
4. 기간별 검색

**API**:
```typescript
GET /api/cms/company/chat?companyCode=&fromDate=&toDate=
GET /api/cms/company/chat/:chatId/messages?companyCode=
```

### 📥 견적 다운로드 현황

**위치**: `/superAdmin/aiData/estimateDownload`

**기능**:
1. 다운로드 기록 조회
2. 엑셀 다운로드
3. PDF 재다운로드
4. 통계 확인

**API**:
```typescript
GET /api/cms/estimate/download?companyCode=&fromDate=&toDate=
GET /api/estimate/download/:companyCode/:uuid.pdf
```

---

## 개발 팁

### 🐛 디버깅

```typescript
// devLogger 사용
import { devLog } from '@/lib/utils/devLogger';

devLog('변수명:', value);  // dev 환경에서만 출력
devLog('🔥 중요:', data);  // 이모지로 구분
```

### 🎨 테마 색상

```typescript
// THEME_COLORS 사용
import { THEME_COLORS } from '@/styles/theme_colors';

const Button = styled.button`
  background: ${THEME_COLORS.light.primary};
  color: ${THEME_COLORS.light.onPrimary};
`;
```

### 📝 타입 정의

```typescript
// API 타입은 .types.ts 파일에 정의
// src/lib/api/admin/adminApi.types.ts
// src/lib/api/user/userApi.types.ts

export interface CompanyInfoResponse {
  _id: string;
  companyCode: string;
  companyName: string;
  // ...
}
```

### 🔄 Store 사용

```typescript
// Store 외부에서 직접 접근
import { useChatStore } from '@/store/chatStore';

// 컴포넌트 내부
const messages = useChatStore(s => s.messages);

// 컴포넌트 외부
const currentMessages = useChatStore.getState().messages;
useChatStore.getState().addMessage(newMessage);
```

---

## 배포

### 🚀 빌드

```bash
npm run build
```

### 📦 배포 (Firebase)

```bash
firebase deploy
```

### 🌍 환경 변수

```bash
# .env.dev
VITE_ENV_NAME=dev
VITE_API_HOST=http://localhost:3000

# .env.prod
VITE_ENV_NAME=prod
VITE_API_HOST=https://api.example.com
```

---

## 트러블슈팅

### ❌ 일반적인 문제

**1. companyInfo가 null**
```typescript
// 원인: 회사 정보 로딩 전에 컴포넌트 렌더링
// 해결: isLoading 체크
const { companyInfo, isLoading } = useCompanyStore();

if (isLoading) return <Spinner />;
if (!companyInfo) return <Error />;
```

**2. chatSessionId가 없음**
```typescript
// 원인: 세션 생성 전에 메시지 전송
// 해결: ensureSession() 사용
const sessionId = await ensureSession();
```

**3. 토큰 만료**
```typescript
// 원인: JWT 토큰 만료
// 해결: 자동 로그아웃 처리
if (error.statusCode === 401) {
  useAuthStore.getState().logout();
  navigate('/login');
}
```

---

## 마무리

이 문서는 AI Estimate 프로젝트의 핵심 아키텍처와 주요 기능을 설명합니다.

**추가 문서**:
- [API 명세서](./API_SPECIFICATION.md) (작성 예정)
- [컴포넌트 가이드](./COMPONENT_GUIDE.md) (작성 예정)
- [배포 가이드](./DEPLOYMENT_GUIDE.md) (작성 예정)

**문의**:
- 프로젝트 관리자: [담당자 연락처]
- 이슈 트래커: [GitHub Issues]

**버전**:
- 최종 수정일: 2025-01-24
- 버전: 1.0.0
