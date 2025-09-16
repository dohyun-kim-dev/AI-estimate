

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import CmsPopup from '@/components/CmsPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import UploadResultPopup from './UploadResultPopup';
import PriceEditPopup from './PriceEditPopup';
import { getAllUnitPrices, uploadUnitPrices } from '@/lib/api/admin/adminApi';
import { useToast } from '@/components/common/ToastProvider';
import { priceApiResponseToMarkdownTable } from '../../../../ai/prompts/priceDataToJson';


// 필수 여부를 한글로 변환하는 함수
const getRequiredDisplayText = (required: boolean): string => {
  return required ? '필수' : '선택';
};

// 한글 필수 여부를 영문 boolean으로 변환하는 함수
const parseRequiredFromKorean = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    // 한글 필수/선택 처리
    if (trimmedValue === '필수') return true;
    if (trimmedValue === '선택') return false;
    
    // 기존 영문 처리도 유지
    const lowerValue = trimmedValue.toLowerCase();
    return !['false', '0', 'n', 'no', '거짓', 'x', '선택'].includes(lowerValue);
  }
  
  return Boolean(value);
};

// 영문 타입을 한글로 변환하는 함수
const getTypeDisplayText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'string': '문자',
    'number': '숫자',
    'boolean': '참/거짓',
    'date': '날짜',
    'datetime': '날짜시간',
    'text': '문자',
    'integer': '정수',
    'float': '실수',
    'decimal': '소수'
  };
  
  return typeMap[type.toLowerCase()] || type;
};

// 한글 타입을 영문으로 변환하는 함수
const parseTypeFromKorean = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return 'string';
  }
  
  const reverseTypeMap: Record<string, string> = {
    '문자': 'string',
    '숫자': 'number',
    '참/거짓': 'boolean',
    '날짜': 'date',
    '날짜시간': 'datetime',
    '정수': 'integer',
    '실수': 'float',
    '소수': 'decimal'
  };
  
  const trimmedValue = value.trim();
  return reverseTypeMap[trimmedValue] || trimmedValue.toLowerCase();
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

const ErrorSection = styled.div`
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #856404;
`;

const SuccessSection = styled.div`
  background-color: #d1edff;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  color: #0c5460;
`;

// 데이터 타입 검증 및 변환 함수 (검증 우선, 변환은 나중에)
const validateAndConvertValue = (value: any, expectedType: string, columnName: string, rowIndex: number) => {
  const errors: string[] = [];
  
  // 빈 값 처리
  if (value === null || value === undefined || value === '') {
    return { value: '', errors, isValid: true }; // 빈 값은 일단 통과 (필수 검증은 별도)
  }
  
  switch (expectedType) {
    case 'string':
      return { value: String(value), errors, isValid: true };
      
    case 'number':
      // 먼저 숫자 타입 검증
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return { 
          value: value, // 원본 값 유지
          errors: [], // 에러는 validateAndClassifyData에서 처리
          isValid: false 
        };
      }
      return { value: numValue, errors, isValid: true };
      
    case 'boolean':
      // 먼저 불린 타입 검증
      if (typeof value === 'boolean') {
        return { value, errors, isValid: true };
      }
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        if (['true', '1', 'y', 'yes', '참', 'o'].includes(lowerValue)) {
          return { value: true, errors, isValid: true };
        }
        if (['false', '0', 'n', 'no', '거짓', 'x'].includes(lowerValue)) {
          return { value: false, errors, isValid: true };
        }
      }
      // 변환할 수 없으면 원본 값 유지하고 invalid 처리
      return { 
        value: value, // 원본 값 유지
        errors: [], // 에러는 validateAndClassifyData에서 처리
        isValid: false 
      };
      
    default:
      return { value: String(value), errors, isValid: true };
  }
};

// 컬럼 메타정보 검증 함수 (심각한 오류만 체크)
const validateColumnMetadata = (uploadColumns: any[], originalColumns: any[]) => {
  const errors: string[] = [];
  
  // id 컬럼을 포함한 전체 원본 컬럼
  const allOriginalColumns = [
    { name: 'id', type: 'string', required: false, orderNo: 0 },
    ...originalColumns
  ].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
  
  console.log('Original columns:', allOriginalColumns);
  console.log('Upload columns:', uploadColumns);
  
  // 필수 컬럼 누락 체크
  const uploadColumnNames = uploadColumns.map(col => col.name);
  const missingColumns = allOriginalColumns.filter(
    originalCol => !uploadColumnNames.includes(originalCol.name)
  );
  
  if (missingColumns.length > 0) {
    errors.push(`필수 컬럼이 누락되었습니다: ${missingColumns.map(col => `'${col.name}'`).join(', ')}`);
  }
  
  // 각 컬럼의 타입과 필수여부 검증 (컬럼명 기준)
  uploadColumns.forEach((uploadCol, index) => {
    const originalCol = allOriginalColumns.find(col => col.name === uploadCol.name);
    const columnPosition = `${index + 1}번째 컬럼`;
    const columnInfo = `${columnPosition} '${uploadCol.name}'`;
    
    if (!originalCol) {
      // 원본에 없는 새로운 컬럼은 허용 (경고만)
      console.warn(`새로운 컬럼이 추가되었습니다: ${columnInfo}`);
      return;
    }
    
    // 타입 검증
    if (uploadCol.type !== originalCol.type) {
      errors.push(`${columnInfo}: 타입이 변경되었습니다. 원본: '${originalCol.type}' → 업로드: '${uploadCol.type}'`);
    }
    
    // 필수 여부 검증
    if (uploadCol.required !== originalCol.required) {
      const originalRequired = originalCol.required ? 'Y' : 'N';
      const uploadRequired = uploadCol.required ? 'Y' : 'N';
      errors.push(`${columnInfo}: 필수 여부가 변경되었습니다. 원본: '${originalRequired}' → 업로드: '${uploadRequired}'`);
    }
  });
  
  return errors;
};

