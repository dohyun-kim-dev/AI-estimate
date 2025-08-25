import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from '@/contexts/AdminAuthContext';
function DataContainer({ message, successChild, noDataChild }) {
    const isSuccess = message === 'success';
    return (_jsx("div", { style: { flex: 1 }, children: isSuccess ? successChild : noDataChild ?? _jsx("p", { children: "No data available." }) }));
}
function ProductDetailContent({ title, data, color }) {
    return (_jsxs("div", { style: { backgroundColor: color, padding: '1rem', borderRadius: '8px' }, children: [_jsx("h3", { children: title }), _jsx("pre", { style: { fontSize: '13px', overflowX: 'auto' }, children: JSON.stringify(data, null, 2) })] }));
}
export default function DashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardError, setDashboardError] = useState(null);
    const [productDetail1, setProductDetail1] = useState(null);
    const [productDetail9999, setProductDetail9999] = useState(null);
    const navigate = useNavigate(); // Next.js의 useRouter 훅 사용
    ;
    const { logout } = useAdminAuth();
    const handleLogout = () => {
        logout(); // ✅ context 상태까지 동기화
        navigate('/cms'); // 로그인 페이지로 이동
    };
    return (_jsx(ScreenWrapper, { children: _jsxs("main", { style: { paddingTop: '2rem', paddingBottom: '2rem' }, children: [_jsx("h1", { children: "\uD83D\uDCCA \uAD00\uB9AC\uC790 \uB300\uC2DC\uBCF4\uB4DC" }), _jsx("button", { onClick: handleLogout, style: {
                        marginBottom: '1rem',
                        padding: '10px 20px',
                        backgroundColor: '#d32f2f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                    }, children: "\uB85C\uADF8\uC544\uC6C3" }), dashboardError && _jsx("p", { style: { color: 'red' }, children: dashboardError }), !dashboardData && !dashboardError && _jsx("p", { children: "\uB300\uC2DC\uBCF4\uB4DC \uB370\uC774\uD130 \uBD88\uB7EC\uC624\uB294 \uC911..." }), dashboardData && (_jsxs("section", { style: {
                        margin: '2rem 0',
                        padding: '1rem',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                    }, children: [_jsx("h2", { children: "\uD83D\uDCC8 \uB300\uC2DC\uBCF4\uB4DC \uC6D0\uBCF8 \uB370\uC774\uD130" }), _jsx("pre", { children: JSON.stringify(dashboardData, null, 2) })] })), _jsxs("section", { style: { display: 'flex', gap: '2rem', marginTop: '2rem' }, children: [_jsx(DataContainer, { message: productDetail1?.[0]?.message ?? '', successChild: _jsx(ProductDetailContent, { title: "\u2705 \uAD6C\uB3C5\uC790 \uC788\uC74C (productIndex: 25)", data: productDetail1, color: "#e0f7fa" }), noDataChild: _jsx(ProductDetailContent, { title: "\u274C \uAD6C\uB3C5\uC790 \uC5C6\uC74C (productIndex: 25)", data: productDetail1, color: "#ffe0b2" }) }), _jsx(DataContainer, { message: productDetail9999?.[0]?.message ?? '', successChild: _jsx(ProductDetailContent, { title: "\u2705 \uAD6C\uB3C5\uC790 \uC788\uC74C (productIndex: 9999)", data: productDetail9999, color: "#e0f7fa" }), noDataChild: _jsx(ProductDetailContent, { title: "\u274C \uAD6C\uB3C5\uC790 \uC5C6\uC74C (productIndex: 9999)", data: productDetail9999, color: "#ffe0b2" }) })] })] }) }));
}
