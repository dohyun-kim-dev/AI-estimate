import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Image } from '@mui/icons-material'; // 기본 아이콘 사용
/**
 * PhotoDataContainer는 이미지 데이터를 위한 데이터 렌더링 컨테이너입니다.
 * 데이터가 없을 경우 산 아이콘과 함께 기본 안내 문구를 표시합니다.
 */
export function PhotoDataContainer({ message, successChild, noDataChild }) {
    const isSuccess = message === 'success';
    return (_jsx("div", { style: { flex: 1 }, children: isSuccess ? (successChild) : (noDataChild ?? (_jsxs("div", { style: { textAlign: 'center', padding: '2rem', color: '#888' }, children: [_jsx(Image, { style: { fontSize: 48, marginBottom: 12 } }), _jsx("p", { children: "\uC774\uBBF8\uC9C0\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." })] }))) }));
}
