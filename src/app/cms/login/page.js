import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { TextField } from '@/components/TextField';
import { loginAdminService } from '@/lib/services/loginAdminService';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import CommonButton from '@/components/CommonButton';
import { toast, ToastContainer } from 'react-toastify';
export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [idError, setIdError] = useState(null);
    const [pwdError, setPwdError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAdminAuth();
    // 이미 로그인된 상태라면 /cms로 리다이렉트
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/cms', { replace: true });
        }
    }, [isLoggedIn, navigate]);
    const userIdRegex = /^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9]{6,20}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?~^<>,.&+=])[A-Za-z\d$@$!%*#?~^<>,.&+=]{8,}$/;
    const handleLogin = async () => {
        // 중복 요청 방지
        if (isLoading)
            return;
        setIdError(null);
        setPwdError(null);
        setIsLoading(true);
        let hasError = false;
        // if (!userIdRegex.test(userId)) {
        //   setIdError('아이디는 영문자와 숫자를 포함한 6~20자여야 합니다.');
        //   hasError = true;
        // }
        if (!passwordRegex.test(password)) {
            setPwdError('비밀번호는 영문자, 숫자, 특수문자를 포함한 8자 이상이어야 합니다.');
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
                    login(response.id);
                    toast.success('로그인 성공!');
                    navigate('/cms');
                },
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("form", { onSubmit: (e) => {
            e.preventDefault(); // 새로고침 방지
            handleLogin();
        }, style: { width: "100%" }, children: _jsx("div", { style: {
                height: '100vh',
                width: '100vw', // 화면 전체를 감싸도록 설정
                backgroundColor: '#fff', // 배경 흰색
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }, children: _jsxs("div", { style: {
                    padding: '16px',
                    maxWidth: '360px',
                    minWidth: '360px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }, children: [_jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between', // 양쪽 끝으로 정렬
                            marginBottom: '20px',
                            width: '100%', // 부모 컨테이너의 너비를 기준으로 정렬
                        }, children: [_jsx("img", { src: "/Logo_AIGO.svg", alt: "CMS Logo", width: 80, height: 80 }), _jsx("div", { style: {
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#000', // 텍스트 색상 검정으로 변경
                                    whiteSpace: 'nowrap',
                                }, children: "AI \uACAC\uC801\uC11C \uD1B5\uD569\uAD00\uB9AC\uC790\uC6A9" })] }), _jsx("div", { style: {
                            fontSize: '30px',
                            fontWeight: 500,
                            color: '#000', // 텍스트 색상 검정으로 변경
                            marginBottom: '10px',
                            alignSelf: 'flex-start',
                        }, children: "SIGN IN" }), _jsx(TextField, { value: userId, radius: "0px", onChange: (e) => setUserId(e.target.value), placeholder: "\uC544\uC774\uB514\uB97C \uC785\uB825\uD558\uC138\uC694", showSuffixIcon: false, errorMessage: idError || undefined }), _jsx(TextField, { value: password, radius: "0px", onChange: (e) => setPassword(e.target.value), placeholder: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694", isPasswordField: true, showSuffixIcon: true, errorMessage: pwdError || undefined }), _jsx("div", { style: { height: '8px' } }), _jsx(CommonButton, { borderRadius: "0px", borderColor: "transparent", text: isLoading ? "로그인 중..." : "로그인", fontSize: "18px", onClick: handleLogin, disabled: isLoading }), _jsx("div", { style: {
                            marginTop: '50px',
                            fontSize: '16px',
                            fontWeight: 400,
                            color: '#6c6969',
                            textAlign: 'center',
                        }, children: "\uC2DC\uC2A4\uD15C \uACC4\uC815\uC774 \uC5C6\uB2E4\uBA74, \uAD00\uB9AC\uC790\uC5D0\uAC8C \uBB38\uC758 \uBC14\uB78D\uB2C8\uB2E4." }), _jsx(ToastContainer, { position: "top-center", autoClose: 3000, newestOnTop: true, closeOnClick: true, rtl: false, pauseOnFocusLoss: true, draggable: true, pauseOnHover: true })] }) }) }));
}
