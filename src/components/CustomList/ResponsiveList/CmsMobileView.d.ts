import { ColumnDefinition } from "@/components/CustomList/GenericDataTable";
interface BaseRecord {
    id?: string | number;
    index?: number;
    no?: number;
    createdTime?: string;
    [key: string]: unknown;
}
type ViewMode = 'detail' | 'compact' | 'large';
interface CmsMobileViewProps<T extends BaseRecord> {
    title: string;
    data: T[];
    columns: ColumnDefinition<T>[];
    onRowClick?: (item: T) => void;
    onAdd?: () => void;
    onExport?: () => void;
    isLoading?: boolean;
    fetchData?: () => Promise<{
        data: T[];
        totalItems: number;
        allItems: number;
    }>;
    compactFieldCount?: number;
    defaultViewMode?: ViewMode;
    enableSearch?: boolean;
    searchPlaceholder?: string;
    enableDateFilter?: boolean;
    itemsPerPageOptions?: number[];
    enableCompanySearch?: boolean;
    onCompanySelect?: (company: {
        id: string;
        name: string;
    }) => void;
}
export default function CmsMobileView<T extends BaseRecord>({ title, data, columns, onRowClick, onAdd, onExport, isLoading: isLoadingProp, fetchData, compactFieldCount, defaultViewMode, enableSearch, searchPlaceholder, enableDateFilter, itemsPerPageOptions, enableCompanySearch, onCompanySelect }: CmsMobileViewProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
