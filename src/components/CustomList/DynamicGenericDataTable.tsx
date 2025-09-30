"use client";

import styled from "styled-components";
import React, { useEffect, useRef } from "react";
import { ThemeMode } from "../../styles/theme_colors";
import { devLog } from "../../utils/devLogger";



export interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  noPopup?: boolean; // ✅ 팝업 비활성화
  formatter?: (value: any, item: T, rowIndex: number) => React.ReactNode;
  excelFormatter?: (value: any, item: T) => string | number | boolean; // Excel 전용 포맷터 (옵셔널)
  showColumn?: boolean; // ✅ 엑셀에서 컬럼 표시 여부 (기본 true)
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties | ((value: any, item: T) => React.CSSProperties);
  flex?: number; // ✅ flex 비율
}

interface DynamicGenericDataTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  isLoading?: boolean;
  error?: string | null;
  maxLength?: number;
  onRowClick?: (item: T, rowIndex: number) => void;
  onHeaderClick?: (accessor: keyof T | string) => void;
  sortKey?: keyof T | string | null;
  sortOrder?: "asc" | "desc";
  keyExtractor: (item: T, index: number) => string | number;
  themeMode?: ThemeMode;
}

// 중첩 키 처리
const getPropertyValue = <T,>(obj: T, path: keyof T | string): any => {
  if (typeof path !== "string") return obj[path];
  const keys = path.split(".");
  return keys.reduce((acc: any, key: string) => acc?.[key], obj);
};

const DynamicGenericDataTable = <T extends object>({
  data,
  columns,
  isLoading = false,
  error = null,
  maxLength,
  onRowClick,
  onHeaderClick,
  sortKey,
  sortOrder,
  keyExtractor,
  themeMode = "dark",
}: DynamicGenericDataTableProps<T>) => {
  const displayData = maxLength ? data.slice(0, maxLength) : data;
  const tableRef = useRef<HTMLTableElement>(null);

  // 동적 테이블에서는 각 컬럼의 최소 너비를 계산
  const calculateMinWidth = (column: ColumnDefinition<T>) => {
    const headerLength = column.header.length;
    const minWidth = Math.max(headerLength * 8, 100); // 최소 100px, 헤더 길이에 따라 조정
    return `${minWidth}px`;
  };

  useEffect(() => {
    const logTableStatus = () => {
      const tableWidth = tableRef.current?.offsetWidth;
      const totalMinWidth = columns.reduce((sum, col) => {
        const minWidth = parseInt(calculateMinWidth(col));
        return sum + minWidth;
      }, 0);
      
      devLog("============== 📐 DynamicGenericDataTable Layout Info ==============");
      devLog("📏 window.innerWidth:", window.innerWidth);
      devLog("📐 table.offsetWidth:", tableWidth);
      devLog("📊 totalMinWidth:", totalMinWidth);
      devLog("📋 columns.length:", columns.length);
      columns.forEach((col, i) => {
        const minWidth = calculateMinWidth(col);
        devLog(`  ▸ Column ${i} (${col.header}): minWidth=${minWidth}`);
      });
      devLog("================================================================");
    };
    logTableStatus();
    window.addEventListener("resize", logTableStatus);
    return () => window.removeEventListener("resize", logTableStatus);
  }, [columns]);

  return (
    <DynamicTableContainer>
      <DynamicTable ref={tableRef}>
        <colgroup>
          {columns.map((col, i) => (
            <col key={i} style={{ minWidth: calculateMinWidth(col) }} />
          ))}
        </colgroup>
        <thead>
        <tr>
          {columns.map((col, i) => {
            const sortable = (col.sortable ?? true) && onHeaderClick;
            const isSorted = sortable && col.accessor === sortKey;
            return (
              <Th
                key={i}
                onClick={sortable ? () => onHeaderClick(col.accessor) : undefined}
                style={{ ...col.headerStyle, cursor: sortable ? "pointer" : "default" }}
                $isSortable={!!sortable}>
                {col.header}
                {isSorted && <SortIcon>{sortOrder === "asc" ? " ▲" : " ▼"}</SortIcon>}
              </Th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <TdNoData colSpan={columns.length}>
              <LoadingWrapper>
                <LoadingSpinner />
                <p>데이터를 불러오는 중...</p>
              </LoadingWrapper>
            </TdNoData>
          </tr>
        ) : error ? (
          <tr>
            <TdNoData colSpan={columns.length}>
              <NoDataWrapper>
                <p style={{ color: '#d32f2f' }}>오류: {error}</p>
              </NoDataWrapper>
            </TdNoData>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <TdNoData colSpan={columns.length}>
              <NoDataWrapper>
                <p>데이터가 없습니다.</p>
              </NoDataWrapper>
            </TdNoData>
          </tr>
        ) : (
          displayData.map((item, rowIdx) => (
            <TableRow key={keyExtractor(item, rowIdx)}>
              {columns.map((col, colIdx) => {
                const value = getPropertyValue(item, col.accessor);
                const content = col.formatter ? col.formatter(value, item, rowIdx) : String(value ?? "-");
                const style = typeof col.cellStyle === "function" ? col.cellStyle(value, item) : col.cellStyle;
                
                return (
                  <Td
                    key={colIdx}
                    style={{
                      ...style,
                      cursor: col.noPopup ? "default" : "pointer",
                    }}
                    onClick={() => {
                      if (!col.noPopup && onRowClick) onRowClick(item, rowIdx);
                    }}>
                    {content}
                  </Td>
                );
              })}
            </TableRow>
          ))
        )}
      </tbody>
      </DynamicTable>
    </DynamicTableContainer>
  );
};

export default DynamicGenericDataTable;

// --- Styles ---

const DynamicTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid #e6e7e9;
  border-radius: 4px;
  background-color: #fffefb;
  
  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const DynamicTable = styled.table`
  width: max-content; /* 컨텐츠에 맞게 너비 자동 조정 */
  min-width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  background-color: #fffefb;
  table-layout: auto; /* 동적 레이아웃으로 변경 */
`;

const Th = styled.th<{ $isSortable?: boolean }>`
  padding: 12px 8px;
  border-bottom: 1px solid #e6e7e9;
  background-color: #f7f7f7;
  color: #221d12;
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
  cursor: ${({ $isSortable }) => ($isSortable ? "pointer" : "default")};
`;

const SortIcon = styled.span`
  margin-left: 4px;
  font-size: 12px;
  color: #221d12;
`;

const TableRow = styled.tr`
  background-color: #fffefb;
  position: relative; /* 툴팁 위치 기준점 */

  &:nth-child(even) {
    background-color: #f7f7f7;
  }

  /* 행에 호버될 때 z-index 조정 */
  &:hover {
    z-index: 100;
  }
`;

const Td = styled.td`
  padding: 12px 8px;
  background-color: transparent;
  color: #221d12;
  text-align: center;
  border: none;
  overflow: hidden; /* 넘치는 내용 숨김 */
  text-overflow: ellipsis; /* 말줄임표 표시 */
  white-space: nowrap; /* 텍스트 줄바꿈 방지 */
  position: relative; /* 툴팁 위치 기준점 */
`;

const TdNoData = styled.td`
  padding: 40px;
  color: #aaa;
  background-color: #fffefb;
`;

const NoDataWrapper = styled.div`
  text-align: center;
  width: 100%;
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left: 4px solid #214a72;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;