'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import TextField from '@/components/common/TextField';
import { useToast } from '@/components/common/ToastProvider';
import CompanySearch from '@/components/CompanySearch/CompanySearch';
import { updateCompanyInfo, getCompany } from '@/lib/api/admin/adminApi';
import { uploadFiles } from '@/lib/api/user/userApi';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import { devLog } from '@/utils/devLogger';

// 회사 정보 인터페이스
interface CompanyInfo {
  id: string;
  name: string;
  ceo: string;
  businessNo: string;
  cellphone: string;
  address: string;
  detailAddress: string;
  businessCategory?: string;
  businessType?: string;
  aiProfile?: string;
  aiName?: string;
  signature?: string;
  etc?: string[];
}

// 초기 회사 정보
const initialCompanyInfo: CompanyInfo = {
  id: '',
  name: '',
  ceo: '',
  businessNo: '',
  cellphone: '',
  address: '',
  detailAddress: '',
  businessCategory: '',
  businessType: '',
  aiProfile: '/ai-estimate/pretty.png',
  aiName: 'AI 에이전트',
  signature: '',
  etc: [''] // 기본값을 1개로 수정
};

const SettingsContainer = styled.div`
  padding: 44px 24px 24px 24px;
  width: 100%;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 840px;
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Heading = styled.h2`
  color: #333333;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
`;

const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #F7F7F7;
  padding: 24px;
  border-radius: 8px;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 20px 50px;
  border-radius: 8px;
  max-width: 840px;
  margin-bottom: 16px;
`;

// 프로필 섹션 스타일
const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const ProfileImageWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
`;

const ProfileImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${ProfileImageWrapper}:hover & {
    opacity: 1;
  }
`;

const ProfileTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProfileTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const ProfileTitleInput = styled.input`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  outline: none;

  &:focus {
    border-color: #2C2E3C;
  }
`;

const EditIcon = styled.svg`
  margin-top :4px;
  cursor: pointer;
  width: 23px;
  height: 22px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const ProfileSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

// 기본 정보 카드 스타일
const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #333333;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
`;

// 이미지 업로드 섹션 (CompanyFormPopup과 동일한 스타일)
const ImageUploadSection = styled.div`
  // margin-top: 24px;
`;

const ImageUploadTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333;
`;

const ImageUploadBox = styled.div`
  border: 2px dashed #E6E7E9;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #ccc;
  }
`;

const ImageUploadText = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const ImageUploadSubText = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  &:hover {
    background-color: #e8e8e8;
  }
`;

// 견적 비고란 스타일
const EstimateNotesSection = styled.div`
  // margin-top: 24px;
`;

const EstimateNotesTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333333;
`;

const NoteRow = styled.div`
  display: flex;
  align-items: end;
  gap: 12px;
  margin-bottom: 12px;
`;

const NoteInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const ActionButton = styled.button<{ $variant: 'add' | 'delete' }>`
  width: 60px;
  height: 54px;
  border: 1px solid #CBCCD7;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  background-color: white;
  color: black; 

  &:hover {
    opacity: 0.9;
  }
`;

// 저장 버튼
const SaveAllButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 32px;
  padding: 16px 20px;
  background-color: #2C2E3C;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #1a1c28;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// 미리보기 이미지 스타일
const PreviewImageWrapper = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 16px;
  cursor: pointer;
  
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #ddd;
  object-fit: cover;
  cursor: pointer;
`;

//리무브 스타일 수정 하지마 이대로 유지
const RemoveImageButton = styled.button`
  position: absolute;
  top: -10px;
  right: -10px;
  width: 24px;
  border-radius: 50%;
  background-color: #777777;
  color: white;
  font-size: 14px;
  line-height: 1;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #555555;
  }
  
  &:before {
    content: "×";
    font-weight: bold;
  }
`;

// PDF 파일 미리보기
const PdfPreview = styled.div`
  display: inline-block;
  padding: 12px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-top: 16px;
  position: relative;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

// 드롭다운 메뉴 스타일
const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 130px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transform: ${({ $isOpen }) => $isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-10px)'};
  transition: all 0.2s ease;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  color: #333333;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f5f5f5;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
`;

