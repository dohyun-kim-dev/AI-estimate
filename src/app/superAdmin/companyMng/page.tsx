'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import CmsResponsiveContainer from '@components/CustomList/ResponsiveList/CmsResponsiveContainer';
import { toast, ToastContainer } from 'react-toastify';
import { getCompanyList, createCompany, updateCompany } from '@/lib/api/admin/adminApi';
import { getFileUrl } from '@/lib/api/user/userApi';
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
import { devLog } from '@/utils/devLogger'

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
  }>({});
 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCategoryRegisterOpen, setIsCategoryRegisterOpen] = useState(false);
  const [isCategorySearchOpen, setIsCategorySearchOpen] = useState(false);
  const [isCompanyRegisterOpen, setIsCompanyRegisterOpen] = useState(false);
  const listRef = useRef<{ refetch: () => void }>(null);

  const resetForm = useCallback(
    (initial?: Partial<Company>) => {
      setSelectedCustomer(initial ?? null);
      setName(initial?.name ?? ''); // 대표명
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
      setCeoName(initial?.dbName ?? ''); // 고객사명(EN)을 ceoName 필드에 매핑
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
          ciImage,
          businessImage,
          category: categoryId, // 현재 선택된 카테고리 ID 사용
          contractStartDate: contractStartDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
          contractEndDate: contractEndDate || dayjs().add(contractType === 'MONTH' ? 1 : 12, 'month').format('YYYY-MM-DD HH:mm:ss'),
          contractType: contractType as 'MONTH' | 'YEAR',
        };
        
        const targetCompanyCode = code || selectedCustomer.companyCode || '';
        await updateCompany(targetCompanyCode, updateParams);
        toast.success('고객사 정보가 수정되었습니다.');
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
        toast.success('고객사가 등록되었습니다.');
      }
      
      setIsPopupOpen(false);
      setIsCompanyRegisterOpen(false); // 고객사 등록 모달도 닫기
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
        // formatter: (value, item, index) => index + 1,
      },
      {
        header: '가입일시',
        accessor: 'createAt',
        sortable: true,
        formatter: (value) => (value ? dayjs(value).format('YY-MM-DD(ddd) HH:mm') : '-'),
      },
      { header: '고객사명(KR)', accessor: 'companyName' },
      { header: '고객사명(EN)', accessor: 'dbName' },
      {
        header: '고객사 CI',
        accessor: 'ciImage',
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
        formatter: (value) => {
          switch (value) {
            case 'LIGHT': return 'Lite (고객용)';
            default: return value || 'Pro';
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
      // {
      //   header: '카테고리코드',
      //   accessor: 'category',
      //   formatter: (value) => value?.categoryCode || '-',
      // },
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
        onClose={() => {
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
