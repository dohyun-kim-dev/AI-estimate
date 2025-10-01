"use client";

import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import styled from "styled-components";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import GenericDataTable, { ColumnDefinition } from "./GenericDataTable"; // 경로 확인
import DynamicGenericDataTable from "./DynamicGenericDataTable"; // 동적 테이블 import
import GenericDateRangePicker from "./GenericDateRangePicker"; // 경로 확인
import DropdownCustom from "./DropdownCustom";
import { THEME_COLORS, ThemeMode } from "@/styles/theme_colors";
import ActionButton from "../ActionButton";
import CompanySearchModal from "./CompanySearchModal";
import { devError, devWarn } from "@/utils/devLogger";




interface ButtonProp {
  label: string;
  onClick: () => void;
}

// Helper: getPropertyValue (기존 유지, UserListPage 버전 개선 적용)
const getPropertyValue = <T extends object>(obj: T, path: keyof T | string): any => {
  if (!obj) return undefined;
  if (typeof path === "string" && path in obj) {
    return obj[path as keyof T];
  }
  if (typeof path === "number" || typeof path === "symbol") {
    return obj[path as keyof T];
  }
  if (typeof path === "string" && path.includes(".")) {
    const keys = path.split(".");
    let value: any = obj;
    for (const key of keys) {
      if (value === null || typeof value !== "object" || !(key in value)) {
        return undefined;
      }
      value = value[key];
    }
    return value;
  }
  return undefined;
};

// --- Component Props ---
interface BaseRecord {
  id?: string | number; // 기본 ID 필드 가정 (keyExtractor 대체용)
  index?: number; // index 필드도 고려
  [key: string]: any; // 다른 필드 허용
}

// API Fetch 함수 타입 정의 (수정: 페이지/정렬 파라미터 제거)
export interface FetchParams {
  fromDate?: string; // Optional
  toDate?: string; // Optional
  keyword?: string; // Optional
  status?: string; // 상태 필터 값 추가
  companyCode?: string; // Optional - 고객사 코드
}

export interface FetchResult<T> {
  data: T[];
  totalItems: number; // 필터링된 총 아이템 수
  allItems?: number; // 필터링 전 전체 아이템 수 (Optional)
}

// 초기 상태 타입
interface InitialState {
  page?: number;
  size?: number;
  sortKey?: string | null;
  sortOrder?: "asc" | "desc";
  fromDate?: string;
  toDate?: string;
  keyword?: string;
}

// GenericListUI Props 정의 (수정)
interface GenericListUIProps<T extends BaseRecord> {
  title: React.ReactNode;
  columns: ColumnDefinition<T>[];
  data: T[]; // 부모에서 직접 전달받는 데이터
  totalItems: number; // 부모에서 전달받는 총 아이템 수
  allItems?: number; // 부모에서 전달받는 전체 아이템 수
  isLoading?: boolean; // 부모에서 관리하는 로딩 상태
  isDynamicData?: boolean; // 동적 데이터 테이블 사용 여부
  
  excelFileName?: string;
  customLeftContent?: React.ReactNode;
  totalAmountLabel?: string;
  totalAmount?: string;
  dualAmounts?: {
    first: { label: string; value: string };
    second: { label: string; value: string };
  };

  statusFilter?: {
    options: { label: string; value: string }[];
    defaultValue?: string;
  };

  addButton?: ButtonProp;
  deleteButton?: ButtonProp;
  customButtons?: ButtonProp[];
  excelTemplateButton?: ButtonProp;
  excelUploadButton?: ButtonProp;

  enableCompanySearch?: boolean;
  onCompanySelect?: (company: { id: string; name: string }) => void;
  selectedCompanyCode?: string | null;
  selectedCompanyName?: string;

  // 부모에게 전달할 콜백들
  onDateChange?: (fromDate: string, toDate: string) => void;
  onSearchChange?: (keyword: string) => void;
  onStatusChange?: (status: string) => void;
  onCompanyChange?: (companyCode: string | null, companyName: string) => void; // 고객사 변경 콜백 추가
  onInitialDateSet?: (fromDate: string, toDate: string) => void; // 초기 날짜 설정 콜백 추가

