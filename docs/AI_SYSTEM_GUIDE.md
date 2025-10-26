# AI 시스템 상세 가이드

## 📋 목차
1. [개요](#개요)
2. [Google Gemini API 통합](#google-gemini-api-통합)
3. [useAI 훅 상세 분석](#useai-훅-상세-분석)
4. [프롬프트 엔지니어링](#프롬프트-엔지니어링)
5. [단가표 시스템](#단가표-시스템)
6. [스트리밍 처리](#스트리밍-처리)
7. [에러 핸들링](#에러-핸들링)
8. [성능 최적화](#성능-최적화)

---

## 개요

### AI 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│              사용자 입력                         │
│  (텍스트, 이미지, 문서)                          │
└───────────────┬─────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│          ChatInput Component                      │
│  - 파일 업로드 처리                               │
│  - 입력 검증                                      │
└───────────────┬───────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│         useChatActions Hook                       │
│  - 이미지/문서 분리                               │
│  - Base64 인코딩                                  │
└───────────────┬───────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│            useAI Hook                             │
│  - 프롬프트 구성                                  │
│  - Gemini API 호출                                │
│  - 스트리밍 처리                                  │
└───────────────┬───────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│         Google Gemini API                         │
│  - gemini-2.5-flash                               │
│  - gemini-2.0-flash                               │
└───────────────┬───────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│         스트리밍 응답                             │
│  - 실시간 chunk 수신                              │
│  - chatStore 업데이트                             │
└───────────────┬───────────────────────────────────┘
                ↓
┌───────────────────────────────────────────────────┐
│        AiMessageContent                           │
│  - 마크다운 렌더링                                │
│  - 견적서 추출 및 표시                            │
└───────────────────────────────────────────────────┘
```

---

## Google Gemini API 통합

### 1. API 설정

**환경 변수**:
```bash
# .env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**config/gemini.ts**:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 사용 가능한 모델
export type ModelName = 
  | 'gemini-2.5-flash'
  | 'gemini-2.0-flash'
  | 'gemini-1.5-pro';

// 모델별 설정
export const MODEL_CONFIG = {
  'gemini-2.5-flash': {
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  },
  'gemini-2.0-flash': {
    maxTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
  },
};
```

### 2. Gemini 모델 초기화

```typescript
import { genAI } from '@/config/gemini';

// 모델 생성
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});
```

### 3. 시스템 프롬프트 설정

```typescript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  systemInstruction: `
당신은 프로젝트 견적서를 작성하는 전문가입니다.

[역할]
- 사용자의 요구사항을 정확히 파악하여 견적서 작성
- 제공된 단가표를 기반으로 금액 산정
- 명확하고 전문적인 답변 제공

[출력 규칙]
1. 견적서는 JSON 형식으로 작성
2. <script type="application/json" id="invoiceData"> 태그로 감싸기
3. 추가 설명은 마크다운 형식으로 작성
  `,
});
```

---

## useAI 훅 상세 분석

### 전체 코드

```typescript
// src/hooks/useAI.ts
import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useChatStore } from '@/store/chatStore';
import { useCompanyStore } from '@/store/companyStore';

export type ModelName = 'gemini-2.5-flash' | 'gemini-2.0-flash';

export interface ImageData {
  data: string;      // Base64
  mimeType: string;  // image/jpeg, image/png, etc.
}

export interface FileData {
  name: string;
  data: string;      // Base64
  mimeType: string;  // application/pdf, etc.
}

export interface SendChatOptions {
  displayMessage?: string;  // 화면에 표시할 메시지 (실제 전송과 다를 수 있음)
  abortSignal?: AbortSignal;
}

export const useAI = (initialModel: ModelName = 'gemini-2.5-flash') => {
  const [modelName, setModelName] = useState<ModelName>(initialModel);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendChat = async (
    userMessage: string,
    imageDataList?: ImageData[],
    fileDataList?: FileData[],
    options?: SendChatOptions
  ) => {
    // 1. 회사 정보 및 프롬프트 가져오기
    const companyInfo = useCompanyStore.getState().companyInfo;
    if (!companyInfo) {
      throw new Error('회사 정보를 찾을 수 없습니다');
    }

    // 2. 시스템 프롬프트 로드
    const systemPrompt = await loadSystemPrompt(companyInfo.companyCode);
    
    // 3. 단가표 로드
    const unitPrices = await loadUnitPrices(companyInfo.companyCode);
    const unitPriceText = formatUnitPrices(unitPrices);

    // 4. Gemini API 초기화
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: `${systemPrompt}\n\n[현재 단가표]\n${unitPriceText}`,
    });

    // 5. 채팅 히스토리 구성
    const messages = useChatStore.getState().messages;
    const history = buildMessageHistory(messages);

    // 6. 채팅 시작
    const chat = model.startChat({ history });

    // 7. 프롬프트 구성 (텍스트 + 이미지 + 파일)
    const parts = [];
    
    // 텍스트
    parts.push({ text: userMessage });
    
    // 이미지
    if (imageDataList && imageDataList.length > 0) {
      imageDataList.forEach(img => {
        parts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType,
          },
        });
      });
    }
    
    // 파일 (문서)
    if (fileDataList && fileDataList.length > 0) {
      fileDataList.forEach(file => {
        parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType,
          },
        });
      });
    }

    // 8. AbortController 설정
    abortControllerRef.current = new AbortController();

    try {
      // 9. 스트리밍 요청
      const result = await chat.sendMessageStream(parts);

      // 10. AI 응답 메시지 추가 (빈 내용)
      useChatStore.getState().addMessage({
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      });

      // 11. 스트리밍 처리
      let fullText = '';
      for await (const chunk of result.stream) {
        // Abort 확인
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const chunkText = chunk.text();
        fullText += chunkText;

        // 실시간 UI 업데이트
        useChatStore.getState().updateLastMessage(fullText);
      }

      // 12. 백엔드에 메시지 저장
      const sessionId = useChatStore.getState().getEffectiveSessionId();
      if (sessionId) {
        await saveMessageToBackend(sessionId, userMessage, fullText);
      }

      // 13. 견적서 ID 추출 및 저장
      const estimateData = extractEstimateData(fullText);
      if (estimateData) {
        const estimateId = await uploadEstimate(estimateData);
        // 메시지에 estimateId 연결
      }

    } catch (error) {
      console.error('AI 채팅 오류:', error);
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  return {
    sendChat,
    stopGeneration,
    modelName,
    setModelName,
  };
};
```

### 주요 함수 설명

#### 1. buildMessageHistory

```typescript
function buildMessageHistory(messages: ChatMessage[]) {
  return messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));
}
```

**역할**: chatStore의 메시지를 Gemini API 형식으로 변환

**예시**:
```typescript
// chatStore 메시지
[
  { role: 'user', content: '웹사이트 제작 견적 요청' },
  { role: 'assistant', content: '네, 도와드리겠습니다...' }
]

