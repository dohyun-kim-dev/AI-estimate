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

  const sendChat = useCallback(async (
    message: string,
    files: FileUploadData[] = [] // ⭐ 선택적 파일 인자 추가
  ): Promise<string> => {
    const model = ensureModel();
    if (!chatRef.current) chatRef.current = model.startChat();

    // Part 객체 배열을 생성합니다.
    const parts: any[] = [];

    // 텍스트 메시지를 Part에 추가합니다.
    if (message) {
      parts.push({ text: message });
    }

    // 파일이 있을 경우, 각 파일을 Part에 추가합니다.
    if (files.length > 0) {
      for (const file of files) {
        try {
          // fileUri에서 파일을 가져와서 base64로 변환
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

    // 텍스트 메시지나 파일이 없으면 오류를 반환합니다.
    if (parts.length === 0) {
      return '';
    }

    try {
      // ⭐ sendMessage 함수에 Part 배열을 전달합니다.
      const res = await chatRef.current.sendMessage(parts); 
      logUsageAndCost('sendChat', String(modelName), res);
      return res.response.text();
    } catch (error) {
      console.error('Failed to send multi-modal message:', error);
      throw error;
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

  return { modelName, setModelName, generate, sendChat, resetChat, testModel, setSystemInstruction: setSystem }
}
