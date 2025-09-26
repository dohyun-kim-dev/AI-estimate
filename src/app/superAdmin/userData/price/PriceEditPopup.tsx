'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import Modal from '@/components/common/Modal';
import TextField from '@/components/common/TextField';
import { AppColors } from '@/styles/colors';
import { useToast } from '@/components/common/ToastProvider';
import { deleteUnitPrice } from '@/lib/api/admin/adminApi';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
  padding: 24px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const LeftButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const RightButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const FooterButton = styled.button`
  width: 120px;
  height: 48px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const DeleteButton = styled(FooterButton)`
  background-color: #393C53;
  color: #ffffff;
  
  &:hover:not(:disabled) {
    background-color: #1a1a45;
  }
`;

const CancelButton = styled(FooterButton)`
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid #393C53;
  &:hover:not(:disabled) {
    background-color: #f5f5f5;
  }
`;

const SaveButton = styled(FooterButton)`
  background-color: #393C53;
  color: #ffffff;
  
  &:hover:not(:disabled) {
    background-color: #1a1a45;
  }
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 56px;
  padding: 0 14px;
  border: 1px solid ${AppColors.border};
  border-radius: 4px;
  background-color: #ffffff;
`;

const SwitchButton = styled.div<{ $isOn: boolean }>`
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $isOn }) => $isOn ? AppColors.primary : AppColors.border};
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $isOn }) => $isOn ? '26px' : '2px'};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #ffffff;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const SwitchFieldContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SwitchFloatingLabel = styled.label`
  position: absolute;
  top: -10px;
  left: 12px;
  margin-top: 3px;
  padding: 0 4px;
  font-size: 12px;
  color: #666666;
  background: #ffffff;
  z-index: 1;
`;

const SwitchLabel = styled.span<{ $isOn: boolean }>`
  font-size: 14px;
  color: ${({ $isOn }) => $isOn ? AppColors.primary : AppColors.onSurfaceVariant};
  font-weight: ${({ $isOn }) => $isOn ? 'bold' : 'normal'};
`;

// 삭제 확인 모달 스타일
const DeleteModalContent = styled.div`
  text-align: center;
  padding: 10px 0 0 0;
`;

const DeleteModalDescription = styled.p`
  font-size: 14px;
  color: ${AppColors.onSurfaceVariant};
  margin: 0px 0 32px 0;
  line-height: 1.5;
    width: 100%;
