"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { AppColors } from "@/styles/colors";
import dayjs from "dayjs";
import GenericDateRangePicker from "@/components/CustomList/GenericDateRangePicker";
import DropdownCustom from "@/components/CustomList/DropdownCustom";
import CompanySearchModal from "@/components/CustomList/CompanySearchModal";
import { Add as AddIcon, FileDownload as DownloadIcon, ViewList as DetailViewIcon, ViewModule as CompactViewIcon, ViewComfy as LargeViewIcon } from "@mui/icons-material";
export default function CmsMobileView({ title, data, columns, onRowClick, onAdd, onExport, isLoading: isLoadingProp = false, fetchData, compactFieldCount = 6, defaultViewMode = 'detail', enableSearch = true, searchPlaceholder = "검색어를 입력해주세요", enableDateFilter = false, itemsPerPageOptions = [10, 20, 50], enableCompanySearch = false, onCompanySelect }) {
    const [viewMode, setViewMode] = useState(defaultViewMode);
    const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[0] ?? 10);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(dayjs().subtract(6, "month").format("YYYY-MM-DD"));
    const [toDate, setToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [searchTermInput, setSearchTermInput] = useState("");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    // Fetching state (aligns with GenericListUI behavior)
    const [allData, setAllData] = useState(data ?? []);
    const [totalItemsMeta, setTotalItemsMeta] = useState(data ? data.length : 0);
    const [allItemsMeta, setAllItemsMeta] = useState(data ? data.length : undefined); // kept for parity
    const [isLoadingLocal, setIsLoadingLocal] = useState(false);
    const [error, setError] = useState(null); // reserved for future display
    // Keep allData in sync when static data prop changes (no fetcher)
    useEffect(() => {
        if (!fetchData) {
            const list = Array.isArray(data) ? data : [];
            setAllData(list);
            setTotalItemsMeta(list.length);
            setAllItemsMeta(list.length);
            setCurrentPage(1);
        }
    }, [data, fetchData]);
    // Server fetching similar to GenericListUI
    const fetchDataCallback = useCallback(async () => {
        if (!fetchData)
            return;
        setIsLoadingLocal(true);
        setError(null);
        try {
            const params = {
                keyword: searchKeyword || undefined,
            };
            if (enableDateFilter) {
                params.fromDate = fromDate;
                params.toDate = toDate;
            }
            const result = await fetchData(params);
            const resultData = Array.isArray(result.data) ? result.data : [];
            setAllData(resultData);
            setTotalItemsMeta(result.totalItems || resultData.length);
            setAllItemsMeta(result.allItems || resultData.length);
            setCurrentPage(1);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "데이터를 불러오는 중 오류가 발생했습니다.";
            console.error("Error fetching data:", err);
            setError(message);
            setAllData([]);
            setTotalItemsMeta(0);
            setAllItemsMeta(undefined);
        }
        finally {
            setIsLoadingLocal(false);
        }
    }, [fetchData, searchKeyword, fromDate, toDate, enableDateFilter]);
    // Initial load and when dependencies change
    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);
    // 중첩 키 접근 유틸
    const getPropertyValue = (obj, path) => {
        if (obj === null || typeof obj !== "object")
            return undefined;
        let current = obj;
        for (const key of path.split(".")) {
            if (current !== null && typeof current === "object" && !Array.isArray(current)) {
                const record = current;
                if (!(key in record))
                    return undefined;
                current = record[key];
            }
            else {
                return undefined;
            }
        }
        return current;
    };
    // 컬럼 중복 제거 유틸 (accessor 기준)
    const getUniqueColumns = (cols) => {
        const seen = new Set();
        const unique = [];
        for (const col of cols) {
            const key = String(col.accessor);
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(col);
            }
        }
        return unique;
    };
    // 필터링 및 페이지네이션 데이터 생성
    const filteredData = React.useMemo(() => {
        // 데이터가 배열이 아닌 경우 빈 배열 반환
        if (!Array.isArray(allData)) {
            console.warn('Data is not an array:', allData);
            return [];
        }
        let result = [...allData];
        try {
            if (enableDateFilter) {
                const from = dayjs(fromDate, "YYYY-MM-DD").startOf("day");
                const to = dayjs(toDate, "YYYY-MM-DD").endOf("day");
                result = result.filter((item) => {
                    if (!item)
                        return false;
                    const itemRecord = item;
                    const rawDate = itemRecord.createdTime
                        || itemRecord.createdAt
                        || itemRecord.createdDate;
                    if (!rawDate)
                        return true; // 날짜 필드가 없으면 통과
                    const d = dayjs(String(rawDate));
                    if (!d.isValid())
                        return true;
                    const time = d.valueOf();
                    return time >= from.valueOf() && time <= to.valueOf();
                });
            }
            if (searchKeyword) {
                const keywordLower = searchKeyword.toLowerCase();
                result = result.filter((item) => {
                    if (!item)
                        return false;
                    return columns.some((col) => {
                        const v = getPropertyValue(item, String(col.accessor));
                        const text = typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '';
                        return text.toLowerCase().includes(keywordLower);
                    });
                });
            }
            return result;
        }
        catch (error) {
            console.error('Error filtering data:', error);
            return [];
        }
    }, [allData, enableDateFilter, fromDate, toDate, searchKeyword, columns]);
    const derivedTotalItems = fetchData ? totalItemsMeta : filteredData.length;
    const totalPages = Math.max(1, Math.ceil(derivedTotalItems / itemsPerPage));
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);
    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);
    // 페이지네이션/필터 핸들러
    const handlePageNumChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };
    const handleItemsPerPageChange = (newSize) => {
        if (newSize !== itemsPerPage) {
            setItemsPerPage(newSize);
            setCurrentPage(1);
        }
    };
    const handleDateChange = (newFrom, newTo) => {
        setFromDate(newFrom);
        setToDate(newTo);
        setCurrentPage(1);
    };
    const handleSearchInputChange = (e) => {
        setSearchTermInput(e.target.value);
    };
    const handleImmediateSearch = () => {
        setSearchKeyword(searchTermInput.trim());
        setCurrentPage(1);
    };
    // 카드 클릭 핸들러
    const handleCardClick = (item) => {
        if (onRowClick) {
            onRowClick(item);
        }
    };
    // 보기 모드에 따른 컬럼 필터링
    const getFilteredColumns = () => {
        if (viewMode === 'detail') {
            return getUniqueColumns(columns.filter(col => !col.noPopup));
        }
        else if (viewMode === 'compact') {
            return getUniqueColumns(columns.filter(col => !col.noPopup)).slice(0, compactFieldCount);
        }
        else { // large
            // No, 첫번째 컬럼(보통 name이나 id), createdTime
            const importantColumns = [];
            const added = new Set();
            // No 컬럼 찾기
            const noColumn = columns.find(col => col.accessor === 'no');
            if (noColumn && !added.has(String(noColumn.accessor))) {
                importantColumns.push(noColumn);
                added.add(String(noColumn.accessor));
            }
            // 첫 번째 의미있는 컬럼 (No가 아닌 첫 번째)
            const firstMeaningfulColumn = columns.find(col => col.accessor !== 'no' && !col.noPopup);
            if (firstMeaningfulColumn && !added.has(String(firstMeaningfulColumn.accessor))) {
                importantColumns.push(firstMeaningfulColumn);
                added.add(String(firstMeaningfulColumn.accessor));
            }
            // createdTime 컬럼 찾기
            const createdTimeColumn = columns.find(col => col.accessor === 'createdTime' || col.header.includes('가입일') || col.header.includes('생성일'));
            if (createdTimeColumn && !added.has(String(createdTimeColumn.accessor))) {
                importantColumns.push(createdTimeColumn);
                added.add(String(createdTimeColumn.accessor));
            }
            return importantColumns;
        }
    };
    return (_jsxs(MobileContainer, { children: [_jsxs(MobileHeader, { children: [_jsx(HeaderTitle, { children: title }), _jsxs(ActionButtons, { children: [_jsxs(ViewModeButtons, { children: [_jsx(ViewModeButton, { "$active": viewMode === 'detail', onClick: () => setViewMode('detail'), title: "\uC790\uC138\uD788", children: _jsx(DetailViewIcon, { fontSize: "small" }) }), _jsx(ViewModeButton, { "$active": viewMode === 'compact', onClick: () => setViewMode('compact'), title: "\uC791\uAC8C", children: _jsx(CompactViewIcon, { fontSize: "small" }) }), _jsx(ViewModeButton, { "$active": viewMode === 'large', onClick: () => setViewMode('large'), title: "\uD06C\uAC8C", children: _jsx(LargeViewIcon, { fontSize: "small" }) })] }), onAdd && (_jsx(ActionButton, { onClick: onAdd, children: _jsx(AddIcon, { fontSize: "small" }) })), onExport && (_jsx(ActionButton, { onClick: onExport, children: _jsx(DownloadIcon, { fontSize: "small" }) }))] })] }), _jsxs(ControlsSection, { children: [enableDateFilter && (_jsx(DateRangePickerContainer, { children: _jsx(GenericDateRangePicker, { initialFromDate: fromDate, initialToDate: toDate, onDateChange: handleDateChange }) })), enableCompanySearch && (_jsxs(SearchContainer, { children: [_jsx(CompanySearchInput, { type: "text", placeholder: "\uACE0\uAC1D\uC0AC\uB97C \uC120\uD0DD\uD558\uC138\uC694", value: selectedCompany?.name || '', readOnly: true, onClick: () => setIsCompanyModalOpen(true) }), _jsx(SearchButton, { onClick: () => setIsCompanyModalOpen(true), children: "\uAC80\uC0C9" })] })), enableSearch && (_jsxs(SearchContainer, { children: [_jsx(SearchInput, { type: "text", placeholder: searchPlaceholder, value: searchTermInput, onChange: handleSearchInputChange, onKeyDown: (e) => { if (e.key === 'Enter')
                                    handleImmediateSearch(); } }), _jsx(SearchButton, { onClick: handleImmediateSearch, children: "\uC870\uD68C" })] })), enableCompanySearch && (_jsx(CompanySearchModal, { isOpen: isCompanyModalOpen, onClose: () => setIsCompanyModalOpen(false), onSelect: (company) => {
                            setSelectedCompany(company);
                            if (onCompanySelect) {
                                onCompanySelect(company);
                            }
                        }, themeMode: "light" })), _jsxs(PaginationBar, { children: [_jsx(NavButton, { onClick: () => handlePageNumChange(currentPage - 1), disabled: currentPage <= 1 || isLoadingLocal || isLoadingProp, children: "<" }), _jsxs(PageBox, { children: [currentPage, " / ", totalPages] }), _jsx(NavButton, { onClick: () => handlePageNumChange(currentPage + 1), disabled: currentPage >= totalPages || isLoadingLocal || isLoadingProp, children: ">" }), _jsx(DropdownCustom, { value: itemsPerPage, onChange: handleItemsPerPageChange, options: itemsPerPageOptions }), _jsx(ItemsPerPageText, { children: "\uAC1C\uC529 \uBCF4\uAE30" })] })] }), _jsx(CardList, { children: (isLoadingLocal || isLoadingProp) ? (_jsx(LoadingText, { children: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911..." })) : (_jsxs(_Fragment, { children: [paginatedData.length === 0 && (_jsx(EndMessage, { children: "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })), paginatedData.map((item, index) => (_jsx(DataCard, { onClick: () => handleCardClick(item), "$viewMode": viewMode, children: getFilteredColumns().map((column) => {
                                const value = getPropertyValue(item, String(column.accessor));
                                const defaultDisplay = typeof value === 'string' || typeof value === 'number'
                                    ? value
                                    : value === null || value === undefined
                                        ? '-'
                                        : JSON.stringify(value);
                                const displayValue = column.formatter
                                    ? column.formatter(value, item, index)
                                    : defaultDisplay;
                                return (_jsxs(CardRow, { "$viewMode": viewMode, children: [_jsx(FieldLabel, { "$viewMode": viewMode, children: column.header }), _jsx(FieldValue, { "$viewMode": viewMode, children: displayValue })] }, String(column.accessor)));
                            }) }, item.id || item.index || index)))] })) })] }));
}
// Styled Components
const MobileContainer = styled.div `
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
`;
const MobileHeader = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
`;
const ControlsSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
`;
const HeaderTitle = styled.h1 `
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: black;
`;
const ActionButtons = styled.div `
  display: flex;
  gap: 8px;
  align-items: center;
`;
const ActionButton = styled.button `
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${AppColors.primary};
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;
const ViewModeButtons = styled.div `
  display: flex;
  gap: 4px;
  margin-right: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
