'use client';

import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import styled from "styled-components";
import React, { useEffect, useRef } from "react";

export interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T | string;
  sortable?: boolean;
  noPopup?: boolean; // ✅ 팝업 비활성화
  formatter?: (value: any, item: T, rowIndex: number) => React.ReactNode;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties | ((value: any, item: T) => React.CSSProperties);
  flex?: number; // ✅ flex 비율
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
  fixedLayout?: boolean; // 테이블 레이아웃을 fixed로 설정할지 여부
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
  fixedLayout = false,
}: GenericDataTableProps<T>) => {
  const totalFlex = columns.reduce((sum, col) => sum + (col.flex ?? 0), 0);
  const displayData = maxLength ? data.slice(0, maxLength) : data;
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const logFlexStatus = () => {
      const tableWidth = tableRef.current?.offsetWidth;
      console.log("============== 📐 GenericDataTable Layout Info ==============");
      console.log("📏 window.innerWidth:", window.innerWidth);
      console.log("📐 table.offsetWidth:", tableWidth);
      console.log("📊 totalFlex:", totalFlex);
      columns.forEach((col, i) => {
        const flex = col.flex ?? 0;
        const percent = totalFlex > 0 ? ((flex / totalFlex) * 100).toFixed(2) : "0";
        console.log(`  ▸ Column ${i} (${col.header}): flex=${flex}, widthPercent=${percent}%`);
      });
      console.log("=============================================================");
    };
    logFlexStatus();
    window.addEventListener("resize", logFlexStatus);
    return () => window.removeEventListener("resize", logFlexStatus);
  }, [columns, totalFlex]);

  return (
    <Table $themeMode={themeMode} $fixedLayout={fixedLayout} ref={tableRef}>
      {totalFlex > 0 && (
        <colgroup>
          {columns.map((col, i) => (
            <col
              key={i}
              style={{ width: col.flex ? `${(col.flex / totalFlex) * 100}%` : undefined }}
            />
          ))}
        </colgroup>
      )}
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
                $isSortable={!!sortable}
                $themeMode={themeMode}
                $fixedLayout={fixedLayout}
              >
                {col.header}
                {isSorted && (
                  <SortIcon $themeMode={themeMode} $sortOrder={sortOrder}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                      <g clipPath="url(#clip0_1058_17546)">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.35213 8.59407C7.25496 8.69121 7.12318 8.74578 6.98579 8.74578C6.84839 8.74578 6.71662 8.69121 6.61945 8.59407L3.68822 5.66284C3.63873 5.61504 3.59925 5.55786 3.5721 5.49465C3.54494 5.43143 3.53065 5.36344 3.53005 5.29463C3.52945 5.22583 3.54256 5.1576 3.56861 5.09392C3.59467 5.03024 3.63314 4.97239 3.68179 4.92374C3.73045 4.87509 3.7883 4.83661 3.85198 4.81056C3.91566 4.7845 3.98389 4.77139 4.05269 4.77199C4.12149 4.77259 4.18949 4.78688 4.2527 4.81404C4.31592 4.8412 4.3731 4.88067 4.4209 4.93016L6.98579 7.49505L9.55068 4.93016C9.6484 4.83577 9.77929 4.78355 9.91515 4.78473C10.051 4.78591 10.181 4.8404 10.277 4.93647C10.3731 5.03254 10.4276 5.1625 10.4288 5.29836C10.43 5.43422 10.3777 5.56511 10.2834 5.66284L7.35213 8.59407Z" fill="#888888"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_1058_17546">
                          <rect width="12.4358" height="12.4358" fill="white" transform="translate(0.768097 0.455566)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </SortIcon>
                )}
              </Th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <TdNoData colSpan={columns.length} $themeMode={themeMode}>
              <NoDataWrapper>
                <NoDataIcon>
                  <img src="/cms/cms_nodata.png" alt="No Data" width="69" />
                    <rect 
                      x="0.5" 
                      y="0.5" 
                      width="68" 
                      height="71" 
                      fill="rgba(255, 255, 255, 0.30)" 
                      stroke="#BABABA" 
                      strokeWidth="0.979"
                    />
                    <path 
                      d="M34.5 20L44.5 30L34.5 40M24.5 30H44.5" 
                      stroke="#BABABA" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      fill="none"
                    />
                </NoDataIcon>
                <NoDataText>
                  데이터가 없습니다.<br />
                  다시 한번 조회해 주세요
                </NoDataText>
              </NoDataWrapper>
            </TdNoData>
          </tr>
        ) : (
          displayData.map((item, rowIdx) => (
            <TableRow
              key={keyExtractor(item, rowIdx)}
              $isEven={rowIdx % 2 === 0}
              $isClickable={false}
              $themeMode={themeMode}
            >
              {columns.map((col, colIdx) => {
                const value = getPropertyValue(item, col.accessor);
                const content = col.formatter ? col.formatter(value, item, rowIdx) : String(value ?? "-");
                const style =
                  typeof col.cellStyle === "function" ? col.cellStyle(value, item) : col.cellStyle;
                return (
                  <Td
                    key={colIdx}
                    style={{
                      ...style,
                      cursor: col.noPopup ? "default" : "pointer",
                    }}
                    $isEven={rowIdx % 2 === 0}
                    $themeMode={themeMode}
                    $fixedLayout={fixedLayout}
                    onClick={() => {
                      if (!col.noPopup && onRowClick) onRowClick(item, rowIdx);
                    }}
                  >
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

const Table = styled.table<{ $themeMode: ThemeMode; $fixedLayout?: boolean }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  table-layout: ${({ $fixedLayout }) => $fixedLayout ? 'fixed' : 'auto'};
  background-color: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};
`;

const Th = styled.th<{ $isSortable?: boolean; $themeMode: ThemeMode; $fixedLayout?: boolean }>`
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
  border-bottom: 1px solid ${({ $themeMode }) =>
    $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-right: 1px solid #E6E7E9;
  background-color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.secondary};
  white-space: ${({ $fixedLayout }) => $fixedLayout ? 'normal' : 'nowrap'};
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
  cursor: ${({ $isSortable }) => ($isSortable ? 'pointer' : 'default')};
  ${({ $fixedLayout }) => $fixedLayout && `
    overflow: hidden;
    text-overflow: ellipsis;
  `}
`;

const SortIcon = styled.span<{ $themeMode: ThemeMode; $sortOrder?: 'asc' | 'desc' }>`
  margin-left: 4px;
  display: inline-block;
  transform: ${({ $sortOrder }) => $sortOrder === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
  
  svg {
    width: 14px;
    height: 13px;
    vertical-align: middle;
  }
`;

const TableRow = styled.tr<{ $isEven: boolean; $isClickable: boolean; $themeMode: ThemeMode }>`
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};

  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#f5f5f5' : THEME_COLORS.dark.background};
  }
`;

const Td = styled.td<{ $isEven: boolean; $themeMode: ThemeMode; $fixedLayout?: boolean }>`
  padding: 12px;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#333333' : THEME_COLORS.dark.text};
  border-right: 1px solid #E6E7E9;
  border-bottom: 1px solid #E6E7E9;
  text-align: center;
  background-color: ${({ $isEven, $themeMode }) =>
    $isEven 
      ? ($themeMode === 'light' ? '#ffffff' : THEME_COLORS.dark.secondary)
      : ($themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.tableBackground)
  };
  ${({ $fixedLayout }) => $fixedLayout && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}

  tr:last-child & {
    border-bottom: none;
  }
`;

const TdNoData = styled.td<{ $themeMode: ThemeMode }>`
  padding: 100px;
  color: #aaa;
  background-color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableBackground};
`;

const NoDataWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const NoDataIcon = styled.div`
  width: 68.999px;
  height: 72.225px;
  flex-shrink: 0;
  margin-bottom: 30px;
`;

const NoDataText = styled.p`
  margin: 0;
  color: #aaa;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
`;