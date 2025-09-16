// src/hooks/estimate.ts
import { v4 as uuidv4 } from 'uuid';

/** 견적 객체에 uuid가 없으면 생성해서 채워줌 */
export function ensureEstimateUuid(est: any) {
  if (!est) return est;
  if (!est.uuid) est.uuid = uuidv4();
  return est;
}

/** 견적 객체 정규화: uuid 보장, is_deleted 기본값, item_id 기본값 부여 */
export function normalizeEstimate<T extends Record<string, any>>(est: T): T {
  console.log("normalizeEstimate called with:", est);
  
  // ✅ 기존 UUID가 있으면 보존, 없으면 생성
  const existingUuid = est.uuid;
  ensureEstimateUuid(est);
  
  console.log("normalizeEstimate UUID 처리:", {
    existingUuid,
    finalUuid: est.uuid,
    preserved: existingUuid === est.uuid
  });

  est?.categories?.forEach((c: any, ci: number) =>
    c?.sub_categories?.forEach((sc: any, si: number) =>
      sc?.items?.forEach((it: any, ii: number) => {
        if (typeof it.is_deleted !== 'boolean') it.is_deleted = false;
        if (!it.item_id) it.item_id = `${ci}-${si}-${ii}`;
      })
    )
  );
  
  console.log("normalizeEstimate 결과:", est);
  return est;
}

/** reply 전체에서 <script> 블록 제거한 "인트로"만 추출 */
export function extractIntroFromReply(reply: string) {
  return reply
    .replace(/<script type="application\/json" id="invoiceData">[\s\S]*?<\/script>/g, '')
    .trim();
}

/** 인트로 + 스크립트(JSON) 문자열 조립 */
export function buildFullEstimateData(input: any, estimateId?: string) {
  if (typeof input === 'string') {
    // content인 경우
    const intro = extractIntroFromReply(input);
    const estimate = extractEstimateData(input,estimateId); //uuid 있음?
    console.log("buildFullEstimateData extracted estimate:", estimate);
    if (!estimate) return input; // 견적서가 없으면 원본 반환
    console.log("buildFullEstimateData input (string):", input);
    const prepared = normalizeEstimate(JSON.parse(JSON.stringify(estimate)));
    console.log("buildFullEstimateData:", prepared);
    const json = JSON.stringify(prepared, null, 2);
    const headline =
      (intro && intro.length > 0)
        ? intro
        : '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';

    return `${headline}

<script type="application/json" id="invoiceData">
${json}
</script>`;
  } else {
    // estimate 객체인 경우 (하위 호환성)
    console.log("buildFullEstimateData input:", input);
    const prepared = normalizeEstimate(JSON.parse(JSON.stringify(input || {})));
    console.log("buildFullEstimateData:", prepared);
    const json = JSON.stringify(prepared, null, 2);
    const headline = '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';

    return `${headline}

<script type="application/json" id="invoiceData">
${json}
</script>`;
  }
}

// HTML 안의 <script id="invoiceData">...</script> 에서 JSON 뽑기
export function extractInvoiceJSON(html: string) {
  const match = html.match(
    /<script[^>]*id=["']invoiceData["'][^>]*>([\s\S]*?)<\/script>/i
  );
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}


/** 메시지 content에서 invoiceData JSON을 파싱해서 객체로 반환 */
export function extractEstimateData<T = any>(content: string, estimateId?: string): T | null {
  try {
    const m = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    if (!m) return null;
    const data = JSON.parse(m[1]);
    if (!data || typeof data !== 'object') return null;
    console.log("extractEstimateData data:", data);
    if (estimateId) {
      data.uuid = estimateId;
    }
    return data as T;
  } catch {
    return null;
  }
}

/** 메시지 content에서 견적을 파싱하고 uuid 보장(없으면 생성) 후 돌려줌 */
export function getOrEnsureEstimateFromContent<T = any>(content: string) {
  const est = extractEstimateData<T>(content);
  if (!est) return { estimate: null as T | null };
  // 깊은 복사 후 정규화(= uuid/flags/id 보장)
  console.log("extractEstimateData est:", est);
  const ensured = normalizeEstimate(JSON.parse(JSON.stringify(est)));
  console.log("getOrEnsureEstimateFromContent:", ensured);
  return { estimate: ensured as T };
}

/** 문자열 content에서 uuid만 바로 추출하고 싶을 때 */
export function getEstimateIdFromContent(content: string): string | null {
  try {
    const m = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    if (!m) return null;
    const json = JSON.parse(m[1]);
    return json?.uuid || null;
  } catch {
    return null;
  }
}

/** (선택) 이름이 더 직관적인 alias가 필요하면 export */
export const ensureClientUuid = ensureEstimateUuid;
