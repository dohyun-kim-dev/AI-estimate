// API 응답 타입 정의
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  metadata: unknown | null;
  error: {
    statusCode: number;
    message: string;
    customMessage?: string;
  } | null;
  headers?: Headers;
}

// 첫 번째 요청 파라미터
export interface GoogleLoginInitialParams {
  providerId: string;
}

// 추가 정보 요청 파라미터
export interface GoogleLoginUpdateParams {
  providerId: string;
  name: string;
  email: string;
  profileImage: string;
  cellphone?: string;
}

export interface GoogleLoginResponse {
  _id: string;
  providerId: string;
  createAt: string;
  updateAt?: string;
  profileImage?: string;
  email?: string;
  name?: string;
  cellphone?: string;
  usingService: Array<{
    _id: string;
    user: string;
    company: string;
    monthlyQueryUsage: number;
    dailyQueryUsage: number;
    createAt: string;
    updateAt: string;
  }>;
  isNew: boolean;
}

// 회사 정보 응답 타입
export interface CompanyInfoResponse {
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
  aiConfidence: number;
  mode: string;
  category: {
    _id: string;
    name: string;
    code: string;
  };
  createAt: string;
  updateAt: string;
  memo: string;
  checkpointList: Array<{
    checkpoint: number;
    discountRate: number;
    _id: string;
  }>;
  discountRate: string;
  employeeDailyQueryLimit: number;
  employeeMonthlyQueryLimit: number;
  geminiApiKey: string;
  guestDailyQueryLimit: number;
  guestMonthlyQueryLimit: number;
  rateRule: string;
  userDailyQueryLimit: number;
  userMonthlyQueryLimit: number;
  aiName: string;
  aiProfile: string;
  businessCategory: string;
  businessType: string;
  businessNumber: string;
  homepage: string;
  etc: string[];
  signature: string;
  maxValue: number;
  minValue: number;
  otpSecret: string;
}

// 게스트 토큰 응답 타입
export interface GuestTokenResponse {
  _id: string;
  company: {
    _id: string;
    name: string;
    companyCode: string;
  };
  user: string;
  dailyQueryCount: number;
  monthlyQueryCount: number;
  isAdditionalCharge: boolean; // 추가 과금 여부 (hasUsedExtraCount와 동일)
  createAt: string;
  updateAt: string;
}

// 사용자 정보 응답 타입
export interface UserInfoResponse {
  _id: string;
  providerId: string;
  createAt: string;
  updateAt: string;
  cellphone?: string;
  email?: string;
  name?: string;
  profileImage?: string;
  usingService: Array<{
    _id: string;
    user: string;
    company: string;
    monthlyQueryUsage: number;
    dailyQueryUsage: number;
    createAt: string;
    updateAt: string;
  }>;
}

