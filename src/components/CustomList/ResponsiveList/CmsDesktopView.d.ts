import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";
interface BaseRecord {
    id?: string | number;
    index?: number;
    [key: string]: any;
}
interface CmsDesktopViewProps<T extends BaseRecord> {
    title: string;
    data: T[];
    columns: ColumnDefinition<T>[];
    onRowClick?: (item: T) => void;
    onAdd?: () => void;
    addButtonLabel?: string;
    onExport?: () => void;
    isLoading?: boolean;
    fetchData?: () => Promise<{
        data: T[];
        totalItems: number;
        allItems: number;
    }>;
    themeMode?: "light" | "dark";
    compactFieldCount?: number;
    defaultViewMode?: 'detail' | 'compact' | 'large';
    enableDateFilter?: boolean;
    enableCompanySearch?: boolean;
    onCompanySelect?: (company: {
        id: string;
        name: string;
    }) => void;
}
export default function CmsDesktopView<T extends BaseRecord>({ title, data, columns, onRowClick, onAdd, addButtonLabel, onExport, isLoading, fetchData, themeMode, enableDateFilter, enableCompanySearch, onCompanySelect }: CmsDesktopViewProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