// 변환 후
[
  { role: 'user', parts: [{ text: '웹사이트 제작 견적 요청' }] },
  { role: 'model', parts: [{ text: '네, 도와드리겠습니다...' }] }
]
```

#### 2. formatUnitPrices

```typescript
function formatUnitPrices(unitPrices: UnitPrice[]): string {
  let result = '';
  
  // 카테고리별 그룹핑
  const grouped = groupBy(unitPrices, 'category');
  
  Object.entries(grouped).forEach(([category, items]) => {
    result += `\n[${category}]\n`;
    
    // 서브카테고리별 그룹핑
    const subGrouped = groupBy(items, 'subCategory');
    
    Object.entries(subGrouped).forEach(([subCategory, subItems]) => {
      result += `  ${subCategory}:\n`;
      
      subItems.forEach(item => {
        result += `    - ${item.task}: ${item.unitPrice.toLocaleString()}원/${item.unit}\n`;
      });
    });
  });
  
  return result;
}
```

**출력 예시**:
```
[프론트엔드 개발]
  화면 개발:
    - 일반 화면: 50,000원/페이지
    - 복잡 화면: 100,000원/페이지
  공통 컴포넌트:
    - 재사용 컴포넌트: 30,000원/개

[백엔드 개발]
  API 개발:
    - RESTful API: 80,000원/개
    - GraphQL API: 120,000원/개
