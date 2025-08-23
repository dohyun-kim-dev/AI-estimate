import { api } from './axios'

export interface GoogleLoginInitialParams {
  providerId: string
}

export interface GoogleLoginUpdateParams {
  providerId: string
  name: string
  email: string
  profileImage: string
  cellphone?: string
}

export interface GoogleLoginResponse {
  _id: string
  providerId: string
  createAt: string
  updateAt?: string
  profileImage?: string
  email?: string
  name?: string
  cellphone?: string
  usingService: string[]
  isNew: boolean
}

export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
  metadata: any
  error: {
    statusCode: number
    message: string
    customMessage?: string
    name?: string
  } | null
}

export async function googleLoginInitial(params: GoogleLoginInitialParams) {
  const response = await api.post<ApiResponse<GoogleLoginResponse>>(
    '/users/login/google',
    params
  )
  return response.data
}

export async function googleLoginUpdate(params: GoogleLoginUpdateParams) {
  const response = await api.post<ApiResponse<GoogleLoginResponse>>(
    '/users/login/google',
    params
  )
  return response.data
}

export async function logout() {
  const response = await api.post<ApiResponse<void>>('/users/logout')
  return response.data
}
