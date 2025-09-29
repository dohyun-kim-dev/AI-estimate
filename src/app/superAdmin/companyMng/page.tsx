'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { toast, ToastContainer } from 'react-toastify';
import { getCompanyList, createCompany, updateCompany } from '@/lib/api/admin/adminApi';
import dayjs from 'dayjs';
import { FetchParams, FetchResult } from '@/components/CustomList/GenericListUI';
import { ColumnDefinition } from '@/components/CustomList/GenericDataTable';
import CompanyFormPopup from './CompanyFormPopup';
import CategoryRegisterPopup from './CategoryRegisterPopup';
import CategorySearchPopup from './CategorySearchPopup';
import styled from 'styled-components';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS } from '@/styles/theme_colors';
import { ThemeMode } from '@/styles/theme_colors';

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
  name: string;
  companyName: string;
  cellphone: string;
  email: string;
  companyCode: string;
  dbName: string;
  address: string;
  detailAddress: string;
  ciImage: string;
  businessImage: string;
  contractType: string;
  contractStartDate: string;
  contractEndDate: string;
  aiConfidence: string;
  mode: string;
  category: {name: string, code: string} | null;
  businessNumber: string;
  memo: string;
  licence: string;
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
  
  // 새로운 Company 타입에 맞는 상태
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
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
  const [ceoPhone, setCeoPhone] = useState('');
  const [ceoEmail, setCeoEmail] = useState('');
  const [contractType, setContractType] = useState('');
  const [mode, setMode] = useState('');
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [homepage, setHomepage] = useState('');
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
    ceoPhone?: string;
    ceoEmail?: string;
    contractType?: string;
    mode?: string;
    contractStartDate?: string;
    contractEndDate?: string;
  }>({});
 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCategoryRegisterOpen, setIsCategoryRegisterOpen] = useState(false);
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);
  const [isCompanyRegisterOpen, setIsCompanyRegisterOpen] = useState(false);
  const listRef = useRef<{ refetch: () => void }>(null);

  const resetForm = useCallback(
    (initial?: Partial<Company>) => {
      setSelectedCustomer(initial ?? null);
      setName(initial?.name ?? '');
      setCompanyName(initial?.companyName ?? '');
      setCode(initial?.companyCode ?? '');
      setCategory(initial?.category?.name ?? '');
      setBusinessNumber(initial?.businessNumber ?? '');
      setMemo(initial?.memo ?? '');
      setLicence(initial?.licence ?? '');
      setEmail(initial?.email ?? '');
      setCellphone(initial?.cellphone ?? '');
      setAddress(initial?.address ?? '');
      setDetailAddress(initial?.detailAddress ?? '');
      setCeoName(''); // 실제 데이터에 맞게 수정 필요
      setCeoPhone(''); // 실제 데이터에 맞게 수정 필요
      setCeoEmail(''); // 실제 데이터에 맞게 수정 필요
      setContractType(initial?.contractType ?? '');
      setMode(initial?.mode ?? '');
      setContractStartDate(initial?.contractStartDate ?? '');
      setContractEndDate(initial?.contractEndDate ?? '');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
    },
    []
  );

  const handleAddClick = () => {
    resetForm();
    setIsPopupOpen(true);
  };

  const handleRowClick = (customer: Company) => {
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
    setIsCompanyRegisterOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedCustomer) {
        // 수정 모드
        const categoryId = typeof selectedCustomer.category === 'object' 
          ? selectedCustomer.category?.name || category 
          : selectedCustomer.category || category;
          
        const updateParams = {
          name,
          companyName,
          cellphone,
          email,
          address,
          detailAddress,
          memo,
          category: categoryId,
          contractStartDate,
          contractEndDate,
          contractType: contractType as 'MONTH' | 'YEAR',
        };
        
        const targetCompanyCode = code || selectedCustomer.companyCode || '';
        await updateCompany(targetCompanyCode, updateParams);
        toast.success('고객사 정보가 수정되었습니다.');
      } else {
        // 신규 생성 모드
        const createParams = {
          name: name || '',
          companyName: companyName || '',
          cellphone: cellphone || '',
          email: email || '',
          companyCode: code || '',
          dbName: code || '', // 보통 companyCode와 동일
          address: address || '',
          detailAddress: detailAddress || '',
          homepage: homepage,
          ciImage: ciImage,
          businessImage: businessImage,
          memo: memo,
          category: category || '',
          contractStartDate: contractStartDate || '',
          contractEndDate: contractEndDate || '',
          contractType: contractType as 'MONTH' | 'YEAR',
        };
        
        await createCompany(createParams);
        toast.success('고객사가 등록되었습니다.');
      }
      
      setIsPopupOpen(false);
      // 리스트 새로고침
      setTimeout(() => {
        listRef.current?.refetch();
      }, 100);
    } catch (error) {
      console.error('고객사 저장 실패:', error);
      toast.error('저장 중 오류가 발생했습니다.');
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

        console.log('response', response);

        // callAdminApi는 응답을 배열로 감싸서 반환하므로 첫 번째 요소를 가져옴
        const actualResponse = Array.isArray(response) ? response[0] : response;
        console.log('actualResponse', actualResponse);

        // actualResponse.data에서 실제 API 응답을 가져옴
        const apiResponse = (actualResponse as any)?.data as ApiResponse<Company>;
        console.log('apiResponse', apiResponse);

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
        // formatter: (value, item, index) => index + 1,
      },
      {
        header: '가입일시',
        accessor: 'createAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY-MM-DD(ddd) HH:mm') : '-'),
      },
      { header: '고객사명', accessor: 'companyName' },
      {
        header: '고객사 CI',
        accessor: 'ciImage',
        formatter: (value) => value ? '이미지 있음' : '-',
      },
      {
        header: '라이선스',
        accessor: 'mode',
        formatter: (value) => {
          switch (value) {
            case 'LIGHT': return 'Lite (고객용)';
            case 'FULL': return 'Full';
            default: return value || '-';
          }
        },
      },
      {
        header: '계약구분',
        accessor: 'contractType',
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
        accessor: 'contractStartDate',
        formatter: (value, row) => {
          const start = row.contractStartDate ? dayjs(row.contractStartDate).format('YY-MM-DD') : '';
          const end = row.contractEndDate ? dayjs(row.contractEndDate).format('YY-MM-DD') : '';
          return start && end ? `${start} ~ ${end}` : '-';
        },
      },
      {
        header: '카테고리명',
        accessor: 'category',
        formatter: (value) => value?.name || '-',
      },
      {
        header: '카테고리코드',
        accessor: 'category',
        formatter: (value) => value?.code || '-',
      },
      {
        header: '사업자번호',
        accessor: 'businessNumber',
        formatter: (value) => value || '-',
      },
      { header: '대표명', accessor: 'name' },
      {
        header: '고객사 주소',
        accessor: 'address',
        formatter: (value, row) => `${row.address || ''} ${row.detailAddress || ''}`.trim() || '-',
      },
      { header: '전화번호', accessor: 'cellphone' },
      { header: '이메일', accessor: 'email' },
      {
        header: '메모',
        accessor: 'memo',
        formatter: (value) => value || '-',
      },
    ],
    []
  );

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} theme="light" style={{ zIndex: 10000 }} />
<div style={{ height: '100vw' }} > {/* 상단 여백 */}
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
        onClose={() => setIsCompanyRegisterOpen(false)}
        onSave={async () => {
          try {
            const createParams = {
              name,
              companyName,
              cellphone,
              email,
              companyCode: code,
              dbName: code, // 보통 companyCode와 동일
              address,
              detailAddress,
              memo,
              category,
              contractStartDate,
              contractEndDate,
              contractType: contractType as 'MONTH' | 'YEAR',
            };
            
            await createCompany(createParams);
            toast.success('고객사가 등록되었습니다.');
            setIsCompanyRegisterOpen(false);
            
            // 리스트 새로고침
            setTimeout(() => {
              listRef.current?.refetch();
            }, 100);
          } catch (error) {
            console.error('고객사 등록 실패:', error);
            toast.error('등록 중 오류가 발생했습니다.');
          }
        }}
        selectedCustomer={null}
        formData={{
          name: '',
          companyName: '',
          code: '',
          category: '',
          businessNumber: '',
          memo: '',
          licence: '',
          password: '',
          confirmPassword: '',
          email: '',
          cellphone: '',
          address: '',
          detailAddress: '',
          ceoName: '',
          ceoPhone: '',
          ceoEmail: '',
          contractType: '',
          mode: '',
          contractStartDate: '',
          contractEndDate: '',
          homepage: '',
          ciImage: undefined,
          businessImage: undefined,
          errors: {},
        }}
        onFormChange={{
          setName: setName,
          setCompanyName: setCompanyName,
          setCode: setCode,
          setCategory: setCategory,
          setBusinessNumber: setBusinessNumber,
          setMemo: setMemo,
          setLicence: setLicence,
          setPassword: setPassword,
          setConfirmPassword: setConfirmPassword,
          setEmail: setEmail,
          setCellphone: setCellphone,
          setAddress: setAddress,
          setDetailAddress: setDetailAddress,
          setCeoName: setCeoName,
          setCeoPhone: setCeoPhone,
          setCeoEmail: setCeoEmail,
          setContractType: setContractType,
          setMode: setMode,
          setContractStartDate: setContractStartDate,
          setContractEndDate: setContractEndDate,
          setHomepage: setHomepage,
          setCiImage: setCiImage,
          setBusinessImage: setBusinessImage,
        }}
      />
      </div>
    </>
  );
};

export default CustomerMngPage;
