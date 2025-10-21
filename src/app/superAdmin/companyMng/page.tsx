'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { useToast } from '@/components/common/ToastProvider';
import { getCompanyList, createCompany, updateCompany } from '@/lib/api/admin/adminApi';
import { getFileUrl } from '@/lib/api/user/userApi';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import CompanyFormPopup from './CompanyFormPopup';
import CategoryRegisterPopup from './CategoryRegisterPopup';
import CategorySearchPopup from './CategorySearchPopup';
import styled from 'styled-components';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS } from '@/styles/theme_colors';
import { ThemeMode } from '@/styles/theme_colors';
import { devLog } from '@/utils/devLogger'
import 'dayjs/locale/ko';

dayjs.locale('ko');

// API 응답 타입 정의
interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  metadata: {
    allCnt: number;
    totalCnt: number;
  };
  error: {
    statusCode: number;
    message: string;
    customMessage?: string;
  } | null;
}

type Company = {
  _id: string;
  no?: number; // No 필드 추가
  name: string; // 고객사 대표명
  companyName: string; // 고객사명(KR)
  dbName: string; // 고객사명(EN)
  cellphone: string;
  email: string;
  companyCode: string; // 고객사코드
  address: string;
  detailAddress: string;
  ciImage: string;
  businessImage: string;
  contractType: string;
  contractStartDate: string;
  contractEndDate: string;
  aiConfidence: string;
  mode: string;
  category: {
    _id: string;
    name: string;
    code: string;
  } | null;
  businessNumber: string;
  memo: string;
  licence: string;
  homepage?: string;
  createAt: string;
};

const PrimaryButton = styled(ActionButton)`
  width: 110px;
  height: 40px;
  background: ${THEME_COLORS.light.primary};
  color: #f8f8f8;
  border: none;
  margin-left: 8px;
`;

