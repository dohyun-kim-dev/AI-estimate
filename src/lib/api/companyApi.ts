/**
 * Company-specific API layer
 * 고객사 CMS 전용 통합 API
 * - 로그인 API
 * - 회사별 데이터 API (자동 x-company-code 헤더 주입)
 */
import {
  // 관리자 관리
  adminGetList, adminCreate, adminUpdate, adminDelete,
  
  // 회원 관리
  getUserList, getUserDetail, updateUser,
  
  // 프롬프트 관리
  promptGetList, promptHistoryGetList, promptUpdate,
  
  // 약관 관리
  termGetList, termUpdate,
  
  // AI 프롬프트 관리
  getAIPromptList, createAIPrompt, updateAIPrompt, deleteAIPrompt, getAIPromptHistory,
  
  // 견적 요청 관리
  getEstimateRequestList, getSiteEstimateRequestList,
  
  // 채팅 관리
  getChatRoomList, getEstimateDownloadList,
  
  // 카테고리 관리
  getCategoryList, createCategory, updateCategory,
  
  // 단가 관리
  unitPriceGetList, getAllUnitPrices, uploadUnitPrices, deleteUnitPrice, deleteAllUnitPrices,
  
  // 회사 관리
  getCompany, updateCompany, updateCompanyInfo
} from '@/lib/api/admin/adminApi';

import { uploadFiles } from '@/lib/api/user/userApi';
import { callAdminApi } from '@/lib/api/admin/callAdminApi';
import { devLog } from '@/lib/utils/devLogger';

// ==================== 로그인 관련 타입 및 API ====================

export type CompanyCMSLoginParams = {
  userId: string;
  password: string;
};

export type CompanyCMSLoginResponse = {
  statusCode: number;
  message: string;
  data: {
    id: string;
    token: string;
    isRoot: boolean;
    adminData: any;
  };
};

export interface CompanyCMSLoginServiceParams {
  id: string;
  password: string;
  showMessage: (msg: string) => void;
  onSuccess: (response: any) => void;
}

/**
 * 고객사 CMS 관리자 로그인 API
 */
export async function companyCMSLogin(params: CompanyCMSLoginParams) {
  return callAdminApi<CompanyCMSLoginResponse>({
    title: '고객사 CMS 로그인',
    url: `/api/company/cms/login`,
    method: 'POST',
    body: { 
      adminId: params.userId, 
      password: params.password 
    },
    isCallPageLoader: true,
  });
}

/**
 * 고객사 CMS 로그인 서비스 (통합)
 */
export async function companyCMSLoginService({
  id,
  password,
  showMessage,
  onSuccess,
}: CompanyCMSLoginServiceParams) {
  try {
    devLog('🔐 [Company CMS Login] 로그인 시도:', { id });

    const response = await companyCMSLogin({
      userId: id,
      password,
    });

    devLog('📡 [Company CMS Login] API 응답:', response);

    // callAdminApi는 배열로 응답을 감싸므로 첫 번째 요소 추출
    const actualResponse = Array.isArray(response) ? response[0] : response;
    
    if ((actualResponse as any)?.data?.statusCode === 200) {
      devLog('✅ [Company CMS Login] 로그인 성공');
      const responseData = (actualResponse as any).data.data;
      
      // localStorage에 admin-storage 저장 (통합관리자와 동일)
      const adminStorageData = {
        adminId: responseData.adminId,
        name: responseData.name,
        email: responseData.email,
        cellphone: responseData.cellphone,
        isRoot: responseData.isRoot,
        companyCode: responseData.companyCode,
        memo: responseData.memo,
        receiveAlimtalk: responseData.receiveAlimtalk,
        receiveEmail: responseData.receiveEmail,
        createAt: responseData.createAt,
        lastLoginAt: responseData.lastLoginAt,
        _id: responseData._id
      };
      
      localStorage.setItem('admin-storage', JSON.stringify(adminStorageData));
      devLog('💾 [Company CMS Login] admin-storage 저장:', adminStorageData);
      
      onSuccess({
        id: responseData.adminId, // adminId를 사용
        token: '', // 토큰은 응답에 없으므로 빈 문자열
        isRoot: responseData.isRoot,
        adminData: adminStorageData,
      });
    } else {
      const errorMessage = (actualResponse as any)?.data?.message || '로그인에 실패했습니다.';
      devLog('❌ [Company CMS Login] 로그인 실패:', errorMessage);
      showMessage(errorMessage);
    }
  } catch (error: any) {
    devLog('💥 [Company CMS Login] 에러 발생:', error);
    
    const errorMessage = error?.response?.data?.message || 
                        error?.message || 
                        '네트워크 오류가 발생했습니다.';
    showMessage(errorMessage);
  }
}

