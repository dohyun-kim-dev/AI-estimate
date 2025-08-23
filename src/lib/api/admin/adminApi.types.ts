export type AdminLoginParams = {
    userId: string;
    password: string;
  };

  export type AdminGetListParams = {
    keyword: string;
  };

  export type AdminCreateParams = {
    adminId: string;
    password: string;
    name: string;
    cellphone: string;
    description: string;
    email: string;
    emailYn: string;
    smsYn: string;
  };

  export type UnitPriceGetListParams = Record<string, never>;

  export type AdminUpdateParams = {
    targetAdminId: string; // 로그인 ID
    name?: string;
    cellphone?: string;
    description?: string;
    email?: string;
    emailYn?: 'Y' | 'N';
    smsYn?: 'Y' | 'N';
  };

  export type AdminPasswordUpdateParams = {
    targetAdminId: string; // 로그인 ID
    password: string;
  };


  export type TermGetListParams = {
    index: number;
    termsType: string;
    content: string;
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

