import { v4 as uuidv4 } from 'uuid';
import { devLog } from '@/utils/devLogger'

export function normalizeEstimateForSave(est: any) {
  if (!est) return est;
  if (!est.uuid) est.uuid = uuidv4();
  devLog("normalizeEstimateForSave:", est);

  est.categories?.forEach((c: any, ci: number) => {
    c.sub_categories?.forEach((sc: any, si: number) => {
      sc.items?.forEach((it: any, ii: number) => {
        if (typeof it.is_deleted !== 'boolean') it.is_deleted = false;
        if (!it.item_id) it.item_id = `${ci}-${si}-${ii}`;
      });
    });
  });
  return est;
}

export function buildFullEstimateData(estimate: any, aiIntro?: string) {
  const intro =
    aiIntro ??
    '지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 아래에 바로 제공드립니다.';

  const prepared = normalizeEstimateForSave({ ...(estimate ?? {}) });
  const json = JSON.stringify(prepared, null, 2);
devLog("buildFullEstimateData prepared:", prepared);
  devLog("buildFullEstimateData json:", json);
  return `${intro}

<script type="application/json" id="invoiceData">
${json}
</script>`;
}

