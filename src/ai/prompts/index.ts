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
import { devLog } from '../../utils/devLogger';

// Zustand 스토어 객체 직접 가져오기
const promptStore = usePromptStore.getState();

// 단가표 데이터를 마크다운 형식으로 변환하는 함수
const convertPriceListToMarkdown = (priceList: any[], columns?: any[]): string => {
  devLog('[convertPriceListToMarkdown] 변환 시작, 데이터 개수:', priceList?.length || 0);
  
  if (!priceList || priceList.length === 0) {
    devLog("[convertPriceListToMarkdown] ❌ 빈 데이터이므로 변환 실패");
    devLog("priceList", priceList);
    return '단가표 데이터를 불러오는데 실패했습니다.';
  }

  devLog('[convertPriceListToMarkdown] ✅ 데이터 확인됨, 변환 진행');
  devLog('[convertPriceListToMarkdown] 첫 번째 데이터 샘플:', priceList[0]);
  devLog('[convertPriceListToMarkdown] columns 정보:', columns);

  let markdown = `# 단가표 정보

다음은 프로젝트 견적 산출에 사용되는 단가표 정보입니다.

`;

  // 컬럼 정보가 제공되지 않은 경우 기본 컬럼 사용
  const defaultColumns = [
    { name: '제목', type: 'string' },
    { name: '금액', type: 'number' },
    { name: '설명', type: 'string' },
    { name: '프론트 기간', type: 'number' },
    { name: '백엔드 기간', type: 'number' }
  ];
  
  // columns가 string 배열인 경우 object 배열로 변환
  let activeColumns: any[] = [];
  if (Array.isArray(columns) && columns.length > 0) {
    if (typeof columns[0] === 'string') {
      // string 배열인 경우
      activeColumns = columns
        .filter(col => col !== 'id') // id 제외
        .map(col => ({ name: col, type: 'string' })); // 기본적으로 string 타입으로 설정
      
      // 특정 컬럼들은 타입을 지정
      activeColumns = activeColumns.map(col => {
        if (col.name === '금액' || col.name.includes('기간')) {
          return { ...col, type: 'number' };
        }
        devLog("col",col);
        return col;
      });
    } else {
      // object 배열인 경우
      activeColumns = columns.filter(col => col.name !== 'id');
    }
  } else {
    activeColumns = defaultColumns;
  }

  devLog('[convertPriceListToMarkdown] 표시할 컬럼들:', activeColumns.map(col => col.name));

  // 카테고리별로 그룹화하여 처리 (분류 필드 사용)
  const categories = priceList.reduce((acc, item) => {
    const category = item.분류 || item.카테고리 || item.category || item.category_name || '기타';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  devLog('[convertPriceListToMarkdown] 카테고리별 그룹화 결과:', Object.keys(categories));

  Object.entries(categories).forEach(([categoryName, items]) => {
    devLog(`[convertPriceListToMarkdown] 카테고리 "${categoryName}" 처리 중, 항목 수: ${(items as any[]).length}`);

    markdown += `## ${categoryName}

`;
    
    // 동적 헤더 생성
    const headers = activeColumns.map(col => col.name);
    markdown += `| ${headers.join(' | ')} |\n`;
    markdown += `|${headers.map(() => '--------').join('|')}|\n`;

    (items as any[]).forEach((item, index) => {
      const rowData: string[] = [];
      
      activeColumns.forEach((column) => {
        const columnName = column.name;
        let value = item[columnName];
        
        // 타입에 따른 포맷팅
        if (column.type === 'number' && value !== undefined && value !== null && value !== '') {
          // 숫자 타입인 경우 천단위 콤마 추가
          const numValue = Number(value);
          if (!isNaN(numValue)) {
            value = numValue.toLocaleString('ko-KR');
          }
        } else if (value === undefined || value === null || value === '') {
          value = '-';
        }
        
        rowData.push(String(value));
      });
      
      markdown += `| ${rowData.join(' | ')} |\n`;
      
      // 첫 번째 항목만 샘플로 로깅
      if (index === 0) {
        devLog(`[convertPriceListToMarkdown] 샘플 항목 변환:`, {
          original: item,
          formatted: rowData
        });
      }
    });

    markdown += `\n`;
  });

  markdown += `---

**참고사항:**
- 위 단가는 기본 단가이며, 프로젝트 복잡도에 따라 조정될 수 있습니다.
- 실제 견적은 상세 요구사항 분석 후 산출됩니다.
- 단가는 VAT 별도 금액입니다.
- 기간은 프론트엔드(FE)와 백엔드(BE) 개발 기간을 합산한 기준입니다.
`;

  devLog('[convertPriceListToMarkdown] ✅ 마크다운 변환 완료, 최종 길이:', markdown.length);
  return markdown;
};

export const combineSystemPrompts = async () => {
  devLog('[combineSystemPrompts] 시작');

  // 데이터 준비 상태 확인
  const isDataReady = promptStore.getIsPriceDataReady();
  devLog('[combineSystemPrompts] 데이터 준비 상태:', isDataReady);

  // 데이터가 준비되지 않았다면 준비될 때까지 기다림
  if (!isDataReady) {
    devLog('[combineSystemPrompts] 데이터가 준비되지 않아 로딩 시작');

    try {
      // API 호출로 데이터 준비
      const response = await getAllUnitPrices();
      devLog('[combineSystemPrompts] API 응답:', response);

      if (response && response.statusCode === 200 && response.data && (response.data as any).data && Array.isArray((response.data as any).data)) {
        const priceList = (response.data as any).data;
        const columns = (response.data as any).columns || [];

        // promptStore에 데이터 저장
        promptStore.setPriceList(priceList);
        promptStore.setPriceListColumns(columns);
        devLog('[combineSystemPrompts] 단가표 데이터 저장 완료, 길이:', priceList.length);
        devLog('[combineSystemPrompts] 컬럼 정보 저장 완료, 개수:', columns.length);

        // 마크다운 형식으로 변환하여 저장 (컬럼 정보 포함)
        const priceListMarkdown = convertPriceListToMarkdown(priceList, columns);
        
        // 마크다운 생성 결과 확인 및 콘솔 출력
        if (priceListMarkdown && priceListMarkdown !== '단가표 데이터를 불러오는데 실패했습니다.') {
          devLog('[combineSystemPrompts] ✅ 마크다운 생성 성공!');
          devLog('[combineSystemPrompts] 📄 생성된 마크다운 내용:');
          devLog('='.repeat(50));
          devLog(priceListMarkdown);
          devLog('='.repeat(50));
        } else {
          devLog('[combineSystemPrompts] ❌ 마크다운 생성 실패!');
          devLog('[combineSystemPrompts] 실패한 마크다운 내용:', priceListMarkdown);
        }
        
        promptStore.setPriceListMarkdown(priceListMarkdown);
        devLog('[combineSystemPrompts] 마크다운 변환 및 저장 완료');

        // 데이터 준비 완료 표시
        promptStore.setPriceDataReady(true);
        devLog('[combineSystemPrompts] 데이터 준비 완료');
      } else {
        devLog('[combineSystemPrompts] API 응답이 올바르지 않음:', response);
        // 실패 시에도 빈 데이터로 준비 완료 표시 (재시도 방지)
        promptStore.setPriceDataReady(true);
      }
    } catch (error) {
      devLog('[combineSystemPrompts] 단가표 데이터를 불러오는데 실패했습니다:', error);
      // 실패 시에도 준비 완료 표시 (무한 루프 방지)
      promptStore.setPriceDataReady(true);
    }
  }

  // 이제 데이터가 준비되었으므로 프롬프트 생성
  const priceList = promptStore.getPriceList();
  const priceListColumns = promptStore.getPriceListColumns();
  const priceListMarkdown = promptStore.getPriceListMarkdown();
  const aiPromptsContent = promptStore.getAiPrompts();

  devLog('[combineSystemPrompts] 최종 데이터 상태:', {
    priceListLength: priceList?.length || 0,
    columnsLength: priceListColumns?.length || 0,
    hasMarkdown: !!priceListMarkdown,
    markdownLength: priceListMarkdown?.length || 0,
    hasAiPrompts: !!aiPromptsContent,
    aiPromptsLength: aiPromptsContent?.length || 0
  });

  // AI 프롬프트 content와 priceListMarkdown을 결합
  const finalPrompt = `${aiPromptsContent}\n\n${priceListMarkdown}`;

  devLog('[combineSystemPrompts] 최종 프롬프트 생성 완료, 길이:', finalPrompt.length);
  devLog('[combineSystemPrompts] AI 프롬프트 포함 여부:', finalPrompt.includes(aiPromptsContent.substring(0, 50)));
  devLog('[combineSystemPrompts] 단가표 마크다운 포함 여부:', finalPrompt.includes('# 단가표 정보'));
  devLog('priceListMarkdown', priceListMarkdown);
  devLog('priceList', priceList);

  // 최종 프롬프트에 마크다운이 포함되었는지 상세 확인
  if (finalPrompt.includes('# 단가표 정보')) {
    devLog('[combineSystemPrompts] ✅ 최종 프롬프트에 단가표 마크다운이 정상 포함됨');

    // 마크다운 부분만 추출해서 확인
    const markdownStart = finalPrompt.indexOf('# 단가표 정보');
    const markdownEnd = finalPrompt.indexOf('---', markdownStart);
    if (markdownEnd > markdownStart) {
      const markdownSection = finalPrompt.substring(markdownStart, markdownEnd + 3);
      devLog('[combineSystemPrompts] 📋 포함된 마크다운 섹션:');
      devLog('-'.repeat(30));
      devLog(markdownSection);
      devLog('-'.repeat(30));
    }
  } else {
    devLog('[combineSystemPrompts] ❌ 최종 프롬프트에 단가표 마크다운이 포함되지 않음');
    devLog('[combineSystemPrompts] ⚠️  가능한 원인: 마크다운 생성 실패 또는 데이터 누락');
  }

  // devLog('[combineSystemPrompts] 최종 프롬프트 내용:', finalPrompt);
  return finalPrompt;
};