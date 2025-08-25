import React from 'react';
import { ColumnDefinition } from './GenericDataTable';
import { ThemeMode } from '@/styles/theme_colors';
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
interface SimpleGenericListProps<T extends BaseRecord> {
    title: React.ReactNode;
    columns: ColumnDefinition<T>[];
    fetchData: (params: FetchParams) => Promise<FetchResult<T>>;
    initialState?: {
        page?: number;
        size?: number;
        sortKey?: string | null;
        sortOrder?: 'asc' | 'desc';
    };
    keyExtractor?: (item: T, index: number) => string | number;
    renderTabs?: () => React.ReactNode;
    themeMode?: ThemeMode;
}
declare const SimpleGenericList: <T extends BaseRecord>(props: SimpleGenericListProps<T> & {
    ref?: React.Ref<{
        refetch: () => void;
    }>;
}) => React.ReactElement;
export default SimpleGenericList;
