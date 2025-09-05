'use client';

import React, { useEffect, useState } from 'react';
import CmsPopup from '@/components/CmsPopup';
import { TextField } from '@/components/TextField';
import { Validators } from '@/lib/utils/validators';
import { toast } from 'react-toastify';
import { adminPasswordUpdate } from '@/lib/api/admin';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';

interface PasswordPopupProps {
  adminId: string;
  isOpen: boolean;
  onClose: () => void;
}

const PasswordPopup: React.FC<PasswordPopupProps> = ({ adminId, isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

    const [pwdError, setPwdError] = useState<string | null>(null);
    const [confirmPwdError, setConfirmPwdError] = useState<string | null>(null);


    useEffect(() => {
      if (isOpen) {
        setPassword('');
        setConfirmPassword('');
        setPwdError(null);             // ✅ 추가
        setConfirmPwdError(null);      // ✅ 추가
      }
    }, [isOpen]);
    
    const handleSubmit = async () => {
      // ✅ 에러 상태 초기화
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
        const res = await adminPasswordUpdate({
          targetAdminId: adminId,
          password,
        });
    
        if (res?.[0]?.message === 'success') {
          toast.success('비밀번호가 성공적으로 변경되었습니다.');
          onClose();
        } else {
          toast.error(res?.[0]?.error?.customMessage || '비밀번호 변경에 실패했습니다.');
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
          <TextField
            radius="0"
            value={password}
            autoComplete="new-password"
            labelColor="black"
            showSuffixIcon= {true}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (숫자+영문+특수문자 8자리 이상)"
            isPasswordField
            errorMessage={pwdError ?? undefined}
          />
        </InputRow>

        <InputRow>
          <Label>새 비밀번호 확인</Label>
          <TextField
            radius="0"
            value={confirmPassword}
            autoComplete="new-password"
            labelColor="black"
            showSuffixIcon= {true}
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
