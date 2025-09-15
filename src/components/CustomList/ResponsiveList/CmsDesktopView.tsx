"use client";

import React, { useRef } from "react";
import GenericListUI, { FetchParams, FetchResult } from "@/components/CustomList/GenericListUI";
import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";

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
  // 고객사 검색 관련 props
  enableCompanySearch?: boolean;
  onCompanySelect?: (company: { id: string; name: string }) => void;
  selectedCompanyCode?: string | null;
  selectedCompanyName?: string;
  isShowExcelTemplate?: boolean;
  excelUploadBtnCallBack?: () => void;
  excelTemplateBtnCallBack?: () => void;
}

export default function CmsDesktopView<T extends BaseRecord>({
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
  enableCompanySearch,
  onCompanySelect,
  selectedCompanyCode,
  selectedCompanyName,
  isShowExcelTemplate,
  excelUploadBtnCallBack,
  excelTemplateBtnCallBack,
}: CmsDesktopViewProps<T>) {
  const listRef = useRef<{ refetch: () => void } | null>(null);

  const handleFetchData = async (params: FetchParams) => {
    if (fetchData) {
      return await fetchData(params);
    }
    // 기본 더미 데이터 반환
    return {
      data,
      totalItems: data.length,
      allItems: data.length,
    };
  };

  return (
    <GenericListUI<T>
      ref={listRef}
      title={title}
      excelFileName="데이터 목록"
      columns={columns}
      fetchData={handleFetchData}
      themeMode={themeMode}
      onAdd={onAdd}
      addButtonLabel={addButtonLabel}
      onRowClick={onRowClick}
      enableDateFilter={enableDateFilter}
      enableCompanySearch={enableCompanySearch}
      onCompanySelect={onCompanySelect}
      selectedCompanyCode={selectedCompanyCode}
      selectedCompanyName={selectedCompanyName}
      isShowExcelTemplate={isShowExcelTemplate}
      excelUploadBtnCallBack={excelUploadBtnCallBack}
      excelTemplateBtnCallBack={excelTemplateBtnCallBack}
    />
  );
}
