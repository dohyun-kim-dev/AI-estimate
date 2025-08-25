// src/app/cms/userData/priceList/page.tsx
'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
// 팝업 관련 스타일은 재사용 가능하므로 필요에 따라 추가
const StyledPopupContent = styled.div `
  padding: 20px;
  h3 {
    margin-top: 0;
  }
`;
const PriceListPage = () => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const listRef = useRef(null);
    const handleRowClick = (item) => {
        setSelectedItem(item);
        setIsPopupOpen(true);
    };
    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedItem(null);
    };
    const fetchData = useCallback(async (params) => {
        console.log('Mock Data fetching for PriceList...', params);
        const mockData = [
            {
                no: 1, select: false, code: 'C1', category_name: 'COMMON', sub_category_name: '화면설계', function_name: '기능1', description: '기능에 대한 상세 설명', memo: '잠재고객/지속적인 연락 필요', frontend_period: 0.2, backend_period: 0.2, price: 500000, createdTime: '2025-05-21T11:31:12Z', updateTime: '2025-05-21T11:31:12Z', createdId: '작성자1', updateId: '작성자1',
            },
            {
                no: 2, select: false, code: 'C2', category_name: 'COMMON', sub_category_name: '기획', function_name: '기능2', description: '새로운 기능 설명', memo: '', frontend_period: 0.3, backend_period: 0.1, price: 350000, createdTime: '2025-05-22T14:00:00Z', updateTime: '2025-05-22T14:00:00Z', createdId: '작성자2', updateId: '작성자2',
            },
            // 여기에 더 많은 목 데이터를 추가할 수 있습니다.
        ];
        const filteredData = params.keyword
            ? mockData.filter(item => item.function_name.includes(params.keyword) ||
                item.description.includes(params.keyword) ||
                item.category_name.includes(params.keyword))
            : mockData;
        return {
            data: filteredData,
            totalItems: filteredData.length,
            allItems: mockData.length,
        };
    }, []);
    const columns = useMemo(() => [
        { header: '선택', accessor: 'select', formatter: () => _jsx("input", { type: "checkbox" }) },
        { header: 'No', accessor: 'no', sortable: true },
        { header: '코드', accessor: 'code', sortable: true },
        { header: '항목', accessor: 'category_name', sortable: true },
        { header: '카테고리', accessor: 'sub_category_name', sortable: true },
        { header: '기능명', accessor: 'function_name', sortable: true },
        { header: '설명', accessor: 'description', sortable: true },
        { header: '메모', accessor: 'memo', sortable: true },
        { header: '프론트 기간', accessor: 'frontend_period' },
        { header: '백엔드 기간', accessor: 'backend_period' },
        { header: '금액', accessor: 'price', formatter: (value) => value.toLocaleString() },
        { header: '작성일자', accessor: 'createdTime', formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
        { header: '수정일자', accessor: 'updateTime', formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
        { header: '작성id', accessor: 'createdId' },
        { header: '작성자', accessor: 'updateId' },
    ], []);
    return (_jsxs(_Fragment, { children: [_jsx(CmsResponsiveContainer, { ref: listRef, title: "\uB2E8\uAC00\uD45C \uAD00\uB9AC", excelFileName: "PriceList", columns: columns, fetchData: fetchData, enableSearch: true, enableDateFilter: false, searchPlaceholder: "\uAE30\uB2A5\uBA85, \uC124\uBA85, \uD56D\uBAA9 \uAC80\uC0C9", onRowClick: handleRowClick, themeMode: "light" }), _jsx(CmsPopup, { title: "\uB2E8\uAC00\uD45C \uC0C1\uC138", isOpen: isPopupOpen, onClose: closePopup, children: _jsx(StyledPopupContent, { children: selectedItem && (_jsxs(_Fragment, { children: [_jsxs("h3", { children: [selectedItem.function_name, " (", selectedItem.code, ")"] }), _jsxs("p", { children: ["\uC124\uBA85: ", selectedItem.description] }), _jsxs("p", { children: ["\uAE08\uC561: ", selectedItem.price?.toLocaleString(), "\uC6D0"] })] })) }) })] }));
};
export default PriceListPage;
