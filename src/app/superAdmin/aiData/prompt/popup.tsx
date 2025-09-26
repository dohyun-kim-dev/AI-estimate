'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import CmsPopup from '@/components/CmsPopup';
import dayjs from 'dayjs';
import { getAIPromptHistory, updateAIPrompt } from '@/lib/api/admin/adminApi';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import SimpleGenericList from '@/components/CustomList/SimpleGenericList';
import { toast } from 'react-toastify';

type PromptHistory = {
  _id: string;
  name: string;
  description: string;
  content: string;
  promptId: string;
  createAt: string;
  createByName?: string;
};

type Prompt = {
  _id: string;
  name: string;
  description: string;
  content: string;
  createBy: string;
  createAt: string;
  updateAt: string;
};

type PromptPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedPrompt: Prompt | null;
  companyCode: string;
};

const PromptPopup: React.FC<PromptPopupProps> = ({ isOpen, onClose, selectedPrompt, companyCode }) => {
  const [selected, setSelected] = useState<PromptHistory | Prompt | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [historyList, setHistoryList] = useState<PromptHistory[]>([]);
  const [isContentChanging, setIsContentChanging] = useState(false);

  // 선택된 프롬프트가 변경될 때마다 초기화
  useEffect(() => {
    if (selectedPrompt) {
      setSelected(selectedPrompt);
      setName(selectedPrompt.name);
      setDescription(selectedPrompt.description);
      setContent(selectedPrompt.content);
    }
  }, [selectedPrompt]);

  // 팝업이 열릴 때마다 히스토리 초기화
  useEffect(() => {
    if (!isOpen) {
      setHistoryList([]);
      setSelected(null);
    }
  }, [isOpen]);

  // 히스토리 목록이 업데이트될 때 첫 번째 항목 자동 선택
  useEffect(() => {
    if (historyList.length > 0 && selectedPrompt) {
      const firstItem = historyList[0];
      setSelected(firstItem);
      setName(firstItem.name);
      setDescription(firstItem.description);
      setContent(firstItem.content);
    }
  }, [historyList, selectedPrompt]);

  const fetchData = async (_: FetchParams): Promise<FetchResult<PromptHistory>> => {
    if (!selectedPrompt || !companyCode) {
      return { data: [], totalItems: 0, allItems: 0 };
    }

    try {
      const response = await getAIPromptHistory({
        id: selectedPrompt._id,
        companyCode: companyCode
      });

      console.log('프롬프트 히스토리 응답:', response);

      // 응답 처리 단순화
      let historyData = [];
      
      // 직접 응답인 경우
      if (response && typeof response === 'object' && 'statusCode' in response && response.statusCode === 200) {
        historyData = (response as any).data || [];
        console.log('직접 응답 처리:', historyData);
      }
      // 배열로 감싸진 응답인 경우
      else if (Array.isArray(response) && response[0]) {
        const responseData = response[0];
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          const innerData = responseData.data;
          if (innerData && typeof innerData === 'object' && 'statusCode' in innerData && innerData.statusCode === 200) {
            historyData = (innerData as any).data || [];
            console.log('배열 응답 처리:', historyData);
          }
        }
      }

      setHistoryList(historyData);
      console.log('최종 히스토리 데이터:', historyData, '길이:', historyData.length);
      return { data: historyData, totalItems: historyData.length, allItems: historyData.length };

      return { data: [], totalItems: 0, allItems: 0 };
    } catch (error) {
      console.error('프롬프트 히스토리 조회 오류:', error);
      return { data: [], totalItems: 0, allItems: 0 };
    }
  };



  const handleViewClick = (historyId: string) => {
    const item = historyList.find((d) => d._id === historyId);
    if (item) {
      setIsContentChanging(true);
      setTimeout(() => {
        setSelected(item);
        setName(item.name);
        setDescription(item.description);
        setContent(item.content);
        setIsContentChanging(false);
      }, 150);
    }
  };

  const handleSave = async () => {
    if (!selectedPrompt || !companyCode) {
      toast.error('프롬프트 정보가 없습니다.');
      return;
    }

    try {
      const response = await updateAIPrompt({
        id: selectedPrompt._id,
        companyCode: companyCode,
        name: name,
        description: description,
        content: content,
      });

      console.log('프롬프트 수정 응답:', response);

      const responseData = Array.isArray(response) ? response[0] : response;
      
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 
          responseData.data && typeof responseData.data === 'object' && 
          'statusCode' in responseData.data && responseData.data.statusCode === 200 && 
          'message' in responseData.data && responseData.data.message === 'success') {
        toast.success('프롬프트가 저장되었습니다.');
        onClose();
      } else {
        toast.error('프롬프트 저장에 실패했습니다.');
      }
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
      accessor: 'no',
      sortable: true,
      flex: 0.5,
      // formatter: (_value, _item, index) => (index !== undefined ? index + 1 : 1),
    },
    {
      header: '수정일시',
      accessor: 'createAt',
      sortable: true,
      formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
      flex: 2,
    },
    { 
      header: '작성자', 
      accessor: 'createByName',
      sortable: true,
      flex: 1.5,
      formatter: (value) => value || '곧 추가 예정'
    },
    {
      header: '보기',
      accessor: '_id',
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
        <LeftSection $isChanging={isContentChanging}>
          <LabelTitle>{name || '선택된 항목 없음'}</LabelTitle>
          <SubTitle>{description || '설명이 없습니다'}</SubTitle>
          
          <FormSection>
            {/* <InputLabel>프롬프트명</InputLabel>
            <CustomInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프롬프트명을 입력하세요"
            />
            
            <InputLabel>설명</InputLabel>
            <CustomInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="설명을 입력하세요"
            /> */}
            
            {/* <InputLabel>내용</InputLabel> */}
            <CustomTextarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="프롬프트 내용을 입력하세요"
            />
          </FormSection>
        </LeftSection>
        <RightSection>
          <SimpleGenericList
            title="수정 이력"
            columns={columns}
            fetchData={fetchData}
            themeMode="light"
            fixedLayout={true}
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
  height: calc(85vh - 200px);
  min-width: 0;
  color: #000;
`;

const LeftSection = styled.div<{ $isChanging?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  opacity: ${({ $isChanging }) => $isChanging ? 0.3 : 1};
  transition: opacity 0.15s ease-in-out;
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
  margin: 0 0 44px 0;
`;

const SubTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin: 0 0 0px 0;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const CustomInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  
  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
  
  &::placeholder {
    color: #999;
  }
`;

const RightHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const CurrentButton = styled.button`
  padding: 8px 16px;
  background-color: transparent;
  color: ${AppColors.primary};
  border: 1px solid ${AppColors.primary};
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  
  &:hover {
    background-color: ${AppColors.primary};
    color: white;
  }
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
