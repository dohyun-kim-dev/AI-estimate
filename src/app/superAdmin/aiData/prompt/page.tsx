'use client';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';

import GenericListUI, {
  FetchParams,
  FetchResult,
} from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import { getAIPromptList, createAIPrompt, updateAIPrompt, deleteAIPrompt } from '@/lib/api/admin/adminApi';
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
import PromptFormPopup from './PromptFormPopup';
import CmsResponsiveContainer from '@/components/CustomList/ResponsiveList/CmsResponsiveContainer';

type Prompt = {
  _id: string;
  name: string;
  description: string;
  content: string;
  createBy: string;
  createAt: string;
  updateAt: string;
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
  const [currentKeyword, setCurrentKeyword] = useState<string>('');
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string>(''); // 기본값을 heredot으로 설정
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(''); // 기본 회사명

  const listRef = useRef<{ refetch: () => void }>(null);

  const handleHeaderButtonClick = () => {
    setSelectedItem(null); // 신규 등록
    setIsPopupOpen(true);
  };

  const handleRowClick = (item: Prompt) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };
  
  // 고객사 선택 핸들러
  const handleCompanySelect = useCallback((company: { id: string; name: string; }) => {
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
  }, []);

  // 고객사가 변경되면 자동으로 리패치
  useEffect(() => {
    if (selectedCompanyCode && listRef.current) {
      listRef.current.refetch();
    }
  }, [selectedCompanyCode]);

  const closePopup = () => {
    setIsPopupOpen(false);
  };


  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<Prompt>> => {
      try {
        // 현재 입력된 검색어 저장
        if (params.keyword !== undefined) {
          setCurrentKeyword(params.keyword);
        }

        const response = await getAIPromptList({
          companyCode: selectedCompanyCode || '',
          keyword: params.keyword || currentKeyword || '',
        });
        
        console.log('AI 프롬프트 조회 응답:', response);
        
        // 응답 처리 (응답 구조에 맞게 수정)
        if (response && typeof response === 'object') {
          // 응답이 직접 API 응답 객체인 경우
          if ('statusCode' in response && response.statusCode === 200) {
            const promptData = (response as any).data || [];
            const totalItems = promptData.length;
            return { data: promptData, totalItems, allItems: totalItems };
          } 
          // 응답이 배열로 감싸져 있는 경우 (callAdminApi 특성)
          else if (Array.isArray(response) && response[0]) {
            const firstItem = response[0];
            if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
              const responseData = firstItem.data;
              if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
                const promptData = (responseData as any).data || [];
                const totalItems = promptData.length;
                return { data: promptData, totalItems, allItems: totalItems };
              }
            }
          }
        }
        
        console.error('프롬프트 목록 응답 형식이 예상과 다릅니다:', response);
        return { data: [], totalItems: 0, allItems: 0 };
      } catch (error) {
        console.error('프롬프트 목록 조회 오류:', error);
        return { data: [], totalItems: 0, allItems: 0 };
      }
    },
    [currentKeyword, selectedCompanyCode]
  );


  const columns: ColumnDefinition<Prompt>[] = useMemo(
    () => [
      { header: 'No', accessor: 'no' },
      {
        header: '최종수정일',
        accessor: 'updateAt',
        formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
      },
      {
        header: '작성자',
        accessor: 'createBy',
      },
      {
        header: '프롬프트명',
        accessor: 'name',
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
        data={[]}
        columns={columns}
        fetchData={fetchData}
        enableDateFilter={false}
        enableCompanySearch={true}
        onCompanySelect={handleCompanySelect}
        selectedCompanyCode={selectedCompanyCode}
        selectedCompanyName={selectedCompanyName}
        onRowClick={handleRowClick}
        onAdd={handleHeaderButtonClick}
        addButtonLabel="프롬프트 추가"
        themeMode="light"
      />

<PromptPopup
  index={0}
  isOpen={isPopupOpen}
  onClose={closePopup}
  firstCreatedTime={selectedItem?.createAt ? dayjs(selectedItem.createAt).format('YYYY-MM-DD') : ''}
  firstContent={selectedItem?.content || ''}
/>

    </>
  );
};

export default PromptPage;
