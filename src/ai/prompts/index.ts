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
import { getAllUnitPrices, getAiPrompts } from '@/lib/api/user/userApi';
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

  // AI 프롬프트 데이터 가져오기
  let aiPromptsContent = '';
  try {
    const aiPromptsResponse = await getAiPrompts();
    console.log('[combineSystemPrompts] AI 프롬프트 API 응답:', aiPromptsResponse);

    if (aiPromptsResponse && aiPromptsResponse.statusCode === 200 && aiPromptsResponse.data) {
      const promptsData = aiPromptsResponse.data as any;
      
      // GREETING, INSTRUCTION, OTHER의 content를 순차 연결
      const greetingContent = promptsData.GREETING?.content || '';
      const instructionContent = promptsData.INSTRUCTION?.content || '';
      const otherContent = promptsData.OTHER?.content || '';
      
      aiPromptsContent = `${greetingContent}${instructionContent}${otherContent}`;
      console.log('[combineSystemPrompts] AI 프롬프트 content 연결 완료, 길이:', aiPromptsContent.length);
    } else {
      console.warn('[combineSystemPrompts] AI 프롬프트 데이터를 불러오는데 실패했습니다:', aiPromptsResponse);
    }
  } catch (error) {
    console.warn('[combineSystemPrompts] AI 프롬프트 API 호출 실패:', error);
  }

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

  // AI 프롬프트 content와 priceListMarkdown을 결합
  const finalPrompt = `${aiPromptsContent}\n\n${priceListMarkdown}`;

  console.log('[combineSystemPrompts] 최종 프롬프트 생성 완료, 길이:', finalPrompt.length);
  console.log('[combineSystemPrompts] AI 프롬프트 포함 여부:', finalPrompt.includes(aiPromptsContent.substring(0, 50)));
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