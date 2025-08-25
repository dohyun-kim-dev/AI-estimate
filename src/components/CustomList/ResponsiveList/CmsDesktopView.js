"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from "react";
import GenericListUI from "@/components/CustomList/GenericListUI";
export default function CmsDesktopView({ title, data, columns, onRowClick, onAdd, addButtonLabel, onExport, isLoading = false, fetchData, themeMode = "light", enableDateFilter, enableCompanySearch, onCompanySelect }) {
    const listRef = useRef(null);
    const handleFetchData = async (params) => {
        if (fetchData) {
            return await fetchData(params); // ✅ params를 전달합니다.
        }
        // 기본 더미 데이터 반환
        return {
            data,
            totalItems: data.length,
            allItems: data.length,
        };
    };
    return (_jsx(GenericListUI, { ref: listRef, title: title, excelFileName: "\uB370\uC774\uD130 \uBAA9\uB85D", columns: columns, fetchData: handleFetchData, themeMode: themeMode, onAdd: onAdd, addButtonLabel: addButtonLabel, onRowClick: onRowClick, enableDateFilter: enableDateFilter, enableCompanySearch: enableCompanySearch, onCompanySelect: onCompanySelect }));
}