  initialState?: InitialState;
  hasUrlParams?: boolean;
  keyExtractor?: (item: T, index: number) => string | number;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  enableDateFilter?: boolean;
  dateRangeOptions?: ('금월' | '지난달' | '3개월' | '6개월' | '1년' | '2년' | '지정')[];
  itemsPerPageOptions?: number[];
  themeMode?: ThemeMode;
  onRowClick?: (item: T, rowIndex: number) => void;
  renderTabs?: () => React.ReactNode;
  renderMiddleContent?: () => React.ReactNode;
}

// 등록, 템플릿 버튼 (밝은 톤)
const PrimaryButton = styled(ActionButton)<{ $themeMode: ThemeMode }>`
  width: 110px;
  height: 40px;
  background: #214a72;
  color: #ffffff;
  border: none;
  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) => ($themeMode === 'light' ? '#1a3c5e' : '#1a3c5e')};
  }
`;

// 삭제, 업로드 버튼 (어두운 톤)
const SecondaryButton = styled(ActionButton)<{ $themeMode: ThemeMode }>`
  width: 110px;
  height: 40px;
  background: ${({ $themeMode }) => ($themeMode === "light" ? "#FFFFFF" : "#333333")};
  color: ${({ $themeMode }) => ($themeMode === "light" ? "#214A72" : "#eeeeee")};
  border: none;
  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#dddddd" : "#555555")};
  }
`;

// 다운로드 버튼 (특정 색)
const DownloadButton = styled(ActionButton)`
  width: 110px;
  height: 40px;
  background: #51815a;
  color: #ffffff;
  border: none;
  &:hover:not(:disabled) {
    color: #ffffff;
  }
`;

// 상태별 색상 정의 추가
const STATUS_COLORS = {
  '': '#887e67', // 전체
  ONGOING: '#4CAF50', // 진행중 - 초록색
  ENDED: '#2196F3', // 종료 - 파란색
  WAITING: '#FF9800', // 대기중 - 주황색
  CANCELED: '#F44336', // 취소 - 빨간색
};


