'use client';
import React from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { AppColors } from '@/styles/colors';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 16px;
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
  color: ${AppColors.onPrimary};
  border: 1px solid ${AppColors.border};
`;

type Customer = {
  id: string;
  name: string;
  ceo: string;
  businessNo: string;
  adminId: string;
  email: string;
  cellphone: string;
  address: string;
  description: string;
  createdTime: string | null;
  lastLoginTime: string | null;
};

interface CompanyFormPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedCustomer: Partial<Customer> | null;
  formData: {
    customerId: string;
    password: string;
    confirmPassword: string;
    name: string;
    ceo: string;
    businessNo: string;
    adminId: string;
    email: string;
    cellphone: string;
    address: string;
    description: string;
    pwdError: string | null;
    confirmPwdError: string | null;
  };
  onFormChange: {
    setCustomerId: (value: string) => void;
    setPassword: (value: string) => void;
    setConfirmPassword: (value: string) => void;
    setName: (value: string) => void;
    setCeo: (value: string) => void;
    setBusinessNo: (value: string) => void;
    setAdminId: (value: string) => void;
    setEmail: (value: string) => void;
    setCellphone: (value: string) => void;
    setAddress: (value: string) => void;
    setDescription: (value: string) => void;
  };
}

const CompanyFormPopup: React.FC<CompanyFormPopupProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedCustomer,
  formData,
  onFormChange,
}) => {
  const {
    customerId,
    password,
    confirmPassword,
    name,
    ceo,
    businessNo,
    adminId,
    email,
    cellphone,
    address,
    description,
    pwdError,
    confirmPwdError,
  } = formData;

  const {
    setCustomerId,
    setPassword,
    setConfirmPassword,
    setName,
    setCeo,
    setBusinessNo,
    setAdminId,
    setEmail,
    setCellphone,
    setAddress,
    setDescription,
  } = onFormChange;

  return (
    <CmsPopup
      title="고객사 등록/수정"
      isOpen={isOpen}
      onClose={onClose}
      showRequiredMark
      bottomFloating={
        <PopupFooter>
          <div />
          <div style={{ display: 'flex', gap: '12px' }}>
            <SaveButton onClick={onSave}>저장</SaveButton>
            <CancelButton onClick={onClose}>닫기</CancelButton>
          </div>
        </PopupFooter>
      }
    >
      <FormContainer>
        <TextField
          radius="0"
          value={customerId}
          label="* 고객사 ID"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setCustomerId(e.target.value)}
          placeholder="고객사 고유 ID를 입력하세요"
          readOnly={!!selectedCustomer}
        />

        {/* 신규 등록 시: 비밀번호/비밀번호 확인 */}
        {!selectedCustomer && (
          <>
            <TextField
              radius="0"
              value={password}
              showSuffixIcon
              label="* 비밀번호"
              $labelPosition="horizontal"
              labelColor="white"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문 + 숫자 + 특수문자 1개 포함 8자리 이상"
              isPasswordField
              errorMessage={pwdError ?? undefined}
            />

            <TextField
              radius="0"
              value={confirmPassword}
              showSuffixIcon
              label="* 비밀번호 확인"
              $labelPosition="horizontal"
              labelColor="white"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              isPasswordField
              errorMessage={confirmPwdError ?? undefined}
            />
          </>
        )}

        <TextField
          radius="0"
          value={name}
          label="* 고객사명"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setName(e.target.value)}
          placeholder="고객사명을 입력하세요"
        />
        <TextField
          radius="0"
          value={ceo}
          label="대표명"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setCeo(e.target.value)}
          placeholder="대표자명을 입력하세요"
        />
        <TextField
          radius="0"
          value={businessNo}
          label="사업자번호"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setBusinessNo(e.target.value)}
          placeholder="사업자등록번호를 입력하세요 (예: 123-45-67890)"
        />
        <TextField
          radius="0"
          value={email}
          label="이메일"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 형식으로 입력하세요"
        />
        <TextField
          radius="0"
          value={cellphone}
          label="연락처"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => {
            const input = e.target.value;
            if (/^\d*$/.test(input)) setCellphone(input);
          }}
          placeholder="- 없이 숫자만 입력"
        />
        <TextField
          radius="0"
          value={address}
          label="주소"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setAddress(e.target.value)}
          placeholder="도로명/상세주소 입력"
        />
        <TextField
          radius="0"
          value={description}
          label="비고"
          $labelPosition="horizontal"
          labelColor="white"
          onChange={(e) => setDescription(e.target.value)}
          placeholder="기타 참고 사항 입력"
          multiline
          minLines={3}
        />
      </FormContainer>
    </CmsPopup>
  );
};

export default CompanyFormPopup;
