import { useCallback, useRef, useState, useEffect } from 'react'
import { GoogleGenerativeAI, GenerativeModel, ChatSession, SchemaType } from '@google/generative-ai'
import { devLog } from '@/utils/devLogger'
import { FileUploadData } from '@/firebase.functions'
import { useCompanyStore } from '@/store/companyStore'

export type SimpleModel =
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.0-flash'
  | (string & {})

// USD 단가(백오피스에서 ENV로 전역 기본을 바꾸거나, 아래 테이블을 보정하세요)
// 단위: USD per 1M tokens (추정치). 실단가는 프로젝트 정책에 맞게 조정 필요
const DEFAULT_PRICING_PER_MTOK_USD: Record<string, { input: number; output: number }> = {
  'gemini-2.5-flash': { input: 0.35, output: 0.53 },
  'gemini-2.5-flash-lite': { input: 0.1, output: 0.2 },
  'gemini-2.0-flash': { input: 0.2, output: 0.4 },
}

function getGlobalUsdRates() {
  const defIn = Number(import.meta.env.VITE_GEMINI_INPUT_PER_MTOK_USD || '')
  const defOut = Number(import.meta.env.VITE_GEMINI_OUTPUT_PER_MTOK_USD || '')
  return {
    input: Number.isFinite(defIn) && defIn > 0 ? defIn : undefined,
    output: Number.isFinite(defOut) && defOut > 0 ? defOut : undefined,
  }
}

function getPricingForModel(modelName: string) {
  const global = getGlobalUsdRates()
  const table = DEFAULT_PRICING_PER_MTOK_USD[modelName]
  return {
    input: global.input ?? table?.input ?? 0.2,
    output: global.output ?? table?.output ?? 0.6,
  }
}

function getUsdKrwRate() {
  const env = Number(import.meta.env.VITE_USD_KRW || '')
  return Number.isFinite(env) && env > 0 ? env : 1350 // 기본 1350원/USD
}

function formatCurrencyUSD(v: number) {
  return `$${v.toFixed(4)}`
}
function formatCurrencyKRW(v: number) {
  return `₩${Math.round(v).toLocaleString('ko-KR')}`
}

function pickNumber(...vals: any[]) {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 0
}

/**
 * 재시도 가능한 에러인지 판단하는 함수
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // FirebaseError의 경우
  if (error.code && typeof error.code === 'string') {
    const errorCode = error.code.toLowerCase();
    // AI 서비스 관련 재시도 가능한 에러들
    if (errorCode.includes('ai/fetch-error') || 
        errorCode.includes('unavailable') || 
        errorCode.includes('internal') ||
        errorCode.includes('timeout') ||
        errorCode.includes('ai/service-disabled') ||
        errorCode.includes('ai/quota-exceeded') ||
        errorCode.includes('ai/resource-exhausted')) {
      return true;
    }
  }

  // Firebase AI 특화 에러 메시지 패턴
  const firebaseErrorMessage = error.message || String(error);
  if (firebaseErrorMessage.includes('firebasevertexai.googleapis.com') && 
      (firebaseErrorMessage.includes('[500]') || 
       firebaseErrorMessage.includes('[502]') || 
       firebaseErrorMessage.includes('[503]') || 
       firebaseErrorMessage.includes('[504]') ||
       firebaseErrorMessage.includes('service is currently unavailable'))) {
    return true;
  }
  
  // HTTP 상태 코드 기반 판단
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    // 5xx 서버 에러나 429 Rate Limit는 재시도 가능
    return status >= 500 || status === 429;
  }
  
  // 에러 메시지 기반 판단
  const errorMessage = error.message || String(error);
  const retryableMessages = [
    'service is currently unavailable',
    'internal error',
    'timeout',
    'network error',
    'connection error',
    'fetch failed',
    'rate limit',
    'quota exceeded'
  ];
  
  return retryableMessages.some(msg => 
    errorMessage.toLowerCase().includes(msg)
  );
}

/**
 * 지수 백오프를 사용한 재시도 대기 시간 계산
 */
function calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
  // 지수 백오프: baseDelay * (2^attempt) + 랜덤 지터(0~500ms)
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 500; // 0~500ms 랜덤 지연
  return Math.min(exponentialDelay + jitter, 10000); // 최대 10초
}

