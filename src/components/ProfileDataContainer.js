import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Person } from '@mui/icons-material'; // 기본 아이콘 사용
/**
 * ProfileDataContainer는 프로필 정보를 위한 데이터 렌더링 컨테이너입니다.
 * 데이터가 없을 경우 사람 아이콘과 함께 기본 안내 문구를 표시합니다.
 */
export function ProfileDataContainer({ message, successChild, noDataChild }) {
    const isSuccess = message === 'success';
    return (_jsx("div", { style: { flex: 1 }, children: isSuccess ? (successChild) : (noDataChild ?? (_jsxs("div", { style: { textAlign: 'center', padding: '2rem', color: '#888' }, children: [_jsx(Person, { style: { fontSize: 48, marginBottom: 12 } }), _jsx("p", { children: "\uB4F1\uB85D\uB41C \uD504\uB85C\uD544 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." })] }))) }));
}
