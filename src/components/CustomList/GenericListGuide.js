"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useMemo } from "react";
import styled from "styled-components";
import dayjs from "dayjs";
// GenericListUI와 관련 타입들을 import 합니다.
import GenericListUI from "./GenericListUI";
// --- 2. Mock 데이터 생성 ---
// 실제 API 응답을 대체할 샘플 데이터를 만듭니다.
const mockData = Array.from({ length: 101 }, (_, i) => ({
    id: i + 1,
    name: `아이템 ${i + 1}`,
    category: i % 3 === 0 ? "Electronics" : i % 3 === 1 ? "Clothing" : "Books",
    registeredDate: dayjs()
        .subtract(Math.floor(Math.random() * 365), "day")
        .format("YYYY-MM-DD"),
    status: i % 4 === 0 ? "active" : i % 4 === 1 ? "inactive" : "pending",
    amount: Math.floor(Math.random() * 100000),
}));
// --- 3. 스타일 컴포넌트 (선택적) ---
// 포매터 등에서 사용할 간단한 스타일 컴포넌트를 정의할 수 있습니다.
const StatusBadge = styled.span `
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: white;
  background-color: ${({ status }) => status === "active" ? "#4CAF50" : status === "inactive" ? "#f44336" : "#FF9800"};
`;
// --- 4. 가이드 컴포넌트 정의 ---
const GenericListGuide = () => {
    /**
     * --- 5. fetchData 함수 구현 (Mock 데이터 사용) ---
     *
     * GenericListUI는 fetchData prop을 통해 데이터를 가져옵니다.
     * 이 함수는 FetchParams를 인자로 받아 FetchResult<T> 타입의 Promise를 반환해야 합니다.
     *
     * 현재 GenericListUI는 클라이언트 측 페이지네이션/정렬을 지원하므로,
     * 이 함수는 주로 필터링(날짜, 검색어)된 *전체* 데이터를 반환하는 데 사용됩니다.
     */
    const fetchData = useCallback(async (params) => {
        console.log("Mock fetchData called with params:", params);
        // 실제 API 호출 대신 setTimeout으로 비동기 로딩을 시뮬레이션합니다.
        await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms 딜레이
        // Mock 데이터 필터링 (날짜 및 검색어)
        const filteredData = mockData.filter((item) => {
            let dateMatch = true;
            if (params.fromDate && params.toDate) {
                const itemDate = dayjs(item.registeredDate);
                dateMatch =
                    itemDate.isAfter(dayjs(params.fromDate).subtract(1, "day")) &&
                        itemDate.isBefore(dayjs(params.toDate).add(1, "day"));
            }
            let keywordMatch = true;
            if (params.keyword) {
                const lowerKeyword = params.keyword.toLowerCase();
                keywordMatch =
                    item.name.toLowerCase().includes(lowerKeyword) || item.category.toLowerCase().includes(lowerKeyword);
            }
            return dateMatch && keywordMatch;
        });
        // 필터링된 결과를 FetchResult 형태로 반환합니다.
        return {
            data: filteredData, // 필터링된 전체 데이터
            totalItems: filteredData.length, // 필터링된 아이템 수
            allItems: mockData.length, // 필터링 전 총 아이템 수
        };
    }, []); // Mock 데이터는 변경되지 않으므로 의존성 배열은 비워둡니다.
    /**
     * --- 6. 컬럼(Columns) 정의 ---
     *
     * GenericDataTable (GenericListUI 내부에서 사용됨)에 표시될 컬럼 정보를 정의합니다.
     * ColumnDefinition<T> 타입의 배열 형태입니다.
     *
     * - header: 테이블 헤더에 표시될 문자열
     * - accessor: 데이터 객체에서 해당 셀의 값을 가져올 키 (점(.)으로 중첩 접근 가능)
     * - sortable: 해당 컬럼으로 정렬 가능 여부 (클라이언트 측 정렬)
     * - formatter: 셀 내용을 커스텀 렌더링하는 함수 (ReactNode 반환)
     *   - value: accessor로 가져온 원본 값
     *   - item: 해당 행의 전체 데이터 객체
     *   - rowIndex: 해당 행의 인덱스
     */
    const columns = useMemo(() => [
        // 6-1. 기본 컬럼 (문자열, 정렬 가능)
        { header: "ID", accessor: "id", sortable: true },
        { header: "이름", accessor: "name", sortable: true },
        { header: "카테고리", accessor: "category", sortable: true },
        // 6-2. 날짜 포매팅 컬럼 (정렬 가능)
        {
            header: "등록일",
            accessor: "registeredDate",
            sortable: true,
            formatter: (value) => dayjs(value).format("YYYY년 MM월 DD일"), // dayjs를 사용한 간단한 포매팅
        },
        // 6-3. 상태 포매팅 컬럼 (스타일 컴포넌트 사용, 정렬 가능)
        {
            header: "상태",
            accessor: "status",
            sortable: true,
            formatter: (value) => _jsx(StatusBadge, { status: value, children: value.toUpperCase() }), // 위에서 정의한 StatusBadge 사용
        },
        // 6-4. 숫자 포매팅 컬럼 (정렬 가능)
        {
            header: "금액",
            accessor: "amount",
            sortable: true,
            formatter: (value) => `${value.toLocaleString()} 원`, // 숫자를 통화 형식으로 포매팅
        },
    ], [] // 컬럼 정의는 보통 한 번만 수행되므로 의존성 배열은 비워둡니다.
    );
    /**
     * --- 7. GenericListUI 렌더링 ---
     *
     * 필요한 props를 전달하여 GenericListUI 컴포넌트를 렌더링합니다.
     */
    return (_jsx(GenericListUI, { 
        // --- 필수 Props ---
        title: "Mock \uB370\uC774\uD130 \uB9AC\uC2A4\uD2B8 \uC608\uC81C" // 리스트 상단에 표시될 제목 (ReactNode 가능)
        , columns: columns, fetchData: fetchData, excelFileName: "MockDataExport" // 엑셀 다운로드 시 사용될 파일 이름 (확장자 제외)
        , 
        // --- 옵션 Props ---
        // 초기 상태 설정 (페이지, 사이즈, 정렬 등)
        // 클라이언트 측 처리가 강화되어 주로 초기 표시 상태에만 영향을 줍니다.
        initialState: {
            page: 1, // 초기 페이지 번호
            size: 10, // 초기 페이지 당 아이템 수
            sortKey: "id", // 초기 정렬 컬럼 accessor
            sortOrder: "desc", // 초기 정렬 순서 ('asc' 또는 'desc')
            // fromDate: dayjs().subtract(1, 'month').format('YYYY-MM-DD'), // 초기 시작 날짜 (기본값: 6개월 전)
            // toDate: dayjs().format('YYYY-MM-DD'), // 초기 종료 날짜 (기본값: 오늘)
            // keyword: "아이템", // 초기 검색어
        }, 
        // 각 행의 고유 키를 추출하는 함수 (기본값: item.id 또는 item.index)
        // keyExtractor={(item) => item.id}
        // 검색 기능 활성화 여부 (기본값: true)
        enableSearch: true, 
        // 검색창 placeholder 텍스트
        searchPlaceholder: "\uC774\uB984 \uB610\uB294 \uCE74\uD14C\uACE0\uB9AC \uAC80\uC0C9", 
        // 날짜 필터 활성화 여부 (기본값: true)
        // GenericDateRangePicker 컴포넌트가 내장되어 사용됩니다.
        enableDateFilter: true, 
        // 날짜 범위 빠른 선택 버튼 옵션 (기본값: ['6개월', '1년', '2년'])
        // dateRangeOptions={["1개월", "3개월", "6개월"]}
        // 페이지 당 아이템 수 선택 옵션 (기본값: [12, 30, 50, 100])
        itemsPerPageOptions: [10, 20, 30, 50], 
        // 테마 모드 ('light' 또는 'dark', 기본값: 'light')
        themeMode: "light", 
        // 행 클릭 시 실행될 콜백 함수
        onRowClick: (item, rowIndex) => {
            alert(`Row ${rowIndex + 1} clicked! Name: ${item.name}`);
        }, 
        // 헤더 오른쪽에 추가 액션 버튼을 렌더링하는 함수
        renderHeaderActionButton: () => (_jsx("button", { onClick: () => alert("추가 액션 버튼 클릭!"), style: { padding: "8px 16px", borderRadius: "0px", border: "none", background: "#214A72", color: "white" }, children: "\uCD94\uAC00 \uC561\uC158" })) }));
};
export default GenericListGuide;
