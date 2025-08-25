import React from "react";
import { ThemeMode } from "@/styles/theme_colors";
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
declare const GenericTreeListUI: React.ForwardRefExoticComponent<GenericTreeListUIProps & React.RefAttributes<unknown>>;
export default GenericTreeListUI;
