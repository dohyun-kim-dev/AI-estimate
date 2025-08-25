"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import GenericDateRangePicker from "./GenericDateRangePicker";
import { THEME_COLORS } from "@/styles/theme_colors";
import TreeGridTable from "./TreeGridTable";
const GenericTreeListUI = forwardRef(({ title, columns, fetchData, excelFileName = "TreeData", themeMode = "light", enableSearch = true, enableDateFilter = true, searchPlaceholder = "검색어를 입력하세요", onCellChange }, ref) => {
    const [data, setData] = useState([]);
    const [fromDate, setFromDate] = useState(dayjs().subtract(1, "month").format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [search, setSearch] = useState("");
    const [searchApplied, setSearchApplied] = useState("");
    const loadData = async () => {
        const result = await fetchData({ fromDate, toDate, keyword: searchApplied });
        setData(result.data);
    };
    useImperativeHandle(ref, () => ({ refetch: loadData }));
    useEffect(() => {
        loadData();
    }, [fromDate, toDate, searchApplied]);
    const handleExcelDownload = () => {
        const flatData = [];
        const flatten = (nodes, depth = 0) => {
            for (const node of nodes) {
                flatData.push({ ...node, depth });
                if (node.children)
                    flatten(node.children, depth + 1);
            }
        };
        flatten(data);
        const rows = flatData.map((item) => {
            const row = {};
            columns.forEach((col) => {
                row[col.header] = item[col.accessor];
            });
            return row;
        });
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, `${excelFileName}_${dayjs().format("YYYYMMDD")}.xlsx`);
    };
    return (_jsxs(Container, { "$themeMode": themeMode, children: [_jsxs(Header, { children: [_jsx(Title, { children: title }), _jsxs(ControlArea, { children: [enableDateFilter && (_jsx(GenericDateRangePicker, { initialFromDate: fromDate, initialToDate: toDate, onDateChange: (f, t) => {
                                    setFromDate(f);
                                    setToDate(t);
                                }, themeMode: themeMode })), enableSearch && (_jsxs(_Fragment, { children: [_jsx(SearchInput, { value: search, onChange: (e) => setSearch(e.target.value), onKeyDown: (e) => e.key === "Enter" && setSearchApplied(search), placeholder: searchPlaceholder }), _jsx(SearchButton, { onClick: () => setSearchApplied(search), children: "\uC870\uD68C" })] }))] })] }), _jsx(TableContainer, { children: _jsx(TreeGridTable, { data: data, columns: columns, onChange: setData, onCellChange: onCellChange }) })] }));
});
export default GenericTreeListUI;
const Container = styled.div `
  padding: 20px;
  min-width: 1200px;
  background-color: ${({ $themeMode }) => THEME_COLORS[$themeMode].background};
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].text};
`;
const Header = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;
const Title = styled.h1 `
  font-size: 24px;
  margin: 0;
`;
const ControlArea = styled.div `
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;
const SearchInput = styled.input `
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;
const SearchButton = styled.button `
  padding: 6px 12px;
  background-color: #3a82f7;
  color: white;
  border: none;
  border-radius: 4px;
`;
const TableContainer = styled.div `
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  overflow: auto;
`;
