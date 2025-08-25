"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import CmsResponsiveContainer from "../../../../components/CustomList/ResponsiveList/CmsResponsiveContainer";
// 🔷 더미 데이터 정의
const dummyData = [
    {
        id: 1,
        name: "홍길동",
        profile: "/sample_avatar1.jpg",
        userId: "1234567891234567890",
        email: "hgd123@gmail.com",
        date: "25-05-01(thu)",
        project: "AI 견적서 시스템",
        feature: "관리자 등록 기능",
        children: [
            {
                id: 2,
                date: "25-05-02(fri)",
                project: "AI 견적서 시스템",
                feature: "관리자 등록 기능",
            },
            {
                id: 3,
                date: "25-05-01(thu)",
                project: "전산 솔루션",
                feature: "관리자 등록 기능",
            },
        ],
    },
    {
        id: 4,
        name: "강태원",
        profile: "/sample_avatar4.jpg",
        userId: "1234567891234567890",
        email: "hgd123@gmail.com",
        date: "25-05-02(fri)",
        project: "드론",
        feature: "관리자 등록 기능",
    },
    {
        id: 5,
        name: "임정기",
        profile: "/sample_avatar5.jpg",
        userId: "1234567891234567890",
        email: "hgd123@gmail.com",
        date: "25-05-02(fri)",
        project: "중고거래",
        feature: "관리자 등록 기능",
    },
    {
        id: 6,
        name: "곽준규",
        profile: "/sample_avatar6.jpg",
        userId: "1234567891234567890",
        email: "hgd123@gmail.com",
        date: "25-05-02(fri)",
        project: "금융 / 펀드",
        feature: "관리자 등록 기능",
    },
];
// 🔷 컬럼 정의
const columns = [
    { header: "유저", accessor: "name", editable: true },
    {
        header: "프로필",
        accessor: "profile",
        // formatter: (value) => <img src={value} alt="프로필" style={{ width: 32, height: 32, borderRadius: "50%" }} />,
        noPopup: true,
    },
    { header: "아이디", accessor: "userId" },
    { header: "이메일", accessor: "email", editable: true },
    { header: "날짜", accessor: "date" },
    { header: "프로젝트", accessor: "project" },
    { header: "기능제목", accessor: "feature" },
    {
        header: "파일 다운로드",
        accessor: "download",
        formatter: () => _jsx("button", { style: { background: "#123B64", color: "white", padding: "5px 10px" }, children: "\uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC" }),
        noPopup: true,
    },
];
// 🔷 fetchData 구현
const fetchData = async (params) => {
    console.log("📦 fetchData called with params:", params);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: dummyData,
                totalItems: dummyData.length,
            });
        }, 300);
    });
};
// 🔷 페이지 컴포넌트
export default function TreeGridPage() {
    const handleCellChange = (id, key, value) => {
        console.log("✅ 셀 변경:", { id, key, value });
    };
    return (_jsx(CmsResponsiveContainer, { title: "AI \uB3D9\uBB38\uC11C\uB2F5 \uAD00\uB9AC", columns: columns, fetchData: fetchData, enableSearch: true, enableDateFilter: true, searchPlaceholder: "\uC720\uC800, \uC544\uC774\uB514, \uC774\uBA54\uC77C, \uD504\uB85C\uC81D\uD2B8\uBA85 \uAC80\uC0C9", onCellChange: handleCellChange, themeMode: "light" }));
}
