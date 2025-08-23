'use client';

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import GenericDataTable, { ColumnDefinition } from './GenericDataTable';
import { THEME_COLORS, ThemeMode } from '@/styles/theme_colors';

// BaseRecord, FetchParams, FetchResult 타입 재사용
interface BaseRecord {
  id?: string | number;
  index?: number;
  [key: string]: any;
}

const RightControls = styled.div`
  display: flex;
  justify-content: end;
  margin-bottom: 15px;

  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Cnt = styled.div<{ $themeMode: ThemeMode }>`
  font-size: 14px;
  color: '#fff';
  white-space: nowrap;
`;

const PageBox = styled.div<{ $themeMode: ThemeMode }>`
  margin: 0 5px;
  font-size: 14px;
  color: '#fff';
  white-space: nowrap;
`;

const TopHeader = styled.div`
  display: flex;
  flex-direction: column; /* 세로 배치 */
  margin-bottom: 15px;
  gap: 15px;

`;

const TableContainer = styled.div<{ $themeMode: ThemeMode }>`
  width: 100%;
  overflow-x: auto;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-radius: 4px;
  background: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};

  /* @media (max-width: 1400px) {
    width: 1150px;
  }

  @media (min-width: 2050px) {
    width: 1800px;
  } */
`;

const CMSTitle = styled.h1<{ $themeMode: ThemeMode }>`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0;
  color: '#fff';
`;

const TabsWrapper = styled.div`
  margin-top: 15px;
`;

const Container = styled.div<{ $themeMode: ThemeMode }>`
  justify-content: start;
  width: calc(100%-50px);
  /* min-width: 600px; */
  height: auto;
  /* padding: 30px; */
  /* background-color: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.background : THEME_COLORS.dark.background}; */
  box-sizing: border-box;
  color: '#fff';
`;

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

const SimpleGenericListInner = <T extends BaseRecord>(
  {
    title,
    columns,
    fetchData,
    initialState = {},
    keyExtractor,
    renderTabs,
    themeMode = 'light',
  }: SimpleGenericListProps<T>,
  ref: React.Ref<{ refetch: () => void }>
) => {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState<number>();
  const [currentPage, setCurrentPage] = useState(initialState.page ?? 1);
  const [itemsPerPage] = useState(initialState.size ?? 12);
  const [sortKey, setSortKey] = useState<string | null>(initialState.sortKey ?? null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialState.sortOrder ?? 'asc');
  const [isLoading, setIsLoading] = useState(false);

  const fetchDataCallback = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchData({});
      setData(result.data);
      setTotalItems(result.totalItems);
      setAllItems(result.allItems);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  useImperativeHandle(ref, () => ({
    refetch: () => fetchDataCallback(),
  }));

  useEffect(() => {
    fetchDataCallback();
  }, []);

  const sortedData = useMemo(() => {
    const sorted = [...data];
    if (sortKey) {
      sorted.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }
    return sorted;
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const internalKeyExtractor = keyExtractor ?? ((item, index) => item.id ?? item.index ?? index);

  return (
    <Container $themeMode={themeMode}>
      <TopHeader>
          {typeof title === 'string' ? (
            <CMSTitle $themeMode={themeMode}>{title}</CMSTitle>
          ) : (
            title
          )}
        {renderTabs && <TabsWrapper>{renderTabs()}</TabsWrapper>}
      </TopHeader>

      <RightControls>
          <Cnt $themeMode={themeMode}>
            전체 {`${allItems ?? '-'}건 중 ${totalItems}건`}
          </Cnt>
          <PaginationControls>
            <NavButton
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isLoading}
              $themeMode={themeMode}
            >
              &lt;
            </NavButton>
            <PageBox $themeMode={themeMode}>
              {currentPage} / {totalPages > 0 ? totalPages : 1}
            </PageBox>
            <NavButton
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoading}
              $themeMode={themeMode}
            >
              &gt;
            </NavButton>
          </PaginationControls>
        </RightControls>

      <TableContainer $themeMode={themeMode}>
        <GenericDataTable
          data={paginatedData}
          columns={columns}
          isLoading={isLoading}
          keyExtractor={internalKeyExtractor}
          themeMode={themeMode}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onHeaderClick={(key) => {
            const order = sortKey === key && sortOrder === 'asc' ? 'desc' : 'asc';
            setSortKey(key as string);
            setSortOrder(order);
            setCurrentPage(1);
          }}
        />
        
      </TableContainer>
    </Container>
  );
};

const SimpleGenericList = forwardRef(SimpleGenericListInner) as <T extends BaseRecord>(
  props: SimpleGenericListProps<T> & { ref?: React.Ref<{ refetch: () => void }> }
) => React.ReactElement;

export default SimpleGenericList;



const NavButton = styled.button<{ $themeMode: ThemeMode }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#FFFFFF" : THEME_COLORS.dark.secondary)};
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.text)};
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.8;
    border-color: ${({ $themeMode }) => ($themeMode === "light" ? "#999" : "#AAAAAA")};
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f8f8f8" : "#424451")};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ $themeMode }) => ($themeMode === "light" ? "#EEEEEE" : "#555555")};
    color: ${({ $themeMode }) => ($themeMode === "light" ? "#AAAAAA" : "#777777")};
  }
`;