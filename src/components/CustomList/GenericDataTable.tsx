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
    <Table $themeMode={themeMode} ref={tableRef}>
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
              >
                {col.header}
                {isSorted && <SortIcon $themeMode={themeMode}>{sortOrder === "asc" ? " ▲" : " ▼"}</SortIcon>}
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

const Table = styled.table<{ $themeMode: ThemeMode }>`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  table-layout: auto;
  table-layout: auto;
  background-color: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};
`;

const Th = styled.th<{ $isSortable?: boolean; $themeMode: ThemeMode }>`
  padding: 12px 8px;
  border-bottom: 1px solid ${({ $themeMode }) => THEME_COLORS[$themeMode].borderColor};
  background-color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableHeaderBackground};
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableHeaderText};
  font-weight: bold;
  white-space: nowrap;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const SortIcon = styled.span<{ $themeMode: ThemeMode }>`
  margin-left: 4px;
  font-size: 12px;
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableHeaderText};
`;

const TableRow = styled.tr<{ $isEven: boolean; $isClickable: boolean; $themeMode: ThemeMode }>`
  background-color: ${({ $isEven, $themeMode }) =>
    $isEven ? THEME_COLORS[$themeMode].tableRowEven : THEME_COLORS[$themeMode].tableRowOdd};
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};

  &:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f5f5f5" : "#3d3f4a")};
  }
`;

const Td = styled.td<{ $isEven: boolean; $themeMode: ThemeMode }>`
  padding: 12px 8px;
  border-bottom: 1px solid ${({ $themeMode }) => THEME_COLORS[$themeMode].borderColor};
  background-color: ${({ $isEven, $themeMode }) =>
    $isEven ? THEME_COLORS[$themeMode].tableRowEven : THEME_COLORS[$themeMode].tableRowOdd};
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableText};
  text-align: center;
`;

const TdNoData = styled.td<{ $themeMode: ThemeMode }>`
  padding: 300px;
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