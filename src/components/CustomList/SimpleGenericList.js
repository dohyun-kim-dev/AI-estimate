'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useImperativeHandle, useState, useEffect, useCallback, useMemo, } from 'react';
import styled from 'styled-components';
import GenericDataTable from './GenericDataTable';
import { THEME_COLORS } from '@/styles/theme_colors';
const RightControls = styled.div `
  display: flex;
  justify-content: end;
  margin-bottom: 15px;

  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;
const PaginationControls = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const Cnt = styled.div `
  font-size: 14px;
  color: '#fff';
  white-space: nowrap;
`;
const PageBox = styled.div `
  margin: 0 5px;
  font-size: 14px;
  color: '#fff';
  white-space: nowrap;
`;
const TopHeader = styled.div `
  display: flex;
  flex-direction: column; /* 세로 배치 */
  margin-bottom: 15px;
  gap: 15px;

`;
const TableContainer = styled.div `
  width: 100%;
  overflow-x: auto;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-radius: 4px;
  background: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};

  /* @media (max-width: 1400px) {
    width: 1150px;
  }

  @media (min-width: 2050px) {
    width: 1800px;
  } */
`;
const CMSTitle = styled.h1 `
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0;
  color: '#fff';
`;
const TabsWrapper = styled.div `
  margin-top: 15px;
`;
const Container = styled.div `
  justify-content: start;
  width: calc(100%-50px);
  /* min-width: 600px; */
  height: auto;
  /* padding: 30px; */
  /* background-color: ${({ $themeMode }) => $themeMode === "light" ? THEME_COLORS.light.background : THEME_COLORS.dark.background}; */
  box-sizing: border-box;
  color: '#fff';
`;
const SimpleGenericListInner = ({ title, columns, fetchData, initialState = {}, keyExtractor, renderTabs, themeMode = 'light', }, ref) => {
    const [data, setData] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [allItems, setAllItems] = useState();
    const [currentPage, setCurrentPage] = useState(initialState.page ?? 1);
    const [itemsPerPage] = useState(initialState.size ?? 12);
    const [sortKey, setSortKey] = useState(initialState.sortKey ?? null);
    const [sortOrder, setSortOrder] = useState(initialState.sortOrder ?? 'asc');
    const [isLoading, setIsLoading] = useState(false);
    const fetchDataCallback = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await fetchData({});
            setData(result.data);
            setTotalItems(result.totalItems);
            setAllItems(result.allItems);
            setCurrentPage(1);
        }
        finally {
            setIsLoading(false);
        }
    }, [fetchData]);
    useImperativeHandle(ref, () => ({
        refetch: () => fetchDataCallback(),
    }));
    useEffect(() => {
        fetchDataCallback();
    }, []);
    const sortedData = useMemo(() => {
        const sorted = [...data];
        if (sortKey) {
            sorted.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];
                return sortOrder === 'asc'
                    ? String(valA).localeCompare(String(valB))
                    : String(valB).localeCompare(String(valA));
            });
        }
        return sorted;
    }, [data, sortKey, sortOrder]);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedData, currentPage, itemsPerPage]);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const internalKeyExtractor = keyExtractor ?? ((item, index) => item.id ?? item.index ?? index);
    return (_jsxs(Container, { "$themeMode": themeMode, children: [_jsxs(TopHeader, { children: [typeof title === 'string' ? (_jsx(CMSTitle, { "$themeMode": themeMode, children: title })) : (title), renderTabs && _jsx(TabsWrapper, { children: renderTabs() })] }), _jsxs(RightControls, { children: [_jsxs(Cnt, { "$themeMode": themeMode, children: ["\uC804\uCCB4 ", `${allItems ?? '-'}건 중 ${totalItems}건`] }), _jsxs(PaginationControls, { children: [_jsx(NavButton, { onClick: () => setCurrentPage((prev) => Math.max(1, prev - 1)), disabled: currentPage <= 1 || isLoading, "$themeMode": themeMode, children: "<" }), _jsxs(PageBox, { "$themeMode": themeMode, children: [currentPage, " / ", totalPages > 0 ? totalPages : 1] }), _jsx(NavButton, { onClick: () => setCurrentPage((prev) => Math.min(totalPages, prev + 1)), disabled: currentPage >= totalPages || isLoading, "$themeMode": themeMode, children: ">" })] })] }), _jsx(TableContainer, { "$themeMode": themeMode, children: _jsx(GenericDataTable, { data: paginatedData, columns: columns, isLoading: isLoading, keyExtractor: internalKeyExtractor, themeMode: themeMode, sortKey: sortKey, sortOrder: sortOrder, onHeaderClick: (key) => {
                        const order = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
                        setSortKey(key);
                        setSortOrder(order);
                        setCurrentPage(1);
                    } }) })] }));
};
const SimpleGenericList = forwardRef(SimpleGenericListInner);
export default SimpleGenericList;
const NavButton = styled.button `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#FFFFFF" : THEME_COLORS.dark.secondary)};
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.text)};
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.8;
    border-color: ${({ $themeMode }) => ($themeMode === "light" ? "#999" : "#AAAAAA")};
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f8f8f8" : "#424451")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ $themeMode }) => ($themeMode === "light" ? "#EEEEEE" : "#555555")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? "#AAAAAA" : "#777777")};
  }
`;
