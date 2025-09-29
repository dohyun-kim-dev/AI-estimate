'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import ActionButton from '@/components/ActionButton';
import { toast } from 'react-toastify';
import { createCategory, updateCategory } from '@/lib/api/admin/adminApi';

interface CategoryRegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any | null;
}

const CategoryRegisterPopup: React.FC<CategoryRegisterPopupProps> = ({ isOpen, onClose, editData }) => {
  const [categoryName, setCategoryName] = useState(editData?.name ?? '');
  const [categoryCode, setCategoryCode] = useState(editData?.code ?? '');

  // editData가 변경될 때마다 값 초기화
  React.useEffect(() => {
    if (isOpen) {
      setCategoryName(editData?.name ?? '');
      setCategoryCode(editData?.code ?? '');
      console.log('CategoryRegisterPopup 열림 - editData:', editData);
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!categoryName) {
      toast.error('카테고리명을 입력하세요.');
      return;
    }
    if (!editData && !categoryCode) {
      toast.error('카테고리코드를 입력하세요.');
      return;
    }
    try {
      if (editData) {
        // 수정 - ID 확인 로그 추가
        console.log('카테고리 수정 - ID:', editData._id, '데이터:', { name: categoryName, code: categoryCode });
        await updateCategory(editData._id, { name: categoryName, code: categoryCode });
        toast.success('카테고리가 수정되었습니다.');
      } else {
        // 등록
        console.log('카테고리 등록 - 데이터:', { name: categoryName, code: categoryCode });
        await createCategory({ name: categoryName, code: categoryCode });
        toast.success('카테고리가 등록되었습니다.');
      }
      setCategoryName('');
      setCategoryCode('');
      onClose();
    } catch (error) {
      console.error('카테고리 저장 오류:', error);
      toast.error('카테고리 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <CmsPopup
      title={editData ? "카테고리 수정" : "카테고리 등록"}
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      backgroundColor="#FFF"
    
    >
      <div style={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
        <CommonTextField
          id="categoryName"
          value={categoryName}
          label="* 카테고리명"
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="카테고리명을 입력하세요"
        />
        <CommonTextField
          id="categoryCode"
          value={categoryCode}
          label="* 카테고리코드"
          onChange={(e) => setCategoryCode(e.target.value)}
          placeholder="카테고리코드를 입력하세요"
        />
      </div>
        <BottomButtonRow>
    <SaveButton onClick={handleSave}>{editData ? '수정' : '저장'}</SaveButton>
    <CloseButton onClick={onClose}>닫기</CloseButton>
      </BottomButtonRow>
    </CmsPopup>
  );
};

const RequiredText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: right;
`;



const BottomButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
  padding: 0;
`;

const SaveButton = styled.button`
  background: #2C2E3C;
  color: #fff;
  border: 1px solid #2C2E3C;
  border-radius: 2px;
  padding: 9px 53px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: #fff;
  color: #2C2E3C;
  border: 1px solid #2C2E3C;
  border-radius: 2px;
  padding: 9px 53px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f5f5f5;
  }
`;


export default CategoryRegisterPopup;
