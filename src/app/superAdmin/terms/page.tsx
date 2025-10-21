"use client";

import { useEffect, useState } from "react";
import React, { Suspense } from "react";
import { Editor } from "@tiptap/react";
import styled from "styled-components";
import CommonButton from "@/components/CommonButton";
import { termGetList, TermGetListParams, termUpdate } from "@/lib/api/admin";
import { toast, ToastContainer } from 'react-toastify';
import { devLog } from "@/lib/utils/devLogger";
import { useToast } from '@/components/common/ToastProvider';


const CustomTiptapEditor = React.lazy(() => import("@/components/Editor/CustomTiptapEditor"));

const tabs = [
  { key: "terms", label: "이용약관", index: 1, language: "KOR" },
  { key: "privacy", label: "개인정보 취급방침", index: 2, language: "KOR" },
  { key: "company", label: "사업자 정보", index: 3, language: "KOR" },
  { key: "terms-ENG", label: "이용약관(ENG)", index: 4, language: "ENG" },
  { key: "privacy-ENG", label: "개인정보 취급방침(ENG)", index: 5, language: "ENG" },
  { key: "company-ENG", label: "사업자 정보(ENG)", index: 6, language: "ENG" },
];


type ContentMap = {
  [key: string]: {
    content: string;
    index: number | undefined; 
    termsType?: string;
    language: string;
  };
};

const TabRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const TabList = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000;
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button<{ $active?: boolean }>`
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
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [contents, setContents] = useState<ContentMap>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { show: showToast } = useToast(); // 토스트 훅 추가

  // 1. API 호출 및 데이터 매핑
  useEffect(() => {
    const fetchTerms = async () => {
      const res = await termGetList() as any;
      devLog("📱 [약관 목록] 응답", res);

      // API 응답에서 data 배열 추출
      const rawList = res[0]?.data.data || [];
      devLog("📱 [약관 목록] 원본 데이터", rawList);

      // rawList의 순서와 상관없이 각 탭의 language와 index에 맞는 데이터 매핑
      const map: ContentMap = {};
      tabs.forEach((tab) => {
        const matched = rawList.find(
          (item: any) => item.language === tab.language && item._id === tab.index
        );
        map[tab.key] = {
          index: matched?._id,
          language: tab.language,
          content: matched?.content ?? "",
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

  const handleTabChange = (key: string) => {
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

  const handleEditorReady = (editor: Editor) => {
    setEditorInstance(editor);
  };
  
  const handleSave = async () => {
    if (!editorInstance) return;
  
    const html = editorInstance.getHTML();
    const current = contents[activeTab];
  
    if (!current?.language) {
      showToast("저장할 약관 정보가 없습니다.", 'error');
      return;
    }
  
    const params = {
      language: current.language,
      content: html,
    };
  
    try {
      const response = await termUpdate(current.index, params) as any;
      devLog("📦 저장 응답:", response);
  
      const result = response?.[0] || response;
      if (result?.['message'] === "success" || response?.['message'] === "success") {
        showToast("저장되었습니다.", 'success');

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
        } else {
            setContents((prev) => ({
                ...prev,
                [activeTab]: {
                    ...prev[activeTab],
                    content: html,
                },
            }));
        }
      } else {
        showToast("저장에 실패했습니다.", 'error');
        console.warn("🚨 실패 응답 내용:", result);
      }
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      showToast("저장 중 오류가 발생했습니다.", 'error');
    }
  };

  return (
    
    <div style={{ minHeight: "100vh", padding: "2rem", paddingTop: "88px", minWidth: "1200px" }}>
        <ToastContainer position="top-center" autoClose={3000} />
      <Title>이용약관 편집</Title>

      <TabRow>
        <TabList>
          {tabs.map((tab) => (
            <TabButton
              key={tab.key}
              $active={activeTab === tab.key}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabList>

        <CommonButton
          text="저장"
          $iconPosition="left"
          width="80px"
          height="36px"
          fontSize="14px"
          borderRadius="8px"
          backgroundColor="#000"
          color="#fff"
          onClick={handleSave}
        />
      </TabRow>

      <div className="bg-[#f9f9f9] p-4 rounded border border-gray-300">
        {isDataLoaded ? (
          <Suspense fallback={<p>에디터를 불러오는 중입니다...</p>}>
            <CustomTiptapEditor
              initialContent={contents[activeTab]?.content || ""}
              onEditorReady={handleEditorReady}
            />
          </Suspense>
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
      </div>
    </div>
  );
}