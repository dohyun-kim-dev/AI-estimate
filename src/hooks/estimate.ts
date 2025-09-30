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

/** reply 전체에서 <script> 블록과 마크다운 코드블록 제거한 "인트로"만 추출 */
export function extractIntroFromReply(reply: string) {
  let intro = reply
    .replace(/<script type="application\/json" id="invoiceData">[\s\S]*?<\/script>/g, '')
    .replace(/```json\s*\n[\s\S]*?\n```/g, '')
    .trim();

  // JSON 시작 직전의 불필요한 텍스트 패턴들 제거
  // 예: "new_uuid_for_recommended_features", "uuid_123", "estimate_data" 등
  const unnecessaryPatterns = [
    /\b[a-zA-Z0-9_]*uuid[a-zA-Z0-9_]*\b/gi, // uuid 관련 텍스트
    /\b[a-zA-Z0-9_]*estimate[a-zA-Z0-9_]*\b/gi, // estimate 관련 텍스트
    /\b[a-zA-Z0-9_]*recommended[a-zA-Z0-9_]*\b/gi, // recommended 관련 텍스트
    /\b[a-zA-Z0-9_]*features?[a-zA-Z0-9_]*\b/gi, // feature 관련 텍스트
    /\b[a-zA-Z0-9_]*data[a-zA-Z0-9_]*\b/gi, // data 관련 텍스트
    /\bnew_[a-zA-Z0-9_]+\b/gi, // new_로 시작하는 패턴
    /\b[a-zA-Z0-9_]+_for_[a-zA-Z0-9_]+\b/gi, // _for_ 패턴
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, // UUID 패턴
  ];

  // 각 패턴을 제거
  unnecessaryPatterns.forEach(pattern => {
    intro = intro.replace(pattern, '').trim();
  });

  // 연속된 공백이나 줄바꿈 정리
  intro = intro.replace(/\s+/g, ' ').trim();

  // 빈 문자열이 되면 기본 메시지 반환
  if (!intro || intro.length === 0) {
    return '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';
  }

  return intro;
}

/** 인트로 + 스크립트(JSON) 문자열 조립 */
export function buildFullEstimateData(input: any, estimateIdOrIntro?: string, providedIntro?: string) {
  if (typeof input === 'string') {
    // content인 경우
    const intro = extractIntroFromReply(input);
    const estimate = extractEstimateData(input, estimateIdOrIntro); //uuid 있음?
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
    
    // providedIntro가 있으면 사용, 아니면 estimateIdOrIntro가 인트로인지 확인, 둘 다 없으면 기본값
    let headline = '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';
    
    if (providedIntro && providedIntro.length > 0) {
      headline = providedIntro;
    } else if (estimateIdOrIntro && estimateIdOrIntro.length > 0 && !estimateIdOrIntro.match(/^[a-f0-9-]{36}$/i)) {
      // estimateIdOrIntro가 UUID가 아니면 인트로로 간주
      headline = estimateIdOrIntro;
    }

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
    // 1. 먼저 <script> 태그에서 JSON 찾기 (기존 로직)
    const scriptMatch = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    
    if (scriptMatch) {
      const data = JSON.parse(scriptMatch[1]);
      if (data && typeof data === 'object') {
        console.log("extractEstimateData data (from script):", data);
        if (estimateId) {
          data.uuid = estimateId;
        }
        return data as T;
      }
    }
    
    // 2. <script> 태그가 없으면 마크다운 코드블록에서 JSON 찾기
    const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const data = JSON.parse(codeBlockMatch[1]);
      if (data && typeof data === 'object') {
        console.log("extractEstimateData data (from markdown):", data);
        if (estimateId) {
          data.uuid = estimateId;
        }
        return data as T;
      }
    }
    
    // 3. 위 두 방법이 안되면 content 전체를 JSON으로 파싱 시도
    const data = JSON.parse(content.trim());
    if (data && typeof data === 'object') {
      console.log("extractEstimateData data (from raw JSON):", data);
      if (estimateId) {
        data.uuid = estimateId;
      }
      return data as T;
    }
    
    return null;
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
    // 1. 먼저 <script> 태그에서 JSON 찾기 (기존 로직)
    const scriptMatch = content.match(
      /<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/
    );
    
    if (scriptMatch) {
      const json = JSON.parse(scriptMatch[1]);
      return json?.uuid || null;
    }
    
    // 2. <script> 태그가 없으면 마크다운 코드블록에서 JSON 찾기
    const codeBlockMatch = content.match(/```json\s*\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      const json = JSON.parse(codeBlockMatch[1]);
      return json?.uuid || null;
    }
    
    // 3. 위 두 방법이 안되면 content 전체를 JSON으로 파싱 시도
    const json = JSON.parse(content.trim());
    return json?.uuid || null;
  } catch {
    return null;
  }
}

/** (선택) 이름이 더 직관적인 alias가 필요하면 export */
export const ensureClientUuid = ensureEstimateUuid;
