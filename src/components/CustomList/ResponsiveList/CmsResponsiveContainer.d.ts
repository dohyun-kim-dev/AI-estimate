import { AdminUser } from "../types";
import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";
interface BaseRecord {
    id?: string | number;
    index?: number;
    [key: string]: any;
}
type ViewMode = 'detail' | 'compact' | 'large';
interface CmsResponsiveContainerProps<T extends BaseRecord> {
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
    defaultViewMode?: ViewMode;
    enableDateFilter: boolean;
    enableCompanySearch?: boolean;
    onCompanySelect?: (company: {
        id: string;
        name: string;
    }) => void;
}
export default function CmsResponsiveContainer<T extends BaseRecord = AdminUser>({ title, data, columns, onRowClick, onAdd, addButtonLabel, onExport, isLoading, fetchData, themeMode, compactFieldCount, defaultViewMode, enableDateFilter, onCompanySelect, enableCompanySearch }: CmsResponsiveContainerProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