// --- The Component --- (완전히 단순화)
const GenericListUIInner = <T extends BaseRecord>(
  {
    title,
    columns,
    data, // 부모에서 직접 전달받는 데이터
    totalItems, // 부모에서 전달받는 총 아이템 수
    allItems, // 부모에서 전달받는 전체 아이템 수
    isLoading = false, // 부모에서 관리하는 로딩 상태
    isDynamicData = false, // 동적 데이터 테이블 사용 여부
    excelFileName = "DataExport",
    customLeftContent,
    totalAmountLabel,
    totalAmount,
    dualAmounts,
    initialState = {},
    hasUrlParams = false,
    keyExtractor,
    enableSearch = true,
    searchPlaceholder = "검색어를 입력해주세요",
    enableDateFilter = true,
    dateRangeOptions = ['금월', '지난달', '1년', '지정'],
    itemsPerPageOptions = [12, 30, 50, 100],
    themeMode = "light",
    onRowClick,
    renderTabs,
    addButton,
    deleteButton,
    customButtons = [],
    excelTemplateButton,
    excelUploadButton,
    statusFilter,
    enableCompanySearch,
    onCompanySelect,
    selectedCompanyCode: externalSelectedCompanyCode,
    selectedCompanyName: externalSelectedCompanyName,
    renderMiddleContent,
    // 부모에게 전달할 콜백들
    onDateChange,
    onSearchChange,
    onStatusChange,
    onCompanyChange,
    onInitialDateSet, // 초기 날짜 설정 콜백 추가
  }: GenericListUIProps<T>,
  ref: React.Ref<{ refetch: () => void }>
) => {

  // --- 내부 상태 --- (API 관련 상태 제거, UI 상태만 유지)
  const [error, setError] = useState<string | null>(null);

  // 초기 날짜 설정 함수
  const getInitialDates = useCallback(() => {
    if (initialState.fromDate && initialState.toDate) {
      return {
        fromDate: initialState.fromDate,
        toDate: initialState.toDate,
      };
    }
    const today = dayjs();
    const firstOption = dateRangeOptions[0];

    switch (firstOption) {
      case '금월':
        return {
          fromDate: today.startOf('month').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
      case '지난달':
        return {
          fromDate: today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
          toDate: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
        };
      case '3개월':
        return {
          fromDate: today.subtract(3, 'month').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
      case '6개월':
        return {
          fromDate: today.subtract(6, 'month').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
      case '1년':
        return {
          fromDate: today.subtract(1, 'year').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
      case '2년':
        return {
          fromDate: today.subtract(2, 'year').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
      default:
        return {
          fromDate: today.startOf('month').format('YYYY-MM-DD'),
          toDate: today.format('YYYY-MM-DD'),
        };
    }
  }, [dateRangeOptions, initialState.fromDate, initialState.toDate]);

  const initialDates = useMemo(() => getInitialDates(), [getInitialDates]);

  // UI 제어 상태 (페이지네이션, 정렬, 필터)
  const [currentPage, setCurrentPage] = useState(initialState.page ?? 1);
  const [itemsPerPage, setItemsPerPage] = useState(
    initialState.size ?? itemsPerPageOptions[0] ?? 12
  );
  const [sortKey, setSortKey] = useState<string | null>(initialState.sortKey ?? null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialState.sortOrder ?? "asc");
  const [fromDate, setFromDate] = useState(initialDates.fromDate);
  const [toDate, setToDate] = useState(initialDates.toDate);
  const [searchTermInput, setSearchTermInput] = useState(initialState.keyword ?? "");
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  
  // 상태 필터 state 추가
  const [selectedStatus, setSelectedStatus] = useState(statusFilter?.defaultValue || '');

  // 고객사 정보를 내부 상태로 관리 (날짜처럼)
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string | null>(externalSelectedCompanyCode || null);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(externalSelectedCompanyName || "");

  // 외부에서 전달받은 고객사 정보가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalSelectedCompanyCode !== undefined) {
      setSelectedCompanyCode(externalSelectedCompanyCode);
    }
  }, [externalSelectedCompanyCode]);

  useEffect(() => {
    if (externalSelectedCompanyName !== undefined) {
      setSelectedCompanyName(externalSelectedCompanyName);
    }
  }, [externalSelectedCompanyName]);

  // 초기 날짜 설정 시 부모에게 알림
  useEffect(() => {
    if (onInitialDateSet) {
      onInitialDateSet(fromDate, toDate);
    }
  }, []); // 컴포넌트 마운트 시에만 실행

  // --- 부모에게 전달할 콜백 함수들 ---
  const handleRefetch = useCallback(() => {
    // 현재 상태를 부모에게 전달하여 API 호출 요청
    if (onDateChange) {
      onDateChange(fromDate, toDate);
    }
    if (onSearchChange) {
      onSearchChange(searchTermInput.trim());
    }
    if (onStatusChange) {
      onStatusChange(selectedStatus);
    }
    if (onCompanyChange) {
      onCompanyChange(selectedCompanyCode, selectedCompanyName);
    }
  }, [fromDate, toDate, searchTermInput, selectedStatus, selectedCompanyCode, selectedCompanyName, onDateChange, onSearchChange, onStatusChange, onCompanyChange]);

  useImperativeHandle(ref, () => ({
    refetch: handleRefetch,
  }));

  // 날짜 변경 시 상태 업데이트 및 콜백 호출
  const handleDateChangeInternal = (newFrom: string, newTo: string) => {
    setFromDate(newFrom);
    setToDate(newTo);
    if (onDateChange) {
      onDateChange(newFrom, newTo);
    }
  };

  // 상태 변경 핸들러 (콜백 방식)
  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setCurrentPage(1); // 상태 변경시 1페이지로 이동
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  // 고객사 선택 핸들러 (내부 상태 업데이트)
  const handleCompanySelect = (company: { id: string; name: string }) => {
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    setIsCompanyModalOpen(false);
    
    // 부모에게도 알림 (필요한 경우)
    if (onCompanySelect) {
      onCompanySelect(company);
    }
    
    // 고객사 변경 콜백 호출 (조회 버튼 클릭 시 사용될 데이터)
    if (onCompanyChange) {
      onCompanyChange(company.id, company.name);
    }
  };

  // --- 데이터 변경 감지 및 페이지 리셋 ---
  useEffect(() => {
    // 데이터가 변경되면 첫 페이지로 이동 (단, 정렬이나 페이지 변경으로 인한 것이 아닌 경우만)
    setCurrentPage(1);
  }, [data]); // data가 변경될 때마다 실행

  // --- 클라이언트 측 데이터 처리 --- (정렬, 페이지네이션)
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const sortableData = [...data]; // 부모에서 이미 필터링된 데이터 사용
    if (sortKey) {
      sortableData.sort((a, b) => {
        const valA = getPropertyValue(a, sortKey);
        const valB = getPropertyValue(b, sortKey);
        let comparison = 0;
        if (valA === null || valA === undefined) comparison = -1;
        else if (valB === null || valB === undefined) comparison = 1;
        else if (dayjs.isDayjs(valA) && dayjs.isDayjs(valB))
          comparison = valA.valueOf() - valB.valueOf();
        else if (typeof valA === "string" && typeof valB === "string")
          comparison = valA.localeCompare(valB);
        else if (typeof valA === "number" && typeof valB === "number") comparison = valA - valB;
        else comparison = String(valA).localeCompare(String(valB));
        return sortOrder === "asc" ? comparison : comparison * -1;
      });
    }
    return sortableData;
  }, [data, sortKey, sortOrder]);

  const paginatedData = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // --- 파생 상태 (페이지네이션) ---
  // --- 파생 상태 (페이지네이션) ---
  // totalItems는 부모에서 전달받은 값 사용 (이미 필터링된 개수)
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const displayTotalItems = totalItems;
  const displayAllItems = allItems ?? totalItems;

  // --- 이벤트 핸들러 (수정) ---
  // 페이지 변경: 상태만 업데이트
  const handlePageNumChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };
  // 페이지 크기 변경: 상태만 업데이트
  const handleItemsPerPageChange = (newSize: number) => {
    if (newSize !== itemsPerPage) {
      setItemsPerPage(newSize);
      setCurrentPage(1);
    }
  };
  // 정렬 변경: 상태만 업데이트
  const handleHeaderClick = (accessor: keyof T | string) => {
    const newSortOrder = sortKey === accessor && sortOrder === "asc" ? "desc" : "asc";
    setSortKey(accessor as string);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // 정렬 시 1페이지로
  };

  // 검색어 입력: 입력 상태만 업데이트 (API 호출 없음)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermInput(e.target.value);
  };
  // 조회 버튼 클릭: 부모에게 검색 콜백
  const handleImmediateSearch = () => {
    const newKeyword = searchTermInput.trim();
    if (onSearchChange) {
      onSearchChange(newKeyword);
    }
  };


  // 엑셀 다운로드 핸들러 (수정: 클라이언트 데이터 사용)
  const handleDownloadClick = () => {
    try {
      // 정렬된 전체 데이터 사용 (페이지네이션 전)
      const dataToDownload = sortedData;

      if (!dataToDownload || dataToDownload.length === 0) {
        devWarn('다운로드할 데이터가 없습니다.');
        alert('다운로드할 데이터가 없습니다.'); // 임시
        return;
      }

      // 컬럼 정보를 사용하여 데이터 포맷팅 (showColumn이 false인 컬럼은 제외)
      const formattedData = dataToDownload.map(item => {
        const row: { [key: string]: any } = {};
        columns.forEach(col => {
          // showColumn이 false인 경우 엑셀에서 제외 (기본값은 true)
          if (col.showColumn === false) {
            return;
          }
          
          if (col.accessor) {
            let value = getPropertyValue(item, col.accessor);
            
            // Excel 전용 포맷터가 있는 경우 사용
            if (col.excelFormatter && typeof col.excelFormatter === 'function') {
              value = col.excelFormatter(value, item);
            }
            // Excel 전용 포맷터가 없는 경우, 원본 값 사용 (기본 포맷팅만 적용)
            else {
              // 기본 데이터 타입 포맷팅만 적용
              if (value instanceof Date) value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
              else if (typeof value === 'boolean') value = value ? 'Y' : 'N';
              else if (value === null || value === undefined) value = '';
              // formatter가 있어도 Excel에서는 원본 값 사용
            }
            
            const headerName =
              typeof col.header === 'string'
                ? col.header.replace(/\n/g, ' ')
                : String(col.accessor);
            
            // URL 패턴을 감지하여 하이퍼링크로 변환
            if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://'))) {
              row[headerName] = { t: 's', v: value, l: { Target: value } };
            } else {
              row[headerName] = value;
            }
          }
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${excelFileName}_${dayjs().format('YYYYMMDD')}.xlsx`);
      alert('엑셀이 다운로드되었습니다.'); // 임시
    } catch (err) {
      devError('Excel download failed:', err);
      alert('엑셀 다운로드 중 오류가 발생했습니다.'); // 임시
    }
  };

  // --- 행 클릭 핸들러 (기존 유지) ---
  const handleRowClickInternal = useCallback(
    (item: T, index: number) => {
      if (onRowClick) {
        onRowClick(item, index); // 부모 컴포넌트의 onRowClick 함수 호출
      }
    },
    [onRowClick]
  );

  // --- 키 추출기 (기존 유지) ---
  const internalKeyExtractor = useMemo(() => {
    if (keyExtractor) return keyExtractor;
    // 기본 keyExtractor: item.id 또는 item.index 사용 시도
    return (item: T, index: number) => item.id ?? item.index ?? `row-${index}`;
  }, [keyExtractor]);


  return (
    <Container $themeMode={themeMode}>
      <TopHeader>
        <HeaderMainRow>
          <TitleContainer>
            {typeof title === "string" ? (
              <CMSTitle $themeMode={themeMode}>{title}</CMSTitle>
            ) : (
              title /* ReactNode 직접 렌더링 */
            )}
          </TitleContainer>
          {enableCompanySearch && (
            <CompanySearchContainer>
              <Flex>
                <CompanySearchInput
                  type="text"
                  placeholder="고객사를 선택하세요"
                  value={selectedCompanyName || ''}
                  readOnly
                  onClick={() => setIsCompanyModalOpen(true)}
                  $themeMode={themeMode}
                />
                <SearchButton onClick={() => setIsCompanyModalOpen(true)} $themeMode={themeMode}>
                  검색
                </SearchButton>
              </Flex>
            </CompanySearchContainer>
          )}
        </HeaderMainRow>
        {renderTabs && <TabsWrapper>{renderTabs()}</TabsWrapper>}
      </TopHeader>

      <ControlHeader>
        <APIControls>
          <LeftFilterControls>
            {enableDateFilter && (
              <DateRangePickerContainer>
                <GenericDateRangePicker
                  initialFromDate={fromDate}
                  initialToDate={toDate}
                  onDateChange={handleDateChangeInternal}
                  themeMode={themeMode}
                  rangeOptions={dateRangeOptions}
                  hasUrlParams={hasUrlParams}
                />
              </DateRangePickerContainer>
            )}
          </LeftFilterControls>
          
          <RightFilterControls>
            {statusFilter && (
              <StatusFilterContainer>
                <StatusSelect
                  value={selectedStatus}
                  onChange={e => handleStatusChange(e.target.value)}
                  $themeMode={themeMode}
                  style={{
                    color:
                      STATUS_COLORS[selectedStatus as keyof typeof STATUS_COLORS] ||
                      STATUS_COLORS[''],
                  }}
                >
                  {statusFilter.options.map(option => (
                    <option
                      key={option.value}
                      value={option.value}
                      style={{
                        color:
                          STATUS_COLORS[option.value as keyof typeof STATUS_COLORS] ||
                          STATUS_COLORS[''],
                      }}
                    >
                      {option.label}
                    </option>
                  ))}
                </StatusSelect>
              </StatusFilterContainer>
            )}
            {enableSearch && (
              <SearchContainer>
                <SearchInput
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTermInput}
                  onChange={handleSearchInputChange}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleImmediateSearch();
                  }}
                  $themeMode={themeMode}
                />
                <SearchButton onClick={handleImmediateSearch} $themeMode={themeMode}>
                  조회
                </SearchButton>
              </SearchContainer>
            )}
          </RightFilterControls>
        </APIControls>

        <EventControls>
          <LeftControls>
            {customLeftContent ? (
              <>
                {customLeftContent}
                {addButton && (
                  <div style={{ marginLeft: '20px' }}>
                    <PrimaryButton $themeMode={themeMode} onClick={addButton.onClick}>
                      {addButton.label}
                    </PrimaryButton>
                  </div>
                )}
              </>
            ) : dualAmounts ? (
              <DualAmountsContainer>
                <TotalAmount>
                  <TotalAmountLabel>{dualAmounts.first.label}</TotalAmountLabel>
                  <TotalAmountValue>{dualAmounts.first.value}</TotalAmountValue>
                </TotalAmount>
                <TotalAmount>
                  <TotalAmountLabel>{dualAmounts.second.label}</TotalAmountLabel>
                  <TotalAmountValue>{dualAmounts.second.value}</TotalAmountValue>
                </TotalAmount>
              </DualAmountsContainer>
            ) : totalAmountLabel && totalAmount ? (
              <TotalAmount>
                <TotalAmountLabel>{totalAmountLabel}</TotalAmountLabel>
                <TotalAmountValue>{totalAmount}</TotalAmountValue>
              </TotalAmount>
            ) : null}

            {!customLeftContent && !totalAmount && !dualAmounts && addButton && (
              <PrimaryButton $themeMode={themeMode} onClick={addButton.onClick}>
                {addButton.label}
              </PrimaryButton>
            )}

            {deleteButton && (
              <SecondaryButton $themeMode={themeMode} onClick={deleteButton.onClick}>
                {deleteButton.label}
              </SecondaryButton>
            )}
          </LeftControls>

          {renderMiddleContent && (
            <MiddleControls>
              {renderMiddleContent()}
            </MiddleControls>
          )}

          <RightControls>
            {/* totalAmount 또는 dualAmounts가 있을 때는 addButton을 여기에 표시 */}
            {(totalAmount || dualAmounts) && addButton && (
              <PrimaryButton $themeMode={themeMode} onClick={addButton.onClick}>
                {addButton.label}
              </PrimaryButton>
            )}
            {/* 커스텀 버튼들 렌더링 */}
            {customButtons.map((button, index) => (
              <PrimaryButton key={index} $themeMode={themeMode} onClick={button.onClick}>
                {button.label}
              </PrimaryButton>
            ))}
            {excelTemplateButton && (
              <PrimaryButton $themeMode={themeMode} onClick={excelTemplateButton.onClick}>
                {excelTemplateButton.label}
              </PrimaryButton>
            )}
            {excelUploadButton && (
              <SecondaryButton $themeMode={themeMode} onClick={excelUploadButton.onClick}>
                {excelUploadButton.label}
              </SecondaryButton>
            )}

            <DownloadButton
              onClick={handleDownloadClick}
              $themeMode={themeMode}
              disabled={isLoading}
            >
              {isLoading ? '다운로드 중...' : '엑셀 다운로드'}
            </DownloadButton>

            <PaginationControls>
              <InfoText $themeMode={themeMode} style={{ marginRight: '16px' }}>
                총 {displayAllItems.toLocaleString()}개 중 {displayTotalItems.toLocaleString()}개
              </InfoText>
              <NavButton
                onClick={() => handlePageNumChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                $themeMode={themeMode}
              >
                &lt;
              </NavButton>
              <PageBox $themeMode={themeMode}>
                {currentPage} / {totalPages > 0 ? totalPages : 1}
              </PageBox>
              <NavButton
                onClick={() => handlePageNumChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                $themeMode={themeMode}
              >
                &gt;
              </NavButton>
              <DropdownCustom
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                options={itemsPerPageOptions}
                themeMode={themeMode}
              />
              <InfoText $themeMode={themeMode} style={{ marginLeft: '5px' }}>
                개씩 보기
              </InfoText>
            </PaginationControls>
          </RightControls>
        </EventControls>

          {/* 고객사 검색 모달 */}
          {enableCompanySearch && (
            <CompanySearchModal
              isOpen={isCompanyModalOpen}
              onClose={() => setIsCompanyModalOpen(false)}
              onSelect={(company) => {
                // 내부 핸들러 사용 (날짜처럼 내부 상태 관리)
                handleCompanySelect({ id: company.companyCode, name: company.companyName });
              }}
              themeMode={themeMode}
            />
          )}
      </ControlHeader>

        {isDynamicData ? (
          <DynamicTableContainer $themeMode={themeMode}>
            <DynamicGenericDataTable
              data={paginatedData}
              columns={columns}
              isLoading={isLoading}
              // error={error}
              onRowClick={handleRowClickInternal}
              onHeaderClick={handleHeaderClick}
              sortKey={sortKey}
              sortOrder={sortOrder}
              keyExtractor={internalKeyExtractor}
              themeMode={themeMode}
            />
          </DynamicTableContainer>
        ) : (
          <TableContainer $themeMode={themeMode}>
            <GenericDataTable
              data={paginatedData}
              columns={columns}
              isLoading={isLoading}
              // error={error}
              onRowClick={handleRowClickInternal}
              onHeaderClick={handleHeaderClick}
              sortKey={sortKey}
              sortOrder={sortOrder}
              keyExtractor={internalKeyExtractor}
              themeMode={themeMode}
            />
          </TableContainer>
        )}
      {/* )} */}
    </Container>
  );
};

const GenericListUI = forwardRef(GenericListUIInner) as <T extends BaseRecord>(
  props: GenericListUIProps<T> & { ref?: React.Ref<{ refetch: () => void }> }
) => React.ReactElement;


export default GenericListUI;

// --- 스타일 컴포넌트 (레이아웃 관련 수정) ---

const Container = styled.div<{ $themeMode: ThemeMode }>`
  min-width: 1200px;
  width: 100%;
  min-height: calc(100vh - 140px);
  box-sizing: border-box;
  padding: 20px 20px 20px 20px;
  overflow: visible; /* 드롭다운이 컨테이너를 벗어나서 보이도록 */
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? THEME_COLORS.light.text : THEME_COLORS.dark.text};
`;

const TopHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  gap: 15px;
`;

const HeaderMainRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0px;
  width: 100%;
`;

const CompanySearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TitleContainer = styled.div`
  /* 제목 영역 스타일 (필요시 추가) */
`;

const ControlHeader = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* background-color: #f0ede6; */
  margin: 20px 0;
  gap: 20px;
  overflow: visible; /* 드롭다운이 보이도록 */
  position: relative; /* 상대 위치 설정 */
`;

const APIControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* background-color: #756b55; */
  flex-wrap: wrap;
  /* padding: 10px; */
  border-radius: 8px;
  gap: 15px;
`;

const LeftFilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const RightFilterControls = styled.div`
  display: flex;
  align-items: center;
  /* gap: 15px; */
`;

const EventControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 20px;
  min-width: min-content;
  overflow-x: auto;
  overflow-y: visible; /* 수직 overflow를 visible로 설정 */
  position: relative; /* 상대 위치 설정 */

  /* 스크롤바 숨기기 */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
`;

const LeftControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
  flex-shrink: 0;
`;

const RightControls = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: nowrap;
  flex-shrink: 0;
  overflow: visible; /* 드롭다운이 보이도록 설정 */
  position: relative; /* 상대 위치 설정 */
`;

const MiddleControls = styled.div`
  display: flex;
  width: 100%;
  // align-items: space-between;
  gap: 10px;
  flex: 1;
  justify-content: center;
`;

const Flex = styled.div`
display:flex;
margin-bottom : 8px;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const BaseInput = styled.input<{ $themeMode: ThemeMode }>`
  width: 250px;
  height: 40px;
  border: 1px solid
    ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor)};
  border-right: none;
  border-radius: 4px 0 0 4px;

  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.inputText : THEME_COLORS.dark.inputText)};
  padding-left: 15px;
  padding-right: 35px;
  background-color: ${({ $themeMode }) =>
    $themeMode === "light" ? THEME_COLORS.light.inputBackground : THEME_COLORS.dark.inputBackground};

  &::placeholder {
    color: ${({ $themeMode }) => ($themeMode === "light" ? "#AAAAAA" : "#888888")};
  }

  &:focus {
    outline: none;
    border-color: ${({ $themeMode }) =>
      $themeMode === "light" ? THEME_COLORS.light.primary : THEME_COLORS.dark.accent};
  }