// ==================== 회사별 데이터 API ====================

// URL에서 현재 companyCode 추출
export const getCurrentCompanyCode = (): string => {
  if (typeof window === 'undefined') return '';
  
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/([^\/]+)\/cms/);
  return match ? match[1] : '';
};

// 회사 특화 헤더 생성
export const getCompanyHeaders = () => {
  const companyCode = getCurrentCompanyCode();
  return companyCode ? { 'x-company-code': companyCode } : {};
};

// Company-specific API 함수들 - 자동으로 companyCode 헤더 주입

// 관리자 관리
export const companyAdminGetList = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return adminGetList({ ...params, companyCode });
};

export const companyAdminCreate = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return adminCreate({ ...params, companyCode });
};

export const companyAdminUpdate = adminUpdate;
export const companyAdminDelete = adminDelete;

// 회원 관리
export const companyGetUserList = (params: any = {}) => {
  const companyCode = getCurrentCompanyCode();
  return getUserList({ ...params, companyCode });
};

export const companyGetUserDetail = getUserDetail;
export const companyUpdateUser = updateUser;

// 프롬프트 관리
export const companyPromptGetList = promptGetList;
export const companyPromptHistoryGetList = promptHistoryGetList;
export const companyPromptUpdate = promptUpdate;

// 약관 관리
export const companyTermGetList = termGetList;
export const companyTermUpdate = termUpdate;

// AI 프롬프트 관리
export const companyGetAIPromptList = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return getAIPromptList({ ...params, companyCode });
};

export const companyCreateAIPrompt = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return createAIPrompt({ ...params, companyCode });
};

export const companyUpdateAIPrompt = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return updateAIPrompt({ ...params, companyCode });
};

export const companyDeleteAIPrompt = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return deleteAIPrompt({ ...params, companyCode });
};

export const companyGetAIPromptHistory = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return getAIPromptHistory({ ...params, companyCode });
};

// 견적 요청 관리
export const companyGetEstimateRequestList = getEstimateRequestList;
export const companyGetSiteEstimateRequestList = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return getSiteEstimateRequestList({ ...params, companyCode });
};

// 채팅 관리
export const companyGetChatRoomList = (params: any = {}) => {
  const companyCode = getCurrentCompanyCode();
  return getChatRoomList({ ...params, companyCode });
};

export const companyGetEstimateDownloadList = (params: any = {}) => {
  const companyCode = getCurrentCompanyCode();
  return getEstimateDownloadList({ ...params, companyCode });
};

// 카테고리 관리
export const companyGetCategoryList = getCategoryList;
export const companyCreateCategory = createCategory;
export const companyUpdateCategory = updateCategory;

// 단가 관리
export const companyUnitPriceGetList = unitPriceGetList;
export const companyGetAllUnitPrices = (params: any = {}) => {
  const companyCode = getCurrentCompanyCode();
  return getAllUnitPrices({ ...params, companyCode });
};

export const companyUploadUnitPrices = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return uploadUnitPrices({ ...params, companyCode });
};

export const companyDeleteUnitPrice = (id: string) => {
  const companyCode = getCurrentCompanyCode();
  return deleteUnitPrice(id, companyCode);
};

export const companyDeleteAllUnitPrices = () => {
  const companyCode = getCurrentCompanyCode();
  return deleteAllUnitPrices(companyCode);
};

// 회사 관리
export const companyGetInfo = () => {
  const companyCode = getCurrentCompanyCode();
  return getCompany(companyCode);
};

export const companyUpdateInfo = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return updateCompany(companyCode, params);
};

export const companyUpdateCompanyInfo = (params: any) => {
  const companyCode = getCurrentCompanyCode();
  return updateCompanyInfo(companyCode, params);
};

// 파일 업로드
export const companyUploadFiles = uploadFiles;

// 기본 함수들을 재정의하지 않고 그대로 export
// (회사 코드가 필요하지 않은 공통 기능들)
export {
  uploadFiles
} from '@/lib/api/user/userApi';