`;

const DeleteModalButtons = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const DeleteModalButton = styled.button<{ $isDelete?: boolean }>`
  width: 100%;
  padding: 12px 24px;
  border-radius: 2px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: none;
  min-width: 80px;
  
  ${({ $isDelete }) => $isDelete ? `
    background-color: #202055;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #1a1a45;
    }
  ` : `
    background-color: white;
    color: ${AppColors.onSurface};
    border: 1px solid ${AppColors.border};
    
    &:hover:not(:disabled) {
      background-color: #f5f5f5;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface PriceEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: (id: string) => Promise<void>; // 삭제 콜백 추가
  selectedItem: any;
  columnsInfo: any[];
  selectedCompanyCode?: string; // 회사 코드 추가
}

const PriceEditPopup: React.FC<PriceEditPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedItem,
  columnsInfo,
  selectedCompanyCode
}) => {
  const { show: showToast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // 삭제 확인 모달 상태

  // 폼 데이터 초기화
  useEffect(() => {
    if (columnsInfo.length > 0) {
      const initialData: Record<string, any> = {};
      
      // 수정 모드인지 확인 (selectedItem에 id가 있고 빈 값이 아닌 경우)
      const isEditMode = selectedItem && selectedItem.id && selectedItem.id !== '';
      
      // 수정 모드일 때는 id도 포함
      columnsInfo.forEach(column => {
        if (column.name === 'id' && !isEditMode) {
          // 신규 추가 모드일 때는 id 제외
          return;
        }
        
        const value = selectedItem ? selectedItem[column.name] : undefined;
        
        // 타입에 따른 초기값 설정
        switch (column.type) {
          case 'number':
            initialData[column.name] = value !== undefined && value !== null ? Number(value) : '';
            break;
          case 'boolean':
            initialData[column.name] = Boolean(value);
            break;
          default:
            initialData[column.name] = value !== undefined && value !== null ? String(value) : '';
        }
      });
      
      // 수정 시 id 추가 (API 전송용)
      if (selectedItem && selectedItem.id) {
        initialData.id = selectedItem.id;
      }
      
      setFormData(initialData);
      setErrors({});
    }
  }, [selectedItem, columnsInfo]);

  // 필드 값 변경 핸들러
  const handleFieldChange = (columnName: string, value: any, columnType: string) => {
    let processedValue = value;
    
    // 타입에 따른 값 처리
    switch (columnType) {
      case 'number':
        // 숫자만 허용 (빈 문자열, 숫자, 소수점 허용)
        if (value === '') {
          processedValue = '';
        } else if (typeof value === 'string') {
          // 숫자, 소수점, 음수 기호만 허용
          const numericValue = value.replace(/[^0-9.-]/g, '');
          // 소수점과 음수 기호가 올바른 위치에 있는지 확인
          if (/^-?\d*\.?\d*$/.test(numericValue)) {
            processedValue = numericValue;
          } else {
            return; // 유효하지 않은 입력은 무시
          }
        } else {
          processedValue = Number(value);
        }
        break;
      case 'boolean':
        processedValue = Boolean(value);
        break;
      default:
        processedValue = String(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [columnName]: processedValue
    }));
    
    // 에러 메시지 제거
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[columnName];
        return newErrors;
      });
    }
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    columnsInfo.forEach(column => {
      const value = formData[column.name];
      
      // 필수 필드 검사
      if (column.required && (value === undefined || value === null || value === '')) {
        newErrors[column.name] = '필수 항목입니다.';
        return;
      }
      
      // 타입 검사 (값이 있을 때만)
      if (value !== undefined && value !== null && value !== '') {
        switch (column.type) {
          case 'number':
            const numValue = Number(value);
            if (isNaN(numValue) || (typeof value === 'string' && value.trim() === '')) {
              newErrors[column.name] = '올바른 숫자를 입력해주세요.';
            }
            break;
          // 다른 타입 검증은 필요에 따라 추가
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) {
      showToast('입력 내용을 확인해주세요.', 'error');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('=== PriceEditPopup handleSave START ===');
      await onSave(formData);
      console.log('=== PriceEditPopup onSave completed ===');
      
      // 테이블 새로고침이 완료된 후 팝업 닫기 (약간의 지연)
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!selectedItem?.id || !selectedCompanyCode) {
      showToast('삭제할 수 없는 항목입니다.', 'error');
      return;
    }

    // 삭제 확인 모달 열기
    setShowDeleteModal(true);
  };

  // 실제 삭제 실행
  const handleConfirmDelete = async () => {
    if (!selectedItem?.id || !selectedCompanyCode) {
      showToast('삭제할 수 없는 항목입니다.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== 삭제 API 호출 START ===', { id: selectedItem.id, companyCode: selectedCompanyCode });
      
      const response = await deleteUnitPrice(selectedItem.id, selectedCompanyCode);
      
      // API 응답 처리
      const actualResponse = Array.isArray(response) ? response[0] : response;
      const apiResponse = (actualResponse as any)?.data;
      
      console.log('삭제 API 응답:', apiResponse);
      
      if (apiResponse && (apiResponse.statusCode === 200 || apiResponse.statusCode === "200") && apiResponse.message === 'success') {
        showToast('삭제되었습니다.', 'success');
        
        // 부모 컴포넌트의 삭제 콜백 호출 (테이블 새로고침용)
        if (onDelete) {
          await onDelete(selectedItem.id);
        }
        
        setShowDeleteModal(false);
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        throw new Error(apiResponse?.error?.customMessage || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const err = error as Error | { customMessage?: string };
      const errorMessage = 'customMessage' in err 
        ? err.customMessage 
        : err instanceof Error 
          ? err.message 
          : '삭제에 실패했습니다.';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 컬럼 정보를 orderNo로 정렬하고 수정 모드가 아닐 때만 id 필드 제외
  const isEditMode = selectedItem && selectedItem.id && selectedItem.id !== '';
  const sortedColumns = [...columnsInfo]
    .filter(column => {
      // 신규 추가 모드일 때만 id 필드 제외
      if (column.name === 'id' && !isEditMode) {
        return false;
      }
      return true;
    })
    .sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));

  // Footer 버튼 렌더링
  const renderFooter = () => (
    <PopupFooter>
      <LeftButtons>
        {isEditMode && (
          <DeleteButton onClick={handleDelete} disabled={isLoading}>
            {isLoading ? '삭제 중...' : '삭제'}
          </DeleteButton>
        )}
      </LeftButtons>
      <RightButtons>

        <SaveButton onClick={handleSave} disabled={isLoading}>
          {isLoading ? '저장 중...' : '저장'}
        </SaveButton>
        <CancelButton onClick={onClose} disabled={isLoading}>
          닫기
        </CancelButton>
      </RightButtons>
    </PopupFooter>
  );

  // 동적 필드 렌더링
  const renderField = (column: any) => {
    const { name, type, required } = column;
    const value = formData[name] || '';
    const hasError = !!errors[name];
    
    switch (type) {
      case 'boolean':
        return (
          <SwitchFieldContainer>
            <SwitchFloatingLabel>{name}</SwitchFloatingLabel>
            <SwitchContainer style={{ borderColor: hasError ? AppColors.error : AppColors.border }}>
              <SwitchButton
                $isOn={Boolean(value)}
                onClick={() => handleFieldChange(name, !Boolean(value), type)}
              />
              <SwitchLabel $isOn={Boolean(value)}>
                {Boolean(value) ? '예' : '아니오'}
              </SwitchLabel>
              {hasError && (
                <span style={{ color: AppColors.error, fontSize: '12px', marginLeft: 'auto' }}>
                  {errors[name]}
                </span>
              )}
            </SwitchContainer>
          </SwitchFieldContainer>
        );
        
      case 'number':
        return (
          <TextField
            id={`field-${name}`}
            label={name}
            type="text"
            value={value === '' ? '' : String(value)}
            onChange={(e) => handleFieldChange(name, e.target.value, type)}
            placeholder={`${name}을(를) 입력하세요 (숫자만)`}
            $inputBackgroundColor="#ffffff"
            $borderColor={hasError ? AppColors.error : AppColors.border}
            inputMode="decimal"
            pattern="[0-9]*"
            errorMessage={errors[name]}
          />
        );
        
      default: // string, text 등
        if (name === '설명' || name === '메모' || name.includes('description')) {
          return (
            <TextField
              id={`field-${name}`}
              label={name}
              value={String(value)}
              onChange={(e) => handleFieldChange(name, e.target.value, type)}
              placeholder={`${name}을(를) 입력하세요`}
              multiline
              minLines={6}
              maxLines={10}
              $inputBackgroundColor="#ffffff"
              $borderColor={hasError ? AppColors.error : AppColors.border}
              errorMessage={errors[name]}
            />
          );
        } else {
          return (
            <TextField
              id={`field-${name}`}
              label={name}
              value={String(value)}
              onChange={(e) => handleFieldChange(name, e.target.value, type)}
              placeholder={name === 'id' ? 'ID (자동생성)' : `${name}을(를) 입력하세요`}
              $inputBackgroundColor={name === 'id' ? '#f5f5f5' : '#ffffff'}
              $borderColor={hasError ? AppColors.error : AppColors.border}
              readOnly={name === 'id'} // id 필드는 읽기 전용
              errorMessage={errors[name]}
            />
          );
        }
    }
  };

  return (
    <>
      <CmsPopup
        title="단가표 항목 편집"
        isOpen={isOpen}
        onClose={onClose}
        backgroundColor="#ffffff"
        showRequiredMark={true}
        bottomFloating={renderFooter()}
      >
        <FormContainer>
          {sortedColumns.map((column) => (
            <FormRow key={column.name}>
              {renderField(column)}
            </FormRow>
          ))}
        </FormContainer>
      </CmsPopup>

      {/* 삭제 확인 모달 */}
      <Modal
        open={showDeleteModal}
        title="해당 단가표 정보를 삭제하시겠습니까?"
        onClose={() => setShowDeleteModal(false)}
        width={400}
        centerTitle={true}
      >
        <DeleteModalContent>
          <DeleteModalDescription>
            삭제한 단가표는 복구할 수 없습니다.<br />
            계속 진행하시려면 '삭제' 버튼을 눌러주세요.
          </DeleteModalDescription>
          <DeleteModalButtons>
            <DeleteModalButton 
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              취소
            </DeleteModalButton>
            <DeleteModalButton 
              $isDelete={true}
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? '삭제 중...' : '삭제'}
            </DeleteModalButton>
          </DeleteModalButtons>
        </DeleteModalContent>
      </Modal>
    </>
  );
};

export default PriceEditPopup;
