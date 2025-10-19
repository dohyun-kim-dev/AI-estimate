import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { TextField } from '@/components/TextField';
import { loginAdminService } from '@/lib/services/loginAdminService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import CommonButton from '@/components/CommonButton';
import { toast, ToastContainer } from 'react-toastify';
import { useParams } from 'react-router-dom';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { companyCode } = useParams();

  // 페이지 로드 시 body 스타일 초기화
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = '#ffffff';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.backgroundColor = '#ffffff';
    
    return () => {
      // 컴포넌트 언마운트 시 원래 스타일 복원
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  const navigate = useNavigate();
  const { login, isLoggedIn } = useAdminAuth();

  // 이미 로그인된 상태라면 /cms로 리다이렉트
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/cms', { replace: true });
    }
  }, [isLoggedIn, navigate]);

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
      await loginAdminService({
        id: userId,
        password,
        showMessage: (msg) => {
          toast.error(msg);
        },
        onSuccess: (response) => {
          login(response.id, response.token, response.isRoot, response.adminData);
          toast.success('로그인 성공!');
          navigate(`/superadmin`);
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: 0,
        zIndex: 9999,
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault(); // 새로고침 방지
          handleLogin();
        }}
        style={{ width: "100%" }}
      >
      <div
        style={{
          padding: '16px',
          maxWidth: '360px',
          minWidth: '360px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 로고와 설명 텍스트 (row) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center', // 양쪽 끝으로 정렬
            marginBottom: '20px',
            width: '100%', // 부모 컨테이너의 너비를 기준으로 정렬
            gap: '12px',
          }}
        >
          {/* 로고 이미지 */}
          <img src="/Logo_AIGO.svg" alt="CMS Logo" width={80} height={80} />

          {/* 설명 텍스트 */}
          <div
            style={{
              fontSize: '24px',
              fontWeight: 500,
              color: '#000', // 텍스트 색상 검정으로 변경
              whiteSpace: 'nowrap',
            }}
          >
            통합관리자용
          </div>
        </div>

        {/* SIGN IN 텍스트 */}
        <div
          style={{
            fontSize: '30px',
            fontWeight: 500,
            color: '#000', // 텍스트 색상 검정으로 변경
            marginBottom: '10px',
            alignSelf: 'flex-start',
          }}
        >
          SIGN IN
        </div>

        {/* 아이디 입력 */}
        <TextField
          value={userId}
          radius="0px"
          onChange={(e) => setUserId(e.target.value)}
          placeholder="아이디를 입력하세요"
          showSuffixIcon={false}
          errorMessage={idError || undefined}
        />

        {/* 비밀번호 입력 */}
        <TextField
          value={password}
          radius="0px"
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          isPasswordField={true}
          showSuffixIcon={true}
          errorMessage={pwdError || undefined}
          
        />

        {/* 버튼과 여백 */}
        <div style={{ height: '8px' }} />
        <CommonButton
          borderRadius="0px"
          borderColor="transparent"
          text={isLoading ? "로그인 중..." : "로그인"}
          fontSize="18px"
          onClick={handleLogin}
          disabled={isLoading}
        />

        {/* 하단 안내 문구 */}
        <div
          style={{
            marginTop: '50px',
            fontSize: '16px',
            fontWeight: 400,
            color: '#6c6969',
            textAlign: 'center',
          }}
        >
          시스템 계정이 없다면, 관리자에게 문의 바랍니다.
        </div>

        {/* 토스트 메시지 */}
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
      </div>
      </form>
    </div>
  );
}
