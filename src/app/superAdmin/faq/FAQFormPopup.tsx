'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useToast } from '@/components/common/ToastProvider';
import { devLog } from '@/lib/utils/devLogger';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import { SwitchInput } from '@/components/SwitchInput';
import { AppColors } from '@/styles/colors';
import { createFAQ, updateFAQ, deleteFAQ } from '@/lib/api/admin/adminApi';

// FAQ 타입 정의
type FAQ = {
  _id: string;
  title: string;
  content: string;
  language: 'KOR' | 'ENG';
  createAt: string;
  updateAt: string;
  isPublic?: boolean;
  author?: string;
};

interface FAQFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFAQ: Partial<FAQ> | null;
  onSuccess: () => void;
  companyCode?: string;
}

const FAQFormPopup: React.FC<FAQFormPopupProps> = ({
  isOpen,
  onClose,
  selectedFAQ,
  onSuccess,
  companyCode,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  
  const { show: showToast } = useToast();

  // 폼 초기화
  useEffect(() => {
    if (selectedFAQ) {
      setTitle(selectedFAQ.title || '');
      setContent(selectedFAQ.content || '');
      setIsPublic(selectedFAQ.isPublic !== undefined ? selectedFAQ.isPublic : true);
    } else {
      setTitle('');
      setContent('');
      setIsPublic(true);
    }
    setTitleError(null);
    setContentError(null);
  }, [selectedFAQ, isOpen]);

  const handleSave = async () => {
    let valid = true;

    // 제목 검증
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요.');
      valid = false;
    } else {
      setTitleError(null);
    }

    // 내용 검증
    if (!content.trim()) {
      setContentError('내용을 입력해주세요.');
      valid = false;
    } else {
      setContentError(null);
    }

    if (!valid) return;

    try {
      if (selectedFAQ?._id) {
        // 수정
        devLog('FAQ 수정:', { id: selectedFAQ._id, title, content, isPublic });
        await updateFAQ(selectedFAQ._id, {
          title: title.trim(),
          content: content.trim(),
          isPublic,
          language: 'KOR',
        });
        showToast('FAQ가 성공적으로 수정되었습니다.', 'success');
      } else {
        // 생성
        devLog('FAQ 생성:', { title, content, isPublic, companyCode });
        await createFAQ({
          title: title.trim(),
          content: content.trim(),
          isPublic,
          language: 'KOR',
          companyCode,
        });
        showToast('FAQ가 성공적으로 등록되었습니다.', 'success');
      }
      onSuccess();
    } catch (error) {
      console.error('FAQ 저장 오류:', error);
      const err = error as Error | { customMessage?: string };
      const errorMessage = 'customMessage' in err 
        ? err.customMessage 
        : err instanceof Error 
          ? err.message 
          : 'FAQ 저장에 실패했습니다.';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedFAQ?._id) return;

    if (window.confirm('정말로 이 FAQ를 삭제하시겠습니까?')) {
      try {
        devLog('FAQ 삭제:', selectedFAQ._id);
        await deleteFAQ(selectedFAQ._id);
        showToast('FAQ가 성공적으로 삭제되었습니다.', 'success');
        onSuccess();
      } catch (error) {
        console.error('FAQ 삭제 오류:', error);
        const err = error as Error | { customMessage?: string };
        const errorMessage = 'customMessage' in err 
          ? err.customMessage 
          : err instanceof Error 
            ? err.message 
            : 'FAQ 삭제에 실패했습니다.';
        showToast(errorMessage, 'error');
      }
    }
  };

  return (
    <CmsPopup
      title={selectedFAQ ? "FAQ 수정" : "FAQ 등록"}
      isOpen={isOpen}
      onClose={onClose}
      isWide={false}
      showRequiredMark={true}
      height='auto'
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역: 삭제 버튼 */}
          {selectedFAQ ? (
            <DeleteButton onClick={handleDelete}>
              삭제
            </DeleteButton>
          ) : (
            <div /> // 빈 영역 유지
          )}

          {/* 오른쪽 영역: 저장/닫기 */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={handleSave}>저장</SaveButton>
            <CancelButton onClick={onClose}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        {/* 공개여부 섹션 */}
        <SwitchSection>
          <SectionTitle>공개여부</SectionTitle>
          <SwitchWrapper>
            <SwitchInput
              label=""
              value={isPublic}
              onChange={(newValue) => {
                devLog('📢 공개여부 변경:', isPublic, '->', newValue);
                setIsPublic(newValue);
              }}
              $labelPosition="horizontal"
              labelColor="black"
            />
            {/* <SwitchLabel>{isPublic ? '공개' : '비공개'}</SwitchLabel> */}
          </SwitchWrapper>
        </SwitchSection>

        {/* FAQ 작성 섹션 */}
        <SectionTitle>FAQ 작성</SectionTitle>
        
        <TextArea
          id="faqTitle"
          value={title}
          label="* 질문"
          onChange={(e) => setTitle(e.target.value)}
          placeholder="질문을 입력해주세요"
          height="400px"
          errorMessage={titleError ?? undefined}
        />

        <TextArea
          id="faqContent"
          value={content}
          label="* 답변"
          onChange={(e) => setContent(e.target.value)}
          placeholder="답변을 입력해주세요"
          height="400px"
          errorMessage={contentError ?? undefined}
        />
      </FormContainer>
    </CmsPopup>
  );
};

export default FAQFormPopup;

// 스타일 컴포넌트
const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 14px;
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
  border-radius: 4px;

  &:hover {
    border: 1px solid ${AppColors.border};
  }
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
  border-radius: 4px;
`;

const DeleteButton = styled(FooterButton)`
  background-color: #2C2E3C;
  color: white;
  border: 1px solid #2C2E3C;
  border-radius: 4px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: flex-start;
  padding-top: 10px;
`;

const SwitchSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;

const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SwitchLabel = styled.span`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
  min-width: 100px;
`;