`;

const SearchInput = styled(BaseInput)`
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;

  &:focus {
    background-image: url("/icon_search.png");
  }
`;

const CompanySearchInput = styled(BaseInput)`
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  
  &:hover {
    background-color: ${({ $themeMode }) =>
      $themeMode === "light" ? "#f5f5f5" : THEME_COLORS.dark.background};
  }
`;

const SearchButton = styled.button<{ $themeMode: ThemeMode }>`
  width: 60px;
  height: 40px;
  background: #214a72;
  border: none;
  border-radius: 0;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: visible; /* 드롭다운이 보이도록 설정 */
  position: relative; /* 상대 위치 설정 */
`;

const PageBox = styled.div<{ $themeMode: ThemeMode }>`
  margin: 0 5px;
  font-size: 14px;
  color: #887e67;
  white-space: nowrap;
`;

const InfoText = styled.p<{ $themeMode: ThemeMode }>`
  margin: 0;
  font-size: 14px;
  color: #887e67;
  white-space: nowrap;
`;

const TableContainer = styled.div<{ $themeMode: ThemeMode }>`
  width: 100%;
  min-width: 1000px;
  max-width: 100%; /* 컨테이너를 벗어나지 않도록 최대 너비 제한 */
  border: 1px solid
    ${({ $themeMode }) =>
      $themeMode === 'light' ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  background: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.tableBackground
      : THEME_COLORS.dark.tableBackground};
  overflow: hidden; /* 테이블이 컨테이너를 벗어나지 않도록 */
  table-layout: fixed; /* 테이블 레이아웃을 고정하여 컬럼 너비 제어 */

  /* 내부 테이블 요소들도 너비 제한 */
  table {
    width: 100%;
    table-layout: fixed;
  }

  @media (max-width: 1400px) {
    min-width: 1000px;
  }