/**
 * 재시도 가능한 비동기 함수 실행기
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000,
  onRetry?: (attempt: number, error: Error) => void,
  abortSignal?: AbortSignal
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // AbortSignal 체크
    if (abortSignal?.aborted) {
      throw new Error('Operation aborted');
    }
    
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // 마지막 시도이거나 재시도 불가능한 에러면 즉시 throw
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      
      // 재시도 콜백 호출
      console.warn(`[useAI] Attempt ${attempt + 1} failed, retrying...`, error);
      onRetry?.(attempt + 1, lastError);
      
      // 대기 시간 계산 및 대기
      const delay = calculateRetryDelay(attempt, baseDelay);
      devLog(`[useAI] Waiting ${delay}ms before retry...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

function logUsageAndCost(where: string, modelName: string, anyResponse: unknown) {
  const r: any = anyResponse as any
  const usage = r?.response?.usageMetadata || r?.usageMetadata
  if (!usage) {
    devLog(`[useAI] ${where} usage: (no usage metadata)`, r)
    return
  }
  const promptT = pickNumber(
    usage.promptTokenCount,
    usage.inputTokenCount,
    usage.inputTokens
  )
  const candidatesT = pickNumber(
    usage.candidatesTokenCount,
    usage.outputTokenCount,
    usage.outputTokens
  )
  const cachedT = pickNumber(usage.cachedContentTokenCount)
  const thoughtsT = pickNumber(usage.thoughtsTokenCount)
  const totalT = pickNumber(
    usage.totalTokenCount,
    usage.totalTokens,
    promptT + candidatesT
  )

  const rate = getPricingForModel(modelName)
  const usdKrw = getUsdKrwRate()

  const inputCostUSD = (promptT / 1_000_000) * rate.input
  const outputCostUSD = (candidatesT / 1_000_000) * rate.output
  const totalCostUSD = inputCostUSD + outputCostUSD

  const inputCostKRW = inputCostUSD * usdKrw
  const outputCostKRW = outputCostUSD * usdKrw
  const totalCostKRW = totalCostUSD * usdKrw

  // 실제 토큰 수 계산 결과 로깅
  devLog(`🔢 [${modelName}] 실제 토큰 계산 결과:`)
  devLog(`   입력 토큰: ${promptT.toLocaleString()} tokens`)
  devLog(`   출력 토큰: ${candidatesT.toLocaleString()} tokens`)
  devLog(`   캐시 토큰: ${cachedT.toLocaleString()} tokens`)
  devLog(`   사고 토큰: ${thoughtsT.toLocaleString()} tokens`)
  devLog(`   총 토큰: ${totalT.toLocaleString()} tokens`)
  devLog(`💰 비용 (KRW): ₩${totalCostKRW.toFixed(2)} (입력: ₩${inputCostKRW.toFixed(2)}, 출력: ₩${outputCostKRW.toFixed(2)})`)
  devLog(`💱 환율: ${usdKrw.toLocaleString()} KRW/USD`)

  devLog(
    `[useAI] ${where} tokens → input(prompt): ${promptT}, output(candidates): ${candidatesT}, cached: ${cachedT}, thoughts: ${thoughtsT}, total: ${totalT}`
  )
  devLog(
    `[useAI] ${where} cost(USD) → input: ${formatCurrencyUSD(inputCostUSD)}, output: ${formatCurrencyUSD(outputCostUSD)}, total: ${formatCurrencyUSD(totalCostUSD)}`
  )
  devLog(
    `[useAI] ${where} cost(KRW) → input: ${formatCurrencyKRW(inputCostKRW)}, output: ${formatCurrencyKRW(outputCostKRW)}, total: ${formatCurrencyKRW(totalCostKRW)}  (FX: ${usdKrw.toLocaleString('ko-KR')} KRW/USD)`
  )
}

/**
 * sendChat 옵션 타입
 * @property streaming - true면 스트리밍(실시간), false면 전체 응답만 반환 (기본값: true)
 * @property onStream - 스트리밍일 때 chunk 단위로 호출되는 콜백
 * @property onEstimateJson - 견적서 JSON 감지 시 콜백
 * @property onLoading - 로딩 상태 콜백
 * @property maxRetries - 최대 재시도 횟수 (기본값: 2)
 * @property retryDelay - 재시도 간격(ms) (기본값: 1000)
 * @property onRetry - 재시도 시 호출되는 콜백
 */
