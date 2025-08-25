import { ThemeMode } from "@/styles/theme_colors";
import React from "react";
export interface ColumnDefinition<T> {
    header: string;
    accessor: keyof T | string;
    sortable?: boolean;
    noPopup?: boolean;
    formatter?: (value: any, item: T, rowIndex: number) => React.ReactNode;
    headerStyle?: React.CSSProperties;
    cellStyle?: React.CSSProperties | ((value: any, item: T) => React.CSSProperties);
    flex?: number;
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
declare const GenericDataTable: <T extends object>({ data, columns, isLoading, error, maxLength, onRowClick, onHeaderClick, sortKey, sortOrder, keyExtractor, themeMode, }: GenericDataTableProps<T>) => import("react/jsx-runtime").JSX.Element;
export default GenericDataTable;
