'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';
import { useToast } from '@/components/common/ToastProvider';

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

const FieldLabel = styled.label<{ $required?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${AppColors.onSurface};
  
  ${({ $required }) => $required && `
    &::after {
      content: ' *';
      color: ${AppColors.error};
    }
  `}
`;

const PopupFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
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
  color: #ffffff;
  
  &:disabled {
    background-color: ${AppColors.disabled};
    cursor: not-allowed;
  }
`;

const SelectField = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid ${({ $hasError }) => $hasError ? AppColors.error : AppColors.border};
  border-radius: 6px;
  font-size: 14px;
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  
  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
  
  &:disabled {
    background-color: ${AppColors.disabled};
    color: ${AppColors.onSurfaceVariant};
    cursor: not-allowed;
  }
`;

const CheckboxField = styled.input`
  width: 20px;
  height: 20px;
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: ${AppColors.onSurface};
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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

const SwitchLabel = styled.span<{ $isOn: boolean }>`
  font-size: 14px;
  color: ${({ $isOn }) => $isOn ? AppColors.primary : AppColors.onSurfaceVariant};
  font-weight: ${({ $isOn }) => $isOn ? 'bold' : 'normal'};
`;

const NumberInput = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid ${({ $hasError }) => $hasError ? AppColors.error : AppColors.border};
  border-radius: 6px;
  font-size: 14px;
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  
  &:focus {
    outline: none;
    border-color: ${AppColors.primary};
  }
  
  &:disabled {
    background-color: ${AppColors.disabled};
    color: ${AppColors.onSurfaceVariant};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: ${AppColors.error};
  font-size: 12px;
  margin-top: 4px;
`;

interface PriceEditPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  selectedItem: any;
  columnsInfo: any[];
}

const PriceEditPopup: React.FC<PriceEditPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedItem,
  columnsInfo
}) => {
  const { show: showToast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // 폼 데이터 초기화
  useEffect(() => {
    if (selectedItem && columnsInfo.length > 0) {
      const initialData: Record<string, any> = {};
      
      columnsInfo.forEach(column => {
        const value = selectedItem[column.name];
        
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
      await onSave(formData);
      showToast('성공적으로 저장되었습니다.', 'success');
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      showToast('저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 컬럼 정보를 orderNo로 정렬
  const sortedColumns = [...columnsInfo].sort((a, b) => (a.orderNo || 0) - (b.orderNo || 0));

  // 동적 필드 렌더링
  const renderField = (column: any) => {
    const { name, type, required } = column;
    const value = formData[name] || '';
    const hasError = !!errors[name];
    
    switch (type) {
      case 'boolean':
        return (
          <SwitchContainer>
            <SwitchButton
              $isOn={Boolean(value)}
              onClick={() => handleFieldChange(name, !Boolean(value), type)}
            />
            <SwitchLabel $isOn={Boolean(value)}>
              {Boolean(value) ? '예' : '아니오'}
            </SwitchLabel>
          </SwitchContainer>
        );
        
      case 'number':
        return (
          <NumberInput
            type="text"
            value={String(value)}
            onChange={(e) => handleFieldChange(name, e.target.value, type)}
            placeholder={`${name}을(를) 입력하세요 (숫자만)`}
            $hasError={hasError}
            inputMode="decimal"
            pattern="[0-9]*"
          />
        );
        
      default: // string, text 등
        if (name === '설명' || name === '메모' || name.includes('description')) {
          return (
            <TextField
              value={String(value)}
              onChange={(e) => handleFieldChange(name, e.target.value, type)}
              placeholder={`${name}을(를) 입력하세요`}
              multiline
              minLines={3}
              maxLines={6}
              $inputBackgroundColor="#ffffff"
              $borderColor={hasError ? AppColors.error : AppColors.border}
            />
          );
        } else {
          return (
            <TextField
              value={String(value)}
              onChange={(e) => handleFieldChange(name, e.target.value, type)}
              placeholder={`${name}을(를) 입력하세요`}
              $inputBackgroundColor="#ffffff"
              $borderColor={hasError ? AppColors.error : AppColors.border}
              readOnly={name === 'id'} // id 필드는 읽기 전용
            />
          );
        }
    }
  };

  return (
    <CmsPopup
      title="단가표 항목 편집"
      isOpen={isOpen}
      onClose={onClose}
      backgroundColor="#ffffff"
      showRequiredMark={true}
      bottomFloating={
        <PopupFooter>
          <CancelButton onClick={onClose} disabled={isLoading}>
            취소
          </CancelButton>
          <SaveButton onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </SaveButton>
        </PopupFooter>
      }
    >
      <FormContainer>
        {sortedColumns.map((column) => (
          <FormRow key={column.name}>
            <FieldLabel $required={column.required}>
              {column.name}
              {column.type !== 'string' && (
                <span style={{ color: AppColors.onSurfaceVariant, fontSize: '12px', marginLeft: '8px' }}>
                  ({column.type === 'number' ? '숫자' : 
                    column.type === 'boolean' ? '참/거짓' : 
                    column.type})
                </span>
              )}
            </FieldLabel>
            {renderField(column)}
            {errors[column.name] && (
              <ErrorMessage>{errors[column.name]}</ErrorMessage>
            )}
          </FormRow>
        ))}
      </FormContainer>
    </CmsPopup>
  );
};

export default PriceEditPopup;