export interface SendChatOptions {
  streaming?: boolean; // true: 실시간, false: 전체 응답만 (기본 true)
  onStream?: (chunk: string) => void;
  onEstimateJson?: (json: any) => void;
  onLoading?: (loading: boolean) => void;
  abortSignal?: AbortSignal; // 스트리밍 중단용
  maxRetries?: number; // 최대 재시도 횟수 (기본값: 2)
  retryDelay?: number; // 재시도 간격(ms) (기본값: 1000)
  onRetry?: (attempt: number, error: Error) => void; // 재시도 콜백
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costKRW: number;
}

export default function useAI(initialModel: SimpleModel = 'gemini-2.5-flash') {
  const [modelName, setModelName] = useState<SimpleModel>(initialModel)
  const [systemInstruction, setSystemInstruction] = useState<string | undefined>(undefined)
  // companyStore에서 aiConfidence 값 가져오기
  const { companyInfo } = useCompanyStore()
  // maximum output tokens / thinking budget - companyStore의 aiConfidence 값 참조
  const [thinkingBudget, setThinkingBudget] = useState<number>(companyInfo?.aiConfidence || 500)

  const modelRef = useRef<GenerativeModel | null>(null)
  const chatRef = useRef<ChatSession | null>(null)
  const initialized = useRef(false)

  // companyStore의 aiConfidence 값이 변경되면 thinkingBudget 업데이트
  useEffect(() => {
    const newThinkingBudget = companyInfo?.aiConfidence * 10 || 500;
    if (newThinkingBudget !== thinkingBudget) {
      devLog('[useAI] aiConfidence 변경 감지:', thinkingBudget, '->', newThinkingBudget);
      setThinkingBudget(newThinkingBudget);
    }
  }, [companyInfo?.aiConfidence, thinkingBudget]);

  // thinkingBudget 또는 systemInstruction이 바뀌면 다음 전송 시 새 세션으로 시작되도록 리셋
  useEffect(() => {
    chatRef.current = null
  }, [thinkingBudget, systemInstruction, modelName])

  // 초기화 시 한 번만 시스템 프롬프트 설정
  // 🔥 Gemini API Key와 genAI 인스턴스를 ref로 관리
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    if (!initialized.current) {
      (async () => {
        try {
          // 🔥 CompanyStore에서 캐시된 정보 먼저 확인
          let apiKey = companyInfo?.geminiApiKey || '';
          
          if (!apiKey) {
            // 캐시에 없으면 API 호출
            const { getCompanyInfo } = await import('@/lib/api/user/userApi');
            const response = await getCompanyInfo();
            
            if (response.statusCode === 200 && response.data?.geminiApiKey) {
              apiKey = response.data.geminiApiKey;
              devLog('[useAI] Gemini API Key 로드 성공 (API 호출)');
            } else {
              // 폴백: 환경변수
              apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
              devLog('[useAI] 환경변수 API Key 사용');
            }
          } else {
            devLog('[useAI] Gemini API Key 로드 성공 (캐시 사용)');
          }
          
          if (apiKey) {
            genAIRef.current = new GoogleGenerativeAI(apiKey);
            devLog('[useAI] GoogleGenerativeAI 초기화 성공');
          }
          
          // 시스템 프롬프트 로드
          const { combineSystemPrompts } = await import('@/ai/prompts');
          const baseSystemPrompt = await combineSystemPrompts();
          
          // 견적서 출력 규칙 및 JSON 스키마 추가
          const additionalInstructions = `

## 최종 출력 형식 (Final Output Format)

### 견적서 출력 규칙
-   [자연어 요약]: JSON 출력 전, "지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 제공드립니다." 와 같은 짧은 요약을 먼저 출력.
-   [최초 견적 안내문]: 대화 기록에 \`<script type="application/json" id="invoiceData">\` 태그가 한 번도 없었다면, 자연어 요약 앞에 아래 안내문을 반드시 추가.
    \`\`\`
    견적서가 준비되었습니다. 첫 견적이라 아래 기능을 안내드립니다.

    
    📤 견적서 및 대화방 공유 기능
    생성된 견적서는 견적서 및 앱바 우측 상단에 [공유 아이콘]을 눌러 팀원들과 쉽게 공유할 수 있습니다.

    📄 견적서 PDF 다운로드 기능
    견적서 카드 UI 우측 [다운로드 아이콘]을 통해 현재 견적서를 내려받아 볼 수 있어요.

    🤖 발급된 견적서 열람
    로그인 후 앱바의 [문서아이콘]에서 발행된 모든 견적서를 확인할 수 있습니다.
    \`\`\`
-   [수정 견적]: 대화 기록에 견적서가 이미 존재한다면, 위 안내 문구 없이 바로 자연어 요약으로 시작.
-   [견적서 본문]: 견적 내용은 반드시 \`<script type="application/json" id="invoiceData">\` 태그 안에 JSON 객체로만 출력.

### JSON 스키마 (JSON Schema) - 엄격하게 준수

interface ProjectEstimate {
  project_name: string;          // 프로젝트 이름
  total_price: string;           // 총 금액 (예: "90,120,000")
  vat_included_price: string;    // 부가세 포함 금액
  estimated_period: string;      // 예상 기간 (예: "22주")
  categories: Category[];        // 카테고리 목록
}
interface Category {
  category_name: string;         // 카테고리 이름 (예: "⚙️ 기본 공통")
  sub_categories: SubCategory[]; // 하위 카테고리 목록
}
interface SubCategory {
  sub_category_name: string;     // 하위 카테고리 이름
  items: EstimateItem[];         // 견적 항목 목록
}
interface EstimateItem {
  name: string;                  // 항목 이름
  price: string;                 // 가격 (예: "10,000,000")
  description: string;           // 설명
  fe: string;                    // 프론트엔드 기간
  be: string;                    // 백엔드 기간
  page_count: number | string;   // 페이지 수 (AI가 string으로 반환할 수도 있음)
  cal_page: string;              // 본 수 반영 여부 ("Y" 또는 "N")
  is_deleted: boolean;           // 삭제 여부 (기본값: false)
}

**단가표 컬럼 매핑 규칙:**
- "금액" → price 필드 (**중요**: 단가표에 명시된 실제 금액을 그대로 사용. 절대 0으로 설정하지 말 것)
- "기능명" 또는 "제목" → name 필드
- "설명" → description 필드
- "프론트엔드_기간" 또는 "FE기간" → fe 필드
- "백엔드_기간" 또는 "BE기간" → be 필드
- "본 수 반영" → cal_page 필드 ("Y" 또는 "N" 값)

**가격 설정 필수 규칙:**
1. 단가표에서 해당 기능을 찾으면 반드시 해당 금액을 price 필드에 설정
2. 디자인, 기획, 환경구축 등 모든 항목은 cal_page: "N"으로 설정하되 price는 단가표의 실제 금액 사용
3. 화면 개발 관련 기능은 cal_page: "Y"로 설정하고 page_count와 함께 price는 단가표의 실제 단가 사용
4. 어떤 경우에도 단가표에 가격이 있는 항목의 price를 "0"으로 설정하지 말 것

**⚙️ 기본 공통 카테고리 특별 규칙:**
- 스토리보드, UI/UX 디자인 항목: cal_page: "N", page_count: 0, price: 단가표의 실제 금액
- 환경구축 관련 항목: cal_page: "N", page_count: 0, price: 단가표의 실제 금액
- 페이지 수를 추론하지 않는다고 해서 가격을 0으로 설정하는 것이 아님
- 기본 공통 항목들도 반드시 단가표의 실제 가격을 사용해야 함

`;
          
          const systemPrompt = baseSystemPrompt + additionalInstructions;
          devLog('[useAI] 시스템 프롬프트 초기화 완료, 길이:', systemPrompt.length);
          setSystemInstruction(systemPrompt);
        } catch (error) {
          console.error('[useAI] 초기화 실패:', error);
        }
      })();
      initialized.current = true;
    }
  }, [companyInfo?.geminiApiKey]);

  const ensureModel = useCallback(() => {
    if (!genAIRef.current) {
      throw new Error('GoogleGenerativeAI not initialized');
    }
    
    modelRef.current = genAIRef.current.getGenerativeModel({
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    devLog('[useAI] model initialized:', modelName);
    return modelRef.current;
  }, [modelName, systemInstruction])

  const generate = useCallback(async (prompt: string): Promise<string> => {
    const model = ensureModel()
    // 단발 요청에도 동일한 budget 적용
    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        thinkingConfig: { thinking_budget: thinkingBudget } as any,
      },
    } as any)
    logUsageAndCost('generate', String(modelName), res)
    const text = res.response.text()
    return text
  }, [ensureModel, modelName, thinkingBudget])

  /**
   * AI 채팅 메시지 전송 (스트리밍/비스트리밍 모두 지원)
   * @param message - 프롬프트 텍스트
   * @param files - 첨부 파일 배열
   * @param options - SendChatOptions (streaming: true면 실시간, false면 전체 응답만)
   * @param chatHistory - 과거 대화 이력 (세션 복원 시 사용)
   * @returns { text: string, tokenUsage?: TokenUsage } (전체 응답과 토큰 사용량)
   */
  const sendChat = useCallback(async (
    message: string,
    files: FileUploadData[] = [],
    options?: SendChatOptions & { chatHistory?: Array<{ role: 'user' | 'model'; content: string }> },
  ): Promise<{ text: string, tokenUsage?: TokenUsage }> => {
    const maxRetries = options?.maxRetries ?? 2;
    const retryDelay = options?.retryDelay ?? 1000;
    
    // 재시도 로직이 적용된 메인 함수
    return executeWithRetry(async () => {
      return await sendChatInternal(message, files, options);
    }, maxRetries, retryDelay, options?.onRetry, options?.abortSignal);
  }, [ensureModel, modelName, thinkingBudget])

  /**
   * 실제 채팅 메시지 전송 로직 (재시도 로직에서 호출됨)
   */
  const sendChatInternal = useCallback(async (
    message: string,
    files: FileUploadData[] = [],
    options?: SendChatOptions & { chatHistory?: Array<{ role: 'user' | 'model'; content: string }> },
  ): Promise<{ text: string, tokenUsage?: TokenUsage }> => {
    // 🔥 AI 오류 테스트용 - 주석 해제하면 강제 에러 발생
    // throw new Error('테스트용 AI 오류입니다.');
    const model = ensureModel();
    devLog(chatRef.current ? '[useAI] 기존 채팅 세션 재사용' : '[useAI] 새로운 채팅 세션 생성' , chatRef.current);
    // ✅ 첫 메시지부터 thinkingBudget 반영되도록 세션 생성 시 config 주입
    //세션스토리지에 ai-chat-storage.state.message < 2 면 새 채팅으로 간주
    const chatStorage = sessionStorage.getItem('ai-chat-storage');
    if (chatStorage) {
      const parsed = JSON.parse(chatStorage);
      const messages = parsed?.state?.messages || [];
      devLog('[useAI] 세션스토리지 메시지 수:', messages);
      if (messages.length < 4) {
        chatRef.current = null;
      }
    }
    devLog(chatRef.current ? '[useAI] 채팅 세션 유지' : '[useAI] 채팅 세션 초기화', chatRef.current);
    if (!chatRef.current) {
      // 과거 대화 이력이 있으면 history와 함께 세션 시작
      const history = options?.chatHistory?.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })) || [];
    devLog('[useAI] 새로운 채팅 세션 시작, thinkingBudget:', thinkingBudget, '이력 메시지 수:', history);
      chatRef.current = model.startChat({
        history,
        generationConfig: {
          thinkingConfig: { thinking_budget: thinkingBudget } as any,
        },
      } as any)
      
      if (history.length > 0) {
        devLog('[useAI] 과거 대화 이력과 함께 세션 시작:', history.length, '개 메시지');
      }
    }

    // Part 배열 생성
    const parts: any[] = []
    if (message) parts.push({ text: message })
        if (files.length > 0) {
  for (const file of files) {
    try {
      // 1) base64가 이미 준비되어 있으면 그대로 사용
      if ((file as any).base64) {
        parts.push({
          inlineData: {
            data: (file as any).base64,
            mimeType: file.mimeType,
          },
        });
        continue;
      }

      // 2) base64 없으면 fetch해서 보충 (대용량이면 비권장)
      if (file.fileUri) {
        const response = await fetch(file.fileUri, { 
          signal: options?.abortSignal 
        });
        if (!response.ok) {
          console.warn(`Failed to fetch file from ${file.fileUri}:`, response.statusText);
          continue;
        }
        const arrayBuffer = await response.arrayBuffer();

        // (안전 변환) chunk 단위로 base64 처리
        const base64Data = (() => {
          let binary = '';
          const bytes = new Uint8Array(arrayBuffer);
          const chunkSize = 0x8000; // 32KB
          for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, chunk as any);
          }
          return btoa(binary);
        })();

        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: file.mimeType,
          },
        });
      }
    } catch (error) {
      console.error(`Error processing file ${file.fileUri}:`, error);
      continue;
    }
  }
}
    if (parts.length === 0) return { text: '' }

    // 로딩 시작
    options?.onLoading?.(true)

    // streaming 기본값 true
    const streaming = options?.streaming !== undefined ? options.streaming : true

    try {
      // AbortSignal 체크 - API 호출 전
      if (options?.abortSignal?.aborted) {
        devLog('[useAI] sendChat: aborted before API call');
        throw new Error('Request aborted by user');
      }
      
      if (streaming) {
        // 스트리밍 모드
        if (typeof chatRef.current!.sendMessageStream === 'function') {
          const streamResult = await chatRef.current!.sendMessageStream(parts)
          let result = ''
          for await (const candidate of streamResult.stream) {
            if (options?.abortSignal?.aborted) {
              devLog('[useAI] sendChat: streaming aborted by user');
              break;
            }
            let chunk = ''
            if (typeof candidate?.text === 'function') chunk = candidate.text()
            else if (typeof candidate?.text === 'string') chunk = candidate.text
            if (chunk) {
              // devLog('[useAI] streaming chunk:', chunk)
              result += chunk
              options?.onStream?.(chunk)
              const trimmed = chunk.trim()
              if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                  const json = JSON.parse(trimmed)
                  options?.onEstimateJson?.(json)
                } catch {}
              }
            }
          }
          // ✅ 스트리밍 후 최종 response로 usage 로깅 및 토큰 정보 추출
          const finalResp = await streamResult.response
          logUsageAndCost('sendChat(streaming)', String(modelName), finalResp)
          
          // 토큰 정보 추출
          const usage = (finalResp as any)?.response?.usageMetadata || (finalResp as any)?.usageMetadata
          let tokenUsage: TokenUsage | undefined
          if (usage) {
            const promptT = pickNumber(usage.promptTokenCount, usage.inputTokenCount, usage.inputTokens)
            const candidatesT = pickNumber(usage.candidatesTokenCount, usage.outputTokenCount, usage.outputTokens)
            const totalT = pickNumber(usage.totalTokenCount, usage.totalTokens, promptT + candidatesT)
            
            const rate = getPricingForModel(modelName)
            const usdKrw = getUsdKrwRate()
            const inputCostUSD = (promptT / 1_000_000) * rate.input
            const outputCostUSD = (candidatesT / 1_000_000) * rate.output
            const totalCostKRW = (inputCostUSD + outputCostUSD) * usdKrw
            
            tokenUsage = {
              promptTokens: promptT,
              completionTokens: candidatesT,
              totalTokens: totalT,
              costKRW: totalCostKRW
            }
          }
          
          return { text: result, tokenUsage }
        } else {
          // fallback: 일반 sendMessage
          const res = await chatRef.current!.sendMessage(parts)
          const text = res.response.text()
          devLog('[useAI] streaming fallback text:', text)
          logUsageAndCost('sendChat(streaming-fallback)', String(modelName), res)
          
          // 토큰 정보 추출
          const usage = (res as any)?.response?.usageMetadata || (res as any)?.usageMetadata
          let tokenUsage: TokenUsage | undefined
          if (usage) {
            const promptT = pickNumber(usage.promptTokenCount, usage.inputTokenCount, usage.inputTokens)
            const candidatesT = pickNumber(usage.candidatesTokenCount, usage.outputTokenCount, usage.outputTokens)
            const totalT = pickNumber(usage.totalTokenCount, usage.totalTokens, promptT + candidatesT)
            
            const rate = getPricingForModel(modelName)
            const usdKrw = getUsdKrwRate()
            const inputCostUSD = (promptT / 1_000_000) * rate.input
            const outputCostUSD = (candidatesT / 1_000_000) * rate.output
            const totalCostKRW = (inputCostUSD + outputCostUSD) * usdKrw
            
            tokenUsage = {
              promptTokens: promptT,
              completionTokens: candidatesT,
              totalTokens: totalT,
              costKRW: totalCostKRW
            }
          }
          
          const trimmed = text.trim()
          if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            try {
              const json = JSON.parse(trimmed)
              options?.onEstimateJson?.(json)
            } catch {}
          }
          return { text, tokenUsage }
        }
      } else {
        // 비-스트리밍(일반) 모드
        // AbortSignal 체크 - 비스트리밍 API 호출 전
        if (options?.abortSignal?.aborted) {
          devLog('[useAI] sendChat: aborted before non-streaming API call');
          throw new Error('Request aborted by user');
        }
        
        const res = await chatRef.current!.sendMessage(parts)
        logUsageAndCost('sendChat', String(modelName), res)
        const text = res.response.text()
        devLog('[useAI] non-streaming text:', text)
        
        // 토큰 정보 추출
        const usage = (res as any)?.response?.usageMetadata || (res as any)?.usageMetadata
        let tokenUsage: TokenUsage | undefined
        if (usage) {
          const promptT = pickNumber(usage.promptTokenCount, usage.inputTokenCount, usage.inputTokens)
          const candidatesT = pickNumber(usage.candidatesTokenCount, usage.outputTokenCount, usage.outputTokens)
          const totalT = pickNumber(usage.totalTokenCount, usage.totalTokens, promptT + candidatesT)
          
          const rate = getPricingForModel(modelName)
          const usdKrw = getUsdKrwRate()
          const inputCostUSD = (promptT / 1_000_000) * rate.input
          const outputCostUSD = (candidatesT / 1_000_000) * rate.output
          const totalCostKRW = (inputCostUSD + outputCostUSD) * usdKrw
          
          tokenUsage = {
            promptTokens: promptT,
            completionTokens: candidatesT,
            totalTokens: totalT,
            costKRW: totalCostKRW
          }
        }
        
        const trimmed = text.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const json = JSON.parse(trimmed)
            options?.onEstimateJson?.(json)
          } catch {}
        }
        return { text, tokenUsage }
      }
    } catch (error) {
      console.error('Failed to send multi-modal message:', error)
      throw error
    } finally {
      options?.onLoading?.(false)
    }
  }, [ensureModel, modelName, thinkingBudget])

  const resetChat = useCallback(() => {
    chatRef.current = null
  }, [])

  const setSystem = useCallback((sys: string | undefined) => {
    setSystemInstruction(sys)
    chatRef.current = null // 시스템 변경 시 세션 재시작
  }, [])

  // 과거 대화 이력과 함께 새 채팅 세션 시작
  const startChatWithHistory = useCallback((history: Array<{ role: 'user' | 'model'; content: string }>) => {
    chatRef.current = null; // 기존 세션 리셋
    devLog('[useAI] startChatWithHistory 호출됨, 이력 개수:', history.length);
    devLog('chatRef.current:', chatRef.current);
  }, [])

