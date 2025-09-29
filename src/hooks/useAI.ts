import { useCallback, useRef, useState, useEffect } from 'react'
import { getAI, getGenerativeModel, GenerativeModel, ChatSession, SchemaType } from 'firebase/ai'
import { app } from '@/firebaseConfig'
import { devLog } from '@/utils/devLogger'
import { FileUploadData } from '@/firebase.functions'

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
      console.log(`[useAI] Waiting ${delay}ms before retry...`);
      
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
  console.log(`🔢 [${modelName}] 실제 토큰 계산 결과:`)
  console.log(`   입력 토큰: ${promptT.toLocaleString()} tokens`)
  console.log(`   출력 토큰: ${candidatesT.toLocaleString()} tokens`)
  console.log(`   캐시 토큰: ${cachedT.toLocaleString()} tokens`)
  console.log(`   사고 토큰: ${thoughtsT.toLocaleString()} tokens`)
  console.log(`   총 토큰: ${totalT.toLocaleString()} tokens`)
  console.log(`💰 비용 (KRW): ₩${totalCostKRW.toFixed(2)} (입력: ₩${inputCostKRW.toFixed(2)}, 출력: ₩${outputCostKRW.toFixed(2)})`)
  console.log(`💱 환율: ${usdKrw.toLocaleString()} KRW/USD`)

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
  // maximum output tokens / thinking budget
  const [thinkingBudget, setThinkingBudget] = useState<number>(500)

  const modelRef = useRef<GenerativeModel | null>(null)
  const chatRef = useRef<ChatSession | null>(null)
  const initialized = useRef(false)

  // 🔧 최적화: systemInstruction은 초기화 후 거의 변경되지 않으므로 세션 리셋 조건 완화
  // thinkingBudget과 modelName 변경 시에만 세션 리셋 (systemInstruction 제외)
  useEffect(() => {
    chatRef.current = null
  }, [thinkingBudget, modelName])
  
  // systemInstruction 변경 시에는 경고만 출력 (개발 중에만 발생)
  useEffect(() => {
    if (initialized.current && chatRef.current) {
      console.warn('[useAI] systemInstruction 변경 감지됨. 다음 메시지부터 새 세션이 생성됩니다.');
      // 운영 환경에서는 systemInstruction이 자주 변경되지 않으므로 즉시 리셋하지 않음
    }
  }, [systemInstruction])

  // 초기화 시 한 번만 시스템 프롬프트 설정
  useEffect(() => {
    if (!initialized.current) {
      (async () => {
        try {
          const { combineSystemPrompts } = await import('@/ai/prompts');
          const systemPrompt = await combineSystemPrompts();
          console.log('[useAI] 시스템 프롬프트 초기화 완료, 길이:', systemPrompt.length);
          setSystemInstruction(systemPrompt);
        } catch (error) {
          console.error('[useAI] 시스템 프롬프트 초기화 실패:', error);
        }
      })();
      initialized.current = true;
    }
  }, []);

  const ensureModel = useCallback(() => {
    if (!app) throw new Error('Firebase app not initialized')
    const ai = getAI(app)
    modelRef.current = getGenerativeModel(ai, {
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
      // 🔥 웹 검색 및 함수 호출 기능 활성화
      tools: [
        {
          functionDeclarations: [
            {
              name: 'analyze_url_content',
              description: '웹사이트 URL을 분석하여 콘텐츠를 추출하고 요약합니다. 프로젝트 기획이나 견적서 작성에 유용한 정보를 가져옵니다.',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  url: {
                    type: SchemaType.STRING,
                    description: '분석할 웹사이트의 URL'
                  },
                  analysis_type: {
                    type: SchemaType.STRING,
                    enum: ['summary', 'full_content', 'project_info'],
                    description: '분석 타입: 요약(summary), 전체 내용(full_content), 프로젝트 정보(project_info)'
                  }
                },
                required: ['url']
              }
            }
          ]
        }
      ],
      // 웹 검색 기능 활성화 (Gemini Pro에서 지원)
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
    devLog('[useAI] model initialized with web search and function calling:', modelName)
    return modelRef.current
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
    const model = ensureModel();
    console.log(chatRef.current ? '[useAI] 기존 채팅 세션 재사용' : '[useAI] 새로운 채팅 세션 생성' , chatRef.current);
    // ✅ 첫 메시지부터 thinkingBudget 반영되도록 세션 생성 시 config 주입
    //세션스토리지에 ai-chat-storage.state.message < 2 면 새 채팅으로 간주
    const chatStorage = sessionStorage.getItem('ai-chat-storage');
    if (chatStorage) {
      const parsed = JSON.parse(chatStorage);
      const messages = parsed?.state?.messages || [];
      console.log('[useAI] 세션스토리지 메시지 수:', messages);
      if (messages.length < 4) {
        chatRef.current = null;
      }
    }
    console.log(chatRef.current ? '[useAI] 채팅 세션 유지' : '[useAI] 채팅 세션 초기화', chatRef.current);
    if (!chatRef.current) {
      // 과거 대화 이력이 있으면 history와 함께 세션 시작
      const history = options?.chatHistory?.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })) || [];
    console.log('[useAI] 새로운 채팅 세션 시작, thinkingBudget:', thinkingBudget, '이력 메시지 수:', history);
      chatRef.current = model.startChat({
        history,
        generationConfig: {
          thinkingConfig: { thinking_budget: thinkingBudget } as any,
        },
      } as any)
      
      if (history.length > 0) {
        console.log('[useAI] 과거 대화 이력과 함께 세션 시작:', history.length, '개 메시지');
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
        const response = await fetch(file.fileUri);
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
              // console.log('[useAI] streaming chunk:', chunk)
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
          console.log('[useAI] streaming fallback text:', text)
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
        const res = await chatRef.current!.sendMessage(parts)
        logUsageAndCost('sendChat', String(modelName), res)
        const text = res.response.text()
        console.log('[useAI] non-streaming text:', text)
        
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
    console.log('[useAI] startChatWithHistory 호출됨, 이력 개수:', history.length);
    console.log('chatRef.current:', chatRef.current);
  }, [])

const startNewChat = useCallback(() => {
    chatRef.current = null; // 기존 세션 리셋
    console.log('[useAI] startNewChat 호출됨, 새 세션 시작');
        console.log('chatRef:', chatRef);
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
  //         console.log('[useAI] clearChatHistory 호출됨', chatRef);
  //   if (chatRef.current) {
  //     console.log('[useAI] clearChatHistory 호출됨', chatRef.current);
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