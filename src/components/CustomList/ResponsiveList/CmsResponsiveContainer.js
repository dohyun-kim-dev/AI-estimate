"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import ResponsiveView from "@/layout/ResponsiveView";
import CmsMobileView from "./CmsMobileView";
import CmsDesktopView from "./CmsDesktopView";
export default function CmsResponsiveContainer({ title, data, columns, onRowClick, onAdd, addButtonLabel, onExport, isLoading = false, fetchData, themeMode = "light", compactFieldCount = 3, defaultViewMode = 'detail', enableDateFilter, onCompanySelect, enableCompanySearch }) {
    // 공통 props
    const commonProps = {
        title,
        data,
        columns,
        onRowClick,
        onAdd,
        onExport,
        isLoading,
        fetchData,
        themeMode,
        compactFieldCount,
        defaultViewMode,
        enableDateFilter,
        enableCompanySearch,
        onCompanySelect
    };
    return (_jsx(ResponsiveView, { mobileView: _jsx(CmsMobileView, { ...commonProps }), desktopView: _jsx(CmsDesktopView, { ...commonProps, addButtonLabel: addButtonLabel }) }));
}
