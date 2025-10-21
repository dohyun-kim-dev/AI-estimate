'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { TextField } from '@/components/TextField';
import { companyCMSLoginService } from '@/lib/services/companyCMSLoginService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import CommonButton from '@/components/CommonButton';
import OTPInputForm from '@/components/OTPInputForm';
import { toast, ToastContainer } from 'react-toastify';
import styled from 'styled-components';
import { devLog } from '../../../utils/devLogger';
import { useToast } from '@/components/common/ToastProvider';

export default function CompanyCMSLoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false); // OTP 모드 상태
  const [loginResponse, setLoginResponse] = useState<any>(null); // 로그인 응답 저장
  const { companyCode } = useParams<{ companyCode: string }>();
  const { show: showToast } = useToast(); // 토스트 훅 추가

  const navigate = useNavigate();
  const { login, isLoggedIn } = useAdminAuth();

  // 이미 로그인된 상태라면 CMS로 리다이렉트 (OTP 모드가 아닐 때만)
  useEffect(() => {
    if (isLoggedIn && companyCode && !isOtpMode) {
      navigate(`/${companyCode}/cms/admin-management`, { replace: true });
    }
  }, [isLoggedIn, navigate, companyCode, isOtpMode]);

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
          //@@Todo otp로 다시 전환 할때 주석 풀어주세요
          // 로그인 성공 시 OTP 모드로 전환
          // setLoginResponse(response); // 응답 저장
          // setIsOtpMode(true);
          // showToast('OTP 인증을 진행해주세요.','success');
          // 실제 로그인 처리는 OTP 인증 후에 수행

           // 로그인 성공 시 바로 로그인 처리 및 이동
          login(response.id, response.token, response.isRoot, response.adminData);
          devLog('🏢 [CompanyCMSLoginPage] 로그인 성공, CMS로 이동');
          
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

  // OTP 인증 처리
  const handleOtpSubmit = (otp: string) => {
    devLog('OTP 제출:', otp);
    devLog('🏢 [CompanyCMSLoginPage] OTP 인증 성공, CMS로 이동:', { otp });
    
    if (companyCode) {
      devLog('🏢 [CompanyCMSLoginPage] companyCode:', { companyCode });
      
      // 실제 로그인 처리 (OTP 검증 후)
      if (loginResponse) {
        login(loginResponse.id, loginResponse.token, loginResponse.isRoot, loginResponse.adminData);
        devLog('🏢 [CompanyCMSLoginPage] login 함수 호출 완료');
      }
      
      // CMS로 이동
      devLog('🏢 [CompanyCMSLoginPage] navigate 호출:', `/${companyCode}/cms/admin-management`);
      navigate(`/${companyCode}/cms/admin-management`);
    }
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
              src={`/Logo_AIGO.svg`} 
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

          <SignInTitle className={isOtpMode ? 'otp-mode' : ''}>
            {isOtpMode ? 'OTP 로그인' : 'SIGN IN'}
          </SignInTitle>

          {isOtpMode ? (
            <>
              <OTPInputForm onOtpSubmit={handleOtpSubmit} />
              <BackButton onClick={() => setIsOtpMode(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15.1133 20.4844L6.628 11.9991L15.1133 3.51381" stroke="#a6a7a9" strokeWidth="1.4"/>
                </svg> 이전
              </BackButton>
            </>
          ) : (
            <>
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
            </>
          )}

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
  justify-content: center;
  // margin-bottom: 20px;
  width: 100%;
  gap: 12px;
`;

const CompanyTitle = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #000;
  white-space: nowrap;
`;

const SignInTitle = styled.div`
  font-size: 30px;
  font-weight: 500;
  color: #000;
  margin-bottom: 10px;
  align-self: ${({ theme }) => theme ? 'flex-start' : 'flex-start'};
  
  &.otp-mode {
    font-size: 18px;
    margin-bottom: 0px;
    align-self: center;
    text-align: center;
  }
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

const BackButton = styled.button`
display: flex;
align-items: center;
  margin-top: 30px;
  background: none;
  border: none;
  color: #6c6969;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 16px;
  transition: color 0.2s ease;
  align-self: flex-center;
  width: 100%;
  text-align: left;

`;
