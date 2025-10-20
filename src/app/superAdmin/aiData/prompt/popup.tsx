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
import { devLog } from '@/utils/devLogger'
import FullScreenModal from './FullScreenModal';
import { useToast } from '@/components/common/ToastProvider';

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
  const { show: showToast } = useToast(); // 토스트 훅 추가
  const [historyList, setHistoryList] = useState<PromptHistory[]>([]);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const [editableContent, setEditableContent] = useState('');

  // 팝업이 열릴 때마다 히스토리 초기화
  useEffect(() => {
    if (!isOpen) {
      setHistoryList([]);
    }
  }, [isOpen]);

  // 선택된 프롬프트가 변경될 때 editableContent 초기화
  useEffect(() => {
    if (selectedPrompt) {
      setEditableContent(selectedPrompt.content);
    }
  }, [selectedPrompt]);

  const fetchData = async (_: FetchParams): Promise<FetchResult<PromptHistory>> => {
    if (!selectedPrompt || !companyCode) {
      return { data: [], totalItems: 0, allItems: 0 };
    }

    try {
      const response = await getAIPromptHistory({
        id: selectedPrompt._id,
        companyCode: companyCode
      });

      devLog('프롬프트 히스토리 응답:', response);

      // 응답 처리 단순화
      let historyData = [];
      
      // 직접 응답인 경우
      if (response && typeof response === 'object' && 'statusCode' in response && response.statusCode === 200) {
        historyData = (response as any).data || [];
        devLog('직접 응답 처리:', historyData);
      }
      // 배열로 감싸진 응답인 경우
      else if (Array.isArray(response) && response[0]) {
        const responseData = response[0];
        if (responseData && typeof responseData === 'object' && 'data' in responseData) {
          const innerData = responseData.data;
          if (innerData && typeof innerData === 'object' && 'statusCode' in innerData && innerData.statusCode === 200) {
            historyData = (innerData as any).data || [];
            devLog('배열 응답 처리:', historyData);
          }
        }
      }

      setHistoryList(historyData);
      devLog('최종 히스토리 데이터:', historyData, '길이:', historyData.length);
      return { data: historyData, totalItems: historyData.length, allItems: historyData.length };

      return { data: [], totalItems: 0, allItems: 0 };
    } catch (error) {
      console.error('프롬프트 히스토리 조회 오류:', error);
      return { data: [], totalItems: 0, allItems: 0 };
    }
  };



  const handleViewClick = (historyId: string) => {
    if (!selectedPrompt) return;
    
    // 현재 경로 확인하여 적절한 URL 생성
    const currentPath = window.location.pathname;
    let url = '';
    
    if (currentPath.includes('/superadmin/')) {
      url = `/superadmin/prompt-detail?promptId=${selectedPrompt._id}&companyCode=${companyCode}&historyId=${historyId}`;
    } else if (currentPath.includes('/cms/')) {
      // 고객사 CMS 경로 추출 (예: /heredot/cms/)
      const match = currentPath.match(/^\/([^\/]+)\/cms\//);
      if (match) {
        const companyCodeFromPath = match[1];
        url = `/${companyCodeFromPath}/cms/prompt-detail?promptId=${selectedPrompt._id}&companyCode=${companyCode}&historyId=${historyId}`;
      } else {
        // aiclient 경로 (예: /aiclient/heredot/cms/)
        const aiclientMatch = currentPath.match(/^\/aiclient\/([^\/]+)\/cms\//);
        if (aiclientMatch) {
          const companyCodeFromPath = aiclientMatch[1];
          url = `/aiclient/${companyCodeFromPath}/cms/prompt-detail?promptId=${selectedPrompt._id}&companyCode=${companyCode}&historyId=${historyId}`;
        }
      }
    }
    
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('적절한 URL을 생성할 수 없습니다.');
    }
  };

  const handleSave = async () => {
    if (!selectedPrompt || !companyCode) {
      showToast('프롬프트 정보가 없습니다.','error');
      return;
    }

    try {
      const response = await updateAIPrompt({
        id: selectedPrompt._id,
        companyCode: companyCode,
        name: selectedPrompt.name,
        description: selectedPrompt.description,
        content: editableContent,
      });

      devLog('프롬프트 수정 응답:', response);

      const responseData = Array.isArray(response) ? response[0] : response;
      
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 
          responseData.data && typeof responseData.data === 'object' && 
          'statusCode' in responseData.data && responseData.data.statusCode === 200 && 
          'message' in responseData.data && responseData.data.message === 'success') {
        showToast('프롬프트가 저장되었습니다.','success');
        onClose();
      } else {
        showToast('프롬프트 저장에 실패했습니다.','error');
      }
    } catch (error) {
      console.error('프롬프트 저장 실패:', error);
      showToast('저장 중 오류가 발생했습니다.','error');
    }
  };

  const closePopup = () => {
    onClose();
  };

  const handleFullScreenOpen = () => {
    setIsFullScreenOpen(true);
  };

  const handleFullScreenClose = () => {
    setIsFullScreenOpen(false);
  };

  const handleFullScreenApply = async (content: string) => {
    if (!selectedPrompt || !companyCode) {
      showToast('프롬프트 정보가 없습니다.','error');
      return;
    }

    try {
      const response = await updateAIPrompt({
        id: selectedPrompt._id,
        companyCode: companyCode,
        name: selectedPrompt.name,
        description: selectedPrompt.description,
        content: content,
      });

      devLog('프롬프트 수정 응답:', response);

      const responseData = Array.isArray(response) ? response[0] : response;
      
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 
          responseData.data && typeof responseData.data === 'object' && 
          'statusCode' in responseData.data && responseData.data.statusCode === 200 && 
          'message' in responseData.data && responseData.data.message === 'success') {
        showToast('프롬프트가 저장되었습니다.','success');
        // 풀스크린 모달만 닫기 (기본 팝업은 유지)
        setIsFullScreenOpen(false);
        // 업데이트된 내용을 기본 팝업에도 반영
        setEditableContent(content);
      } else {
        showToast('프롬프트 저장에 실패했습니다.','error');
      }
    } catch (error) {
      console.error('프롬프트 저장 실패:', error);
      showToast('저장 중 오류가 발생했습니다.','error');
    }
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
    <>
      <CmsPopup 
        title="AI 프롬프트 관리" 
        isOpen={isOpen} 
        onClose={closePopup} 
        isWide
        backgroundColor="#FFF"
        bottomFloating={
          <PopupFooter>
            <SaveButton onClick={handleSave} disabled={!selectedPrompt}>저장</SaveButton>
            <CancelButton onClick={closePopup}>닫기</CancelButton>
          </PopupFooter>
        }
      >
        <PopupLayout>
          <LeftSection>
            <HeaderRow>
              <LabelTitle>{selectedPrompt?.name || '선택된 항목 없음'}</LabelTitle>
              <FullScreenIcon onClick={handleFullScreenOpen}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                  <path d="M20 20.5V21H20.5V20.5H20ZM15.354 15.146C15.2601 15.0521 15.1328 14.9994 15 14.9994C14.8672 14.9994 14.7399 15.0521 14.646 15.146C14.5521 15.2399 14.4994 15.3672 14.4994 15.5C14.4994 15.6328 14.5521 15.7601 14.646 15.854L15.354 15.146ZM19.5 14.5V20.5H20.5V14.5H19.5ZM20 20H14V21H20V20ZM20.354 20.146L15.354 15.146L14.646 15.854L19.646 20.854L20.354 20.146ZM4 20.5H3.5V21H4V20.5ZM9.354 15.854C9.44789 15.7601 9.50063 15.6328 9.50063 15.5C9.50063 15.3672 9.44789 15.2399 9.354 15.146C9.26011 15.0521 9.13278 14.9994 9 14.9994C8.86722 14.9994 8.73989 15.0521 8.646 15.146L9.354 15.854ZM3.5 14.5V20.5H4.5V14.5H3.5ZM4 21H10V20H4V21ZM4.354 20.854L9.354 15.854L8.646 15.146L3.646 20.146L4.354 20.854ZM20 4.5H20.5V4H20V4.5ZM14.646 9.146C14.5995 9.19249 14.5626 9.24768 14.5375 9.30842C14.5123 9.36916 14.4994 9.43426 14.4994 9.5C14.4994 9.56574 14.5123 9.63084 14.5375 9.69158C14.5626 9.75232 14.5995 9.80751 14.646 9.854C14.6925 9.90049 14.7477 9.93736 14.8084 9.96252C14.8692 9.98768 14.9343 10.0006 15 10.0006C15.0657 10.0006 15.1308 9.98768 15.1916 9.96252C15.2523 9.93736 15.3075 9.90049 15.354 9.854L14.646 9.146ZM20.5 10.5V4.5H19.5V10.5H20.5ZM20 4H14V5H20V4ZM19.646 4.146L14.646 9.146L15.354 9.854L20.354 4.854L19.646 4.146ZM4 4.5V4H3.5V4.5H4ZM8.646 9.854C8.73989 9.94789 8.86722 10.0006 9 10.0006C9.13278 10.0006 9.26011 9.94789 9.354 9.854C9.44789 9.76011 9.50063 9.63278 9.50063 9.5C9.50063 9.36722 9.44789 9.23989 9.354 9.146L8.646 9.854ZM4.5 10.5V4.5H3.5V10.5H4.5ZM4 5H10V4H4V5ZM3.646 4.854L8.646 9.854L9.354 9.146L4.354 4.146L3.646 4.854Z" fill="#888888"/>
                </svg>
              </FullScreenIcon>
            </HeaderRow>
            <SubTitle>{selectedPrompt?.description || '설명이 없습니다'}</SubTitle>
            
            <FormSection>
              <CustomTextarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
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

      {/* 풀스크린 모달 */}
      <FullScreenModal
        isOpen={isFullScreenOpen}
        onClose={handleFullScreenClose}
        onApply={handleFullScreenApply}
        title={selectedPrompt?.name || '프롬프트 상세'}
        description={selectedPrompt?.description}
        content={editableContent}
      />
    </>
  );
};

export default PromptPopup;


// ------------------------ 스타일 ------------------------

const CustomTextarea = styled.textarea`
  flex: 1;
  width: 100%;
  background-color: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.7;
  color: #2c3e50;
  resize: none;
  outline: none;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  cursor: text;
  
  &::placeholder {
    color: #999;
  }
  
  &:focus {
    border-color: ${AppColors.primary};
    background-color: #fff;
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

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 44px;
`;

const LabelTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`;

const FullScreenIcon = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f0f0f0;
  }

  svg {
    transition: opacity 0.2s;
  }

  &:hover svg {
    opacity: 0.7;
  }
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
  border: 1px solid #2C2E3C;
  border-radius: 2px;

  &:hover {
    border-color: #2C2E3C;
  }
`;

const SaveButton = styled(FooterButton)<{ disabled?: boolean }>`
  background-color: #2C2E3C;
  color: ${AppColors.onPrimary};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  border-radius: 2px;
`;