const CustomerMngPage: React.FC = () => {
  const [customers, setCustomers] = useState<Company[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Partial<Company> | null>(null);
  const { show: showToast } = useToast(); // 토스트 훅 추가
  // 새로운 Company 타입에 맞는 상태
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryCode, setCategoryCode] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [memo, setMemo] = useState('');
  const [licence, setLicence] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [ceoName, setCeoName] = useState('');
  const [contractType, setContractType] = useState('MONTH');
  const [mode, setMode] = useState('LIGHT');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [homepage, setHomepage] = useState('');
  const [ceoPhone, setCeoPhone] = useState('');
  const [ceoEmail, setCeoEmail] = useState('');
  const [ciImage, setCiImage] = useState<string | undefined>();
  const [businessImage, setBusinessImage] = useState<string | undefined>();
  
  // 에러 상태
  const [errors, setErrors] = useState<{
    name?: string;
    companyName?: string;
    code?: string;
    category?: string;
    businessNumber?: string;
    memo?: string;
    licence?: string;
    password?: string;
    confirmPassword?: string;
    email?: string;
    cellphone?: string;
    address?: string;
    detailAddress?: string;
    ceoName?: string;
    contractType?: string;
    mode?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    homepage?: string;
    ciImage?: string;
    businessImage?: string;
  }>({});
 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCategoryRegisterOpen, setIsCategoryRegisterOpen] = useState(false);
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);
  const [isCompanyRegisterOpen, setIsCompanyRegisterOpen] = useState(false);
  const listRef = useRef<{ refetch: () => void }>(null);

  const resetForm = useCallback(
    (initial?: Partial<Company>) => {
      // selectedCustomer는 별도로 설정하므로 여기서는 제외
      setName(initial?.name ?? ''); // 고객사 대표명
      setCompanyName(initial?.companyName ?? ''); // 고객사명(KR)
      setCode(initial?.companyCode ?? ''); // 고객사코드
      setCategory(initial?.category?.name ?? '');
      setCategoryId(initial?.category?._id ?? '');
      setCategoryCode(initial?.category?.code ?? '');
      setBusinessNumber(initial?.businessNumber ?? '');
      setMemo(initial?.memo ?? '');
      setLicence(initial?.licence ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setAddress(initial?.address ?? '');
      setDetailAddress(initial?.detailAddress ?? '');
      setCeoName(initial?.dbName ?? ''); // 고객사명(EN)
      setCeoPhone(''); // 추가된 필드 초기화
      setCeoEmail(''); // 추가된 필드 초기화
      setContractType(initial?.contractType ?? 'MONTH');
      setMode(initial?.mode ?? 'LIGHT');
      setContractStartDate(initial?.contractStartDate ?? '');
      setContractEndDate(initial?.contractEndDate ?? '');
      setHomepage(initial?.homepage ?? '');
      setCiImage(initial?.ciImage); // CI 이미지 파일 경로
      setBusinessImage(initial?.businessImage); // 사업자등록증 파일 경로
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    },
    []
  );

  const handleAddClick = () => {
    resetForm();
    setSelectedCustomer(null); // 명시적으로 null 설정
    setIsPopupOpen(true);
  };

  const handleRowClick = (customer: Company) => {
    setSelectedCustomer(customer); // 먼저 customer 설정
    resetForm(customer);
    setIsPopupOpen(true);
  };

  const handleCategoryRegisterClick = () => {
    setIsCategoryRegisterOpen(true);
  };

  const handleCategorySearchClick = () => {
    setIsCategorySearchOpen(true);
  };

  const handleCompanyRegisterClick = () => {
    setSelectedCustomer(null); // 먼저 null로 설정
    resetForm(); // 고객사 등록 시 모든 상태 초기화
    setIsCompanyRegisterOpen(true);
  };

  // 폼 벨리데이션 함수
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    // 필수 필드 검증
    if (!companyName.trim()) {
      newErrors.companyName = '고객사명(KR)은 필수입니다.';
    }
    
    if (!ceoName.trim()) {
      newErrors.ceoName = '고객사명(EN)은 필수입니다.';
    }
    
    if (!code.trim()) {
      newErrors.code = '고객사코드는 필수입니다.';
    }
    
    if (!categoryId.trim()) {
      newErrors.category = '카테고리는 필수입니다.';
    }
    
    // 사업자번호 검증 (10자리 숫자, 하이픈 포함 12자리)
    if (!businessNumber.trim()) {
      newErrors.businessNumber = '사업자번호는 필수입니다.';
    } else {
      const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$|^\d{10}$/;
      if (!businessNumberPattern.test(businessNumber.trim())) {
        newErrors.businessNumber = '사업자번호는 10자리 숫자 또는 000-00-00000 형식으로 입력하세요.';
      }
    }
    
    if (!name.trim()) {
      newErrors.name = '대표명은 필수입니다.';
    }
    
    // 대표 전화번호 검증 (10~11자리 숫자, 하이픈 포함 가능)
    if (!cellphone.trim()) {
      newErrors.cellphone = '대표 전화번호는 필수입니다.';
    } else {
      const phonePattern = /^01[016789]-?\d{3,4}-?\d{4}$|^0\d{1,2}-?\d{3,4}-?\d{4}$/;
      const numbersOnly = cellphone.replace(/[^0-9]/g, '');
      if (!phonePattern.test(cellphone.trim()) || numbersOnly.length < 10 || numbersOnly.length > 11) {
        newErrors.cellphone = '전화번호는 10~11자리 숫자로 입력하세요. (예: 010-1234-5678)';
      }
    }
    
    // 대표 이메일 검증 (더 엄격한 이메일 형식)
    if (!email.trim()) {
      newErrors.email = '대표 이메일은 필수입니다.';
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email.trim())) {
        newErrors.email = '올바른 이메일 형식으로 입력하세요. (예: example@domain.com)';
      }
    }
    
    // 홈페이지 URL 검증 (선택사항이지만 입력 시 형식 검증)
    if (homepage && homepage.trim()) {
      let urlToValidate = homepage.trim();
      
      // http:// 또는 https://가 없으면 추가
      if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
        urlToValidate = 'https://' + urlToValidate;
      }
      
      try {
        const url = new URL(urlToValidate);
        // 유효한 URL이면 정규화된 형태로 저장
        if (onFormChange?.setHomepage) {
          onFormChange.setHomepage(urlToValidate);
        }
      } catch {
        newErrors.homepage = '올바른 홈페이지 주소를 입력하세요. (예: www.example.com 또는 https://www.example.com)';
      }
    }
    
    if (!address.trim()) {
      newErrors.address = '고객사 주소는 필수입니다.';
    }
    
    if (!detailAddress.trim()) {
      newErrors.detailAddress = '상세 주소는 필수입니다.';
    }
    
    // CI 이미지 필수 검증
    if (!ciImage || ciImage.trim() === '') {
      newErrors.ciImage = '고객사 CI 이미지는 필수입니다.';
    }
    
    // 사업자등록증 필수 검증
    if (!businessImage || businessImage.trim() === '') {
      newErrors.businessImage = '사업자등록증은 필수입니다.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // 벨리데이션 체크
    if (!validateForm()) {
      showToast('필수 항목을 모두 입력해주세요.', 'error');
      return;
    }

    try {
      if (selectedCustomer) {
        // 수정 모드 - categoryId 상태값을 사용 (화면에서 선택한 카테고리의 ID)
        const updateParams = {
          name, // 대표명
          companyName, // 고객사명(KR)
          dbName: ceoName, // 고객사명(EN)
          cellphone,
          email,
          address,
          detailAddress,
          memo,
          businessNumber,
          homepage, // 홈페이지 추가
          ciImage,
          businessImage,
          category: categoryId, // 현재 선택된 카테고리 ID 사용
          contractStartDate: contractStartDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
          contractEndDate: contractEndDate || dayjs().add(contractType === 'MONTH' ? 1 : 12, 'month').format('YYYY-MM-DD HH:mm:ss'),
          contractType: contractType as 'MONTH' | 'YEAR',
        };
        
        const targetCompanyCode = code || selectedCustomer.companyCode || '';
        await updateCompany(targetCompanyCode, updateParams);
        showToast('고객사 정보가 수정되었습니다.','success');
      } else {
        // 신규 생성 모드
        const createParams = {
          name: name || '', // 대표명
          companyName: companyName || '', // 고객사명(KR)
          dbName: ceoName || '', // 고객사명(EN)
          cellphone: cellphone || '',
          email: email || '',
          companyCode: code || '', // 고객사코드
          address: address || '',
          detailAddress: detailAddress || '',
          homepage: homepage,
          ciImage: ciImage,
          businessImage: businessImage,
          memo: memo,
          businessNumber: businessNumber,
          category: categoryId || '',
          contractStartDate: contractStartDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
          contractEndDate: contractEndDate || dayjs().add(contractType === 'MONTH' ? 1 : 12, 'month').format('YYYY-MM-DD HH:mm:ss'),
          contractType: contractType as 'MONTH' | 'YEAR',
        };
        
        await createCompany(createParams);
        showToast('고객사가 등록되었습니다.','success');
      }
      
      // API 성공 시에만 모달 닫기 및 리스트 새로고침
      setIsPopupOpen(false);
      setIsCompanyRegisterOpen(false);
      
      // 리스트 새로고침
      setTimeout(() => {
        listRef.current?.refetch();
      }, 100);
      
    } catch (error) {
      console.error('고객사 저장 실패:', error);
      showToast('저장 중 오류가 발생했습니다.','error');
      // 에러 발생 시 모달은 닫지 않음
    }
  };

  const fetchData = useCallback(
    async (params: FetchParams): Promise<FetchResult<Company>> => {
      try {
        const fromDate = '2025-01-01';
        const toDate = dayjs().format('YYYY-MM-DD');

        const response = await getCompanyList({
          keyword: params.keyword || '',
          fromDate: fromDate,
          toDate: toDate,
        });

        devLog('response', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        devLog('actualResponse', actualResponse);

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<Company>;
        devLog('apiResponse', apiResponse);

        if (apiResponse && apiResponse.message === 'success') {
          return {
            data: apiResponse.data || [],
            totalItems: apiResponse.metadata?.totalCnt || 0,
            allItems: apiResponse.metadata?.allCnt || 0
          } as FetchResult<Company>;
        } else {
          console.error('API Error:', apiResponse);
          return {
            data: [],
            totalItems: 0,
            allItems: 0
          };
        }
      } catch (error) {
        console.error('Fetch Error:', error);
        return {
          data: [],
          totalItems: 0,
          allItems: 0
        };
      }
    },
    []
  );

  // 고객사 전용 엑셀 다운로드 함수
  const handleCustomExcelDownload = useCallback((data: Company[], columns: ColumnDefinition<Company>[]) => {
    try {
      if (!data || data.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      // 엑셀 데이터 포맷팅 (라이선스, 카테고리명 제외, 계약기간 형식 변경)
      const formattedData = data.map(item => {
        const row: { [key: string]: any } = {};
        
        // 원하는 컬럼만 추가
        row['No'] = item.no || '';
        row['가입일시'] = item.createAt ? dayjs(item.createAt).format('YY.MM.DD(ddd) HH:mm') : '-';
        row['고객사명(KR)'] = item.companyName || '-';
        row['고객사명(EN)'] = item.dbName || '-';
        // 라이선스 제외
        // 계약구분
        row['계약구분'] = item.contractType || '-';
        // 계약기간 - 25.10.19 ~ 26.10.19 형식
        const start = item.contractStartDate ? dayjs(item.contractStartDate).format('YY.MM.DD') : '';
        const end = item.contractEndDate ? dayjs(item.contractEndDate).format('YY.MM.DD') : '';
        row['계약기간'] = start && end ? `${start} ~ ${end}` : '-';
        // 카테고리명 제외
        row['사업자번호'] = item.businessNumber || '-';
        row['대표명'] = item.name || '-';
        row['고객사 주소'] = `${item.address || ''} ${item.detailAddress || ''}`.trim() || '-';
        row['전화번호'] = item.cellphone || '-';
        row['이메일'] = item.email || '-';
        row['메모'] = item.memo || '-';
        
        return row;
      });

      // 워크시트 생성
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // 컬럼 너비 설정
      const columnWidths = [
        { wch: 5 },   // No
        { wch: 18 },  // 가입일시
        { wch: 15 },  // 고객사명(KR)
        { wch: 15 },  // 고객사명(EN)
        { wch: 10 },  // 계약구분
        { wch: 20 },  // 계약기간
        { wch: 15 },  // 사업자번호
        { wch: 10 },  // 대표명
        { wch: 30 },  // 고객사 주소
        { wch: 15 },  // 전화번호
        { wch: 25 },  // 이메일
        { wch: 20 },  // 메모
      ];
      worksheet['!cols'] = columnWidths;

      // 워크북 생성 및 워크시트 추가
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '고객사 목록');

      // 파일 다운로드
      const fileName = `고객사_목록_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  }, []);

  const formData = {
    name,
    companyName,
    code,
    category,
    businessNumber,
    memo,
    licence,
    password,
    confirmPassword,
    email,
    cellphone,
    address,
    detailAddress,
    ceoName,
    ceoPhone,
    ceoEmail,
    contractType,
    mode,
    contractStartDate,
    contractEndDate,
    homepage,
    ciImage,
    businessImage,
    errors,
  };

  const onFormChange = {
    setName,
    setCompanyName,
    setCode,
    setCategory,
    setCategoryId,
    setCategoryCode,
    setBusinessNumber,
    setMemo,
    setLicence,
    setPassword,
    setConfirmPassword,
    setEmail,
    setCellphone,
    setAddress,
    setDetailAddress,
    setCeoName,
    setCeoPhone,
    setCeoEmail,
    setContractType,
    setMode,
    setContractStartDate,
    setContractEndDate,
    setHomepage,
    setCiImage,
    setBusinessImage,
  };

  const columns = useMemo(
    () => [
      {
        header: 'No',
        accessor: 'no',
        width: 60,
        // formatter: (value, item, index) => index + 1,
      },
      {
        header: '가입일시',
        accessor: 'createAt',
        width:100,
        allowWrap: true,
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY.MM.DD(ddd) HH:mm') : '-'),
      },
      { header: '고객사명(KR)', accessor: 'companyName', width: 100 },
      { header: '고객사명(EN)', accessor: 'dbName', width: 100 },
      {
        header: '고객사 CI',
        accessor: 'ciImage',
        flex: 1,
        formatter: (value) => {
          if (!value) return '-';
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={getFileUrl(value)}
                alt="고객사 CI"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'; // 이미지 로드 실패 시 숨김
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.textContent = '-'; // 빈칸 대신 '-' 표시
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        header: '라이선스',
        accessor: 'license',
        flex:1,
        formatter: (value) => {
          switch (value) {
            case 'LIGHT': return 'Lite (고객용)';
            default: return value || 'Pro';
          }
        },
      },
      {
        header: '계약구분',
        accessor: 'contractType',flex:1,
        formatter: (value) => {
          switch (value) {
            case 'MONTH': return '월계약';
            case 'YEAR': return '년계약';
            default: return value || '-';
          }
        },
      },
      {
        header: '계약기간',
        accessor: 'contractStartDate',width: 100,allowWrap: true,
        formatter: (value, row) => {
          const start = row.contractStartDate ? dayjs(row.contractStartDate).format('YY.MM.DD') : '';
          const end = row.contractEndDate ? dayjs(row.contractEndDate).format('YY.MM.DD') : '';
          return start && end ? `${start} ~ ${end}` : '-';
        },
      },
      {
        header: '카테고리명',
        accessor: 'category',width:100,
        formatter: (value) => value?.name || '-',
      },
      // {
      //   header: '카테고리코드',
      //   accessor: 'category',
      //   formatter: (value) => value?.categoryCode || '-',
      // },
      {
        header: '사업자번호',
        accessor: 'businessNumber',width:100,allowWrap: true,
        formatter: (value) => value || '-',
      },
      { header: '대표명', accessor: 'name',flex:1 },
      {
        header: '고객사 주소',flex:1,allowWrap: true,
        accessor: 'address',
        formatter: (value, row) => `${row.address || ''} ${row.detailAddress || ''}`.trim() || '-',
      },
      { header: '전화번호', accessor: 'cellphone',flex:1,allowWrap: true, },
      { header: '이메일', accessor: 'email',flex:1,allowWrap: true },
      {
        header: '메모',
        accessor: 'memo',flex:1,allowWrap: true,
        formatter: (value) => value || '-',
      },
    ],
    []
  );

  return (
    <>
      {/* <ToastContainer position="top-center" autoClose={3000} theme="light" style={{ zIndex: 10000 }} /> */}
      <CmsResponsiveContainer<Company>
        ref={listRef}
        title="고객사 관리"
        data={[]} // 초기값, fetchData가 있으면 무시됨
        columns={columns}
        fetchData={fetchData}
        onRowClick={handleRowClick}
        // onAdd={handleAddClick}
        // addButtonLabel="고객사 등록"
        themeMode="light"
        compactFieldCount={4}
        defaultViewMode="detail"
        enableDateFilter={false}
        customExcelDownload={handleCustomExcelDownload}
        renderMiddleContent={() => (
          <div style={{ flex: 1, textAlign: 'end', justifyContent: 'flex-end', fontWeight: 'bold', display: 'flex', gap: '8px' }}>
            <PrimaryButton $themeMode="light" onClick={handleCategoryRegisterClick}>
              카테고리 등록
            </PrimaryButton>
            <PrimaryButton $themeMode="light" onClick={handleCategorySearchClick}>
              카테고리 조회
            </PrimaryButton>
            <PrimaryButton $themeMode="light" onClick={handleCompanyRegisterClick}>
              고객사 등록
            </PrimaryButton>
          </div>
        )}
      />

      {/* 카테고리 등록 팝업 */}
      <CategoryRegisterPopup
        isOpen={isCategoryRegisterOpen}
        onClose={() => setIsCategoryRegisterOpen(false)}
      />

      {/* 카테고리 조회 팝업 */}
      <CategorySearchPopup
        isOpen={isCategorySearchOpen}
        onClose={() => setIsCategorySearchOpen(false)}
        showEditActions={true}
      />

      {/* 고객사 수정 팝업 */}
      <CompanyFormPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSave}
        selectedCustomer={selectedCustomer as any}
        formData={formData}
        onFormChange={onFormChange}
      />

      {/* 고객사 등록 팝업 */}
      <CompanyFormPopup
        isOpen={isCompanyRegisterOpen}
        onClose={() => {
          setSelectedCustomer(null); // 명시적으로 null 설정
          resetForm(); // 폼 초기화
          setIsCompanyRegisterOpen(false);
        }}
        onSave={handleSave} // 동일한 저장 로직 사용
        selectedCustomer={null} // null이면 등록 모드
        formData={formData} // 동일한 formData 사용
        onFormChange={onFormChange} // 동일한 onFormChange 사용
      />
    </>
  );
};

export default CustomerMngPage;
