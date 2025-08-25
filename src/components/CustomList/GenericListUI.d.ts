import React from "react";
import { ColumnDefinition } from "./GenericDataTable";
import { ThemeMode } from "@/styles/theme_colors";
interface BaseRecord {
    id?: string | number;
    index?: number;
    [key: string]: any;
}
export interface FetchParams {
    fromDate?: string;
    toDate?: string;
    keyword?: string;
}
export interface FetchResult<T> {
    data: T[];
    totalItems: number;
    allItems?: number;
}
interface InitialState {
    page?: number;
    size?: number;
    sortKey?: string | null;
    sortOrder?: "asc" | "desc";
    fromDate?: string;
    toDate?: string;
    keyword?: string;
}
interface GenericListUIProps<T extends BaseRecord> {
    title: React.ReactNode;
    columns: ColumnDefinition<T>[];
    fetchData: (params: FetchParams) => Promise<FetchResult<T>>;
    excelFileName?: string;
    onAdd?: () => void;
    addButtonLabel?: string;
    deleteBtnCallBack?: () => void;
    isShowExcelTemplate?: boolean;
    excelUploadBtnCallBack?: (() => void);
    enableCompanySearch?: boolean;
    onCompanySelect?: (company: {
        id: string;
        name: string;
    }) => void;
    initialState?: InitialState;
    keyExtractor?: (item: T, index: number) => string | number;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    enableDateFilter?: boolean;
    dateRangeOptions?: string[];
    itemsPerPageOptions?: number[];
    themeMode?: ThemeMode;
    onRowClick?: (item: T, rowIndex: number) => void;
    renderTabs?: () => React.ReactNode;
}
declare const GenericListUI: <T extends BaseRecord>(props: GenericListUIProps<T> & {
    ref?: React.Ref<{
        refetch: () => void;
    }>;
}) => React.ReactElement;
export default GenericListUI;
