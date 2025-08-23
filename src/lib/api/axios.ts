import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 에러 처리
      // TODO: 로그아웃 처리 또는 토큰 갱신
    }
    return Promise.reject(error)
  }
)
