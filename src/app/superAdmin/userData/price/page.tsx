'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import GenericListUI, {
  ColumnDefinition,
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import CmsPopup from '@/components/CmsPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';

// 엑셀 데이터 항목 타입 정의 (엑셀 파일 구조에 맞게 수정)
type PriceItem = {
  항목: string;
  타입: string;
  카테고리: string;
  제목: string;
  설명: string;
  메모: string;
  '관리자 페이지': string;
  '관리자 카테고리': string;
  '프론트 기간': number;
  '백엔드 기간': number;
  금액: number;
};

type PriceList = {
  no: number;
  select: boolean;
  code: string;
  category_name: string;
  sub_category_name: string;
  function_name: string;
  description: string;
  memo: string;
  frontend_period: number;
  backend_period: number;
  price: number;
  createdTime: string | null;
  updateTime: string | null;
  createdId: string;
  updateId: string;
};

const StyledPopupContent = styled.div`
  padding: 20px;
  h3 {
    margin-top: 0;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
`;

const OutputSection = styled.div`
  flex: 1;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: #f9f9f9;
  overflow: auto;
  color: #000000;
`;

const PreformattedText = styled.pre`
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  color: #000000;
`;

const convertJsonToMarkdownTable = (jsonData: PriceItem[]): string => {
  if (!jsonData || jsonData.length === 0) {
    return '';
  }
  const headers = Object.keys(jsonData[0]);
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `|${headers.map(() => '---').join('|')}|`;

  const dataRows = jsonData.map((item) => {
    const values = headers.map((header) => {
      const value = String(item[header as keyof PriceItem])
        .replace(/\|/g, '')
        .replace(/\n/g, '');
      return value;
    });
    return `| ${values.join(' | ')} |`;
  });

  return [headerRow, separatorRow, ...dataRows].join('\n');
};

const PriceListPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<PriceList> | null>(
    null,
  );
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [markdownData, setMarkdownData] = useState<any[] | null>(null);
  const listRef = useRef<{ refetch: () => void }>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRowClick = (item: PriceList) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<PriceList>> => {
      console.log('Mock Data fetching for PriceList...', params);
      const mockData: PriceList[] = [
        {
          no: 1,
          select: false,
          code: 'C1',
          category_name: 'COMMON',
          sub_category_name: '화면설계',
          function_name: '기능1',
          description: '기능에 대한 상세 설명',
          memo: '잠재고객/지속적인 연락 필요',
          frontend_period: 0.2,
          backend_period: 0.2,
          price: 500000,
          createdTime: '2025-05-21T11:31:12Z',
          updateTime: '2025-05-21T11:31:12Z',
          createdId: '작성자1',
          updateId: '작성자1',
        },
        {
          no: 2,
          select: false,
          code: 'C2',
          category_name: 'COMMON',
          sub_category_name: '기획',
          function_name: '기능2',
          description: '새로운 기능 설명',
          memo: '',
          frontend_period: 0.3,
          backend_period: 0.1,
          price: 350000,
          createdTime: '2025-05-22T14:00:00Z',
          updateTime: '2025-05-22T14:00:00Z',
          createdId: '작성자2',
          updateId: '작성자2',
        },
      ];

      const filteredData = params.keyword
        ? mockData.filter(
            (item) =>
              item.function_name.includes(params.keyword as string) ||
              item.description.includes(params.keyword as string) ||
              item.category_name.includes(params.keyword as string),
          )
        : mockData;

      return {
        data: filteredData,
        totalItems: filteredData.length,
        allItems: mockData.length,
      };
    },
    [],
  );

  const columns: ColumnDefinition<PriceList>[] = useMemo(
    () => [
      { header: '선택', accessor: 'select', formatter: () => <input type="checkbox" /> },
      { header: 'No', accessor: 'no', sortable: true },
      { header: '코드', accessor: 'code', sortable: true },
      { header: '항목', accessor: 'category_name', sortable: true },
      { header: '카테고리', accessor: 'sub_category_name', sortable: true },
      { header: '기능명', accessor: 'function_name', sortable: true },
      { header: '설명', accessor: 'description', sortable: true },
      { header: '메모', accessor: 'memo', sortable: true },
      { header: '프론트 기간', accessor: 'frontend_period' },
      { header: '백엔드 기간', accessor: 'backend_period' },
      {
        header: '금액',
        accessor: 'price',
        formatter: (value) => value.toLocaleString(),
      },
      {
        header: '작성일자',
        accessor: 'createdTime',
        formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        header: '수정일자',
        accessor: 'updateTime',
        formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
      },
      { header: '작성id', accessor: 'createdId' },
      { header: '작성자', accessor: 'updateId' },
    ],
    [],
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const allJsonData: { sheetName: string; data: PriceItem[] }[] = [];
        const allMarkdownData: { sheetName: string; markdown: string }[] = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          // ⭐️ 수정된 부분: 첫 번째 행(안내문)을 건너뛰고 두 번째 행(헤더)부터 시작하도록 범위를 지정합니다.
          const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
          const newRange = { s: { r: 1, c: 0 }, e: range.e };

          const rawJsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            range: newRange,
          });

          if (rawJsonData.length > 1) {
            const headers = rawJsonData[0] as string[];
            const dataRows = rawJsonData.slice(1);

            const refinedData = dataRows.map((row: any[]) => {
              const obj: any = {};
              headers.forEach((header, index) => {
                const key = header ? header.trim() : `col${index}`;
                const value = row[index] !== undefined ? row[index] : '';
                obj[key] =
                  !isNaN(Number(value)) && !isNaN(parseFloat(value))
                    ? Number(value)
                    : value;
              });
              return obj as PriceItem;
            });

            allJsonData.push({ sheetName, data: refinedData });
            allMarkdownData.push({
              sheetName,
              markdown: convertJsonToMarkdownTable(refinedData),
            });
          }
        });

        console.log('JSON Data:', allJsonData);
        console.log('Markdown Data:', allMarkdownData);
        setJsonData(allJsonData);
        setMarkdownData(allMarkdownData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleExcelUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // ⭐️ 업데이트된 부분: 엑셀 템플릿 다운로드 핸들러
  const handleExcelTemplateDownload = useCallback(() => {
    const templateData = [
      ['NOTE: index를 적을 경우 기존에 있는 index 기능을 수정하고, index를 안 적고 제목을 적을 경우 새로운 기능이 추가됩니다.'],
      ['index', '항목', '타입', '카테고리', '제목', '설명', '메모', '관리자 페이지', '관리자 카테고리', '프론트 기간', '백엔드 기간', '금액'],
      ['', '필수', '공통', '화면설계', '스토리보드', 'IT 프로젝트 전반적인 설계 정의', '1. PC 또는 모바일 경우 : 본수 기준 1장당 10만원', '', '', 0, 0, 0],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // ⭐️ A1 셀에 'NOTE' 텍스트를 담은 셀 스타일 지정 (텍스트를 래핑하도록)
    const noteCell = ws['A1'];
    if (noteCell) {
        if (!noteCell.s) noteCell.s = {};
        noteCell.s.alignment = { wrapText: true };
    }
    
    // B2:L2 범위에 대한 컬럼 너비 조정 (선택 사항)
    ws['!cols'] = [
        { wch: 8 }, // A: index
        { wch: 10 },// B: 항목
        { wch: 10 },// C: 타입
        { wch: 15 },// D: 카테고리
        { wch: 20 },// E: 제목
        { wch: 40 },// F: 설명
        { wch: 40 },// G: 메모
        { wch: 15 },// H: 관리자 페이지
        { wch: 15 },// I: 관리자 카테고리
        { wch: 15 },// J: 프론트 기간
        { wch: 15 },// K: 백엔드 기간
        { wch: 12 },// L: 금액
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '단가표_템플릿');
    XLSX.writeFile(wb, '단가표_템플릿.xlsx');
  }, []);

  return (
    <>
      <CmsResponsiveContainer<PriceList>
        ref={listRef}
        title="단가표 관리"
        excelFileName="PriceList"
        columns={columns}
        fetchData={fetchData}
        enableSearch
        enableDateFilter={false}
        searchPlaceholder="기능명, 설명, 항목 검색"
        onRowClick={handleRowClick}
        themeMode="light"
        isShowExcelTemplate={true}
        excelUploadBtnCallBack={handleExcelUpload}
        excelTemplateBtnCallBack={handleExcelTemplateDownload}
      />
      {/* 엑셀 업로드용 숨겨진 input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        accept=".xlsx, .xls"
      />

      {jsonData && markdownData && (
        <ContentContainer>
          <OutputSection>
            <h2>변환된 JSON 데이터</h2>
            {jsonData.map((sheet, index) => (
              <div key={index}>
                <h3>{sheet.sheetName} 시트</h3>
                <PreformattedText>{JSON.stringify(sheet.data, null, 2)}</PreformattedText>
              </div>
            ))}
          </OutputSection>
          <OutputSection>
            <h2>변환된 마크다운 데이터</h2>
            {markdownData.map((sheet, index) => (
              <div key={index}>
                <h3>{sheet.sheetName} 시트</h3>
                <PreformattedText>{sheet.markdown}</PreformattedText>
              </div>
            ))}
          </OutputSection>
        </ContentContainer>
      )}

      <CmsPopup title="단가표 상세" isOpen={isPopupOpen} onClose={closePopup}>
        <StyledPopupContent>
          {selectedItem && (
            <>
              <h3>
                {selectedItem.function_name} ({selectedItem.code})
              </h3>
              <p>설명: {selectedItem.description}</p>
              <p>금액: {selectedItem.price?.toLocaleString()}원</p>
            </>
          )}
        </StyledPopupContent>
      </CmsPopup>
    </>
  );
};

export default PriceListPage;