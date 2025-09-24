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