// 데이터 검증 및 분류 함수 (문제가 있는 행만 제외)
const validateAndClassifyData = (data: any[], columns: any[], originalDataRows: any[][]) => {
  const successData: any[] = [];
  const excludedData: any[] = [];
  const excludeReasons: string[] = [];
  
  data.forEach((item, index) => {
    const rowErrors: string[] = [];
    let shouldExclude = false;
    const rowNum = index + 1;
    const excelRowNum = rowNum + 4; // 실제 엑셀 행 번호 (사용방법, 필수, 타입, 헤더 + 데이터 행)
    const originalRow = originalDataRows[index] || []; // 원본 데이터 행
    
    // 각 필드 검증
    columns.forEach((column, colIndex) => {
      const value = item[column.name];
      const originalValue = originalRow[colIndex]; // 원본 값 (변환 전)
      const fieldName = column.name;
      const excelColLetter = String.fromCharCode(66 + colIndex); // B, C, D, E...
      const cellPosition = `${excelColLetter}${excelRowNum}`;
      
      // 필수 필드 검증
      if (column.required && (value === null || value === undefined || value === '')) {
        rowErrors.push(`${cellPosition}셀 '${fieldName}': 필수 필드가 비어있음`);
        shouldExclude = true;
      }
      
      // 타입 검증 (원본 값으로 검증, 값이 있을 때만)
      if (originalValue !== null && originalValue !== undefined && originalValue !== '') {
        switch (column.type) {
          case 'number':
            if (isNaN(Number(originalValue))) {
              rowErrors.push(`${cellPosition}셀 '${fieldName}': 숫자가 아님 (입력값: "${originalValue}")`);
              shouldExclude = true;
            }
            break;
          case 'boolean':
            let isValidBoolean = false;
            if (typeof originalValue === 'boolean') {
              isValidBoolean = true;
            } else if (typeof originalValue === 'string') {
              const lowerValue = originalValue.toLowerCase();
              isValidBoolean = ['true', 'false', '1', '0', 'y', 'n', 'yes', 'no', '참', '거짓', 'o', 'x'].includes(lowerValue);
            }
            
            if (!isValidBoolean) {
              rowErrors.push(`${cellPosition}셀 '${fieldName}': 올바른 불린값이 아님 (입력값: "${originalValue}", 가능값: Y/N, true/false, 1/0 등)`);
              shouldExclude = true;
            }
            break;
        }
      }
    });
    
    if (shouldExclude) {
      excludedData.push({ ...item, rowIndex: rowNum, excelRowNum, errors: rowErrors });
      excludeReasons.push(`엑셀 ${excelRowNum}행: ${rowErrors.join(', ')}`);
    } else {
      successData.push(item);
    }
  });
  
  return { 
    successData, 
    excludedData, 
    excludeReasons,
    totalProcessed: data.length,
    successCount: successData.length,
    excludedCount: excludedData.length
  };
};

// 필수 컬럼 검증 함수
const validateRequiredFields = (obj: any, columns: any[], rowIndex: number) => {
  const errors: string[] = [];
  
  columns.forEach(column => {
    if (column.required) {
      const value = obj[column.name];
      if (value === null || value === undefined || value === '') {
        errors.push(`행 ${rowIndex + 1}, 컬럼 '${column.name}': 필수 값이 비어있습니다.`);
      }
    }
  });
  
  return errors;
};