`;

const DateRangePickerContainer = styled.div`
  /* 특별한 스타일 불필요 */
`;

const TabsWrapper = styled.div`
  margin-top: 15px;
`;

const CMSTitle = styled.h1<{ $themeMode: ThemeMode }>`
  font-size: 28px;
  font-weight: bold;
  margin: 0;
  margin-bottom: 0;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? THEME_COLORS.light.titleColor : THEME_COLORS.dark.titleColor};
`;

const NavButton = styled.button<{ $themeMode: ThemeMode }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  border: 1px solid
    ${({ $themeMode }) =>
      $themeMode === 'light' ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor};
  background-color: #ddd8c7;
  color: ${({ $themeMode }) =>
    $themeMode === 'light' ? THEME_COLORS.light.text : THEME_COLORS.dark.text};
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
  transition:
    background-color 0.2s,
    border-color 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.8;
    border-color: ${({ $themeMode }) => ($themeMode === 'light' ? '#999' : '#AAAAAA')};
    background-color: ${({ $themeMode }) => ($themeMode === 'light' ? '#f8f8f8' : '#424451')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: ${({ $themeMode }) => ($themeMode === 'light' ? '#EEEEEE' : '#555555')};
    color: ${({ $themeMode }) => ($themeMode === 'light' ? '#AAAAAA' : '#777777')};
  }
`;

