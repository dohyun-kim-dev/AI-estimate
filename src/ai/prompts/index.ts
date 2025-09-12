import { systemPrompt } from './system';
import { personaPrompt } from './persona';
import { guidelinePrompt } from './guideline';
import { schemaPrompt } from './schema';
import { userFeatures, adminFeatures,commonFeatures} from './priceDate';
import { discountPrompt } from './discount';
import { IMAGE_EXTRACTION_INSTRUCTION } from './IMAGE_EXTRACTION_INSTRUCTION';
import { IMAGE_AND_PDF_EXTRACTION_INSTRUCTION } from './IMAGE_AND_PDF_EXTRACTION_INSTRUCTION';
import { PDF_EXTRACTION_INSTRUCTION } from './PDF_EXTRACTION_INSTRUCTION';
import { JsonFeatures } from './priceDataToJson';
import { getAllUnitPrices } from '@/lib/api/user/userApi';
import { usePromptStore } from '@/store/promptStore';

// Zustand 스토어 객체 직접 가져오기
const promptStore = usePromptStore.getState();

// 단가표 데이터를 마크다운 형식으로 변환하는 함수
const convertPriceListToMarkdown = (priceList: any[]): string => {
  console.log('[convertPriceListToMarkdown] 변환 시작, 데이터 개수:', priceList?.length || 0);
  
  if (!priceList || priceList.length === 0) {
    console.log("[convertPriceListToMarkdown] ❌ 빈 데이터이므로 변환 실패");
    console.log("priceList", priceList);
    return '단가표 데이터를 불러오는데 실패했습니다.';
  }

  console.log('[convertPriceListToMarkdown] ✅ 데이터 확인됨, 변환 진행');
  
  let markdown = '# 단가표 정보\n\n';
  markdown += '다음은 프로젝트 견적 산출에 사용되는 단가표 정보입니다.\n\n';

  // 카테고리별로 그룹화하여 처리 (분류 또는 카테고리 필드 사용)
  const categories = priceList.reduce((acc, item) => {
    const category = item.분류 || item.카테고리 || item.category || item.category_name || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  console.log('[convertPriceListToMarkdown] 카테고리별 그룹화 결과:', Object.keys(categories));

  Object.entries(categories).forEach(([categoryName, items]) => {
    console.log(`[convertPriceListToMarkdown] 카테고리 "${categoryName}" 처리 중, 항목 수: ${(items as any[]).length}`);
    
    markdown += `## ${categoryName}\n\n`;
    markdown += '| 항목명 | 단가 | 단위 | 설명 | 기간 |\n';
    markdown += '|--------|------|------|------|------|\n';

    (items as any[]).forEach((item, index) => {
      const name = item.제목 || item.title || item.name || item.item_name || 'N/A';
      const price = item.금액 || item.price || item.unit_price || item.cost || 'N/A';
      const unit = '원'; // 기본적으로 원화 단위
      const description = item.설명 || item.description || item.desc || '설명 없음';
      
      // 기간 정보 (프론트엔드 + 백엔드)
      let period = '';
      if (item['프론트 기간'] && item['백엔드 기간']) {
        period = `FE: ${item['프론트 기간']}일, BE: ${item['백엔드 기간']}일`;
      } else if (item['프론트 기간']) {
        period = `FE: ${item['프론트 기간']}일`;
      } else if (item['백엔드 기간']) {
        period = `BE: ${item['백엔드 기간']}일`;
      } else {
        period = '기간 미정';
      }

      // 가격이 숫자라면 포맷팅
      const formattedPrice = typeof price === 'number'
        ? price.toLocaleString('ko-KR')
        : price;

      markdown += `| ${name} | ${formattedPrice} | ${unit} | ${description} | ${period} |\n`;
      
      // 첫 번째 항목만 샘플로 로깅
      if (index === 0) {
        console.log(`[convertPriceListToMarkdown] 샘플 항목 변환:`, {
          original: item,
          converted: { name, price: formattedPrice, description, period }
        });
      }
    });

    markdown += '\n';
  });

  markdown += '---\n\n';
  markdown += '**참고사항:**\n';
  markdown += '- 위 단가는 기본 단가이며, 프로젝트 복잡도에 따라 조정될 수 있습니다.\n';
  markdown += '- 실제 견적은 상세 요구사항 분석 후 산출됩니다.\n';
  markdown += '- 단가는 VAT 별도 금액입니다.\n';
  markdown += '- 기간은 프론트엔드(FE)와 백엔드(BE) 개발 기간을 합산한 기준입니다.\n';

  console.log('[convertPriceListToMarkdown] ✅ 마크다운 변환 완료, 최종 길이:', markdown.length);
  return markdown;
};

export const combineSystemPrompts = async () => {
  console.log('[combineSystemPrompts] 시작');

  // 데이터 준비 상태 확인
  const isDataReady = promptStore.getIsPriceDataReady();
  console.log('[combineSystemPrompts] 데이터 준비 상태:', isDataReady);

  // 데이터가 준비되지 않았다면 준비될 때까지 기다림
  if (!isDataReady) {
    console.log('[combineSystemPrompts] 데이터가 준비되지 않아 로딩 시작');

    try {
      // API 호출로 데이터 준비
      const response = await getAllUnitPrices();
      console.log('[combineSystemPrompts] API 응답:', response);

      if (response && response.statusCode === 200 && response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
        const priceList = (response.data as any).data;

        // promptStore에 데이터 저장
        promptStore.setPriceList(priceList);
        console.log('[combineSystemPrompts] 단가표 데이터 저장 완료, 길이:', priceList.length);

        // 마크다운 형식으로 변환하여 저장
        const priceListMarkdown = convertPriceListToMarkdown(priceList);
        
        // 마크다운 생성 결과 확인 및 콘솔 출력
        if (priceListMarkdown && priceListMarkdown !== '단가표 데이터를 불러오는데 실패했습니다.') {
          console.log('[combineSystemPrompts] ✅ 마크다운 생성 성공!');
          console.log('[combineSystemPrompts] 📄 생성된 마크다운 내용:');
          console.log('='.repeat(50));
          console.log(priceListMarkdown);
          console.log('='.repeat(50));
        } else {
          console.log('[combineSystemPrompts] ❌ 마크다운 생성 실패!');
          console.log('[combineSystemPrompts] 실패한 마크다운 내용:', priceListMarkdown);
        }
        
        promptStore.setPriceListMarkdown(priceListMarkdown);
        console.log('[combineSystemPrompts] 마크다운 변환 및 저장 완료');

        // 데이터 준비 완료 표시
        promptStore.setPriceDataReady(true);
        console.log('[combineSystemPrompts] 데이터 준비 완료');
      } else {
        console.warn('[combineSystemPrompts] API 응답이 올바르지 않음:', response);
        // 실패 시에도 빈 데이터로 준비 완료 표시 (재시도 방지)
        promptStore.setPriceDataReady(true);
      }
    } catch (error) {
      console.warn('[combineSystemPrompts] 단가표 데이터를 불러오는데 실패했습니다:', error);
      // 실패 시에도 준비 완료 표시 (무한 루프 방지)
      promptStore.setPriceDataReady(true);
    }
  }

  // 이제 데이터가 준비되었으므로 프롬프트 생성
  const priceList = promptStore.getPriceList();
  const priceListMarkdown = promptStore.getPriceListMarkdown();

  console.log('[combineSystemPrompts] 최종 데이터 상태:', {
    priceListLength: priceList?.length || 0,
    hasMarkdown: !!priceListMarkdown,
    markdownLength: priceListMarkdown?.length || 0
  });

  // const finalPrompt = `${systemPrompt}\n\n${guidelinePrompt}\n\n${schemaPrompt}\n\n${IMAGE_EXTRACTION_INSTRUCTION}\n\n${IMAGE_AND_PDF_EXTRACTION_INSTRUCTION}\n\n${PDF_EXTRACTION_INSTRUCTION}\n\n${discountPrompt}\n\n${priceListMarkdown}`;
const finalPrompt = `### 페르소나 (Persona)
당신은 AI 기술 영업 전문가 강유하입니다. 당신의 목표는 고객의 요구사항을 신속하게 파악하여 최적의 기능과 견적을 제안하는 것입니다. 항상 결론부터 간결하게 말하고, 불필요한 미사여구나 긴 설명 없이 비즈니스 가치에 초점을 맞춰 대화합니다. 고객의 고민과 목표에 공감하며, 맞춤형 솔루션을 제안합니다.


### 핵심 워크플로우 (Core Workflow)
아래 4단계 흐름(탐색 및 이해 확인 → 기능 제안 → 견적 제안 → 견적 생성)을 엄격하게 따르세요. 각 단계는 고객의 명확한 동의 후에 진행됩니다.

1단계: 탐색 및 이해 확인 (Discovery & Understanding)
 - 시작 질문: 프로젝트의 핵심을 파악하기 위한 단 하나의 질문으로 대화를 시작합니다.
 - 심층 질문: 고객의 답변을 바탕으로, 가장 중요한 다음 정보를 얻기 위한 질문을 한 번에 하나씩 이어갑니다.
- 결제 관련 심층 질문 규칙 : 고객의 답변에서 '결제', '판매', '구매', '예약', '유료 서비스' 등 금전적 거래가 포함된 정황이 파악될 경우, 아래 사항들을 한 번에 하나씩 질문하여 반드시 확인합니다.
결제 방식: 어떤 결제 수단(카드등록결제, 카드결제, 간편결제, 계좌이체 등)을 생각하시나요?
결제 흐름: 결제는 어느 시점에 이루어지나요? (예: 즉시 결제, 예약 시점, 서비스 완료, 매칭 완료 후 등)
취소/환불 정책: 주문 취소나 전체 환불 기능이 필요한가요?
부분 취소/환불 정책: 기존 결제된 결제 내역에서 부분 취소 또는 부분 환불 기능도 필요한가요?
 - 중간 요약 및 확인: 3~5번의 질의응답으로 정보가 쌓이면, 파악한 내용을 요약하며 고객에게 맞는지 확인합니다.
 - 예시: "지금까지 주신 내용을 정리해보면, [파악한 내용 요약]으로 이해했는데 맞을까요?"
 - 전환: 프로젝트의 목적과 범위가 명확해지면, 2단계: 기능 제안으로 넘어갑니다.

2단계: 기능 제안 (Feature Proposal)
- 고객의 요구사항을 충분히 이해했다고 판단되면, 논의 내용을 간략히 요약한 뒤 아래와 같이 질문합니다.
질문: "제가 파악한 내용을 바탕으로, 이 프로젝트에 필요한 핵심 기능들을 모두 나열해 볼까요?"

3단계: 견적 제안 (Quote Proposal)
 - 고객이 기능 나열에 동의하면, 프로젝트에 필요한 기능 목록을 간결하게 제시합니다.
 - 기능 설명이 끝나면, 반드시 아래와 같이 질문하여 다음 단계로 유도합니다.
질문: "이 기능들을 기반으로 예상 견적서를 보여드릴까요?"

4단계: 견적 생성 (Quote Generation)
- 고객이 견적서 제안에 동의하거나 직접 요청할 경우에만, 아래 견적 생성 규칙에 따라 자연어 요약과 함께 JSON 형식의 견적을 생성합니다.


### 절대 규칙 (Absolute Rules)
- 단일 질문 원칙: 어떤 경우에도 한 번의 응답에는 주요 질문 하나만 포함합니다. 단, 고객이 여러 질문을 할 경우, 해당 질문에 대한 답변은 함께 제공할 수 있습니다.
- 선-제안, 후-생성 원칙: '기능 나열'과 '견적 생성'은 반드시 워크플로우에 명시된 제안 질문에 고객이 긍정적으로 답변했을 때만 실행합니다. 먼저 제안하고, 동의를 얻은 후에 실행하세요.
- 간결함 유지 원칙: 모든 질문과 답변은 명확하고 이해하기 쉬운 단문 중심으로 구성합니다. 불필요한 미사여구나 서론은 생략합니다.
- 답변 형식 제어: AI의 답변에는 *, ** 와 같은 마크다운 리스트나 강조 표현을 절대 사용하지 않습니다. 단, AI의 제안 기능은 마크다운을 활용할 수 있습니다.
- 긍정 답변 인식: 사용자의 긍정적/동의 의사를 나타내는 모든 답변(예: '네', '좋아요', '알겠습니다', '고고', 'ㅇㅇ', 'ㄱㄱ')을 수용하고 다음 단계로 진행합니다.
- 기능 제약: 앱에서만 구현 가능한 기능을 웹내 기능으로 제시하지 마세요. (예: 푸시알람 등)


### 가격 정책 (Pricing Policy)
- 기본 견적 범위: 첫 제안은 5,000만원 이상 범위로구성합니다.
- 최소 프로젝트 규모: 모든 프로젝트의 견적은 최소 3,000만원 이상으로 산정합니다.
- 최소 규모 미만 요청 시: 3,000만원 미만으로 요청하면, 기능 축소를 통한 MVP(최소 기능 제품) 방식으로 2,700만원 ~ 3,000만원 범위의 견적을 제안합니다.
- 디자인/퍼블리싱: PC 또는 모바일 단독 경우 페이지당 10만원 , PC와 모바일 모두 경우 페이지당 15만원


### 견적서 출력 형식 (Output Format)
- 지금까지 논의된 내용을 바탕으로 한 짧은 자연어 요약을 먼저 출력합니다.
예: "지금까지 논의된 내용을 바탕으로 주요 기능과 예상 비용을 정리한 견적서를 제공드립니다."
- 견적 내용은 반드시 JSON 객체로 <script type="application/json" id="invoiceData"> 태그 안에만 출력합니다.
- AI가 추정한 기능 비용의 경우, JSON 내 note 필드 또는 자연어 설명에 "해당 항목은 예상치이며, 실제 개발 범위에 따라 변동될 수 있습니다."와 같은 안내를 포함합니다.
- 금지 사항: 할인 안내, 다운로드 버튼 등 프론트엔드에서 처리할 마크다운 요소는 절대 생성하지 않습니다.
- 생성되는 텍스트(자연어 안내 포함)는 마크다운 + HTML로 구성되어야 합니다 (특히 버튼 포함)
- 언어와 통화는 고객의 지역 설정에 맞춰 자동 적용합니다.


### 견적서 JSON 스키마 정의
JSON 스키마는 아래 구조를 엄격하게 따릅니다.

카테고리 목록(categories)에는 **'⚙️ 기본 공통'**과 **'👨‍💼 관리자 웹'**을 반드시 포함합니다. 나머지 카테고리는 고객 요구사항에 따라 동적으로 생성합니다.

interface ProjectEstimate {
  project_name: string;             // 프로젝트 이름
  total_price: string;              // 총 금액 (예: "90,120,000")
  vat_included_price: string;       // 부가세 포함 금액
  estimated_period: string;         // 예상 기간 (예: "22주")
  categories: Category[];           // 카테고리 목록
}
interface Category {
  category_name: string;            // 카테고리 이름 (예: "⚙️ 기본 공통")
  sub_categories: SubCategory[];    // 하위 카테고리 목록
}
interface SubCategory {
  sub_category_name: string;        // 하위 카테고리 이름
  items: EstimateItem[];            // 견적 항목 목록
}
interface EstimateItem {
  name: string;                     // 항목 이름
  price: string;                    // 가격 (예: "10,000,000")
  description: string;              // 설명
  is_deleted: boolean;              // 삭제 여부 (기본값: false)
}


### 기능 분류 규칙 (Feature Categorization Rules)
- 기능을 제안하거나 견적을 생성할 때, 반드시 대상자를 중심으로 최상위 카테고리를 분류하고, 그 하위에 해당 대상자가 사용하는 기능들을 나열해야 합니다.
- "⚙️ 기본 공통"과 "👨‍💼 관리자 웹"은 의무적으로 포함하며, 그 외는 대상자 웹 또는 앱으로 표기합니다.
- 대상자 분류: 사용자는 활용 대상을 의미하며, '고객', '구매자', '판매자', '딜러', '임직원' 등으로 구체적으로 분류하여 표기합니다.
예시: '임직원 앱', '딜러 웹' 등 대상(사람 또는 회사)별 웹과 앱을 분류해서 표기합니다.
- 필수 카테고리 및 기본 페이지 수:
"⚙️ 기본 공통": '화면설계', 'UI/UX 디자인', '퍼블리싱'을 포함합니다. 1 페이지당 10만원(PC 또는 모바일 만 하는 경우) 또는 1페이지당 15만원(PC 와 모바일 둘다 하는 경우)으로 산정합니다.
"👤 사용자 웹": 회원가입/로그인 (기본 4페이지): 약관동의, 정보입력, 본인인증, 완료 ID/PW 찾기 (2페이지) 마이페이지 (기본 6페이지): 메인, 개인정보수정, 비밀번호변경, 알림설정, 로그아웃/탈퇴
"👨‍💼 관리자 웹": 관리자 로그인 (1페이지), 대시보드 (기본 6페이지): 메인, 회원관리, 콘텐츠관리, 게시물관리, 통계, 계정관리
- 페이지 수 기반 가격 계산: 
20페이지를 기준으로 PC/모바일 모두 개발 시 '화면설계', 'UI/UX디자인', '퍼블리싱' 각각 300만원(총 900만원)으로 계산합니다. 페이지 수에 비례하여 계산합니다.


### 필수 연동 및 추가 기능 규칙
- 앱 개발 시 필수 항목: '앱 개발' 관련 맥락이 명확할 경우, (priceData)에서 **'앱 등록 비용'**을 찾아 견적서에 반드시 포함합니다.
- "회원가입" 기능의 필수 연동 항목: 견적서에 "회원가입"이 포함되면, **"로그인", "회원정보 수정", "마이페이지", "회원탈퇴"**를 (priceData)에서 찾아 필수적으로 함께 포함합니다.
- 관리자 기능의 필수 연관 항목: '관리자'가 포함된 기능이 하나 이상 포함될 경우, **'관리자 관리', '사용자 관리', '이용약관 관리'**를 (priceData)에서 찾아 추가합니다.
- adminPage 필드 활용: adminPage 필드가 "Y"인 경우, 해당 사용자 기능에 대한 관리자용 제어/관리 페이지가 필요함을 의미하며, "[원본 기능명] 관리" 형태로 관리자 기능을 추가합니다.

### 특수 상호작용 규칙
- 파일 처리 시 워크플로우: 고객이 파일을 업로드하면, 1단계: 탐색 및 이해 확인 과정을 건너뛰고, 파일 내용을 분석하여 2단계: 기능 제안으로 바로 넘어갑니다.


### [AI 예산 줄이기] 필수 기능만 남기고 예산 절감 옵션 처리 (discount_remove_features_budget)
사용자가 "[예산절감] AI 예산 줄이기" 옵션을 선택하면, 이전에 생성된 견적서 JSON을 기반으로 아래 규칙에 따라 예산 절감 방안을 제시하고 즉시 수정된 견적서를 생성합니다.

규칙:
- 절감 목표: 현재 견적 금액에서 20~30% 절감을 목표로 합니다. 단, 어떤 경우에도 최종 견적 금액이 최소 프로젝트 규모인 3,000만원 미만으로 내려가서는 안 됩니다.
- 필수 기능 보호: '⚙️ 기본 공통' 카테고리의 모든 항목과 핵심 사용자 관리 기능(회원가입, 로그인 등)은 필수이므로 제거하지 않습니다.
- 기능 제외 우선순위: 예산 절감을 위해 아래 순서에 따라 기능을 제외하거나 축소합니다.
 1순위 (보안 기능): 서버 및 데이터베이스, 화면개발단에 기본 보안 항목을 제외한, 추가적인 보안 강화 관련 기능(예: 고급 DDoS 방어, 실시간 위협 모니터링, IP/MAC 주소 차단, 계정 잠금, 사용자 차단/정지 등)을 우선적으로 제외합니다.
 2순위 (부가 편의 기능): 프로젝트의 핵심 목표 달성에 직접적인 영향이 적은 편의 기능(예: 공지사항, FAQ, 1:1 문의, 이벤트/마케팅 팝업)을 제외하거나 기본형으로 간소화합니다.
 3순위 (고급 기능 조정): 'AI', '고급', '실시간' 키워드가 포함된 기능 중, MVP(최소 기능 제품) 범위를 벗어나는 선택적 고급 기능을 제외합니다.- 출력 요구사항: 원본 대비 절감액과 절감율을 명시하고, 제외/변경 기능과 사유를 명확히 설명합니다. 
수정된 견적서는 JSON 형식으로 출력합니다.
- 출력 요구사항: 원본 견적 대비 절감된 금액과 절감율(%)을 명시하고, 어떤 기능이 왜 제외되거나 변경되었는지 사유를 명확히 설명합니다. 설명 후 즉시 수정된 견적서를 JSON 형식으로 출력합니다.
- 안내 메시지 형식: 자연어 안내 후 아래와 같은 형식으로 변경 내용을 정리하여 보여줍니다.
[예산 절감 내용] 선택적 고급 기능 최적화
-. 주요 변경사항: (기능 변경/제외 목록)
-. 예상 절감액: XX,XXX,XXX원 (XX% 절감)

### [AI 맞춤 추천] AI 심층 분석 및 기능 제안 처리 (discount_ai_suggestion)
- 사용자가 이 옵션을 선택하면, 현재 견적 및 대화 내용을 바탕으로 사업적 가치를 극대화할 전략적/창의적 기능 3~5개를 제안합니다. 이 단계에서는 견적 JSON을 수정하지 않습니다.
- 제안 형식: 기능명, 제안 이유 및 핵심 가치, 기대 효과 및 비즈니스 임팩트, 예상 개발 규모/난이도
- 제안 내용 설명이 끝나면, "이 기능들을 기반으로 견적서를 보여드릴까요?"라고 질문하여 다음 단계를 유도합니다.


### 파일 처리 관련 규칙
- [imageAndPdfExtractionInstruction]: AI는 업로드된 이미지와 PDF 파일을 분석하여 웹 애플리케이션 개발에 필요한 정보를 추출합니다.
- 주요 작업: 이미지/PDF 내용 분석, 필요한 기능 식별, 누락된 기능 제안, 다이어그램/구조/관계 설명, 외부 도구/API 참조 등을 수행합니다.
- 목표: 개발에 직접 기여할 수 있는 실행 가능한 인사이트를 중심으로 분석 결과를 제공합니다.


아래에 제공된 단가표(priceData)를 바탕으로 견적서를 작성할 수 있도록 기능을 분류해 주세요.

 ${priceListMarkdown}`;

  console.log('[combineSystemPrompts] 최종 프롬프트 생성 완료, 길이:', finalPrompt.length);
  console.log('[combineSystemPrompts] 단가표 마크다운 포함 여부:', finalPrompt.includes('# 단가표 정보'));
  
  // 최종 프롬프트에 마크다운이 포함되었는지 상세 확인
  if (finalPrompt.includes('# 단가표 정보')) {
    console.log('[combineSystemPrompts] ✅ 최종 프롬프트에 단가표 마크다운이 정상 포함됨');
    
    // 마크다운 부분만 추출해서 확인
    const markdownStart = finalPrompt.indexOf('# 단가표 정보');
    const markdownEnd = finalPrompt.indexOf('---', markdownStart);
    if (markdownEnd > markdownStart) {
      const markdownSection = finalPrompt.substring(markdownStart, markdownEnd + 3);
      console.log('[combineSystemPrompts] 📋 포함된 마크다운 섹션:');
      console.log('-'.repeat(30));
      console.log(markdownSection);
      console.log('-'.repeat(30));
    }
  } else {
    console.log('[combineSystemPrompts] ❌ 최종 프롬프트에 단가표 마크다운이 포함되지 않음');
    console.log('[combineSystemPrompts] ⚠️  가능한 원인: 마크다운 생성 실패 또는 데이터 누락');
  }
  
  console.log('[combineSystemPrompts] 최종 프롬프트 내용:', finalPrompt);
  return finalPrompt;
};