// 카메라 아이콘 스타일
const CameraIcon = styled.div`
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 40px;
  height: 40px;
  background-color: #AAAAAA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

export default function CompanyInfoSettingsPage() {
  const [companyInfo, setCompanyInfo] = useState(initialCompanyInfo);
  const [estimateNotes, setEstimateNotes] = useState(['']);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string | null>('');
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedProfileImage, setUploadedProfileImage] = useState<string | null>(null);
  const [uploadedSignatureImage, setUploadedSignatureImage] = useState<string | null>(null);
  
  // 미리보기 상태 추가
  const [profilePreview, setProfilePreview] = useState<string>('');
  const [signaturePreview, setSignaturePreview] = useState<string>('');
  const [signatureFileName, setSignatureFileName] = useState<string>('');
  
  // 프로필 이미지 드롭다운 상태
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  
  const { show: showToast } = useToast();
  
  const profileImageRef = useRef<HTMLInputElement>(null);
  const businessImageRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // URL에서 회사 코드 추출하여 초기화
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // URL에서 /cms/가 포함되면 회사 코드 자동 추출
    if (currentPath.includes('/cms/')) {
      const extractedCompanyCode = getCompanyCodeFromUrl();
      if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
        setSelectedCompanyCode(extractedCompanyCode);
        setSelectedCompanyName(extractedCompanyCode.toUpperCase());
        devLog('🏢 [회사정보 설정] URL에서 회사 코드 자동 추출:', {
          path: currentPath,
          companyCode: extractedCompanyCode
        });
      }
    }
  }, []);

  // 회사 코드가 변경되면 데이터 자동 로드
    useEffect(() => {
      // selectedCompanyCode가 존재하고 빈 문자열이 아닐 때만 로드
      if (selectedCompanyCode && selectedCompanyCode.trim() !== '') {
        loadCompanyData(selectedCompanyCode);
      }
    }, [selectedCompanyCode]);
    
  // 파일 URL 생성 헬퍼 함수
  const getFileUrl = (filename: string) => {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
      return filename;
    }
    
    // ✅ 운영 배포 환경에서는 /file/ 경로 사용
    const isDev = import.meta.env.VITE_ENV_NAME === 'dev';
    return isDev ? `/api/file/${filename}` : `/file/${filename}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({ ...prev, [name]: value }));
  };



  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        showToast('프로필 이미지 업로드 중...', 'info');
        
        // 미리보기용 로컬 이미지 표시
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setProfilePreview(result);
          setCompanyInfo(prev => ({ 
            ...prev, 
            aiProfile: result 
          }));
        };
        reader.readAsDataURL(file);
        
        // 서버에 파일 업로드
        const uploadResponse = await uploadFiles([file]);
        
        if (uploadResponse.statusCode === 200 && uploadResponse.data && uploadResponse.data.length > 0) {
          const uploadedFileName = uploadResponse.data[0];
          setUploadedProfileImage(uploadedFileName);
          
          showToast('프로필 이미지가 업로드되었습니다.', 'success');
        } else {
          showToast('프로필 이미지 업로드에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('프로필 이미지 업로드 실패:', error);
        showToast('프로필 이미지 업로드에 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBusinessImageUpload = () => {
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택하세요', 'error');
      return;
    }
    businessImageRef.current?.click();
  };

  // 프로필 이미지 제거 핸들러
  const handleRemoveProfileImage = () => {
    setProfilePreview('');
    setUploadedProfileImage(null);
    setCompanyInfo(prev => ({ 
      ...prev, 
      aiProfile: '/ai-estimate/pretty.png' // 기본 이미지로 복원
    }));
    showToast('프로필 이미지가 제거되었습니다', 'info');
  };

  // 회사 직인 제거 핸들러
  const handleRemoveSignatureImage = () => {
    setSignaturePreview('');
    setSignatureFileName('');
    setUploadedSignatureImage(null);
    setCompanyInfo(prev => ({ 
      ...prev, 
      signature: '' 
    }));
    showToast('회사 직인이 제거되었습니다', 'info');
  };

  // 프로필 이미지 드롭다운 관련 핸들러
  const handleImageClick = () => {
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택하세요', 'error');
      return;
    }
    setShowImageDropdown(!showImageDropdown);
  };

  const handleImageUpload = () => {
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택하세요', 'error');
      return;
    }
    profileImageRef.current?.click();
    setShowImageDropdown(false);
  };

  const handleSetDefaultImage = () => {
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택하세요', 'error');
      setShowImageDropdown(false);
      return;
    }
    setShowImageDropdown(false);
    setProfilePreview('');
    setUploadedProfileImage(null);
    setCompanyInfo(prev => ({ 
      ...prev, 
      aiProfile: '/ai-estimate/pretty.png' // 기본 이미지로 설정
    }));
    showToast('기본 이미지로 설정되었습니다', 'success');
  };

  const handleBusinessImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        showToast('회사 직인 업로드 중...', 'info');
        
        // 미리보기 처리
        if (file.type === 'application/pdf') {
          // PDF 파일인 경우 파일명만 표시
          setSignaturePreview('');
          setSignatureFileName(file.name);
        } else {
          // 이미지 파일인 경우 미리보기 생성
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            setSignaturePreview(result);
            setCompanyInfo(prev => ({ 
              ...prev, 
              signature: result 
            }));
          };
          reader.readAsDataURL(file);
          setSignatureFileName('');
        }
        
        // 서버에 파일 업로드
        const uploadResponse = await uploadFiles([file]);
        
        if (uploadResponse.statusCode === 200 && uploadResponse.data && uploadResponse.data.length > 0) {
          const uploadedFileName = uploadResponse.data[0];
          setUploadedSignatureImage(uploadedFileName);
          
          showToast('회사 직인이 업로드되었습니다.', 'success');
        } else {
          showToast('회사 직인 업로드에 실패했습니다.', 'error');
        }
      } catch (error) {
        console.error('회사 직인 업로드 실패:', error);
        showToast('회사 직인 업로드에 실패했습니다.', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...estimateNotes];
    newNotes[index] = value;
    setEstimateNotes(newNotes);
    
    // companyInfo.etc도 함께 업데이트
    setCompanyInfo(prev => ({ ...prev, etc: newNotes }));
  };

  const handleAddNote = (index: number) => {
    const newNotes = [...estimateNotes];
    newNotes.splice(index + 1, 0, '');
    setEstimateNotes(newNotes);
    
    // companyInfo.etc도 함께 업데이트
    setCompanyInfo(prev => ({ ...prev, etc: newNotes }));
  };

  const handleDeleteNote = (index: number) => {
    // 최소 1개는 유지하도록 수정
    if (estimateNotes.length > 1) {
      const newNotes = estimateNotes.filter((_, i) => i !== index);
      setEstimateNotes(newNotes);
      
      // companyInfo.etc도 함께 업데이트
      setCompanyInfo(prev => ({ ...prev, etc: newNotes }));
    } else {
      showToast('견적 비고란은 최소 1개 이상 필요합니다.', 'info');
    }
  };

  const handleEditTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInfo(prev => ({ ...prev, aiName: e.target.value }));
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      showToast('AI 에이전트 이름이 변경되었습니다.', 'success');
    } else if (e.key === 'Escape') {
      setCompanyInfo(prev => ({ ...prev, aiName: 'AI 에이전트' }));
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!companyInfo.aiName || companyInfo.aiName.trim() === '') {
      setCompanyInfo(prev => ({ ...prev, aiName: 'AI 에이전트' }));
    }
  };

  // 회사 데이터 로드
  const loadCompanyData = async (companyCode?: string) => {
    // 매개변수가 있으면 사용하고, 없으면 현재 선택된 회사코드 사용
    const companyId = companyCode || selectedCompanyCode || '';

    // 컴퍼니 코드가 없거나 빈 문자열이면 API 호출하지 않음
    if (!companyId || companyId.trim() === '') {
      console.log('컴퍼니 코드가 없어 회사 데이터 로드를 건너뜁니다.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await getCompany(companyId);
      
      let company: any = null;
      if (result && typeof result === 'object') {
        if (Array.isArray(result)) {
          const firstItem = result[0];
          if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
            const responseData = firstItem.data as any;
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              company = responseData.data;
            }
          }
        } else if ('data' in result) {
          const resultData = result as any;
          company = resultData.data;
        }
      }
      
      if (company) {
        setCompanyInfo({
          id: company.companyCode || '',
          name: company.companyName || '',
          ceo: company.name || company.ceo || '', // name을 대표명(ceo)으로 매핑
          businessNo: company.businessNumber || company.businessNo || '', // businessNumber을 사업자등록번호(businessNo)로 매핑
          cellphone: company.cellphone || '',
          address: company.address || '',
          detailAddress: company.detailAddress || '',
          businessCategory: company.businessCategory || '',
          businessType: company.businessType || '',
          aiProfile: company.aiProfile || '/ai-estimate/pretty.png',
          aiName: company.aiName || 'AI 에이전트',
          signature: company.signature || '',
          etc: company.etc || [''] // 기본값을 1개로 수정
        });
        
        // 프로필 이미지 미리보기 설정
        if (company.aiProfile && !company.aiProfile.startsWith('/ai-estimate/')) {
          setProfilePreview(getFileUrl(company.aiProfile));
        } else {
          setProfilePreview('');
        }
        
        // 회사 직인 미리보기 설정
        if (company.signature) {
          const fileUrl = getFileUrl(company.signature);
          // 파일 확장자를 확인하여 PDF 파일인지 판단
          if (company.signature.toLowerCase().endsWith('.pdf')) {
            setSignaturePreview('');
            setSignatureFileName(company.signature);
          } else {
            setSignaturePreview(fileUrl);
            setSignatureFileName('');
          }
        } else {
          setSignaturePreview('');
          setSignatureFileName('');
        }
        
        // 견적 비고란 설정 (최소 1개 보장)
        if (company.etc && Array.isArray(company.etc) && company.etc.length > 0) {
          setEstimateNotes(company.etc);
        } else {
          setEstimateNotes(['']); // 빈 배열이어도 최소 1개 보장
        }
      }
    } catch (error) {
      console.error('회사 데이터 로드 실패:', error);
      showToast('회사 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 회사 선택 핸들러
  const handleCompanySelect = (company: { id: string; name: string }) => {
    // 동일한 회사가 선택된 경우 아무 작업하지 않음
    if (selectedCompanyCode === company.id) {
      return;
    }
    
    // 새로운 회사 선택 시 모든 값 초기화
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 회사 정보 초기화
    setCompanyInfo(initialCompanyInfo);
    
    // 견적 비고란 초기화
    setEstimateNotes(['']);
    
    // 업로드된 이미지 상태 초기화
    setUploadedProfileImage(null);
    setUploadedSignatureImage(null);
    
    // 미리보기 상태 초기화
    setProfilePreview('');
    setSignaturePreview('');
    setSignatureFileName('');
    
    // 편집 상태 초기화
    setIsEditingTitle(false);
    
    // 새로운 회사의 데이터 로드
    // 컴퍼니 코드가 유효한 경우에만 API 호출
    if (company.id && company.id.trim() !== '') {
      loadCompanyData(company.id);
    }
  };

  // 전체 저장
  const handleSaveAll = async () => {
    if (!selectedCompanyCode) {
      showToast('먼저 고객사를 선택하세요', 'error');
      return;
    }

    // 견적 비고란이 비어있으면 기본값 추가
    const finalEstimateNotes = estimateNotes.length > 0 ? estimateNotes : [''];

    setIsLoading(true);
    try {
      await updateCompanyInfo(selectedCompanyCode, {
        // 업로드된 이미지가 있으면 파일명을, 없으면 기존 이미지를 사용
        aiProfile: uploadedProfileImage || companyInfo.aiProfile,
        aiName: companyInfo.aiName,
        businessCategory: companyInfo.businessCategory,
        businessType: companyInfo.businessType,
        // 업로드된 직인 이미지가 있으면 파일명을, 없으면 기존 이미지를 사용
        signature: uploadedSignatureImage || companyInfo.signature,
        etc: finalEstimateNotes
      });
      
      showToast('회사 정보가 저장되었습니다.', 'success');
      
      // 저장 후 업로드된 이미지 상태 초기화
      setUploadedProfileImage(null);
      setUploadedSignatureImage(null);
    } catch (error) {
      console.error('회사 정보 저장 실패:', error);
      showToast('회사 정보 저장에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showImageDropdown && !(event.target as Element).closest('.profile-image-container')) {
        setShowImageDropdown(false);
      }
    };
    
    if (showImageDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageDropdown]);

  return (
    <SettingsContainer>
      <HeaderWrapper>
        <Heading>회사 정보 관리</Heading>
        {/* CMS 환경이 아닐 때만 CompanySearch 표시 */}
        {!window.location.pathname.includes('/cms/') && (
          <CompanySearch
            selectedCompanyCode={selectedCompanyCode}
            selectedCompanyName={selectedCompanyName}
            onCompanySelect={handleCompanySelect}
          />
        )}
      </HeaderWrapper>
      
      <CardsWrapper>
        <MainContent>
            {/* 프로필 섹션 */}
            <Card>
                            <SectionTitle>프로필</SectionTitle>
              <ProfileSection>
                <div className="profile-image-container" style={{ position: 'relative' }}>
                  <ProfileImageWrapper>
                    <ProfileImage 
                      src={profilePreview || companyInfo.aiProfile || '/ai-estimate/pretty.png'} 
                      alt="프로필 이미지" 
                    />
                    <CameraIcon onClick={handleImageClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                        <path d="M20.5 4H17.33L15.5 2H9.5L7.67 4H4.5C3.96957 4 3.46086 4.21071 3.08579 4.58579C2.71071 4.96086 2.5 5.46957 2.5 6V18C2.5 18.5304 2.71071 19.0391 3.08579 19.4142C3.46086 19.7893 3.96957 20 4.5 20H20.5C21.0304 20 21.5391 19.7893 21.9142 19.4142C22.2893 19.0391 22.5 18.5304 22.5 18V6C22.5 5.46957 22.2893 4.96086 21.9142 4.58579C21.5391 4.21071 21.0304 4 20.5 4ZM20.5 18H4.5V6H8.55L10.38 4H14.62L16.45 6H20.5V18ZM12.5 7C11.1739 7 9.90215 7.52678 8.96447 8.46447C8.02678 9.40215 7.5 10.6739 7.5 12C7.5 13.3261 8.02678 14.5979 8.96447 15.5355C9.90215 16.4732 11.1739 17 12.5 17C13.8261 17 15.0979 16.4732 16.0355 15.5355C16.9732 14.5979 17.5 13.3261 17.5 12C17.5 10.6739 16.9732 9.40215 16.0355 8.46447C15.0979 7.52678 13.8261 7 12.5 7ZM12.5 15C11.7044 15 10.9413 14.6839 10.3787 14.1213C9.81607 13.5587 9.5 12.7956 9.5 12C9.5 11.2044 9.81607 10.4413 10.3787 9.87868C10.9413 9.31607 11.7044 9 12.5 9C13.2956 9 14.0587 9.31607 14.6213 9.87868C15.1839 10.4413 15.5 11.2044 15.5 12C15.5 12.7956 15.1839 13.5587 14.6213 14.1213C14.0587 14.6839 13.2956 15 12.5 15Z" fill="white"/>
                      </svg>
                    </CameraIcon>
                  </ProfileImageWrapper>
                  
                  <DropdownMenu $isOpen={showImageDropdown}>
                    <DropdownItem onClick={handleImageUpload}>
                      사진 불러오기
                    </DropdownItem>
                    <DropdownItem onClick={handleSetDefaultImage}>
                      기본 이미지로 설정
                    </DropdownItem>
                  </DropdownMenu>
                </div>
                <ProfileTitleWrapper>
                  {isEditingTitle ? (
                    <ProfileTitleInput
                      ref={titleInputRef}
                      value={companyInfo.aiName || ''}
                      onChange={handleTitleChange}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleTitleBlur}
                    />
                  ) : (
                    <ProfileTitle>{companyInfo.aiName || 'AI 에이전트'}</ProfileTitle>
                  )}
                  <EditIcon 
                    onClick={handleEditTitleClick}
                    xmlns="http://www.w3.org/2000/svg" 
                    width="23" 
                    height="22" 
                    viewBox="0 0 23 22" 
                    fill="none"
                  >
                    <path d="M11.5 2.75H5.08333C4.5971 2.75 4.13079 2.94315 3.78697 3.28697C3.44315 3.63079 3.25 4.0971 3.25 4.58333V17.4167C3.25 17.9029 3.44315 18.3692 3.78697 18.713C4.13079 19.0568 4.5971 19.25 5.08333 19.25H17.9167C18.4029 19.25 18.8692 19.0568 19.213 18.713C19.5568 18.3692 19.75 17.9029 19.75 17.4167V11" stroke="#CDCDCD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17.3422 2.40548C17.7069 2.04081 18.2015 1.83594 18.7172 1.83594C19.2329 1.83594 19.7275 2.04081 20.0922 2.40548C20.4569 2.77015 20.6618 3.26476 20.6618 3.78048C20.6618 4.29621 20.4569 4.79081 20.0922 5.15548L11.8303 13.4183C11.6126 13.6358 11.3437 13.795 11.0484 13.8812L8.41479 14.6512C8.33591 14.6742 8.2523 14.6756 8.17271 14.6552C8.09311 14.6348 8.02047 14.5934 7.96237 14.5353C7.90427 14.4772 7.86286 14.4046 7.84246 14.325C7.82207 14.2454 7.82345 14.1618 7.84646 14.0829L8.61646 11.4493C8.70311 11.1542 8.86261 10.8856 9.08029 10.6683L17.3422 2.40548Z" stroke="#CDCDCD" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </EditIcon>
                </ProfileTitleWrapper>
              </ProfileSection>
              
              <HiddenInput
                ref={profileImageRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
            </Card>

            {/* 기본 정보 카드 */}
            <Card>
              <SectionTitle>견적 기본 정보</SectionTitle>
              <InfoGrid>
                <TextField
                  id="companyName"
                  label="* 기업명"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleChange}
                  placeholder="기업명"
                  readOnly={true}
                />
                <TextField
                  id="ceoName"
                  label="* 대표명"
                  name="ceo"
                  value={companyInfo.ceo}
                  onChange={handleChange}
                  placeholder="이름을 입력해주세요"
                  readOnly={true}
                />
                <TextField
                  id="cellphone"
                  label="* 전화번호"
                  name="cellphone"
                  value={companyInfo.cellphone}
                  onChange={handleChange}
                  placeholder="전화번호를 입력해주세요"
                />
                <TextField
                  id="businessNo"
                  label="* 사업자등록번호"
                  name="businessNo"
                  value={companyInfo.businessNo}
                  onChange={handleChange}
                  placeholder="사업자등록번호를 입력해주세요"
                />
              </InfoGrid>
            </Card>

            {/* 업태 / 중목 카드 */}
            <Card>
              <SectionTitle>업태 / 종목</SectionTitle>
              <InfoGrid>
                <TextField
                  id="businessCategory"
                  label="* 업태"
                  name="businessCategory"
                  value={companyInfo.businessCategory || ''}
                  onChange={handleChange}
                  placeholder="예) 도메인, 제조업"
                />
                <TextField
                  id="businessType"
                  label="* 종목"
                  name="businessType"
                  value={companyInfo.businessType || ''}
                  onChange={handleChange}
                  placeholder="예) 소프트웨어 개발, 의류 유통"
                />
              </InfoGrid>
            </Card>

            {/* 사업장 주소 카드 */}
            <Card>
              <SectionTitle>사업장 주소</SectionTitle>
              <InfoGrid>
                <TextField
                  id="address"
                  label="* 상세 주소 (직접입력)"
                  name="address"
                  value={companyInfo.address}
                  onChange={handleChange}
                  placeholder="상세 주소를 입력해주세요"
                  readOnly={true}
                />
                <TextField
                  id="detailAddress"
                  label="* 사업장 주소 (직접입력)"
                  name="detailAddress"
                  value={companyInfo.detailAddress}
                  onChange={handleChange}
                  placeholder="사업장의 주소를 입력해주세요"
                  readOnly={true}
                />
              </InfoGrid>
            </Card>

            {/* 회사 직인 첨부 카드 */}
            <Card>
              <ImageUploadSection>
                <ImageUploadTitle>회사 직인 첨부</ImageUploadTitle>
                
                {/* 업로드된 이미지나 파일이 없을 때만 업로드 박스 표시 */}
                {!signaturePreview && !signatureFileName && (
                  <ImageUploadBox onClick={handleBusinessImageUpload}>
                    <ImageUploadText>파일을 업로드해주세요</ImageUploadText>
                    <ImageUploadSubText>
                      <p style={{color: '#CA7575'}}>1장의 이미지만 첨부 가능합니다</p>
                      <p>1MB 이하의 Jpg, Jpeg, Png 파일만 등록 가능</p>
                    </ImageUploadSubText>
                    <UploadButton type="button">파일 열기</UploadButton>
                  </ImageUploadBox>
                )}
                
                {/* 직인 이미지 미리보기 */}
                {signaturePreview && (
                  <PreviewImageWrapper onClick={handleBusinessImageUpload}>
                    <PreviewImage src={signaturePreview} alt="회사 직인 미리보기" />
                    <RemoveImageButton 
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 클릭 이벤트 방지
                        handleRemoveSignatureImage();
                      }} 
                    />
                  </PreviewImageWrapper>
                )}
                
                {/* PDF 파일 미리보기 */}
                {signatureFileName && (
                  <PreviewImageWrapper onClick={handleBusinessImageUpload}>
                    <PdfPreview>
                      PDF: {signatureFileName}
                    </PdfPreview>
                    <RemoveImageButton 
                      onClick={(e) => {
                        e.stopPropagation(); // 부모 클릭 이벤트 방지
                        handleRemoveSignatureImage();
                      }} 
                    />
                  </PreviewImageWrapper>
                )}
              </ImageUploadSection>
              
              <HiddenInput
                ref={businessImageRef}
                type="file"
                accept="image/*"
                onChange={handleBusinessImageChange}
              />
            </Card>

            {/* 견적 비고란 카드 */}
            <Card>
              <EstimateNotesSection>
                <EstimateNotesTitle>견적 비고란</EstimateNotesTitle>
                {estimateNotes.map((note, index) => (
                  <NoteRow key={index}>
                    <div style={{ flex: 1 }}>
                      <TextField
                        id={`note-${index}`}
                        label={`* 비고란 설명`}
                        value={note}
                        onChange={(e) => handleNoteChange(index, e.target.value)}
                        placeholder="비고란을 입력해주세요"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'end', paddingBottom: '4px' }}>
                      
                      <ActionButton 
                        $variant="delete"
                        onClick={() => handleDeleteNote(index)}
                        disabled={estimateNotes.length === 1}
                      >
                        삭제
                      </ActionButton>
                      <ActionButton 
                        $variant="add"
                        onClick={() => handleAddNote(index)}
                      >
                        추가
                      </ActionButton>
                    </div>
                  </NoteRow>
                ))}
              </EstimateNotesSection>
            </Card>

            <SaveAllButton onClick={handleSaveAll} disabled={isLoading}>
              {isLoading ? '저장 중...' : '전체 저장'}
            </SaveAllButton>
        </MainContent>
      </CardsWrapper>
    </SettingsContainer>
  );
}
