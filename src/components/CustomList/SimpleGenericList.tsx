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
  margin: 24px 0;
  color: '#000';
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
  white-space: nowrap;
`;

const PageBox = styled.div<{ $themeMode: ThemeMode }>`
  margin: 0 5px;
  font-size: 14px;
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
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid ${({ $themeMode }) =>
    $themeMode === 'light' ? '#dddddd' : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  background: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.tableBackground : THEME_COLORS.dark.tableBackground};
`;

const CMSTitle = styled.h1<{ $themeMode: ThemeMode }>`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0;
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
  color: '#000';
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
  fixedLayout?: boolean; // 테이블 레이아웃을 fixed로 설정할지 여부
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
    fixedLayout = false,
  }: SimpleGenericListProps<T>,
  ref: React.Ref<{ refetch: () => void }>
) => {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState<number>();
  const [currentPage, setCurrentPage] = useState(initialState.page ?? 1);
  const [itemsPerPage] = useState(initialState.size ?? 12);
  const [sortKey, setSortKey] = useState<string | null>(initialState.sortKey ?? 'index');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialState.sortOrder ?? 'desc');
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
        
        // 숫자인 경우 숫자 비교
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }
        
        // 문자열인 경우 문자열 비교
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
          fixedLayout={fixedLayout}
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
  color:#000;
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
