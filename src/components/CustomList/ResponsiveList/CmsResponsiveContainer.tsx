"use client";

import React, { forwardRef } from "react";
import ResponsiveView from "@/layout/ResponsiveView";
import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";
import { FetchParams, FetchResult } from "@/components/CustomList/GenericListUI";
import CmsMobileView from "./CmsMobileView";
import CmsDesktopView from "./CmsDesktopView";

// BaseRecord 타입 정의
interface BaseRecord {
  id?: string | number;
  index?: number;
  [key: string]: any;
}

// ViewMode 타입 추가
type ViewMode = 'detail' | 'compact' | 'large';

interface CmsResponsiveContainerProps<T extends BaseRecord> {
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
  compactFieldCount?: number;
  defaultViewMode?: ViewMode; // 모바일에서 기본 보기   모드
  enableDateFilter: boolean;
  isDynamicData?: boolean; // 동적 데이터 테이블 사용 여부
  // 고객사 검색 관련 props
  enableCompanySearch?: boolean;
  onCompanySelect?: (company: { id: string; name: string }) => void;
  selectedCompanyCode?: string | null; // 현재 선택된 고객사 코드
  selectedCompanyName?: string; // 현재 선택된 고객사명
  isShowExcelTemplate?: boolean;
  excelUploadBtnCallBack?: () => void;
  excelTemplateBtnCallBack?: () => void;
  deleteBtnCallBack?: () => void;
  // 중간 영역 커스텀 컨텐츠 prop 추가
  renderMiddleContent?: () => React.ReactNode;
  searchPlaceholder?: string;
  dateRangeOptions?: ('금월' | '지난달' | '3개월' | '6개월' | '1년' | '2년' | '지정')[];
  // 날짜 관련 콜백 추가
  onInitialDateSet?: (fromDate: string, toDate: string) => void;
  onDateChange?: (fromDate: string, toDate: string) => void;
  onSearchChange?: (keyword: string) => void; // 검색 변경 콜백 추가
  
}

const CmsResponsiveContainer = <T extends BaseRecord>(
  props: CmsResponsiveContainerProps<T> & { ref?: React.Ref<{ refetch: () => void }> }
) => {
  const {
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
    compactFieldCount = 3,
    defaultViewMode = 'detail',
    enableDateFilter,
    isDynamicData = false, // 동적 데이터 테이블 사용 여부
    onCompanySelect,
    enableCompanySearch,
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
    dateRangeOptions,
    ref,
  } = props;
  
  // 공통 props
  const commonProps = {
    ref,
    title,
    data,
    columns,
    onRowClick,
    onAdd,
    onExport,
    isLoading,
    fetchData,
    themeMode,
    compactFieldCount,
    defaultViewMode,
    enableDateFilter,
    isDynamicData, // 동적 데이터 테이블 사용 여부 추가
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
    dateRangeOptions,
  };

  return (
    <ResponsiveView
      mobileView={<CmsMobileView {...commonProps} />}
      desktopView={<CmsDesktopView {...commonProps} addButtonLabel={addButtonLabel} ref={ref} />}
    />
  );
};

export default CmsResponsiveContainer;