// 엑셀 스타일링 적용 함수
const applyExcelStyling = (ws: any, sortedColumns: any[], data?: any[]) => {
  // A1 셀 범위 병합 (A1부터 마지막 컬럼까지)
  const lastCol = String.fromCharCode(65 + sortedColumns.length); // A=65, B=66, ...
  const mergeRange = `A1:${lastCol}1`;
  
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push(XLSX.utils.decode_range(mergeRange));

  // A1 셀 스타일 (사용방법) - 병합된 셀을 위한 스타일
  const a1Cell = ws['A1'];
  if (a1Cell) {
    if (!a1Cell.s) a1Cell.s = {};
    a1Cell.s.font = { bold: true, color: { rgb: 'FF0000' }, size: 9 }; // 빨간색, 굵게, 작은 글씨
    a1Cell.s.alignment = { 
      horizontal: 'left', 
      vertical: 'top',
      wrapText: true 
    };
    a1Cell.s.border = {
      top: { style: 'medium', color: { rgb: 'FF0000' } },
      bottom: { style: 'medium', color: { rgb: 'FF0000' } },
      left: { style: 'medium', color: { rgb: 'FF0000' } },
      right: { style: 'medium', color: { rgb: 'FF0000' } }
    };
    a1Cell.s.fill = { fgColor: { rgb: 'FFF2F2' } }; // 연한 빨간색 배경
  }

  // A2 셀 스타일 (필수)
  const a2Cell = ws['A2'];
  if (a2Cell) {
    if (!a2Cell.s) a2Cell.s = {};
    a2Cell.s.font = { bold: true, color: { rgb: '0000FF' } }; // 파란색, 굵게
    a2Cell.s.alignment = { horizontal: 'center' };
  }

  // A3 셀 스타일 (타입)
  const a3Cell = ws['A3'];
  if (a3Cell) {
    if (!a3Cell.s) a3Cell.s = {};
    a3Cell.s.font = { bold: true, color: { rgb: '008000' } }; // 초록색, 굵게
    a3Cell.s.alignment = { horizontal: 'center' };
  }

  // A4 셀 스타일 (헤더)
  const a4Cell = ws['A4'];
  if (a4Cell) {
    if (!a4Cell.s) a4Cell.s = {};
    a4Cell.s.font = { bold: true, color: { rgb: '800080' } }; // 보라색, 굵게
    a4Cell.s.alignment = { horizontal: 'center' };
  }

  // 헤더 행(4번째 행) 스타일링
  for (let col = 1; col <= sortedColumns.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 3, c: col });
    if (ws[cellAddress]) {
      if (!ws[cellAddress].s) ws[cellAddress].s = {};
      ws[cellAddress].s.font = { bold: true };
      ws[cellAddress].s.fill = { fgColor: { rgb: 'E0E0E0' } }; // 연한 회색 배경
      ws[cellAddress].s.alignment = { horizontal: 'center' };
    }
  }

  // 숫자 타입 컬럼의 셀 타입 설정 (데이터 행에만 적용)
  if (data && data.length > 0) {
    const dataStartRow = 4; // 5번째 행부터 데이터 시작 (0-based index)
    
    sortedColumns.forEach((col: any, colIndex: number) => {
      if (col.type === 'number') {
        const excelColIndex = colIndex + 1; // B열부터 시작 (A열은 구분자)
        
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
          const excelRowIndex = dataStartRow + rowIndex;
          const cellAddress = XLSX.utils.encode_cell({ r: excelRowIndex, c: excelColIndex });
          
          if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
            // 숫자 셀의 타입을 명시적으로 설정
            ws[cellAddress].t = 'n'; // number type
            ws[cellAddress].z = '0.00'; // 숫자 포맷 (소수점 2자리)
          }
        }
      }
    });
  }
  
  // 컬럼 너비 조정 (동적으로 설정)
  const colWidths = [{ wch: 15 }]; // A열: 첫 번째 구분자 컬럼
  sortedColumns.forEach((col: any) => {
    let width = 10; // 기본 너비
    if (col.name === '설명' || col.name === '메모') {
      width = 30; // 설명/메모는 넓게
    } else if (col.name === '제목' || col.name === '기능명') {
      width = 20;
    } else if (col.name.includes('기간') || col.name.includes('페이지') || col.name.includes('카테고리')) {
      width = 15;
    } else if (col.name === 'id') {
      width = 25; // id 필드는 조금 더 넓게
    } else if (col.name === '금액') {
      width = 15; // 금액은 적당히
    }
    colWidths.push({ wch: width });
  });
  ws['!cols'] = colWidths;
  
  // 행 높이 조정 (A1 셀의 긴 텍스트를 위해)
  ws['!rows'] = [
    { hpt: 150 }, // 1행: 사용방법 설명 (높이 150pt로 더 확대)
    { hpt: 25 },  // 2행: 필수
    { hpt: 25 },  // 3행: 타입  
    { hpt: 30 }   // 4행: 헤더 (조금 더 높게)
  ];
};

