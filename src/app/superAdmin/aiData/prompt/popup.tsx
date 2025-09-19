'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import CmsPopup from '@/components/CmsPopup';
import dayjs from 'dayjs';
import { promptHistoryGetList, promptUpdate } from '@/lib/api/admin/adminApi';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import SimpleGenericList from '@/components/CustomList/SimpleGenericList';
import { toast } from 'react-toastify';

type PromptHistory = {
  id: number;
  index: number;
  promptIndex: number;
  updateId: string;
  updateTime: string;
  label: string;
  description: string;
  content: string;
  createdTime: string;
  createdId: string;

};

type PromptPopupProps = {
  index: number;
  isOpen: boolean;
  firstCreatedTime: string;
  firstContent: string; 
  onClose: () => void;
};

const PromptPopup: React.FC<PromptPopupProps> = ({ index, isOpen, onClose, firstContent, firstCreatedTime }) => {
  const [selected, setSelected] = useState<PromptHistory | null>(null);
  const [description, setDescription] = useState('');
  const [promptList, setPromptList] = useState<PromptHistory[]>([]);

  const fetchData = async (_: FetchParams): Promise<FetchResult<PromptHistory>> => {
    const raw = await promptHistoryGetList({ index: Number(index) });
    const wrapper = raw?.[0] as any;
    const data = wrapper?.data ?? [];
  
    if (data.length === 0) {
      return { data: [], totalItems: 0, allItems: 0 };
    }
  
    const base = data[0];
    const firstItem: PromptHistory = {
      ...base,
      id: -1, // 가상의 ID
      index: base.index + 1,
      content: firstContent,
      createdTime: firstCreatedTime,
    };
  
    const combinedData = [firstItem, ...data];
  
    setPromptList(combinedData);
    setSelected(firstItem);
    setDescription(firstItem.content);
  
    return {
      data: combinedData,
      totalItems: combinedData.length,
      allItems: combinedData.length,
    };
  };
  
  

  const handleViewClick = (targetIndex: number) => {
    console.log('targetIndex:', targetIndex);
    const item = promptList.find((d) => d.index === targetIndex);
    console.log('item:', item);
    if (item) {
      setSelected(item);
      setDescription(item.content ?? '');
    }
  };

  const handleSave = async () => {
    if (!selected) {
      toast.error('선택된 항목이 없습니다.');
      return;
    }

    try {
      await promptUpdate({
        index: Number(selected.promptIndex),
        content: description,
      });
      toast.success('프롬프트가 저장되었습니다.');
      onClose();
    } catch (error) {
      console.error('프롬프트 저장 실패:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    }
  };

  const closePopup = () => {
    onClose();
  };

  const columns: ColumnDefinition<PromptHistory>[] = [
    {
      header: 'No',
      accessor: 'index',
      sortable: true,
      flex: 0.5,
      formatter: (value) => value,
    },
    {
      header: '수정일시',
      accessor: 'createdTime',
      sortable: true,
      formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
      flex: 1.5,
    },
    { 
      header: '작성자', 
      accessor: 'createdId',
      sortable: true,
      flex: 1
    },
    {
      header: '보기',
      accessor: 'index',
      sortable: false,
      flex: 0.8,
      formatter: (value) => <ViewButton onClick={() => handleViewClick(value)}>보기</ViewButton>,
    },
  ];

  return (
    <CmsPopup 
      title="AI 프롬프트 관리" 
      isOpen={isOpen} 
      onClose={closePopup} 
      isWide
      backgroundColor="#FFF"
      bottomFloating={
        <PopupFooter>
          <SaveButton onClick={handleSave} disabled={!selected}>저장</SaveButton>
          <CancelButton onClick={closePopup}>닫기</CancelButton>
        </PopupFooter>
      }
    >
      <PopupLayout>
        <LeftSection>
          <LabelTitle>{selected?.label ?? '선택된 항목 없음'}</LabelTitle>
          {/* <SubTitle>{selected?.description ?? '선택된 항목 없음'}</SubTitle> */}

          <CustomTextarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프롬프트"
          />
        </LeftSection>
        <RightSection>
          <SimpleGenericList
            title="수정 이력"
            columns={columns}
            fetchData={fetchData}
            themeMode="light"
            fixedLayout={true}
            initialState={{
              sortKey: 'index',
              sortOrder: 'desc'
            }}
          />
        </RightSection>
      </PopupLayout>
    </CmsPopup>
  );
};

export default PromptPopup;


// ------------------------ 스타일 ------------------------

const CustomTextarea = styled.textarea`
  readonly: true;
  flex: 1;
  width: 100%;
  background-color: #f4f4f4;
  border: none;
  border-radius: 0px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  resize: none;
  outline: none;
  font-family: inherit;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    background-color: #f0f0f0;
  }
  
  /* 스크롤바 스타일링 */
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background-color: #bbb;
  }
`;

const PopupLayout = styled.div`
  display: flex;
  gap: 24px;
  height: calc(85vh - 100px);
  min-width: 0;
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RightSection = styled.div`
  flex: 1;
  overflow: hidden;
  min-width: 0;
  
  /* min-width: 600px; */
`;

const LabelTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 72px 0;
  color: '#fff';
`;

const SubTitle = styled.h2`
  font-size: 16px;
  font-weight: 500;
    margin: 0 0 16px 0;
    margin-bottom: 20px;
    color: '#fff';
`;

const ContentBox = styled.div`
  flex: 1;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid ${AppColors.border};
  border-radius: 8px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 14px;
  color: #000;

  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;

const ViewButton = styled.span`
  font-size: 13px;
  color: ${AppColors.primary}; /* 텍스트 색상 */
  text-decoration: underline; /* 언더라인 추가 */
  cursor: pointer; /* 클릭 가능한 텍스트처럼 보이도록 설정 */

  &:hover {
    color: ${AppColors.hoverText}; /* 호버 시 색상 변경 */
  }
`;

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

const SaveButton = styled(FooterButton)<{ disabled?: boolean }>`
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;