const DualAmountsContainer = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const TotalAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #97601a;
  font-weight: 500;
`;

const TotalAmountLabel = styled.span`
  font-size: 24px;
  color: black;
  font-weight: 600;
  margin-right: 10px;
`;

const TotalAmountValue = styled.span`
  font-size: 24px;
  color: #db6220;
  font-weight: 600;
`;

// 스타일 컴포넌트 추가
const StatusFilterContainer = styled.div`
  margin: 0 10px;
  position: relative;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 16px;
    background-image: url('/icon_burger.png');
    background-size: contain;
    background-repeat: no-repeat;
    transform: translateY(-50%) rotate(270deg);
    pointer-events: none;
  }
`;

const StatusSelect = styled.select<{ $themeMode: ThemeMode }>`
  width: 150px;
  height: 40px;
  padding: 11px 14px;
  padding-right: 30px; // 아이콘을 위한 여백
  border: 1px solid #e0e0e0;
  border-radius: 0px;
  background-color: #fbf9f2;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  &:focus {
    outline: none;
    border-color: #97601a;
  }

  option {
    padding: 8px;
    background-color: white;

    &[value=''] {
      color: #887e67;
    }
    &[value='ONGOING'] {
      color: #4caf50;
    }
    &[value='ENDED'] {
      color: #2196f3;
    }
    &[value='WAITING'] {
      color: #ff9800;
    }
    &[value='CANCELED'] {
      color: #f44336;
    }
  }
`;

// 동적 테이블을 위한 컨테이너 스타일
const DynamicTableContainer = styled.div<{ $themeMode: ThemeMode }>`
  width: 100%;
  min-width: 1000px;
  max-width: 100%;
  border: 1px solid
    ${({ $themeMode }) =>
      $themeMode === 'light' ? THEME_COLORS.light.borderColor : THEME_COLORS.dark.borderColor};
  border-radius: 4px;
  background: ${({ $themeMode }) =>
    $themeMode === 'light'
      ? THEME_COLORS.light.tableBackground
      : THEME_COLORS.dark.tableBackground};
  overflow-x: auto;
  overflow-y: hidden;

  /* 스크롤바 스타일링 */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  @media (max-width: 1400px) {
    min-width: 1000px;
  }
`;