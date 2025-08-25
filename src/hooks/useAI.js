import { useCallback, useRef, useState } from 'react';
import { getAI, getGenerativeModel } from 'firebase/ai';
import { app } from '@/firebaseConfig';
import { devLog } from '@/utils/devLogger';
// USD 단가(백오피스에서 ENV로 전역 기본을 바꾸거나, 아래 테이블을 보정하세요)
// 단위: USD per 1M tokens (추정치). 실단가는 프로젝트 정책에 맞게 조정 필요
const DEFAULT_PRICING_PER_MTOK_USD = {
    'gemini-2.5-flash': { input: 0.35, output: 0.53 },
    'gemini-2.5-flash-lite': { input: 0.1, output: 0.2 },
    'gemini-2.0-flash': { input: 0.2, output: 0.4 },
};
function getGlobalUsdRates() {
    const defIn = Number(import.meta.env.VITE_GEMINI_INPUT_PER_MTOK_USD || '');
    const defOut = Number(import.meta.env.VITE_GEMINI_OUTPUT_PER_MTOK_USD || '');
    return {
        input: Number.isFinite(defIn) && defIn > 0 ? defIn : undefined,
        output: Number.isFinite(defOut) && defOut > 0 ? defOut : undefined,
    };
}
function getPricingForModel(modelName) {
    const global = getGlobalUsdRates();
    const table = DEFAULT_PRICING_PER_MTOK_USD[modelName];
    return {
        input: global.input ?? table?.input ?? 0.2,
        output: global.output ?? table?.output ?? 0.6,
    };
}
function getUsdKrwRate() {
    const env = Number(import.meta.env.VITE_USD_KRW || '');
    return Number.isFinite(env) && env > 0 ? env : 1350; // 기본 1350원/USD
}
function formatCurrencyUSD(v) {
    return `$${v.toFixed(4)}`;
}
function formatCurrencyKRW(v) {
    // 원 단위 반올림
    return `₩${Math.round(v).toLocaleString('ko-KR')}`;
}
function pickNumber(...vals) {
    for (const v of vals) {
        if (typeof v === 'number' && Number.isFinite(v))
            return v;
    }
    return 0;
}
function logUsageAndCost(where, modelName, anyResponse) {
    const r = anyResponse;
    const usage = r?.response?.usageMetadata || r?.usageMetadata;
    if (!usage) {
        devLog(`[useAI] ${where} usage: (no usage metadata)`, r);
        return;
    }
    // 문서 기준 필드 대응
    const promptT = pickNumber(usage.promptTokenCount, usage.inputTokenCount, usage.inputTokens);
    const candidatesT = pickNumber(usage.candidatesTokenCount, usage.outputTokenCount, usage.outputTokens);
    const cachedT = pickNumber(usage.cachedContentTokenCount);
    const thoughtsT = pickNumber(usage.thoughtsTokenCount);
    const totalT = pickNumber(usage.totalTokenCount, usage.totalTokens, promptT + candidatesT // fallback
    );
    const rate = getPricingForModel(modelName);
    const usdKrw = getUsdKrwRate();
    // 비용 계산은 입력/출력 기준으로만 산정 (캐시/생각 토큰은 별도 표기)
    const inputCostUSD = (promptT / 1000000) * rate.input;
    const outputCostUSD = (candidatesT / 1000000) * rate.output;
    const totalCostUSD = inputCostUSD + outputCostUSD;
    const inputCostKRW = inputCostUSD * usdKrw;
    const outputCostKRW = outputCostUSD * usdKrw;
    const totalCostKRW = totalCostUSD * usdKrw;
    devLog(`[useAI] ${where} tokens → input(prompt): ${promptT}, output(candidates): ${candidatesT}, cached: ${cachedT}, thoughts: ${thoughtsT}, total: ${totalT}`);
    devLog(`[useAI] ${where} cost(USD) → input: ${formatCurrencyUSD(inputCostUSD)}, output: ${formatCurrencyUSD(outputCostUSD)}, total: ${formatCurrencyUSD(totalCostUSD)}`);
    devLog(`[useAI] ${where} cost(KRW) → input: ${formatCurrencyKRW(inputCostKRW)}, output: ${formatCurrencyKRW(outputCostKRW)}, total: ${formatCurrencyKRW(totalCostKRW)}  (FX: ${usdKrw.toLocaleString('ko-KR')} KRW/USD)`);
}
export default function useAI(initialModel = 'gemini-2.5-flash') {
    const [modelName, setModelName] = useState(initialModel);
    const [systemInstruction, setSystemInstruction] = useState(undefined);
    const modelRef = useRef(null);
    const chatRef = useRef(null);
    const ensureModel = useCallback(() => {
        if (!app)
            throw new Error('Firebase app not initialized');
        const ai = getAI(app);
        modelRef.current = getGenerativeModel(ai, {
            model: modelName,
            ...(systemInstruction ? { systemInstruction } : {}),
        });
        devLog('[useAI] model initialized:', modelName);
        return modelRef.current;
    }, [modelName, systemInstruction]);
    const generate = useCallback(async (prompt) => {
        const model = ensureModel();
        const res = await model.generateContent(prompt);
        logUsageAndCost('generate', String(modelName), res);
        const text = res.response.text();
        return text;
    }, [ensureModel, modelName]);
    const sendChat = useCallback(async (message) => {
        const model = ensureModel();
        if (!chatRef.current)
            chatRef.current = model.startChat();
        const res = await chatRef.current.sendMessage(message);
        logUsageAndCost('sendChat', String(modelName), res);
        return res.response.text();
    }, [ensureModel, modelName]);
    const resetChat = useCallback(() => {
        chatRef.current = null;
    }, []);
    const setSystem = useCallback((sys) => {
        setSystemInstruction(sys);
        chatRef.current = null; // 시스템 변경 시 세션 재시작
    }, []);
    const testModel = useCallback(async () => {
        try {
            const model = ensureModel();
            const res = await model.generateContent('ping');
            logUsageAndCost('testModel', String(modelName), res);
            const t = res.response.text();
            return { ok: true, message: t?.slice(0, 160) || 'OK' };
        }
        catch (e) {
            const msg = e?.message || String(e);
            return { ok: false, message: msg };
        }
    }, [ensureModel, modelName]);
    return { modelName, setModelName, generate, sendChat, resetChat, testModel, setSystemInstruction: setSystem };
}
