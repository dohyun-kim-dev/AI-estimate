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
height: 32px;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
`;


const Cnt = styled.div<{ $themeMode: ThemeMode }>`
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
  border-radius: 0px;
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none" style={{ transform: 'rotate(180deg)' }}>
          <g clipPath="url(#clip0_1131_2271_left)">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.7064 11.7931C15.8938 11.9806 15.9992 12.2349 15.9992 12.5001C15.9992 12.7652 15.8938 13.0195 15.7064 13.2071L10.0494 18.8641C9.95712 18.9596 9.84678 19.0358 9.72477 19.0882C9.60277 19.1406 9.47155 19.1682 9.33877 19.1693C9.20599 19.1705 9.07431 19.1452 8.95141 19.0949C8.82852 19.0446 8.71686 18.9703 8.62297 18.8765C8.52908 18.7826 8.45483 18.6709 8.40454 18.548C8.35426 18.4251 8.32896 18.2934 8.33012 18.1607C8.33127 18.0279 8.35886 17.8967 8.41126 17.7747C8.46367 17.6526 8.53986 17.5423 8.63537 17.4501L13.5854 12.5001L8.63537 7.55006C8.45321 7.36146 8.35241 7.10885 8.35469 6.84666C8.35697 6.58446 8.46214 6.33365 8.64755 6.14824C8.83296 5.96283 9.08377 5.85766 9.34597 5.85538C9.60816 5.85311 9.86076 5.9539 10.0494 6.13606L15.7064 11.7931Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_1131_2271_left">
              <rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
          </defs>
        </svg>
            </NavButton>
            <PageBox $themeMode={themeMode}>
              {currentPage} / {totalPages > 0 ? totalPages : 1}
            </PageBox>
            <NavButton
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoading}
              $themeMode={themeMode}
            >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
          <g clipPath="url(#clip0_1131_2271_right)">
            <path fillRule="evenodd" clipRule="evenodd" d="M15.7064 11.7931C15.8938 11.9806 15.9992 12.2349 15.9992 12.5001C15.9992 12.7652 15.8938 13.0195 15.7064 13.2071L10.0494 18.8641C9.95712 18.9596 9.84678 19.0358 9.72477 19.0882C9.60277 19.1406 9.47155 19.1682 9.33877 19.1693C9.20599 19.1705 9.07431 19.1452 8.95141 19.0949C8.82852 19.0446 8.71686 18.9703 8.62297 18.8765C8.52908 18.7826 8.45483 18.6709 8.40454 18.548C8.35426 18.4251 8.32896 18.2934 8.33012 18.1607C8.33127 18.0279 8.35886 17.8967 8.41126 17.7747C8.46367 17.6526 8.53986 17.5423 8.63537 17.4501L13.5854 12.5001L8.63537 7.55006C8.45321 7.36146 8.35241 7.10885 8.35469 6.84666C8.35697 6.58446 8.46214 6.33365 8.64755 6.14824C8.83296 5.96283 9.08377 5.85766 9.34597 5.85538C9.60816 5.85311 9.86076 5.9539 10.0494 6.13606L15.7064 11.7931Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_1131_2271_right">
              <rect width="24" height="24" fill="white" transform="translate(0 0.5)"/>
            </clipPath>
          </defs>
        </svg>
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


const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #555555;
`;

const ItemsPage = styled.div`
  display: flex;
  margin: 0 16px;
  gap: 8px;
`;


const NavButton = styled.button<{ $themeMode: ThemeMode }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  cursor: pointer;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  background-color: #fff;
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.text)};
  border-radius: 4px;
  padding: 0;
  transition: background-color 0.2s, border-color 0.2s;

  svg {
    width: 24px;
    height: 24px;
  }

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


const PageBox = styled.div<{ $themeMode: ThemeMode }>`
  margin: 0 5px;
  font-size: 14px;
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.text)};
  white-space: nowrap;
`;

