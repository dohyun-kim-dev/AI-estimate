'use client';
import React, { useCallback, useMemo, useRef, useState } from 'react'; // useRef 추가

import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { promptGetList } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { THEME_COLORS } from '@/styles/theme_colors';
import ActionButton from '@/components/ActionButton';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import SelectionField from '@/components/selectionField';
import { AppColors } from '@/styles/colors';
import { Validators } from '@/lib/utils/validators';
import { toast, ToastContainer } from 'react-toastify';
import { adminCreate } from '@/lib/api/admin';
import Switch from '@/components/Switch';
import { SwitchInput } from '@/components/SwitchInput';
import { devLog } from '@/lib/utils/devLogger';
import SimpleGenericList from '@/components/CustomList/\bSimpleGenericList';
import PromptPopup from './popup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';

type Prompt = {
  index: number;
  key: string;
  category: string;
  label: string;
  description: string;
  descricreatedIdption: string;
  content: string;
  updateId: string;
  createdTime: string | null;
  updateTime: string | null;
};

const PopupFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
`;

const SaveButton = styled(FooterButton)`
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
`;

const RegisterButton = styled(ActionButton)<{ $themeMode: 'light' | 'dark' }>`
  background: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.primary
      : THEME_COLORS.dark.buttonText};
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? '#f8f8f8' : THEME_COLORS.dark.primary};
  border: none;
  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) =>
      $themeMode === 'light' ? '#e8e8e8' : '#424451'};
  }
`;

// const SwitchButton = styled.div<{ checked: boolean; readOnly?: boolean }>`
//   display: inline-block;
//   margin: 0 auto;
//   width: 40px;
//   height: 20px;
//   background-color: ${({ checked }) => (checked ? '#4EFF63' : '#D2D3D7')};
//   border-radius: 20px;
//   position: relative;
//   cursor: ${({ readOnly }) => (readOnly ? 'default' : 'pointer')};
//   transition: background-color 0.3s;
//   &::before {
//     content: '';
//     position: absolute;
//     top: 2px;
//     left: ${({ checked }) => (checked ? '20px' : '2px')};
//     width: 16px;
//     height: 16px;
//     background-color: white;
//     border-radius: 50%;
//     transition: left 0.3s;
//   }
// `;

const PromptPage: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<Partial<Prompt> | null>(
    null
  );

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const listRef = useRef<{ refetch: () => void }>(null);


  const handleHeaderButtonClick = () => {
    setIsPopupOpen(true);
  };

  const handleRowClick = (item: Prompt) => {
    setSelectedItem(item); // index 저장
    setIsPopupOpen(true);
  };
  

  const closePopup = () => {
    setIsPopupOpen(false);
  };


  const fetchData = useCallback(
    // async (params: FetchParams): Promise<FetchResult<Prompt>> => {
    //   const raw = await promptGetList({ keyword: params.keyword ?? '' });
    //   const wrapper = raw?.[0];
    //   const data = wrapper?.data ?? [];
    //   const totalItems = wrapper?.metadata?.totalCnt ?? data.length;
    //   const allItems = wrapper?.metadata?.allCnt ?? totalItems;
    //   return { data, totalItems, allItems };
    // },
    async (params: FetchParams): Promise<FetchResult<Prompt>> => {
      // ✅ API 호출 대신 목 데이터 반환
      // 실제 API 호출 로직은 주석 처리하여 나중에 쉽게 복구 가능
      console.log('Mock Data fetching...', params);

      const mockData: Prompt[] = [
        {
          index: 1,
          key: 'prompt-1',
          category: '기초조사',
          label: 'AI 서비스 소개',
          description: 'AI 서비스의 기본 기능과 장점을 소개하는 프롬프트',
          content: '저희 AI 서비스는...',
          createdId: 'admin1',
          updateId: 'admin1',
          createdTime: '2025-08-10T10:00:00Z',
          updateTime: '2025-08-14T15:30:00Z',
        },
        {
          index: 2,
          key: 'prompt-2',
          category: '견적문의',
          label: '가격 정책 안내',
          description: '제품의 가격 정책 및 할인 정보를 설명하는 프롬프트',
          content: '가격은 다음과 같습니다...',
          createdId: 'admin2',
          updateId: 'admin2',
          createdTime: '2025-08-11T11:00:00Z',
          updateTime: '2025-08-14T16:00:00Z',
        },
        {
          index: 3,
          key: 'prompt-3',
          category: '기술지원',
          label: '자주 묻는 질문',
          description: '고객들이 자주 문의하는 내용에 대한 답변 프롬프트',
          content: 'FAQ 내용은...',
          createdId: 'admin1',
          updateId: 'admin3',
          createdTime: '2025-08-12T12:00:00Z',
          updateTime: '2025-08-14T17:00:00Z',
        },
        // 여기에 더 많은 목 데이터를 추가할 수 있습니다.
      ];

      // 검색 키워드에 따라 필터링
      const filteredData = params.keyword
        ? mockData.filter(item =>
            item.description.includes(params.keyword as string) ||
            item.label.includes(params.keyword as string)
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


  const columns: ColumnDefinition<Prompt>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no' },
      {
        header: '최종수정일',
        accessor: 'updateTime',
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      // {
      //   header: '최종수정자',
      //   accessor: 'updateId',
      // },
      {
        header: '작성자',
        accessor: 'createdId',
      },
      {
        header: '카테고리',
        accessor: 'category',
        sortable: true,
        formatter: (value) => value ?? '-',
      },
      {
        header: '프롬프트 항목',
        accessor: 'label',
        sortable: true,
        formatter: (value) => value ?? '-',
      },
      {
        header: '프롬프트 설명',
        accessor: 'description',
        sortable: true,
        formatter: (value) => value ?? '-',
      },
    ],
    []
  );

  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 10000 }}
      ></ToastContainer>
      <CmsResponsiveContainer<Prompt>
        ref={listRef}
        title="AI 프롬프트 관리"
        excelFileName="PromptList"
        columns={columns}
        fetchData={fetchData}
        enableSearch
        enableDateFilter={false}
        searchPlaceholder="프롬프트 검색"
        onRowClick={handleRowClick}
        themeMode="light"
      />

<PromptPopup
  index={selectedItem?.index ? Number(selectedItem.index) : 0}
  isOpen={isPopupOpen}
  onClose={closePopup}
  firstCreatedTime={
    selectedItem?.createdTime
      ? dayjs(selectedItem.createdTime).format('YYYY-MM-DD')
      : ''
  }
  firstContent={
    selectedItem?.content ?? ''
  }
/>

    </>
  );
};

export default PromptPage;
