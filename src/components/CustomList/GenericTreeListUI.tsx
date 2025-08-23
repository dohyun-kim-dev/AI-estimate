"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import GenericDateRangePicker from "./GenericDateRangePicker";
import DropdownCustom from "./DropdownCustom";
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import ActionButton from "../ActionButton";
import TreeGridTable from "./TreeGridTable";

interface TreeNode {
  id: string | number;
  [key: string]: any;
  children?: TreeNode[];
}

interface ColumnDefinition {
  header: string;
  accessor: string;
  editable?: boolean;
  width?: string;
}

interface FetchParams {
  fromDate?: string;
  toDate?: string;
  keyword?: string;
}

interface FetchResult {
  data: TreeNode[];
  totalItems: number;
  allItems?: number;
}

interface GenericTreeListUIProps {
  title: React.ReactNode;
  columns: ColumnDefinition[];
  fetchData: (params: FetchParams) => Promise<FetchResult>;
  excelFileName?: string;
  themeMode?: ThemeMode;
  enableSearch?: boolean;
  enableDateFilter?: boolean;
  searchPlaceholder?: string;
  onCellChange?: (id: string | number, key: string, value: any) => void;
}

const GenericTreeListUI = forwardRef(({ title, columns, fetchData, excelFileName = "TreeData", themeMode = "light", enableSearch = true, enableDateFilter = true, searchPlaceholder = "검색어를 입력하세요", onCellChange }: GenericTreeListUIProps, ref) => {
  const [data, setData] = useState<TreeNode[]>([]);
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
    const flatData: any[] = [];
    const flatten = (nodes: TreeNode[], depth = 0) => {
      for (const node of nodes) {
        flatData.push({ ...node, depth });
        if (node.children) flatten(node.children, depth + 1);
      }
    };
    flatten(data);

    const rows = flatData.map((item) => {
      const row: any = {};
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

  return (
    <Container $themeMode={themeMode}>
      <Header>
        <Title>{title}</Title>
        <ControlArea>
          {enableDateFilter && (
            <GenericDateRangePicker
              initialFromDate={fromDate}
              initialToDate={toDate}
              onDateChange={(f, t) => {
                setFromDate(f);
                setToDate(t);
              }}
              themeMode={themeMode}
            />
          )}
          {enableSearch && (
            <>
              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearchApplied(search)}
                placeholder={searchPlaceholder}
              />
              <SearchButton onClick={() => setSearchApplied(search)}>조회</SearchButton>
            </>
          )}
        </ControlArea>
      </Header>
      <TableContainer>
        <TreeGridTable
          data={data}
          columns={columns}
          onChange={setData}
          onCellChange={onCellChange} // ✅ 셀 편집 콜백 전달
        />
      </TableContainer>
    </Container>
  );
});

export default GenericTreeListUI;

const Container = styled.div<{ $themeMode: ThemeMode }>`
  padding: 20px;
  min-width: 1200px;
  background-color: ${({ $themeMode }) => THEME_COLORS[$themeMode].background};
  color: ${({ $themeMode }) => THEME_COLORS[$themeMode].text};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
`;

const ControlArea = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const SearchButton = styled.button`
  padding: 6px 12px;
  background-color: #3a82f7;
  color: white;
  border: none;
  border-radius: 4px;
`;

const TableContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  overflow: auto;
`;