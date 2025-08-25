'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { THEME_COLORS } from "@/styles/theme_colors";
import styled from "styled-components";
import { useEffect, useRef } from "react";
// 중첩 키 처리
const getPropertyValue = (obj, path) => {
    if (typeof path !== "string")
        return obj[path];
    const keys = path.split(".");
    return keys.reduce((acc, key) => acc?.[key], obj);
};
const GenericDataTable = ({ data, columns, isLoading = false, error = null, maxLength, onRowClick, onHeaderClick, sortKey, sortOrder, keyExtractor, themeMode = "dark", }) => {
    const totalFlex = columns.reduce((sum, col) => sum + (col.flex ?? 0), 0);
    const displayData = maxLength ? data.slice(0, maxLength) : data;
    const tableRef = useRef(null);
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
    return (_jsxs(Table, { "$themeMode": themeMode, ref: tableRef, children: [totalFlex > 0 && (_jsx("colgroup", { children: columns.map((col, i) => (_jsx("col", { style: { width: col.flex ? `${(col.flex / totalFlex) * 100}%` : undefined } }, i))) })), _jsx("thead", { children: _jsx("tr", { children: columns.map((col, i) => {
                        const sortable = (col.sortable ?? true) && onHeaderClick;
                        const isSorted = sortable && col.accessor === sortKey;
                        return (_jsxs(Th, { onClick: sortable ? () => onHeaderClick(col.accessor) : undefined, style: { ...col.headerStyle, cursor: sortable ? "pointer" : "default" }, "$isSortable": !!sortable, "$themeMode": themeMode, children: [col.header, isSorted && _jsx(SortIcon, { "$themeMode": themeMode, children: sortOrder === "asc" ? " ▲" : " ▼" })] }, i));
                    }) }) }), _jsx("tbody", { children: data.length === 0 ? (_jsx("tr", { children: _jsx(TdNoData, { colSpan: columns.length, "$themeMode": themeMode, children: _jsx(NoDataWrapper, { children: _jsx("p", { children: "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." }) }) }) })) : (displayData.map((item, rowIdx) => (_jsx(TableRow, { "$isEven": rowIdx % 2 === 0, "$isClickable": false, "$themeMode": themeMode, children: columns.map((col, colIdx) => {
                        const value = getPropertyValue(item, col.accessor);
                        const content = col.formatter ? col.formatter(value, item, rowIdx) : String(value ?? "-");
                        const style = typeof col.cellStyle === "function" ? col.cellStyle(value, item) : col.cellStyle;
                        return (_jsx(Td, { style: {
                                ...style,
                                cursor: col.noPopup ? "default" : "pointer",
                            }, "$isEven": rowIdx % 2 === 0, "$themeMode": themeMode, onClick: () => {
                                if (!col.noPopup && onRowClick)
                                    onRowClick(item, rowIdx);
                            }, children: content }, colIdx));
                    }) }, keyExtractor(item, rowIdx))))) })] }));
};
export default GenericDataTable;
// --- Styles ---
const Table = styled.table `
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: center;
  table-layout: auto;
  table-layout: auto;
  background-color: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};
`;
const Th = styled.th `
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
const SortIcon = styled.span `
  margin-left: 4px;
  font-size: 12px;
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableHeaderText};
`;
const TableRow = styled.tr `
  background-color: ${({ $isEven, $themeMode }) => $isEven ? THEME_COLORS[$themeMode].tableRowEven : THEME_COLORS[$themeMode].tableRowOdd};
  cursor: ${({ $isClickable }) => ($isClickable ? "pointer" : "default")};

  &:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f5f5f5" : "#3d3f4a")};
  }
`;
const Td = styled.td `
  padding: 12px 8px;
  border-bottom: 1px solid ${({ $themeMode }) => THEME_COLORS[$themeMode].borderColor};
  background-color: ${({ $isEven, $themeMode }) => $isEven ? THEME_COLORS[$themeMode].tableRowEven : THEME_COLORS[$themeMode].tableRowOdd};
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableText};
  text-align: center;
`;
const TdNoData = styled.td `
  padding: 40px;
  color: #aaa;
  background-color: ${({ $themeMode }) => THEME_COLORS[$themeMode].tableBackground};
`;
const NoDataWrapper = styled.div `
  text-align: center;
  width: 100%;
`;
