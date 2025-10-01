"use client";

import GenericTreeListUI from "@/components/CustomList/GenericTreeListUI";
import React from "react";
import CmsResponsiveContainer from "../../../../components/CustomList/ResponsiveList/CmsResponsiveContainer";
import { devLog } from '@/utils/devLogger'

// 🔷 인터페이스 정의 (GenericTreeListUI가 요구하는 구조)
interface TreeNode {
  id: string | number;
  [key: string]: any;
  children?: TreeNode[];
}

interface FetchParams {
  fromDate?: string;
  toDate?: string;
  keyword?: string;
}

interface FetchResult {
  data: TreeNode[];
  totalItems: number;
  allItems?: number;
}

// 🔷 더미 데이터 정의
const dummyData: TreeNode[] = [
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
  { header: "이메일", accessor: "email" , editable: true},
  { header: "날짜", accessor: "date" },
  { header: "프로젝트", accessor: "project" },
  { header: "기능제목", accessor: "feature" },
  {
    header: "파일 다운로드",
    accessor: "download",
    formatter: () => <button style={{ background: "#123B64", color: "white", padding: "5px 10px" }}>파일 다운로드</button>,
    noPopup: true,
  },
];


// 🔷 fetchData 구현
const fetchData = async (params: FetchParams): Promise<FetchResult> => {
  devLog("📦 fetchData called with params:", params);
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
  const handleCellChange = (id: string | number, key: string, value: any) => {
    devLog("✅ 셀 변경:", { id, key, value });
  };

  return (
    <CmsResponsiveContainer<TreeNode>
      title="AI 동문서답 관리"
      columns={columns}
      fetchData={fetchData}
      enableSearch
      enableDateFilter
      searchPlaceholder="유저, 아이디, 이메일, 프로젝트명 검색"
      onCellChange={handleCellChange} // ✅ 추가
      themeMode="light"
    />
  );
}