```

#### 3. extractEstimateData

```typescript
function extractEstimateData(content: string): ProjectEstimate | null {
  // 방법 1: <script> 태그에서 추출
  const scriptMatch = content.match(
    /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
  );
  
  if (scriptMatch) {
    try {
      return JSON.parse(scriptMatch[1]);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
    }
  }
  
  // 방법 2: 마크다운 코드블록에서 추출
  const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
    }
  }
  
  return null;
}
```

---

## 프롬프트 엔지니어링

### 시스템 프롬프트 구조

```typescript
const systemPrompt = `
당신은 프로젝트 견적서를 작성하는 전문가입니다.

[역할]
1. 사용자의 요구사항을 정확히 파악
2. 제공된 단가표를 기반으로 금액 산정
3. 명확하고 전문적인 견적서 작성

[단가표]
${unitPriceData}

[견적서 작성 규칙]
1. 사용자가 요청한 기능을 분석하여 필요한 항목 도출
2. 단가표에 있는 항목만 사용
3. 단가표에 없는 항목은 유사한 항목으로 대체 또는 사용자에게 확인
4. 수량은 합리적으로 산정 (예: 화면 10개, API 5개 등)
5. 총 금액은 모든 항목의 합계

[출력 형식]
견적서는 다음 JSON 형식으로 작성하고, <script type="application/json" id="invoiceData"> 태그로 감싸세요:

<script type="application/json" id="invoiceData">
{
  "project_name": "프로젝트명",
  "categories": [
    {
      "name": "카테고리명",
      "sub_categories": [
        {
          "name": "서브카테고리명",
          "items": [
            {
              "name": "항목명",
              "price": "가격 (숫자만)",
              "description": "상세 설명"
            }
          ]
        }
      ]
    }
  ],
  "total_amount": "총금액 (숫자만)",
  "estimated_period": "예상 기간 (주 단위, 숫자만)"
}
</script>

JSON 위아래로 사용자에게 친절한 설명을 마크다운 형식으로 추가하세요.

[예시]
안녕하세요! 요청하신 웹사이트 제작 견적서를 작성했습니다.

<script type="application/json" id="invoiceData">
{
  "project_name": "기업 홈페이지 제작",
  "categories": [
    {
      "name": "프론트엔드 개발",
      "sub_categories": [
        {
          "name": "화면 개발",
          "items": [
            {
              "name": "메인 페이지",
              "price": "100000",
              "description": "메인 페이지 디자인 및 개발"
            }
          ]
        }
      ]
    }
  ],
  "total_amount": "5000000",
  "estimated_period": "8"
}
</script>

총 예상 금액은 **5,000,000원**이며, 예상 기간은 **8주**입니다.
추가 문의사항이 있으시면 언제든지 말씀해주세요!
`;
```

### 프롬프트 최적화 팁

#### 1. 명확한 지시문

```typescript
// ❌ 나쁜 예
"견적서를 만들어줘"

// ✅ 좋은 예
"제공된 단가표를 기반으로 JSON 형식의 견적서를 작성하세요. 
각 항목은 name, price, description 필드를 포함해야 합니다."
```

#### 2. Few-shot Learning

```typescript
const systemPrompt = `
[예시 1]
입력: "쇼핑몰 웹사이트 만들어주세요"
출력:
{
  "project_name": "쇼핑몰 웹사이트",
  "categories": [
    {
      "name": "프론트엔드 개발",
      "sub_categories": [
        {
          "name": "화면 개발",
          "items": [
            { "name": "상품 목록 페이지", "price": "100000", ... }
          ]
        }
      ]
    }
  ],
  ...
}

[예시 2]
입력: "모바일 앱 개발 견적"
출력:
...
`;
```

#### 3. 제약 조건 명시

```typescript
const systemPrompt = `
[제약 조건]
- 총 금액은 1억원을 초과할 수 없습니다
- 예상 기간은 최소 4주, 최대 52주입니다
- 모든 가격은 원 단위로 표시합니다
- 항목명은 30자를 초과할 수 없습니다
`;
```

---

## 단가표 시스템

### 단가표 데이터 구조

```typescript
interface UnitPrice {
  _id: string;
  companyCode: string;
  category: string;        // 대분류
  subCategory: string;     // 중분류
  task: string;            // 소분류
  unit: string;            // 단위 (페이지, 개, 시간 등)
  unitPrice: number;       // 단가 (원)
  minQuantity?: number;    // 최소 수량
  maxQuantity?: number;    // 최대 수량
  description?: string;    // 설명
  createdAt: string;
  updatedAt: string;
}
```

### 단가표 엑셀 업로드

**Excel 구조**:
```
| 대분류 | 중분류 | 소분류 | 단위 | 단가 | 최소수량 | 최대수량 | 설명 |
|--------|--------|--------|------|------|----------|----------|------|
| 프론트엔드 개발 | 화면 개발 | 일반 화면 | 페이지 | 50000 | 1 | 100 | 일반적인 정보 표시 화면 |
```

**업로드 처리**:
```typescript
import * as XLSX from 'xlsx';

