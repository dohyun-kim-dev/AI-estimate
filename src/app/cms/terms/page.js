"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styled from "styled-components";
import CommonButton from "@/components/CommonButton";
import { termGetList, termUpdate } from "@/lib/api/admin";
import { toast, ToastContainer } from 'react-toastify';
import { devLog } from "@/lib/utils/devLogger";
const CustomTiptapEditor = dynamic(() => import("@/components/Editor/CustomTiptapEditor"), {
    ssr: false,
});
const tabs = [
    { key: "terms", label: "이용약관", index: 1, language: "KOR" },
    { key: "privacy", label: "개인정보 취급방침", index: 2, language: "KOR" },
    { key: "company", label: "사업자 정보", index: 3, language: "KOR" },
];
const TabRow = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;
const TabList = styled.div `
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;
const Title = styled.h1 `
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin-bottom: 1.5rem;
`;
const TabButton = styled.button `
  background: none;
  border: none;
  font-size: 16px;
  padding: 4px 0;
  cursor: pointer;
  color: ${({ $active }) => ($active ? "#000" : "#999")};
  border-bottom: ${({ $active }) => ($active ? "2px solid #000" : "none")};
  font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
  transition: color 0.2s;

  &:hover {
    color: #000;
  }
`;
export default function TermsPage() {
    const [activeTab, setActiveTab] = useState(tabs[0].key);
    const [editorInstance, setEditorInstance] = useState(null);
    const [contents, setContents] = useState({});
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    // 1. API 호출 및 데이터 매핑
    useEffect(() => {
        const fetchTerms = async () => {
            const res = await termGetList();
            devLog("📱 [약관 목록] 응답", res);
            // ✨ 이 부분을 수정합니다.
            const rawList = res?.[0]?.data || [];
            devLog("📱 [약관 목록] 원본 데이터", rawList);
            if (rawList.length > 0) {
                rawList.sort((a, b) => a._id - b._id);
            }
            devLog("📱 [약관 목록] 정렬된 데이터", rawList);
            const map = {};
            tabs.forEach((tab, index) => {
                const matched = rawList[index];
                map[tab.key] = {
                    index: matched?.["_id"],
                    language: tab.language,
                    content: matched?.["content"] ?? "",
                    termsType: "user",
                };
            });
            devLog("✔️ 최종 설정된 contents:", map);
            setContents(map);
            setIsDataLoaded(true);
        };
        fetchTerms();
    }, []);
    // 2. 탭 변경 시 에디터 콘텐츠 업데이트
    useEffect(() => {
        if (editorInstance) {
            const currentContent = contents[activeTab]?.content || "";
            editorInstance.commands.setContent(currentContent, false);
        }
    }, [activeTab, contents, editorInstance]);
    const handleTabChange = (key) => {
        if (editorInstance) {
            const currentHtml = editorInstance.getHTML();
            setContents((prev) => ({
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    content: currentHtml,
                },
            }));
        }
        setActiveTab(key);
    };
    const handleEditorReady = (editor) => {
        setEditorInstance(editor);
    };
    const handleSave = async () => {
        if (!editorInstance)
            return;
        const html = editorInstance.getHTML();
        const current = contents[activeTab];
        if (!current?.language) {
            toast.error("저장할 약관 정보가 없습니다.");
            return;
        }
        const params = {
            index: current.index,
            language: current.language,
            content: html,
        };
        try {
            const response = await termUpdate(params);
            console.log("📦 저장 응답:", response);
            const result = response?.[0] || response;
            if (result?.['message'] === "success" || response?.['message'] === "success") {
                toast.success("저장되었습니다.");
                const newId = response?.data?._id;
                if (newId) {
                    setContents((prev) => ({
                        ...prev,
                        [activeTab]: {
                            ...prev[activeTab],
                            index: newId,
                            content: html,
                        },
                    }));
                }
                else {
                    setContents((prev) => ({
                        ...prev,
                        [activeTab]: {
                            ...prev[activeTab],
                            content: html,
                        },
                    }));
                }
            }
            else {
                toast.error("저장에 실패했습니다.");
                console.warn("🚨 실패 응답 내용:", result);
            }
        }
        catch (error) {
            console.error("❌ 저장 오류:", error);
            toast.error("저장 중 오류가 발생했습니다.");
        }
    };
    return (_jsxs("div", { style: { minHeight: "100vh", padding: "2rem", paddingTop: "88px" }, children: [_jsx(ToastContainer, { position: "top-center", autoClose: 3000 }), _jsx(Title, { children: "\uC774\uC6A9\uC57D\uAD00 \uD3B8\uC9D1" }), _jsxs(TabRow, { children: [_jsx(TabList, { children: tabs.map((tab) => (_jsx(TabButton, { "$active": activeTab === tab.key, onClick: () => handleTabChange(tab.key), children: tab.label }, tab.key))) }), _jsx(CommonButton, { text: "\uC800\uC7A5", "$iconPosition": "left", width: "80px", height: "36px", fontSize: "14px", borderRadius: "8px", backgroundColor: "#000", color: "#fff", onClick: handleSave })] }), _jsx("div", { className: "bg-[#f9f9f9] p-4 rounded border border-gray-300", children: isDataLoaded ? (_jsx(CustomTiptapEditor, { initialContent: contents[activeTab]?.content || "", onEditorReady: handleEditorReady })) : (_jsx("p", { children: "\uB370\uC774\uD130\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4..." })) })] }));
}
