// src/hooks/estimate.ts
import { v4 as uuidv4 } from 'uuid';

export function ensureEstimateUuid<T extends Record<string, any>>(est: T): T {
  if (!est) return est;
  if (!est.uuid) est.uuid = uuidv4();
  return est;
}

export function normalizeEstimate<T extends Record<string, any>>(est: T): T {
  ensureEstimateUuid(est);
  est?.categories?.forEach((c: any, ci: number) =>
    c?.sub_categories?.forEach((sc: any, si: number) =>
      sc?.items?.forEach((it: any, ii: number) => {
        if (typeof it.is_deleted !== 'boolean') it.is_deleted = false;
        if (!it.item_id) it.item_id = `${ci}-${si}-${ii}`;
      })
    )
  );
  return est;
}

/** reply 전체에서 <script> 블록 제거한 "인트로"만 추출 */
export function extractIntroFromReply(reply: string) {
  return reply.replace(/<script type="application\/json" id="invoiceData">[\s\S]*?<\/script>/g, '').trim();
}

/** 인트로 + 스크립트(JSON) 문자열 조립 */
export function buildFullEstimateData(estimate: any, intro?: string) {
  const prepared = normalizeEstimate(JSON.parse(JSON.stringify(estimate || {})));
  const json = JSON.stringify(prepared, null, 2);
  const headline =
    (intro && intro.length > 0)
      ? intro
      : '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';

  return `${headline}

<script type="application/json" id="invoiceData">
${json}
</script>`;
}


export const getEstimateIdFromContent = (content: string): string | null => {
    try {
      const m = content.match(/<script type="application\/json" id="invoiceData">([\s\S]*?)<\/script>/);
      if (!m) return null;
      const json = JSON.parse(m[1]);
      return json?.uuid || null;
    } catch {
      return null;
    }
  };