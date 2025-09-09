import { useCallback, useRef, useState } from 'react'
import { getAI, getGenerativeModel, GenerativeModel, ChatSession } from 'firebase/ai'
import { app } from '@/firebaseConfig'
import { devLog } from '@/utils/devLogger'
import { Part, FileData } from '@google/generative-ai';
import { FileUploadData } from '@/firebase.functions';


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
  // 원 단위 반올림
  return `₩${Math.round(v).toLocaleString('ko-KR')}`
}

function pickNumber(...vals: any[]) {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return 0
}

function logUsageAndCost(where: string, modelName: string, anyResponse: unknown) {
  const r: any = anyResponse as any
  const usage = r?.response?.usageMetadata || r?.usageMetadata
  if (!usage) {
    devLog(`[useAI] ${where} usage: (no usage metadata)`, r)
    return
  }
  // 문서 기준 필드 대응
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
    promptT + candidatesT // fallback
  )

  const rate = getPricingForModel(modelName)
  const usdKrw = getUsdKrwRate()

  // 비용 계산은 입력/출력 기준으로만 산정 (캐시/생각 토큰은 별도 표기)
  const inputCostUSD = (promptT / 1_000_000) * rate.input
  const outputCostUSD = (candidatesT / 1_000_000) * rate.output
  const totalCostUSD = inputCostUSD + outputCostUSD

  const inputCostKRW = inputCostUSD * usdKrw
  const outputCostKRW = outputCostUSD * usdKrw
  const totalCostKRW = totalCostUSD * usdKrw

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
 */
export interface SendChatOptions {
  streaming?: boolean; // true: 실시간, false: 전체 응답만 (기본 true)
  onStream?: (chunk: string) => void;
  onEstimateJson?: (json: any) => void;
  onLoading?: (loading: boolean) => void;
}

export default function useAI(initialModel: SimpleModel = 'gemini-2.5-flash') {
  const [modelName, setModelName] = useState<SimpleModel>(initialModel)
  const [systemInstruction, setSystemInstruction] = useState<string | undefined>(undefined)
  const modelRef = useRef<GenerativeModel | null>(null)
  const chatRef = useRef<ChatSession | null>(null)

  const ensureModel = useCallback(() => {
    if (!app) throw new Error('Firebase app not initialized')
    const ai = getAI(app)
    modelRef.current = getGenerativeModel(ai, {
      model: modelName,
      ...(systemInstruction ? { systemInstruction } : {}),
    })
    devLog('[useAI] model initialized:', modelName)
    return modelRef.current
  }, [modelName, systemInstruction])

  const generate = useCallback(async (prompt: string): Promise<string> => {
    const model = ensureModel()
    const res = await model.generateContent(prompt)
    logUsageAndCost('generate', String(modelName), res)
    const text = res.response.text()
    return text
  }, [ensureModel, modelName])

  /**
   * AI 채팅 메시지 전송 (스트리밍/비스트리밍 모두 지원)
   * @param message - 프롬프트 텍스트
   * @param files - 첨부 파일 배열
   * @param options - SendChatOptions (streaming: true면 실시간, false면 전체 응답만)
   * @returns string (전체 응답)
   *
   * 사용 예시:
   *   sendChat('안녕', [], { streaming: true, onStream: (chunk) => ... })
   *   sendChat('안녕', [], { streaming: false })
   */
  const sendChat = useCallback(async (
    message: string,
    files: FileUploadData[] = [],
    options?: SendChatOptions
  ): Promise<string> => {
    const model = ensureModel();
    if (!chatRef.current) chatRef.current = model.startChat();

    // Part 객체 배열 생성
    const parts: any[] = [];
    if (message) parts.push({ text: message });
    if (files.length > 0) {
      for (const file of files) {
        try {
          const response = await fetch(file.fileUri);
          if (!response.ok) {
            console.warn(`Failed to fetch file from ${file.fileUri}:`, response.statusText);
            continue;
          }
          const arrayBuffer = await response.arrayBuffer();
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: file.mimeType,
            },
          });
        } catch (error) {
          console.error(`Error processing file ${file.fileUri}:`, error);
          continue;
        }
      }
    }
    if (parts.length === 0) return '';

    // 로딩 시작
    options?.onLoading?.(true);

    // streaming 옵션 기본값 true로 처리
    const streaming = options?.streaming !== undefined ? options.streaming : true;

    try {
      if (streaming) {
        // 스트리밍 모드: chunk 단위로 콜백 전달
        let result = '';
        if (typeof chatRef.current.sendMessageStream === 'function') {
          const streamResult = await chatRef.current.sendMessageStream(parts);
          for await (const candidate of streamResult.stream) {
            let chunk: string = '';
            if (typeof candidate?.text === 'function') {
              chunk = candidate.text();
            } else if (typeof candidate?.text === 'string') {
              chunk = candidate.text;
            }
            if (chunk) {
              // 콘솔에 실시간 chunk 로그
              console.log('[useAI] streaming chunk:', chunk);
              result += chunk;
              options?.onStream?.(chunk);
              if (chunk.trim().startsWith('{') && chunk.trim().endsWith('}')) {
                try {
                  const json = JSON.parse(chunk);
                  options?.onEstimateJson?.(json);
                } catch {}
              }
            }
          }
        } else {
          // fallback: 일반 sendMessage 사용
          const res = await chatRef.current.sendMessage(parts);
          const text = res.response.text();
          // 콘솔에 fallback도 로그
          console.log('[useAI] streaming fallback text:', text);
          result = text;
          options?.onStream?.(text);
          if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
            try {
              const json = JSON.parse(text);
              options?.onEstimateJson?.(json);
            } catch {}
          }
        }
        logUsageAndCost('sendChat(streaming)', String(modelName), {}); // 실제 usage 전달 필요
        return result;
      } else {
        // 비-스트리밍(일반) 모드
        const res = await chatRef.current.sendMessage(parts);
        logUsageAndCost('sendChat', String(modelName), res);
        const text = res.response.text();
        // 콘솔에 비스트리밍도 로그
        console.log('[useAI] non-streaming text:', text);
        if (text.trim().startsWith('{') && text.trim().endsWith('}')) {
          try {
            const json = JSON.parse(text);
            options?.onEstimateJson?.(json);
          } catch {}
        }
        return text;
      }
    } catch (error) {
      console.error('Failed to send multi-modal message:', error);
      throw error;
    } finally {
      options?.onLoading?.(false);
    }
  }, [ensureModel, modelName]);

  const resetChat = useCallback(() => {
    chatRef.current = null
  }, [])

  const setSystem = useCallback((sys: string | undefined) => {
    setSystemInstruction(sys)
    chatRef.current = null // 시스템 변경 시 세션 재시작
  }, [])

  const testModel = useCallback(async (): Promise<{ ok: boolean; message: string }> => {
    try {
      const model = ensureModel()
      const res = await model.generateContent('ping')
      logUsageAndCost('testModel', String(modelName), res)
      const t = res.response.text()
      return { ok: true, message: t?.slice(0, 160) || 'OK' }
    } catch (e: any) {
      const msg = e?.message || String(e)
      return { ok: false, message: msg }
    }
  }, [ensureModel, modelName])

  /**
   * sendChat 사용법:
   * sendChat('메시지', [], { streaming: true, onStream: (chunk) => ... })
   * sendChat('메시지', [], { streaming: false })
   * 기본값은 streaming: true (실시간)
   */
  return { modelName, setModelName, generate, sendChat, resetChat, testModel, setSystemInstruction: setSystem }
}