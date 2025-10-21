'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import { AppColors } from '@/styles/colors';
import { createAIPrompt, updateAIPrompt, deleteAIPrompt } from '@/lib/api/admin/adminApi';
import { useToast } from '@/components/common/ToastProvider';

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 0 14px;
`;

const Title = styled.h2`
  margin: 10px 0;
  padding: 0;
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurface};
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
`;

const SaveButton = styled(FooterButton)`
  background-color: #2C2E3C;
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
  border-radius: 4px;
`;

const DeleteButton = styled(FooterButton)`
  background-color: #dc3545;
  color: white;
  border-radius: 4px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 22px;
  justify-content: space-evenly;
  padding-top: 10px;
`;

type Prompt = {
  _id: string;
  name: string;
  description: string;
  content: string;
  createBy: string;
  createAt: string;
  updateAt: string;
};

interface PromptFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedPrompt: Partial<Prompt> | null;
  companyCode: string;
}

const PromptFormPopup: React.FC<PromptFormPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedPrompt,
  companyCode,
}) => {
  const { show: showToast } = useToast(); 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPrompt) {
      setName(selectedPrompt.name || '');
      setDescription(selectedPrompt.description || '');
      setContent(selectedPrompt.content || '');
    } else {
      // 새로운 프롬프트
      setName('');
      setDescription('');
      setContent('');
    }
    // 에러 초기화
    setNameError(null);
    setDescriptionError(null);
    setContentError(null);
  }, [selectedPrompt, isOpen]);

  const handleSave = async () => {
    let valid = true;

    if (!name.trim()) {
      setNameError('프롬프트명을 입력해주세요.');
      valid = false;
    } else {
      setNameError(null);
    }

    if (!description.trim()) {
      setDescriptionError('프롬프트 설명을 입력해주세요.');
      valid = false;
    } else {
      setDescriptionError(null);
    }

    if (!content.trim()) {
      setContentError('프롬프트 내용을 입력해주세요.');
      valid = false;
    } else {
      setContentError(null);
    }

    if (!valid) return;

    try {
      if (selectedPrompt && selectedPrompt._id) {
        // 수정
        await updateAIPrompt({
          id: selectedPrompt._id,
          companyCode,
          name: name.trim(),
          description: description.trim(),
          content: content.trim(),
        });
        showToast('프롬프트가 수정되었습니다.','success');
      } else {
        // 생성
        await createAIPrompt({
          companyCode,
          name: name.trim(),
          description: description.trim(),
          content: content.trim(),
        });
        showToast('프롬프트가 생성되었습니다.','success');
      }
      onSave();
    } catch (error: any) {
      const errorMessage = error?.message || '저장에 실패했습니다.';
      showToast(errorMessage,'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedPrompt?._id) return;

    if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
      try {
        await deleteAIPrompt({
          id: selectedPrompt._id,
          companyCode,
        });
        showToast('프롬프트가 삭제되었습니다.','success');
        onSave();
      } catch (error: any) {
        const errorMessage = error?.message || '삭제에 실패했습니다.';
        showToast(errorMessage,'error');
      }
    }
  };

  return (
    <CmsPopup
      title={selectedPrompt ? "프롬프트 수정" : "프롬프트 생성"}
      isOpen={isOpen}
      onClose={onClose}
      isWide={false}
      showRequiredMark={true}
      height='auto'
      backgroundColor="white"
      bottomFloating={
        <PopupFooter>
          {/* 왼쪽 영역: 삭제 버튼 */}
          {selectedPrompt ? (
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
        <Title>프롬프트 정보</Title>
        
        <CommonTextField
          id="name"
          value={name}
          label="* 프롬프트명"
          onChange={(e) => setName(e.target.value)}
          placeholder="프롬프트명을 입력하세요"
          errorMessage={nameError ?? undefined}
        />

        <CommonTextField
          id="description"
          value={description}
          label="* 프롬프트 설명"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="프롬프트 설명을 입력하세요"
          errorMessage={descriptionError ?? undefined}
        />

        <Title>프롬프트 내용</Title>

        <TextArea
          id="content"
          value={content}
          label="* 프롬프트 내용"
          onChange={(e) => setContent(e.target.value)}
          placeholder="프롬프트 내용을 입력하세요"
          height="300px"
          errorMessage={contentError ?? undefined}
        />
      </FormContainer>
    </CmsPopup>
  );
};

export default PromptFormPopup;