const PriceListPage: React.FC = () => {
  const { show: showToast } = useToast(); // 토스트 훅 추가
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(''); // 선택된 고객사명 추가
  const [dynamicColumns, setDynamicColumns] = useState<ColumnDefinition<any>[]>([]);
  const [currentTableData, setCurrentTableData] = useState<any[]>([]); // 현재 테이블 데이터 저장
  const [currentColumnsInfo, setCurrentColumnsInfo] = useState<any[]>([]); // 현재 컬럼 정보 저장
  const [transformedTableData, setTransformedTableData] = useState<any[]>([]); // 변환된 테이블 데이터 (select 필드 포함)
  const [isAlertOpen, setIsAlertOpen] = useState(false); // 알림 팝업
  const [alertMessage, setAlertMessage] = useState(''); // 알림 메시지
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('error'); // 알림 타입
  const [uploadSuccessData, setUploadSuccessData] = useState<any[]>([]); // 업로드 성공 데이터 저장
  const [uploadColumns, setUploadColumns] = useState<any[]>([]); // 업로드된 컬럼 정보 저장
  const [forceUpdateKey, setForceUpdateKey] = useState(0); // 강제 업데이트용 key
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  // 단일 항목 저장 핸들러
  const handleSaveItem = async (formData: any) => {
    try {
      console.log('=== handleSaveItem START ===');
      console.log('formData:', formData);
      console.log('selectedItem:', selectedItem);
      console.log('selectedCompanyCode:', selectedCompanyCode);
      console.log('currentColumnsInfo:', currentColumnsInfo);
      
      // 수정 모드인지 확인 (formData에 id가 있고 빈 값이 아닌 경우)
      const isEditMode = formData.id && formData.id !== '';
      console.log('isEditMode:', isEditMode, 'id:', formData.id);
      
      // API에 전달할 데이터 준비
      const apiData = { ...formData };
      
      // 신규 추가일 때는 id 필드 제거 (서버에서 자동 생성)
      if (!isEditMode) {
        delete apiData.id;
        console.log('신규 추가 모드: id 필드 제거');
      } else {
        console.log('수정 모드: id 필드 포함');
      }
      
      // 여기서 실제 API 호출을 해야 하지만, 현재는 uploadUnitPrices를 사용
      // updateUnitPrice API가 있다면 그것을 사용해야 함
      const apiPayload = {
        companyCode: selectedCompanyCode,
        columns: currentColumnsInfo.map((col: any) => ({
          name: col.name,
          type: col.type,
          required: col.required,
          orderNo: col.orderNo
        })),
        data: [apiData] // 단일 항목 배열로 감싸기
      };

      console.log('API payload:', apiPayload);
      const response = await uploadUnitPrices(apiPayload);
      
      console.log('uploadUnitPrices response:', response);
      
      // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
      const actualResponse = Array.isArray(response) ? response[0] : response;
      
      // actualResponse.data에서 실제 API 응답을 가져옴
      const apiResponse = (actualResponse as any)?.data;
      
      console.log('API response details:', apiResponse);
      
      if (apiResponse && (apiResponse.statusCode === 200 || apiResponse.statusCode === "200") && apiResponse.message === 'success') {
        showToast(`데이터가 성공적으로 ${isEditMode ? '수정' : '저장'}되었습니다.`, 'success');
        
        console.log('About to refresh table...');
        console.log('selectedCompanyCode:', selectedCompanyCode);
        console.log('selectedCompanyName:', selectedCompanyName);
        
        // 테이블 새로고침 (약간의 지연을 두어 API 완료 후 실행)
        if (selectedCompanyCode) {
          console.log('Calling handleCompanySelect for refresh...');
          setTimeout(async () => {
            try {
              await handleCompanySelect({ id: selectedCompanyCode, name: selectedCompanyName });
              console.log('handleCompanySelect completed');
            } catch (error) {
              console.error('Error refreshing table:', error);
            }
          }, 100);
        } else {
          console.log('Warning: selectedCompanyCode is null, cannot refresh table');
        }
        
        console.log('=== handleSaveItem SUCCESS END ===');
        return Promise.resolve();
      } else {
        const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '저장에 실패했습니다.';
        console.log('API response error:', errorMessage);
        showToast(errorMessage, 'error');
        return Promise.reject(new Error(errorMessage));
      }
    } catch (error) {
      console.error('Save item error:', error);
      const err = error as Error | { customMessage?: string };
      const errorMessage = 'customMessage' in err 
        ? err.customMessage 
        : err instanceof Error 
          ? err.message 
          : '저장에 실패했습니다.';
      showToast(errorMessage, 'error');
      return Promise.reject(error);
    }
  };

  const handleCompanySelect = async (company: { id: string; name: string }) => {
    console.log('=== Company selected START ===:', company);
    console.log("companyCode:",company.id);
     if (!company.id) {
    showToast('회사 코드가 없습니다. 고객사를 다시 선택해주세요.', 'error');
    return;
  }
    
    try {
      console.log('Fetching data for company:', company.id);
      
      const response = await getAllUnitPrices({
        companyCode: company.id,
        keyword: undefined,
        fromDate: undefined,
        toDate: undefined,
      });

      console.log('API response received');

      // API 응답 처리 로직 (superAdminMng 스타일로 수정)
      let columnsInfo: any[] = [];
      let apiData: any[] = [];
      
      // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
      const actualResponse = Array.isArray(response) ? response[0] : response;
      
      // actualResponse.data에서 실제 API 응답을 가져옴
      const apiResponse = (actualResponse as any)?.data;
      
      if (apiResponse) {
        if ((apiResponse.statusCode === 404 || apiResponse.statusCode === "404") && apiResponse.message === 'not found') {
          // 404 에러 응답 처리 - 샘플 템플릿용 기본 컬럼 정의
          columnsInfo = [
            { name: 'id', type: 'string', required: false, orderNo: 0 },
            { name: '코드', type: 'string', required: true, orderNo: 1 },
            { name: '대분류명', type: 'string', required: true, orderNo: 2 },
            { name: '소분류명', type: 'string', required: false, orderNo: 3 },
            { name: '기능명', type: 'string', required: true, orderNo: 4 },
            { name: '설명', type: 'string', required: false, orderNo: 5 },
            { name: '메모', type: 'string', required: false, orderNo: 6 },
            { name: '프론트엔드_기간', type: 'number', required: false, orderNo: 7 },
            { name: '백엔드_기간', type: 'number', required: false, orderNo: 8 },
            { name: '금액', type: 'number', required: true, orderNo: 9 }
          ];
          apiData = [];
        } else if ((apiResponse.statusCode === 200 || apiResponse.statusCode === "200") && apiResponse.message === 'success') {
          // 성공 응답 처리
          if (apiResponse.data && typeof apiResponse.data === 'object') {
            const responseData = apiResponse.data;
            
            if ('columns' in responseData && Array.isArray(responseData.columns)) {
              columnsInfo = Array.isArray(responseData.columns[0]) 
                ? responseData.columns[0] 
                : responseData.columns;
            }
            
            if ('data' in responseData) {
              // data가 배열이면 그대로, 객체면 배열로 감싸기
              if (Array.isArray(responseData.data)) {
                apiData = responseData.data;
              } else if (responseData.data && typeof responseData.data === 'object') {
                apiData = [responseData.data]; // 단일 객체를 배열로 감싸기
              } else {
                apiData = [];
              }
            }
          }
        } else {
          console.error('API Error:', apiResponse);
          // 기본 컬럼으로 폴백
          columnsInfo = [
            { name: 'id', type: 'string', required: false, orderNo: 0 },
            { name: '코드', type: 'string', required: true, orderNo: 1 },
            { name: '대분류명', type: 'string', required: true, orderNo: 2 },
            { name: '소분류명', type: 'string', required: false, orderNo: 3 },
            { name: '기능명', type: 'string', required: true, orderNo: 4 },
            { name: '설명', type: 'string', required: false, orderNo: 5 },
            { name: '메모', type: 'string', required: false, orderNo: 6 },
            { name: '프론트엔드_기간', type: 'number', required: false, orderNo: 7 },
            { name: '백엔드_기간', type: 'number', required: false, orderNo: 8 },
            { name: '금액', type: 'number', required: true, orderNo: 9 }
          ];
          apiData = [];
        }
      } else {
        console.error('No API response data');
        // 기본 컬럼으로 폴백
        columnsInfo = [
          { name: 'id', type: 'string', required: false, orderNo: 0 },
          { name: '코드', type: 'string', required: true, orderNo: 1 },
          { name: '대분류명', type: 'string', required: true, orderNo: 2 },
          { name: '소분류명', type: 'string', required: false, orderNo: 3 },
          { name: '기능명', type: 'string', required: true, orderNo: 4 },
          { name: '설명', type: 'string', required: false, orderNo: 5 },
          { name: '메모', type: 'string', required: false, orderNo: 6 },
          { name: '프론트엔드_기간', type: 'number', required: false, orderNo: 7 },
          { name: '백엔드_기간', type: 'number', required: false, orderNo: 8 },
          { name: '금액', type: 'number', required: true, orderNo: 9 }
        ];
        apiData = [];
      }

      // 컬럼 정보가 있을 때만 처리
      if (Array.isArray(columnsInfo) && columnsInfo.length > 0) {
        // id 컬럼 추가
        const hasIdColumn = columnsInfo.some(col => col.name === 'id');
        let allColumnsForTable = columnsInfo;
        if (!hasIdColumn) {
          const idColumn = { name: 'id', type: 'string', required: false, orderNo: 0 };
          allColumnsForTable = [idColumn, ...columnsInfo];
        }
        

        // 1. 'No' 헤더 추가
        const generatedColumns: ColumnDefinition<any>[] = [
          {
            header: 'No',
            accessor: 'no',
            sortable: false,
            formatter: (value) => value
          },
          ...allColumnsForTable
            .sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0))
            .map((col: any) => {
              const columnDef: ColumnDefinition<any> = {
                header: col.name,
                accessor: col.name,
                sortable: true,
              };
              if (col.type === 'number') {
                if (col.name === '금액' || col.name.toLowerCase().includes('price')) {
                  columnDef.formatter = (value) => {
                    const numValue = Number(value);
                    return isNaN(numValue) ? value : numValue.toLocaleString('ko-KR');
                  };
                } else {
                  columnDef.formatter = (value) => {
                    const numValue = Number(value);
                    return isNaN(numValue) ? value : numValue;
                  };
                }
              } else if (col.type === 'boolean') {
                columnDef.formatter = (value) => {
                  if (typeof value === 'boolean') {
                    return value ? 'Y' : 'N';
                  }
                  if (typeof value === 'string') {
                    return ['true', '1', 'y', 'yes', '참'].includes(value.toLowerCase()) ? 'Y' : 'N';
                  }
                  return value ? 'Y' : 'N';
                };
              } else if (col.name === 'id') {
                columnDef.formatter = (value) => {
                  if (typeof value === 'string' && value.length > 10) {
                    return `${value.substring(0, 8)}...`;
                  }
                  return value;
                };
              }
              return columnDef;
            })
        ];

        const columnsWithSelect: ColumnDefinition<any>[] = [
          ...generatedColumns
        ];

        // 2. 데이터에 서버에서 전달받은 no 필드 사용 (없으면 index + 1로 폴백)
        const transformedData = apiData.map((item: any, index: number) => ({
          ...item,
          select: false,
          no: (item.no !== undefined ? item.no : index + 1),
        }));

        console.log('Setting all states in batch');
        
        // 모든 상태를 한 번에 업데이트
        setSelectedCompanyCode(company.id);
        setSelectedCompanyName(company.name); // 고객사명도 저장
        setCurrentColumnsInfo(allColumnsForTable);
        setCurrentTableData(apiData);
        setDynamicColumns(columnsWithSelect);
        setTransformedTableData(transformedData);
        setForceUpdateKey(prev => prev + 1); // 테이블 강제 업데이트
      }
      
      console.log('=== Company selected END ===');
        
    } catch (error) {
      console.error('Error fetching data for selected company:', error);
      // 에러 시에도 회사 코드는 설정
      setSelectedCompanyCode(company.id);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (workbook.SheetNames.length === 0) {
          showAlert('업로드할 시트가 없습니다.', 'error');
          return;
        }

        // 첫 번째 시트만 처리
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        console.log('Processing sheet:', sheetName);
        
        // 전체 시트를 읽어서 템플릿 구조 확인
        const range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        console.log('Sheet range:', range);
        
        const allData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: range,
        });
        console.log('All sheet data:', allData);

        if (allData.length < 5) {
          showAlert('템플릿 구조가 올바르지 않습니다. 최소 5행이 필요합니다 (사용방법, 필수, 타입, 헤더, 데이터).', 'error');
          return;
        }

        try {
          // 템플릿 파싱
          const requiredRow = allData[1] as any[];
          const requiredValues = requiredRow.slice(1);
          
          const typeRow = allData[2] as any[];
          const typeValues = typeRow.slice(1);
          
          const headerRow = allData[3] as any[];
          const headers = headerRow.slice(1);
          
          const fullDataRows = allData.slice(4);
          const dataRows = fullDataRows.map(row => (row as any[]).slice(1));

          // 업로드된 컬럼 정보 생성 (원본의 orderNo 유지)
          const allOriginalColumns = [
            { name: 'id', type: 'string', required: false, orderNo: 0 },
            ...currentColumnsInfo
          ].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));

          const uploadColumns = headers.map((header: string, index: number) => {
            const name = header ? header.trim() : `col${index}`;
            const type = parseTypeFromKorean(typeValues[index] ? String(typeValues[index]) : 'string');
            const requiredValue = requiredValues[index];
            
            const required = parseRequiredFromKorean(requiredValue);

            // 원본 컬럼에서 orderNo 찾기
            const originalColumn = allOriginalColumns.find(col => col.name === name);
            const orderNo = originalColumn ? originalColumn.orderNo : index;

            return {
              name,
              type,
              required,
              orderNo
            };
          });

          // 1단계: 컬럼 메타정보 검증 (최초 등록이 아닌 경우만)
          const isFirstRegistration = !currentTableData || currentTableData.length === 0;
          
          if (!isFirstRegistration) {
            // 기존 데이터가 있는 경우만 메타데이터 검증 수행
            const columnErrors = validateColumnMetadata(uploadColumns, currentColumnsInfo);
            
            if (columnErrors.length > 0) {
              // 컬럼 메타정보 에러가 있으면 팝업으로 표시하고 중단
              showAlert(`업로드 실패\n\n컬럼 메타정보 오류:\n${columnErrors.join('\n')}`, 'error');
              return;
            }
          } else {
            // 최초 등록인 경우 업로드된 메타데이터를 새로운 스키마로 사용
            console.log('최초 등록: 업로드된 메타데이터를 새로운 스키마로 설정합니다.');
          }

          // 2단계: 데이터 파싱 및 변환
          const parsedData: any[] = [];
          const parseErrors: string[] = [];
          
          dataRows.forEach((row: any[], rowIndex) => {
            const obj: any = {};
            let hasParseErrors = false;

            // 헤더와 원본 컬럼의 매핑을 통해 데이터 할당
            headers.forEach((header, index) => {
              const key = header ? header.trim() : `col${index}`;
              const uploadColumn = uploadColumns.find(col => col.name === key);
              const expectedType = uploadColumn?.type || 'string';
              
              const rawValue = row[index] !== undefined ? row[index] : '';
              const { value, isValid } = validateAndConvertValue(rawValue, expectedType, key, rowIndex);
              
              obj[key] = value;
              
              // 타입 검증 실패 시 에러 기록
              if (!isValid && rawValue !== null && rawValue !== undefined && rawValue !== '') {
                const excelRowNum = rowIndex + 5; // 실제 엑셀 행 번호
                const excelColLetter = String.fromCharCode(66 + index); // B, C, D, E...
                const cellPosition = `${excelColLetter}${excelRowNum}`;
                
                switch (expectedType) {
                  case 'number':
                    parseErrors.push(`${cellPosition}셀 '${key}': 숫자가 아님 (입력값: "${rawValue}")`);
                    break;
                  case 'boolean':
                    parseErrors.push(`${cellPosition}셀 '${key}': 올바른 불린값이 아님 (입력값: "${rawValue}", 가능값: Y/N, true/false, 1/0 등)`);
                    break;
                }
                hasParseErrors = true;
              }
            });

            // id 필드가 없거나 비어있으면 빈 값으로 유지 (서버에서 신규로 인식하여 자동 생성)
            if (!obj.id) {
              obj.id = '';
            }

            // 파싱 에러가 있어도 일단 데이터는 추가 (나중에 validateAndClassifyData에서 제외됨)
            parsedData.push(obj);
          });

          // 파싱 에러가 있으면 미리 알림
          if (parseErrors.length > 0) {
            console.warn('데이터 파싱 중 타입 오류 발견:', parseErrors);
          }

          // 3단계: 데이터 검증 및 분류 (업데이트된 컬럼 정보로 검증)
          const { 
            successData, 
            excludedData, 
            excludeReasons,
            totalProcessed,
            successCount,
            excludedCount
          } = validateAndClassifyData(parsedData, uploadColumns, dataRows);

          // 4단계: 결과 표시 (모든 경우에 동일한 형태로 표시)
          // 성공 데이터와 컬럼 정보를 상태에 저장 (저장 버튼에서 사용)
          setUploadSuccessData(successData);
          setUploadColumns(uploadColumns);
          
          showAlert(
            `업로드 처리 완료\n\n전체 ${totalProcessed}행 중:\n✅ 성공: ${successCount}행\n❌ 제외: ${excludedCount}행${excludedCount > 0 ? `\n\n제외 사유:\n${excludeReasons.slice(0, 10).join('\n')}${excludeReasons.length > 10 ? `\n... 외 ${excludeReasons.length - 10}개` : ''}` : ''}`,
            excludedCount > 0 ? 'warning' : 'success'
          );

          // API 업로드는 저장 버튼을 통해서만 수행 (handleSaveUploadResult에서 처리)

        } catch (error) {
          console.error('File processing error:', error);
          showAlert('파일 처리 중 오류가 발생했습니다.', 'error');
        }
      };
      reader.readAsArrayBuffer(file);
    }
    
    // 파일 input 초기화
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleExcelUpload = useCallback(() => {
    // 고객사가 선택되지 않은 경우 먼저 체크
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택해주세요.', 'error');
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [selectedCompanyCode, showToast]);

  const handleExcelTemplateDownload = useCallback(async () => {
    try {
      // 회사 코드가 선택되지 않은 경우
      if (!selectedCompanyCode) {
        showToast('먼저 고객사를 선택해주세요.', 'error');
        return;
      }

      // 컬럼 정보가 없는 경우 (에러 또는 아직 조회하지 않음)
      if (!currentColumnsInfo || currentColumnsInfo.length === 0) {
        showToast('먼저 고객사를 선택하여 데이터를 조회해주세요.', 'error');
        return;
      }

      // 컬럼은 있지만 데이터가 없는 경우 - 샘플 템플릿 생성
      if (!currentTableData || currentTableData.length === 0) {
        console.log('Creating sample template with no data');
        
        // currentColumnsInfo에서 orderNo로 정렬 (id 컬럼이 이미 포함되어 있음)
        const sortedColumns = [...currentColumnsInfo].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
        
        // 샘플 템플릿 데이터 구성 (데이터 행 없이)
        const templateData: any[][] = [];
        
        // 1행: 사용방법 설명
        const usageRow = [
          '※ 업로드 주의사항 ※\n' +
          '• A열 무시, B열부터 입력\n' +
          '• 신규 추가건은 id 란을 비워주세요\n' +
          '• 컬럼명/타입/필수여부 최초 등록 이 후 변경 금지\n' +
          '• "필수" 항목 비어있으면 행 제외\n' +
          '• 타입 불일치 시 행 제외 (예: 숫자컬럼에 문자입력)\n' +
          '• 기존 컬럼 삭제/순서변경 시 업로드 실패\n' +
          '• 검증실패 행은 제외되고 성공행만 저장'
        ];
        // B열부터는 빈 값으로 채움
        sortedColumns.forEach(() => {
          usageRow.push('');
        });
        templateData.push(usageRow);
        
        // 2행: 필수 여부
        const requiredRow = ['필수'];
        sortedColumns.forEach((col: any) => {
          requiredRow.push(getRequiredDisplayText(col.required));
        });
        templateData.push(requiredRow);
        
        // 3행: 타입 정보
        const typeRow = ['타입'];
        sortedColumns.forEach((col: any) => {
          typeRow.push(getTypeDisplayText(col.type));
        });
        templateData.push(typeRow);
        
        // 4행: 헤더 정보
        const headerRow = ['헤더'];
        sortedColumns.forEach((col: any) => {
          headerRow.push(col.name);
        });
        templateData.push(headerRow);
        
        // 5행: 데이터 영역 표시
        const dataAreaRow = ['데이터 영역'];
        sortedColumns.forEach((col: any) => {
          let sampleValue: any = '';
          switch (col.type) {
            case 'string':
              if (col.name === 'id') {
                sampleValue = ''; // id 필드는 빈값으로 설정
              } else {
                sampleValue = `예시_${col.name}`;
              }
              break;
            case 'number':
              // 숫자 타입은 실제 숫자로 저장
              sampleValue = col.name === '금액' ? 100000 : 1;
              break;
            case 'boolean':
              sampleValue = 'Y';
              break;
            default:
              sampleValue = '예시값';
          }
          dataAreaRow.push(sampleValue);
        });
        templateData.push(dataAreaRow);

        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // 스타일링 적용 (샘플 데이터 1행)
        applyExcelStyling(ws, sortedColumns, [{}]);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '단가표_샘플템플릿');
        XLSX.writeFile(wb, `단가표_샘플템플릿_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        showToast('샘플 템플릿을 다운로드했습니다.', 'success');
        return;
      }

      // 정상적인 경우 - 실제 데이터로 템플릿 생성
      console.log('Creating template with actual data');
      
      // currentColumnsInfo에서 orderNo로 정렬 (id 컬럼이 이미 포함되어 있음)
      const allColumns = [...currentColumnsInfo].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));
      
      // 템플릿 데이터 구성
      const templateData: any[][] = [];
      
      // 1행: 사용방법 설명
      const usageRow = [
        '※ 업로드 주의사항 ※\n' +
        '• A열 무시, B열부터 입력\n' +
        '• 신규 추가건은 id 란을 비워주세요\n' +
        '• 컬럼명/타입/필수여부 변경 금지\n' +
        '• "필수" 항목 비어있으면 행 제외\n' +
        '• 타입 불일치 시 행 제외 (예: 숫자컬럼에 문자입력)\n' +
        '• 기존 컬럼 삭제/순서변경 시 업로드 실패\n' +
        '• 검증실패 행은 제외되고 성공행만 저장'
      ];
      // B열부터는 빈 값으로 채움
      allColumns.forEach(() => {
        usageRow.push('');
      });
      templateData.push(usageRow);
      
      // 2행: 필수 여부
      const requiredRow = ['필수'];
      allColumns.forEach((col: any) => {
        requiredRow.push(getRequiredDisplayText(col.required));
      });
      templateData.push(requiredRow);
      
      // 3행: 타입 정보
      const typeRow = ['타입'];
      allColumns.forEach((col: any) => {
        typeRow.push(getTypeDisplayText(col.type));
      });
      templateData.push(typeRow);
      
      // 4행: 헤더 정보
      const headerRow = ['헤더'];
      allColumns.forEach((col: any) => {
        headerRow.push(col.name);
      });
      templateData.push(headerRow);
      
      // 5행부터: 실제 데이터
      currentTableData.forEach((item: any, index: number) => {
        const dataRow = ['데이터 영역']; // A열에는 구분자
        allColumns.forEach((col: any) => {
          const value = item[col.name];
          if (value === undefined || value === null) {
            dataRow.push(''); // 값이 없으면 빈 문자열
          } else if (col.type === 'number') {
            // 숫자 타입은 실제 숫자로 저장
            const numValue = Number(value);
            dataRow.push(isNaN(numValue) ? value : numValue);
          } else {
            dataRow.push(value);
          }
        });
        templateData.push(dataRow);
      });

      const ws = XLSX.utils.aoa_to_sheet(templateData);

      // 스타일링 적용 (데이터 포함)
      applyExcelStyling(ws, allColumns, currentTableData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '단가표_실제데이터');
      XLSX.writeFile(wb, `단가표_실제데이터_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      showToast('템플릿이 성공적으로 다운로드되었습니다.', 'success');
      
    } catch (error) {
      console.error('Excel template download error:', error);
      showToast('템플릿 다운로드 중 오류가 발생했습니다.', 'error');
    }
  }, [selectedCompanyCode, currentColumnsInfo, currentTableData]);

  const handleSaveUploadResult = async () => {
    try {
      if (!selectedCompanyCode || !uploadSuccessData.length || !uploadColumns.length) {
        showToast('업로드할 데이터가 없습니다.', 'error');
        return;
      }

      // API 형식에 맞춰 데이터 구성
      const processedData = uploadSuccessData.map((item: any) => {
        const processedItem = { ...item };
        // id가 빈 값이면 필드 자체를 제거 (신규 생성으로 인식)
        if (!processedItem.id || processedItem.id === '') {
          delete processedItem.id;
        }
        return processedItem;
      });

      // 200개씩 나누기
      const chunkSize = 200;
      const chunks = [];
      for (let i = 0; i < processedData.length; i += chunkSize) {
        chunks.push(processedData.slice(i, i + chunkSize));
      }

      // columns payload
      const columnsPayload = uploadColumns.map((col: any) => ({
        name: col.name,
        type: col.type,
        required: col.required,
        orderNo: col.orderNo
      }));

      // 순차적으로 API 호출
      for (let i = 0; i < chunks.length; i++) {
        const apiPayload = {
          companyCode: selectedCompanyCode,
          columns: columnsPayload,
          data: chunks[i]
        };
        
        const response = await uploadUnitPrices(apiPayload);
        
        console.log(`Chunk ${i + 1} upload response:`, response);
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;
        
        if (!apiResponse || (apiResponse.statusCode !== 200 && apiResponse.statusCode !== "200") || apiResponse.message !== 'success') {
          const errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || `청크 ${i + 1} 업로드에 실패했습니다.`;
          throw new Error(errorMessage);
        }
      }

      // 업로드 성공 시 처리
      showToast('데이터가 성공적으로 업로드되었습니다.', 'success');

      // 업로드 성공 후 테이블 새로고침
      if (selectedCompanyCode) {
        await handleCompanySelect({ id: selectedCompanyCode, name: selectedCompanyName });
      }

      // 팝업 닫기
      closeAlert();

      // 상태 초기화
      setUploadSuccessData([]);
      setUploadColumns([]);

    } catch (error) {
      console.error('단가 업로드 에러:', error);
      const err = error as Error | { customMessage?: string };
      const errorMessage = 'customMessage' in err 
        ? err.customMessage 
        : err instanceof Error 
          ? err.message 
          : '데이터 업로드 중 오류가 발생했습니다.';
      showToast(errorMessage, 'error');
    }
  };

  const showAlert = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertOpen(true);
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
    setAlertMessage('');
  };

  return (
    <>
      <CmsResponsiveContainer<any>
        key={`price-list-${selectedCompanyCode || 'no-company'}-${forceUpdateKey}`}
        title="단가표 관리"
        data={transformedTableData}
        columns={dynamicColumns}
        enableDateFilter={false}
        enableCompanySearch={true}
        onCompanySelect={handleCompanySelect}
        selectedCompanyCode={selectedCompanyCode}
        selectedCompanyName={selectedCompanyName}
        onRowClick={handleRowClick}
        themeMode="light"
        onAdd={() => {
          if (!selectedCompanyCode) {
            showToast('먼저 고객사를 선택해주세요.', 'error');
            return;
          }
          
          // 새로운 항목 추가를 위해 빈 객체 설정
          setSelectedItem({});
          setIsPopupOpen(true);
        }}
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

      <PriceEditPopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        onSave={handleSaveItem}
        selectedItem={selectedItem}
        columnsInfo={currentColumnsInfo}
      />

      {/* 알림 팝업 */}
      <UploadResultPopup 
        isOpen={isAlertOpen}
        onClose={closeAlert}
        onSave={alertType === 'success' || alertType === 'warning' ? handleSaveUploadResult : undefined}
        type={alertType}
        message={alertMessage}
      />
    </>
  );
};

export default PriceListPage;
