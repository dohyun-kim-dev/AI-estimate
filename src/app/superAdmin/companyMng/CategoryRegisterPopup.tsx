'use client';
import React, { useState } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import ActionButton from '@/components/ActionButton';
import { toast } from 'react-toastify';
import { createCategory, updateCategory } from '@/lib/api/admin/adminApi';
import { devLog } from '@/utils/devLogger'
import { useToast } from '@/components/common/ToastProvider';

interface CategoryRegisterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any | null;
}

const CategoryRegisterPopup: React.FC<CategoryRegisterPopupProps> = ({ isOpen, onClose, editData }) => {
  const [categoryName, setCategoryName] = useState(editData?.name ?? '');
  const [categoryCode, setCategoryCode] = useState(editData?.code ?? '');
  const { show: showToast } = useToast(); 

  // editData가 변경될 때마다 값 초기화
  React.useEffect(() => {
    if (isOpen) {
      setCategoryName(editData?.name ?? '');
      setCategoryCode(editData?.code ?? '');
      devLog('CategoryRegisterPopup 열림 - editData:', editData);
    }
  }, [editData, isOpen]);

  const handleSave = async () => {
    if (!categoryName) {
      showToast('카테고리명을 입력하세요.','error');
      return;
    }
    if (!editData && !categoryCode) {
      showToast('카테고리코드를 입력하세요.','error');
      return;
    }
    try {
      if (editData) {
        // 수정 - ID 확인 로그 추가
        const categoryId = editData.id || editData._id;
        if (!categoryId) {
          showToast('카테고리 ID를 찾을 수 없습니다.','error');
          return;
        }
        devLog('카테고리 수정 - ID:', categoryId, '데이터:', { name: categoryName, code: categoryCode });
        
        const response = await updateCategory(categoryId, { name: categoryName, code: categoryCode });
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast('카테고리가 수정되었습니다.','success');
          setCategoryName('');
          setCategoryCode('');
          onClose();
        } else {
          // E11000 duplicate key error 처리
          let errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '수정에 실패했습니다.';
          
          // 검증 오류 메시지 한글화
          if (errorMessage.includes('Too big') && errorMessage.includes('<=4 characters')) {
            errorMessage = '카테고리 코드는 4자 이하로 입력해주세요.';
          } else if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
            if (errorMessage.includes('code_1')) {
              errorMessage = '중복된 카테고리 코드입니다.';
            } else if (errorMessage.includes('name_1')) {
              errorMessage = '중복된 카테고리명입니다.';
            } else {
              errorMessage = '중복된 카테고리입니다.';
            }
          }
          showToast(errorMessage,'error');
        }
      } else {
        // 등록
        devLog('카테고리 등록 - 데이터:', { name: categoryName, code: categoryCode });
        
        const response = await createCategory({ name: categoryName, code: categoryCode });
        
        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        
        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data;

        if (apiResponse && apiResponse.statusCode === 200 && apiResponse.message === 'success') {
          showToast('카테고리가 등록되었습니다.','success');
          setCategoryName('');
          setCategoryCode('');
          onClose();
        } else {
          // E11000 duplicate key error 처리
          let errorMessage = apiResponse?.error?.customMessage || apiResponse?.message || '등록에 실패했습니다.';
          
          // 검증 오류 메시지 한글화
          if (errorMessage.includes('Too big') && errorMessage.includes('<=4 characters')) {
            errorMessage = '카테고리 코드는 4자 이하로 입력해주세요.';
          } else if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
            if (errorMessage.includes('code_1')) {
              errorMessage = '중복된 카테고리 코드입니다.';
            } else if (errorMessage.includes('name_1')) {
              errorMessage = '중복된 카테고리명입니다.';
            } else {
              errorMessage = '중복된 카테고리입니다.';
            }
          }
          showToast(errorMessage,'error');
        }
      }
    } catch (error) {
      console.error('카테고리 저장 오류:', error);
      const err = error as Error | { customMessage?: string };
      let errorMessage = 'customMessage' in err
        ? err.customMessage
        : err instanceof Error
          ? err.message
          : '카테고리 저장 중 오류가 발생했습니다.';
      
      // 검증 오류 메시지 한글화
      if (errorMessage.includes('Too big') && errorMessage.includes('<=4 characters')) {
        errorMessage = '카테고리 코드는 4자 이하로 입력해주세요.';
      } else if (errorMessage.includes('E11000') && errorMessage.includes('duplicate key')) {
        if (errorMessage.includes('code_1')) {
          errorMessage = '중복된 카테고리 코드입니다.';
        } else if (errorMessage.includes('name_1')) {
          errorMessage = '중복된 카테고리명입니다.';
        } else {
          errorMessage = '중복된 카테고리입니다.';
        }
      }

      showToast(errorMessage,'error');
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
          readOnly={!!editData}
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
