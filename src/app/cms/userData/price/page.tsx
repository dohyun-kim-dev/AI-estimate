// src/app/cms/userData/priceList/page.tsx

'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import dayjs from 'dayjs';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';

type PriceList = {
  no: number;
  select: boolean;
  code: string;
  category_name: string;
  sub_category_name: string;
  function_name: string;
  description: string;
  memo: string;
  frontend_period: number;
  backend_period: number;
  price: number;
  createdTime: string | null;
  updateTime: string | null;
  createdId: string;
  updateId: string;
};

// 팝업 관련 스타일은 재사용 가능하므로 필요에 따라 추가
const StyledPopupContent = styled.div`
  padding: 20px;
  h3 {
    margin-top: 0;
  }
`;

const PriceListPage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<PriceList> | null>(null);
  const listRef = useRef<{ refetch: () => void }>(null);

  const handleRowClick = (item: PriceList) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };
  
  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<PriceList>> => {
      console.log('Mock Data fetching for PriceList...', params);
      const mockData: PriceList[] = [
        {
          no: 1, select: false, code: 'C1', category_name: 'COMMON', sub_category_name: '화면설계', function_name: '기능1', description: '기능에 대한 상세 설명', memo: '잠재고객/지속적인 연락 필요', frontend_period: 0.2, backend_period: 0.2, price: 500000, createdTime: '2025-05-21T11:31:12Z', updateTime: '2025-05-21T11:31:12Z', createdId: '작성자1', updateId: '작성자1',
        },
        {
          no: 2, select: false, code: 'C2', category_name: 'COMMON', sub_category_name: '기획', function_name: '기능2', description: '새로운 기능 설명', memo: '', frontend_period: 0.3, backend_period: 0.1, price: 350000, createdTime: '2025-05-22T14:00:00Z', updateTime: '2025-05-22T14:00:00Z', createdId: '작성자2', updateId: '작성자2',
        },
        // 여기에 더 많은 목 데이터를 추가할 수 있습니다.
      ];

      const filteredData = params.keyword
        ? mockData.filter(item =>
            item.function_name.includes(params.keyword as string) ||
            item.description.includes(params.keyword as string) ||
            item.category_name.includes(params.keyword as string)
          )
        : mockData;

      return {
        data: filteredData,
        totalItems: filteredData.length,
        allItems: mockData.length,
      };
    },
    []
  );

  const columns: ColumnDefinition<PriceList>[] = useMemo(
    () => [
      { header: '선택', accessor: 'select', formatter: () => <input type="checkbox" /> },
      { header: 'No', accessor: 'no', sortable: true },
      { header: '코드', accessor: 'code', sortable: true },
      { header: '항목', accessor: 'category_name', sortable: true },
      { header: '카테고리', accessor: 'sub_category_name', sortable: true },
      { header: '기능명', accessor: 'function_name', sortable: true },
      { header: '설명', accessor: 'description', sortable: true },
      { header: '메모', accessor: 'memo', sortable: true },
      { header: '프론트 기간', accessor: 'frontend_period' },
      { header: '백엔드 기간', accessor: 'backend_period' },
      { header: '금액', accessor: 'price', formatter: (value) => value.toLocaleString() },
      { header: '작성일자', accessor: 'createdTime', formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
      { header: '수정일자', accessor: 'updateTime', formatter: (value) => dayjs(value).format('YYYY-MM-DD HH:mm:ss') },
      { header: '작성id', accessor: 'createdId' },
      { header: '작성자', accessor: 'updateId' },
    ],
    []
  );

  return (
    <>
      <CmsResponsiveContainer<PriceList>
        ref={listRef}
        title="단가표 관리"
        excelFileName="PriceList"
        columns={columns}
        fetchData={fetchData}
        enableSearch
        enableDateFilter={false} // 날짜 필터 제외
        searchPlaceholder="기능명, 설명, 항목 검색"
        onRowClick={handleRowClick}
        themeMode="light"
      />
      <CmsPopup title="단가표 상세" isOpen={isPopupOpen} onClose={closePopup}>
        <StyledPopupContent>
          {selectedItem && (
            <>
              <h3>{selectedItem.function_name} ({selectedItem.code})</h3>
              <p>설명: {selectedItem.description}</p>
              <p>금액: {selectedItem.price?.toLocaleString()}원</p>
            </>
          )}
        </StyledPopupContent>
      </CmsPopup>
    </>
  );
};

export default PriceListPage;