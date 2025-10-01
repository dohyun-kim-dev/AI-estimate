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
  width?: number | string; // ✅ 고정 너비 (px 또는 % 등)
}

interface GenericDataTableProps<T> {
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

const GenericDataTable = <T extends object>({
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
}: GenericDataTableProps<T>) => {
  const totalFlex = columns.reduce((sum, col) => sum + (col.flex ?? 0), 0);
  const displayData = maxLength ? data.slice(0, maxLength) : data;
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const logFlexStatus = () => {
      const tableWidth = tableRef.current?.offsetWidth;
      devLog("============== 📐 GenericDataTable Layout Info ==============");
      devLog("📏 window.innerWidth:", window.innerWidth);
      devLog("📐 table.offsetWidth:", tableWidth);
      devLog("📊 totalFlex:", totalFlex);
      columns.forEach((col, i) => {
        const flex = col.flex ?? 0;
        const width = col.width;
        const percent = totalFlex > 0 ? ((flex / totalFlex) * 100).toFixed(2) : "0";
        devLog(`  ▸ Column ${i} (${col.header}): width=${width || 'auto'}, flex=${flex}, widthPercent=${percent}%`);
      });
      devLog("=============================================================");
    };
    logFlexStatus();
    window.addEventListener("resize", logFlexStatus);
    return () => window.removeEventListener("resize", logFlexStatus);
  }, [columns, totalFlex]);

  return (
    <Table ref={tableRef}>
      <colgroup>
        {columns.map((col, i) => {
          let width: string | undefined;
          
          // 1. width가 명시적으로 설정된 경우 우선 적용
          if (col.width) {
            width = typeof col.width === 'number' ? `${col.width}px` : col.width;
          }
          // 2. width가 없고 flex가 있으면 flex 비율로 계산
          else if (col.flex && totalFlex > 0) {
            width = `${(col.flex / totalFlex) * 100}%`;
          }
          
          return <col key={i} style={{ width }} />;
        })}
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
    </Table>
  );
};

export default GenericDataTable;

// --- Styles ---

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  background-color: #fffefb;
  table-layout: fixed; /* 테이블 레이아웃을 고정하여 컬럼 너비 제어 */
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