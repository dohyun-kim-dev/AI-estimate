'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { TextField } from '@/components/TextField';
import { companyCMSLoginService } from '@/lib/services/companyCMSLoginService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import CommonButton from '@/components/CommonButton';
import { toast, ToastContainer } from 'react-toastify';
import styled from 'styled-components';

export default function CompanyCMSLoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { companyCode } = useParams<{ companyCode: string }>();

  const navigate = useNavigate();
  const { login, isLoggedIn } = useAdminAuth();

  // 이미 로그인된 상태라면 CMS로 리다이렉트
  useEffect(() => {
    if (isLoggedIn && companyCode) {
      navigate(`/${companyCode}/cms/admin-management`, { replace: true });
    }
  }, [isLoggedIn, navigate, companyCode]);

  const userIdRegex = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,20}$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?~^<>,.&+=])[A-Za-z\d$@$!%*#?~^<>,.&+=]{8,}$/;

  const handleLogin = async () => {
    // 중복 요청 방지
    if (isLoading) return;
    
    setIdError(null);
    setPwdError(null);
    setIsLoading(true);

    let hasError = false;

    if (!userIdRegex.test(userId)) {
      setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
      hasError = true;
    }

    if (!passwordRegex.test(password)) {
      setPwdError(
        '비밀번호는 영문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.'
      );
      hasError = true;
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      await companyCMSLoginService({
        id: userId,
        password,
        showMessage: (msg) => {
          toast.error(msg);
        },
        onSuccess: (response) => {
          login(response.id, response.token, response.isRoot, response.adminData);
          toast.success('로그인 성공!');
          if (companyCode) {
            navigate(`/${companyCode}/cms/admin-management`);
          }
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 회사 이름 표시용 (companyCode를 기반으로)
  const getCompanyDisplayName = (code: string) => {
    const companyNames: { [key: string]: string } = {
      'aigo': 'AIGO',
      'demo': '데모 회사',
      'test': '테스트 회사'
    };
    return companyNames[code] || code.toUpperCase();
  };

  return (
    <FullScreenContainer>
      <LoginForm
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
      >
        <LoginContainer>
          <LogoSection>
            {/* 회사별 로고 또는 기본 로고 */}
            <img 
              src={`/ai-estimate/logo_${companyCode}.png`} 
              alt="Company Logo" 
              width={80} 
              height={80}
              onError={(e) => {
                // 회사별 로고가 없으면 기본 로고 사용
                (e.target as HTMLImageElement).src = "/Logo_AIGO.svg";
              }}
            />
            <CompanyTitle>
              {companyCode ? getCompanyDisplayName(companyCode) : ''} CMS
            </CompanyTitle>
          </LogoSection>

          <SignInTitle>SIGN IN</SignInTitle>

          <TextField
            value={userId}
            radius="0px"
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디를 입력하세요"
            showSuffixIcon={false}
            errorMessage={idError || undefined}
          />

          <TextField
            value={password}
            radius="0px"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            isPasswordField={true}
            showSuffixIcon={true}
            errorMessage={pwdError || undefined}
          />

          <ButtonSpacer />
          <CommonButton
            borderRadius="0px"
            borderColor="transparent"
            text={isLoading ? "로그인 중..." : "로그인"}
            fontSize="18px"
            onClick={handleLogin}
            disabled={isLoading}
          />

          <HelpText>
            시스템 계정이 없다면, 관리자에게 문의 바랍니다.
          </HelpText>

          <ToastContainer
            position="top-center"
            autoClose={3000}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </LoginContainer>
      </LoginForm>
    </FullScreenContainer>
  );
}

// Styled Components
const FullScreenContainer = styled.div`
  height: 100vh;
  width: 100vw;
  backgroundColor: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoginForm = styled.form`
  width: 100%;
`;

const LoginContainer = styled.div`
  padding: 16px;
  max-width: 360px;
  min-width: 360px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  width: 100%;
`;

const CompanyTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  white-space: nowrap;
`;

const SignInTitle = styled.div`
  font-size: 30px;
  font-weight: 500;
  color: #000;
  margin-bottom: 10px;
  align-self: flex-start;
`;

const ButtonSpacer = styled.div`
  height: 8px;
`;

const HelpText = styled.div`
  margin-top: 50px;
  font-size: 16px;
  font-weight: 400;
  color: #6c6969;
  text-align: center;
`;
