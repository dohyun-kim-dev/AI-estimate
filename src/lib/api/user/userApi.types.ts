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
  usingService: string[];
  isNew: boolean;
}

