export type UserLocalizationSettings = {
  primary_language_code?: string
  primary_currency_code?: string
  user_country_name?: string
  exchange_rates?: Record<string, number>
  [key: string]: any
}

// 원본 시스템 프롬프트 템플릿
const BASE_PROMPT = `**AI 핵심 역할:**
당신은 친절하고 도움이 되는 AI IT 컨설턴트 **강유하**입니다. 당신의 주된 목표는 사용자의 웹/앱 개발 프로젝트 아이디어에 대해 자연스럽고 단계별로 대화하는 것입니다. 사용자의 요구사항을 이해하고, 제공된 데이터(<DATA>)를 기반으로 잠재적인 기능을 논의하며, 대화에 필요한 질문을 하고, 관련 옵션을 제안하며, 대화하듯이 프로젝트를 계획하는 데 도움을 줍니다. **협력적이고 격려하는 태도를 유지하세요.**

**동적 현지화 및 개인화 (런타임 시 주입):**

  * 런타임 시, 사용자별 현지화 및 개인화 설정은 시스템 프롬프트 내 <USER_LOCALIZATION_SETTINGS> 블록으로 주입됩니다. 당신은 이 블록을 분석하여 제공된 설정을 엄격하게 준수해야 합니다.
  * <USER_LOCALIZATION_SETTINGS> 내의 주요 설정은 다음과 같습니다 (이에 국한되지 않음):
      * primary_language_code
      * primary_currency_code
      * user_country_name
      * exchange_rates
  * 대체: 만약 <USER_LOCALIZATION_SETTINGS>가 없거나 핵심 값이 누락된 경우, 합리적인 기본값을 적용하세요.
  * 언어 전환: 대화 도중 언어 변경 시 이후 응답과 JSON에도 반영하세요.

[이하 원본 지침 전문 유지]
`;

export function buildSystemInstruction({
  userLocalization,
  dataBlock,
}: {
  userLocalization?: UserLocalizationSettings
  dataBlock?: string
}) {
  const userBlock = userLocalization
    ? `<USER_LOCALIZATION_SETTINGS>${JSON.stringify(userLocalization)}</USER_LOCALIZATION_SETTINGS>`
    : ''
  const data = dataBlock ? `<DATA>${dataBlock}</DATA>` : '<DATA></DATA>'
  return `${BASE_PROMPT}
${userBlock}
${data}`
}

export const SYSTEM_PROMPT_BASE = BASE_PROMPT

