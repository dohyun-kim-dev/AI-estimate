"use client";

import React, { useRef, forwardRef, useEffect, useImperativeHandle, useState } from "react";
import GenericListUI, { FetchParams, FetchResult } from "@/components/CustomList/GenericListUI";
import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";
import { devLog } from '@/utils/devLogger'

// BaseRecord 타입 정의
interface BaseRecord {
  id?: string | number;
  index?: number;
  [key: string]: any;
}

interface CmsDesktopViewProps<T extends BaseRecord> {
  title: string;
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (item: T) => void;
  onAdd?: () => void;
  addButtonLabel?: string;
  onExport?: () => void;
  isLoading?: boolean;
  fetchData?: (params: FetchParams) => Promise<FetchResult<T>>;
  themeMode?: "light" | "dark";
  compactFieldCount?: number; // 모바일용이지만 props 통일을 위해
  defaultViewMode?: 'detail' | 'compact' | 'large'; // 모바일용이지만 props 통일을 위해
  enableDateFilter?: boolean;
  isDynamicData?: boolean; // 동적 데이터 테이블 사용 여부
  // 고객사 검색 관련 props
  enableCompanySearch?: boolean;
  onCompanySelect?: (company: { id: string; name: string }) => void;
  selectedCompanyCode?: string | null;
  selectedCompanyName?: string;
  isShowExcelTemplate?: boolean;
  excelUploadBtnCallBack?: () => void;
  excelTemplateBtnCallBack?: () => void;
  deleteBtnCallBack?: () => void;
  // 중간 영역 커스텀 컨텐츠 prop 추가
  renderMiddleContent?: () => React.ReactNode;
  searchPlaceholder?: string;
  // 날짜 관련 콜백 추가
  onInitialDateSet?: (fromDate: string, toDate: string) => void;
  onDateChange?: (fromDate: string, toDate: string) => void;
  onSearchChange?: (keyword: string) => void; // 검색 변경 콜백 추가
  customExcelDownload?: (data: T[], columns: ColumnDefinition<T>[]) => void; // 커스텀 엑셀 다운로드 함수
  dateRangeOptions?: ('금월' | '지난달' | '3개월' | '6개월' | '1년' | '2년' | '지정')[];
}

  const CmsDesktopView = forwardRef<{ refetch: () => void }, CmsDesktopViewProps<any>>(function CmsDesktopView<T extends BaseRecord>({
  title,
  data,
  columns,
  onRowClick,
  onAdd,
  addButtonLabel,
  onExport,
  isLoading = false,
  fetchData,
  themeMode = "light",
  enableDateFilter,
  isDynamicData = false, // 동적 데이터 테이블 사용 여부
  enableCompanySearch,
  onCompanySelect,
  selectedCompanyCode,
  selectedCompanyName,
  isShowExcelTemplate,
  excelUploadBtnCallBack,
  excelTemplateBtnCallBack,
  deleteBtnCallBack,
  renderMiddleContent,
  searchPlaceholder,
  onInitialDateSet, // 날짜 콜백 추가
  onDateChange, // 날짜 콜백 추가
  onSearchChange, // 검색 변경 콜백 추가
  customExcelDownload, // 커스텀 엑셀 다운로드 함수
  dateRangeOptions,
}: CmsDesktopViewProps<T>, ref: React.Ref<{ refetch: () => void }>) {
  const [listData, setListData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 부모 컴포넌트에 refetch 함수 노출
  useImperativeHandle(ref, () => ({
    refetch: () => {
      handleFetchDataInternal(currentParams);
    },
  }));

  const [currentParams, setCurrentParams] = useState<FetchParams>({});

  // API 호출 함수
  const handleFetchDataInternal = async (params: FetchParams) => {
    if (!fetchData) {
      setListData(data);
      setTotalItems(data.length);
      return;
    }

    // 현재 저장된 파라미터와 새로운 파라미터를 병합
    const mergedParams = { ...currentParams, ...params };
    setCurrentParams(mergedParams);

    setIsListLoading(true);
    try {
      const result = await fetchData(mergedParams);
      setListData(result.data);
      setTotalItems(result.totalItems);
    } catch (error) {
      console.error('API 호출 오류:', error);
      setListData([]);
      setTotalItems(0);
    } finally {
      setIsListLoading(false);
    }
  };

  // 초기 로딩 - 정확히 한 번만 실행되도록 보장
  useEffect(() => {
    if (!isInitialized) {
      devLog('🚀 CmsDesktopView 초기 API 호출');
      setIsInitialized(true);
      handleFetchDataInternal({});
    }
  }, [isInitialized]); // isInitialized가 변경될 때만 실행

  // data prop 변경 감지 - fetchData가 없을 때 직접 전달받은 data 사용
  useEffect(() => {
    if (!fetchData) {
      devLog('🔄 CmsDesktopView data 변경 감지:', data.length);
      setListData(data);
      setTotalItems(data.length);
    }
  }, [data, fetchData]); // data 또는 fetchData가 변경될 때마다 실행

  // 검색 콜백 - 현재 저장된 모든 파라미터와 함께 API 호출
  const handleSearchChange = (keyword: string) => {
    const searchParams = { ...currentParams, keyword };
    handleFetchDataInternal(searchParams);
    // 부모에게도 알림
    if (onSearchChange) {
      onSearchChange(keyword);
    }
  };

  // 날짜 변경 콜백 - 상태만 저장 (API 호출 없음)
  const handleDateChange = (fromDate: string, toDate: string) => {
    setCurrentParams(prev => ({ ...prev, fromDate, toDate }));
    // 부모에게도 알림
    if (onDateChange) {
      onDateChange(fromDate, toDate);
    }
  };

  // 상태 변경 콜백 - 상태만 저장 (API 호출 없음)
  const handleStatusChange = (status: string) => {
    setCurrentParams(prev => ({ ...prev, status }));
  };

  // 고객사 변경 콜백 - 상태만 저장 (API 호출 없음)
  const handleCompanyChange = (companyCode: string | null, companyName: string) => {
    setCurrentParams(prev => ({ ...prev, companyCode: companyCode || undefined }));
  };  
  
  return (
    <GenericListUI<T>
      title={title}
      excelFileName="데이터 목록"
      columns={columns}
      data={listData}
      totalItems={totalItems}
      isLoading={isListLoading}
      isDynamicData={isDynamicData} // 동적 데이터 테이블 사용 여부
      themeMode={themeMode}
      addButton={onAdd ? { label: addButtonLabel || "추가", onClick: onAdd } : undefined}
      deleteButton={deleteBtnCallBack ? { label: "삭제", onClick: deleteBtnCallBack } : undefined}
      excelTemplateButton={excelTemplateBtnCallBack ? { label: "엑셀 템플릿", onClick: excelTemplateBtnCallBack } : undefined}
      excelUploadButton={excelUploadBtnCallBack ? { label: "엑셀 업로드", onClick: excelUploadBtnCallBack } : undefined}
      onRowClick={onRowClick}
      enableDateFilter={enableDateFilter}
      enableCompanySearch={enableCompanySearch}
      onCompanySelect={onCompanySelect}
      selectedCompanyCode={selectedCompanyCode}
      selectedCompanyName={selectedCompanyName}
      renderMiddleContent={renderMiddleContent}
      searchPlaceholder={searchPlaceholder}
      onSearchChange={handleSearchChange}
      onDateChange={handleDateChange}
      onStatusChange={handleStatusChange}
      onCompanyChange={handleCompanyChange}
      onInitialDateSet={onInitialDateSet} // 초기 날짜 설정 콜백 추가
      customExcelDownload={customExcelDownload} // 커스텀 엑셀 다운로드 함수 전달
      dateRangeOptions={dateRangeOptions} // 날짜 옵션 배열 전달
    />
  );
});

export default CmsDesktopView;
