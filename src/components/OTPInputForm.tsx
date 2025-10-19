import { useState } from 'react';
import styled from 'styled-components';

interface OTPInputFormProps {
  onOtpSubmit: (otp: string) => void;
  description?: string;
}

const OTPInputForm = ({ 
  onOtpSubmit, 
  description = '구글 OTP앱에서 확인한 6자리 인증코드를 입력해주세요.' 
}: OTPInputFormProps) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useState<(HTMLInputElement | null)[]>([])[0];

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // 숫자만 입력 허용

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // 마지막 한 글자만 허용
    setOtp(newOtp);

    // 값이 입력되면 다음 칸으로 이동
    if (value && index < otp.length - 1) {
      inputRefs[index + 1]?.focus();
    }

    // 모든 칸이 채워지면 OTP 제출
    if (newOtp.every((char) => char !== '')) {
      onOtpSubmit(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1]?.focus();
    }
  };

  return (
    <OtpFormContainer>
      <OtpDescription>{description}</OtpDescription>
      <OtpInputsWrapper>
        {otp.map((char, index) => (
          <OtpBox
            key={index}
            type="text"
            maxLength={1}
            value={char}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(el) => {
              if (el) inputRefs[index] = el;
            }}
            autoFocus={index === 0}
          />
        ))}
      </OtpInputsWrapper>
    </OtpFormContainer>
  );
};

export default OTPInputForm;

// Styled Components
const OtpFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
`;

const OtpInputsWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 0px;
`;

const OtpBox = styled.input`
  width: 45px;
  height: 55px;
  background-color: #F7F7F7;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  border: none;
  border-radius: 0px;
  outline: none;
  transition: border-color 0.2s ease;
color: #000;
  &:focus {
    border-color: #000;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const OtpDescription = styled.p`
  margin-top: 0px;
  margin-bottom: 32px;
  color: #6c6969;
  font-size: 13px;
  text-align: center;
  line-height: 1.5;
`;
