'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import ActionButton from '@/components/ActionButton';
import { toast } from 'react-toastify';

interface CategoryRegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryRegisterPopup: React.FC<CategoryRegisterPopupProps> = ({ isOpen, onClose }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryCode, setCategoryCode] = useState('');

  const handleSave = () => {
    // TODO: 카테고리 등록 API 호출
    toast.success('카테고리가 등록되었습니다.');
    setCategoryName('');
    setCategoryCode('');
    onClose();
  };

  return (
    <CmsPopup
      title="카테고리 등록"
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      backgroundColor="#FFF"
      bottomFloating={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px' }}>
          <ActionButton $themeMode="light" onClick={handleSave}>저장</ActionButton>
          <ActionButton $themeMode="light" onClick={onClose}>닫기</ActionButton>
        </div>
      }
    >
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <RequiredText>* 필수항목</RequiredText>
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
    </CmsPopup>
  );
};

const RequiredText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: right;
`;

export default CategoryRegisterPopup;