async function uploadUnitPrices(file: File, companyCode: string) {
  // 1. 엑셀 파일 읽기
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);

  // 2. 데이터 변환
  const unitPrices = jsonData.map((row: any) => ({
    companyCode,
    category: row['대분류'],
    subCategory: row['중분류'],
    task: row['소분류'],
    unit: row['단위'],
    unitPrice: parseInt(row['단가']),
    minQuantity: row['최소수량'] ? parseInt(row['최소수량']) : undefined,
    maxQuantity: row['최대수량'] ? parseInt(row['최대수량']) : undefined,
    description: row['설명'],
  }));

  // 3. 백엔드에 업로드
  const formData = new FormData();
  formData.append('file', file);
  formData.append('companyCode', companyCode);

  const response = await fetch('/api/company/cms/unit-prices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-company-code': companyCode,
    },
    body: formData,
  });

  return response.json();
}
```

---

## 스트리밍 처리

### 스트리밍 응답 처리

```typescript
async function handleStreaming(result: any) {
  let fullText = '';
  let buffer = '';  // 불완전한 JSON 버퍼

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    fullText += chunkText;
    buffer += chunkText;

    // 1. 실시간 UI 업데이트
    useChatStore.getState().updateLastMessage(fullText);

    // 2. 견적서 JSON 파싱 시도 (버퍼링)
    const scriptMatch = buffer.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );

    if (scriptMatch) {
      try {
        const estimateData = JSON.parse(scriptMatch[1]);
        // 견적서 데이터 사용 (미리보기 등)
        console.log('견적서 파싱 성공:', estimateData);
      } catch {
        // 아직 JSON이 완성되지 않음
      }
    }
  }

  // 3. 최종 완성된 응답
  return fullText;
}
```

### 스트리밍 취소

```typescript
const abortController = new AbortController();

// 스트리밍 중 취소
stopButton.addEventListener('click', () => {
  abortController.abort();
});

// useAI에서 사용
const result = await chat.sendMessageStream(parts, {
  signal: abortController.signal,
});
```

---

## 에러 핸들링

### 1. API 에러 처리

```typescript
try {
  const result = await chat.sendMessageStream(parts);
  // ...
} catch (error: any) {
  // Gemini API 에러
  if (error.message?.includes('API key')) {
    showToast('API 키가 올바르지 않습니다', 'error');
  } else if (error.message?.includes('quota')) {
    showToast('API 할당량을 초과했습니다', 'error');
  } else if (error.message?.includes('safety')) {
    showToast('안전 정책에 위배되는 콘텐츠입니다', 'error');
  } else {
    showToast('AI 응답 생성 중 오류가 발생했습니다', 'error');
  }
  
  // Sentry로 에러 로그
  Sentry.captureException(error, {
    extra: {
      model: modelName,
      messageLength: userMessage.length,
    },
  });
}
```

### 2. 타임아웃 처리

```typescript
const TIMEOUT_MS = 60000;  // 60초

async function sendChatWithTimeout(...args) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('타임아웃')), TIMEOUT_MS);
  });

  const chatPromise = sendChat(...args);

  return Promise.race([chatPromise, timeoutPromise]);
}
```

### 3. 재시도 로직

```typescript
async function sendChatWithRetry(
  ...args,
  maxRetries = 3
) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendChat(...args);
    } catch (error) {
      lastError = error;
      
      // 재시도 가능한 에러인지 확인
      if (!isRetryableError(error)) {
        throw error;
      }
      
      // 지수 백오프
      await sleep(Math.pow(2, i) * 1000);
    }
  }

  throw lastError;
}

function isRetryableError(error: any): boolean {
  return (
    error.message?.includes('network') ||
    error.message?.includes('timeout') ||
    error.status === 503
  );
}
```

---

## 성능 최적화

### 1. 토큰 사용량 최적화

```typescript
// 히스토리 제한 (최근 10개 메시지만)
function buildMessageHistory(messages: ChatMessage[]) {
  const recentMessages = messages.slice(-10);
  
  return recentMessages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));
}
```

### 2. 캐싱

```typescript
// 단가표 캐싱
let cachedUnitPrices: UnitPrice[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;  // 5분

async function loadUnitPrices(companyCode: string): Promise<UnitPrice[]> {
  const now = Date.now();
  
  if (cachedUnitPrices && now - cacheTimestamp < CACHE_DURATION) {
    return cachedUnitPrices;
  }
  
  const response = await getUnitPrices(companyCode);
  cachedUnitPrices = response.data.unitPrices;
  cacheTimestamp = now;
  
  return cachedUnitPrices;
}
```

### 3. 디바운싱

```typescript
import { debounce } from 'lodash';

// 입력 중 실시간 응답 (디바운싱)
const debouncedSendChat = debounce(async (message: string) => {
  await sendChat(message);
}, 500);
```

---

## 참고 링크

- [Google Gemini API 공식 문서](https://ai.google.dev/docs)
- [Gemini API Node.js SDK](https://github.com/google/generative-ai-js)
- [프롬프트 엔지니어링 가이드](https://www.promptingguide.ai/)

---

**문서 버전**: 1.0.0  
**최종 수정일**: 2025-01-24