const startNewChat = useCallback(() => {
    chatRef.current = null; // 기존 세션 리셋
    devLog('[useAI] startNewChat 호출됨, 새 세션 시작');
        devLog('chatRef:', chatRef);
  }, [])
  
  const testModel = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const model = ensureModel()
      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
        generationConfig: {
          thinkingConfig: { thinking_budget: thinkingBudget } as any,
        },
      } as any)
      logUsageAndCost('testModel', String(modelName), res)
      const t = res.response.text()
      return { ok: true, message: t?.slice(0, 160) || 'OK' }
    } catch (e: any) {
      const msg = e?.message || String(e)
      return { ok: false, message: msg }
    }
  }, [ensureModel, modelName, thinkingBudget])

  // const clearChatHistory = useCallback(() => {
  //         devLog('[useAI] clearChatHistory 호출됨', chatRef);
  //   if (chatRef.current) {
  //     devLog('[useAI] clearChatHistory 호출됨', chatRef.current);
  //     chatRef.current.history = [];
  //   }
  // }, []);

  /**
   * sendChat 사용법:
   * sendChat('메시지', [], { streaming: true, onStream: (chunk) => ... })
   * sendChat('메시지', [], { streaming: false })
   * sendChat('메시지', [], { chatHistory: [...] }) // 세션 복원 시
   * 기본값은 streaming: true (실시간)
   */
  return {
    modelName,
    setModelName,
    thinkingBudget,
    setThinkingBudget,
    generate,
    sendChat,
    resetChat,
    startChatWithHistory,
    startNewChat,
    testModel,
    setSystemInstruction: setSystem,
  }
}