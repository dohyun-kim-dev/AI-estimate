export type AdminLoginParams = {
    userId: string;
    password: string;
  };

  export type UserGetListParams = {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    companyCode?: string;
  };

  export type AdminGetListParams = {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    isRoot: boolean;
    companyCode?: string;
  };

  export type AdminCreateParams = {
    adminId: string;
    password: string;
    name: string;
    cellphone: string;
    memo?: string;
    email: string;
    receiveEmail?: boolean;
    receiveAlimtalk?: boolean;
    companyCode?: string; // 옵션: 없으면 통합관리자, 있으면 고객사 관리자
  };

    export type UnitPriceGetListParams = {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
  };

  export type AllUnitPricesParams = {
    companyCode?: string;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
  };

  export type AdminUpdateParams = {
    _id: string;
    targetAdminId: string; // 로그인 ID
    name?: string;
    cellphone?: string;
    description?: string;
    email?: string;
    receiveAlimtalk?: boolean;
    receiveEmail?: boolean;
    password?: string;
    companyCode?: string;
  };

  export type AdminPasswordUpdateParams = {
    _id: string; // 로그인 ID
    password: string;
  };


  export type TermGetListParams = {
    content: string;
    language: string;
  };

  export type PromptGetListParams = {
    keyword: string;
  };

  export type PromptHistoryGetListParams = {
    index: number;
  };

  export type PromptUpdateParams = {
    index: number;
    content: string;
  };

  export type CompanyGetListParams = {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
  };

  // 단가 업로드 관련 타입들
  export type UnitPriceColumn = {
    name: string;
    type: string;
    required: boolean;
    orderNo: number;
  };

  export type UnitPriceUploadParams = {
    companyCode: string;
    columns: UnitPriceColumn[];
    data: any[];
  };

  // AI 프롬프트 관련 타입들
  export type AIPromptGetListParams = {
    companyCode: string;
    keyword?: string;
  };

  export type AIPromptCreateParams = {
    companyCode: string;
    name: string;
    description: string;
    content: string;
  };

  export type AIPromptUpdateParams = {
    id: string;
    companyCode: string;
    name?: string;
    description?: string;
    content?: string;
  };

  export type AIPromptDeleteParams = {
    id: string;
    companyCode: string;
  };

  // 회원 정보 수정 관련 타입
  export type UserUpdateParams = {
    id: string;
    cellphone?: string;
    email?: string;
    memo?: string;
  };

  // 고객사 생성 관련 타입
  export type CompanyCreateParams = {
    name: string;
    companyName: string;
    cellphone: string;
    email: string;
    companyCode: string;
    dbName: string;
    address: string;
    detailAddress: string;
    homepage?: string;
    ciImage?: string;
    businessImage?: string;
    memo?: string;
    businessNumber?: string;
    category: string;
    contractStartDate: string;
    contractEndDate: string;
    contractType: 'MONTH' | 'YEAR';
  };

  // 고객사 수정 관련 타입
  export type CompanyUpdateParams = {
    name?: string;
    companyName?: string;
    cellphone?: string;
    email?: string;
    dbName?: string;
    address?: string;
    detailAddress?: string;
    homepage?: string;
    ciImage?: string;
    businessImage?: string;
    memo?: string;
    businessNumber?: string;
    category?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    contractType?: 'MONTH' | 'YEAR';
  };

  // 상담요청 조회 관련 타입
  export type EstimateRequestGetListParams = {
    companyCode?: string;
    keyword?: string;
    fromDate?: string;
    toDate?: string;
  };

  // 사이트관리자 상담요청 조회 관련 타입
  export type SiteEstimateRequestGetListParams = {
    keyword?: string;
    fromDate?: string;
    toDate?: string;
    companyCode: string; // 헤더에 필요한 필수 값
  };