`;
const ViewModeButton = styled.button `
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: ${({ $active }) => $active ? AppColors.primary : 'transparent'};
  color: ${({ $active }) => $active ? 'white' : AppColors.onSurfaceVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ $active }) => $active ? AppColors.primary : 'rgba(0, 0, 0, 0.1)'};
  }
`;
const SearchContainer = styled.div `
  display: flex;
  align-items: center;
  gap: 8px;
`;
const BaseInput = styled.input `
  flex: 1;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 12px;
  background-color: #ffffff;
`;
const SearchInput = styled(BaseInput) `
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
`;
const CompanySearchInput = styled(BaseInput) `
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;
const SearchButton = styled.button `
  height: 40px;
  padding: 0 14px;
  background: ${AppColors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
`;
const PaginationBar = styled.div `
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 8px;
`;
const NavButton = styled.button `
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
`;
const PageBox = styled.div `
  min-width: 64px;
  text-align: center;
  font-size: 14px;
  color: ${AppColors.onSurface};
`;
const ItemsPerPageText = styled.span `
  font-size: 14px;
  color: ${AppColors.onSurfaceVariant};
`;
const CardList = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const DataCard = styled.div `
  background: white;
  border-radius: 12px;
  padding: ${({ $viewMode }) => {
    switch ($viewMode) {
        case 'large': return '20px';
        case 'compact': return '12px';
        default: return '16px';
    }
}};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width:100%;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;
const CardRow = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $viewMode }) => {
    switch ($viewMode) {
        case 'large': return '12px 0';
        case 'compact': return '6px 0';
        default: return '8px 0';
    }
}};
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;
const FieldLabel = styled.span `
  font-size: ${({ $viewMode }) => {
    switch ($viewMode) {
        case 'large': return '16px';
        case 'compact': return '13px';
        default: return '14px';
    }
}};
  font-weight: 500;
  color: black;
  min-width: 80px;
`;
const FieldValue = styled.div `
  font-size: ${({ $viewMode }) => {
    switch ($viewMode) {
        case 'large': return '16px';
        case 'compact': return '13px';
        default: return '14px';
    }
}};
  color: black;
  flex: 1;
  text-align: right;
  word-break: break-all;
  font-weight: ${({ $viewMode }) => $viewMode === 'large' ? '500' : 'normal'};
`;
const LoadingText = styled.div `
  text-align: center;
  padding: 40px;
  color: ${AppColors.onSurfaceVariant};
  font-size: 16px;
`;
const EndMessage = styled.div `
  text-align: center;
  padding: 20px;
  color: ${AppColors.onSurfaceVariant};
  font-size: 14px;
`;
const DateRangePickerContainer = styled.div `
  /* 모바일에서는 기본 스타일 유지 */
`;
