'use client';

import React, { useEffect, useState } from 'react';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import { Validators } from '@/lib/utils/validators';
import { toast } from 'react-toastify';
import { adminUpdate } from '@/lib/api/admin';
import { AdminUpdateParams } from '@/lib/api/admin/adminApi.types';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';

type AdminUser = {
  _id: string;
  adminId: string;
  name: string;
  email: string;
  cellphone: string;
  createAt: string;
  memo?: string;
  emailYn?: 'Y' | 'N';
  smsYn?: 'Y' | 'N';
  description?: string;
};

interface PasswordPopupProps {
  selectedUser: Partial<AdminUser> | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // 성공 시 콜백 추가
}

const PasswordPopup: React.FC<PasswordPopupProps> = ({ selectedUser, isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [pwdError, setPwdError] = useState<string | null>(null);
  const [confirmPwdError, setConfirmPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setPwdError(null);
      setConfirmPwdError(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedUser._id) {
      toast.error('선택된 사용자가 없습니다.');
      return;
    }

    // 에러 상태 초기화
    setPwdError(null);
    setConfirmPwdError(null);

    let valid = true;

    if (!Validators.password(password)) {
      setPwdError('비밀번호는 숫자, 영문, 특수문자를 포함하여 8자리 이상이어야 합니다.');
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPwdError('비밀번호가 일치하지 않습니다.');
      valid = false;
    }

    if (!valid) return;

    try {
      // 기존 사용자 정보와 새 비밀번호를 함께 전송
      const updateData: AdminUpdateParams = {
        _id: selectedUser._id,
        targetAdminId: selectedUser.adminId || '', // 로그인 ID
        name: selectedUser.name || '',
        email: selectedUser.email || '',
        cellphone: selectedUser.cellphone || '',
        description: selectedUser.description || '',
        password: password, // 새 비밀번호 추가
      };

      const res = await adminUpdate(updateData);

      toast.success('비밀번호가 성공적으로 변경되었습니다.');
      onClose();
      
      // 성공 시 콜백 호출
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (err: any) {
      toast.error(err?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    }
  };
    

  return (
    <CmsPopup
      title=""
      isOpen={isOpen}
      onClose={onClose}
      backgroundColor="#fff"
      isWide={false}
      height="480px"
      hideHeader={true}
    >
      <FormWrapper>
      <TitleText>
          비밀번호 변경
        </TitleText>
        <DescriptionText>
          새 비밀번호를 입력해 주세요. <br />
          계정 보안을 위해 정기적인 변경을 권장합니다.
        </DescriptionText>

        <InputRow>
          <Label>새 비밀번호</Label>
          <CommonTextField
            id="new-password"
            label=""
            value={password}
            autoComplete="new-password"
            showSuffixIcon={true}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (숫자+영문+특수문자 8자리 이상)"
            isPasswordField
            errorMessage={pwdError ?? undefined}
          />
        </InputRow>

        <InputRow>
          <Label>새 비밀번호 확인</Label>
          <CommonTextField
            id="confirm-password"
            label=""
            value={confirmPassword}
            autoComplete="new-password"
            showSuffixIcon={true}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="비밀번호 확인 (비밀번호와 동일하게 작성)"
            isPasswordField
            errorMessage={confirmPwdError ?? undefined}
          />
        </InputRow>

        <ButtonRow>
          <SaveButton onClick={handleSubmit}>저장</SaveButton>
          <CancelButton onClick={onClose}>닫기</CancelButton>
        </ButtonRow>
      </FormWrapper>
    </CmsPopup>
  );
};

export default PasswordPopup;
const FormWrapper = styled.div`
 padding-top : 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  /* padding: 24px 32px; */
  flex-grow: 1;
`;

const DescriptionText = styled.p`
  font-size: 16px;
  color: ${AppColors.onBackgroundGray};
  margin: 0;
  line-height: 1.5;
`;

const TitleText = styled.p`
  font-size: 26px;
  color: ${AppColors.onPrimaryBlack};
  font-weight: 500;
  margin: 0;
`;

const InputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
`;

const Label = styled.label`
  min-width: 120px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  color: ${AppColors.onSurface};
`;

const ButtonRow = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
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
  border: 1px solid ${AppColors.border};
  color: ${AppColors.onPrimary};
`;
