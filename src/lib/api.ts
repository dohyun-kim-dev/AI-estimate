import { pageLoaderController } from '@/contexts/PageLoaderContext'
import { devLog, devWarn } from '../utils/devLogger'

interface CallApiPostParams {
  title: string
  url: string
  body?: Record<string, unknown>
  isCallPageLoader?: boolean
}

export async function callApiPost<T = unknown>({
  title,
  url,
  body = {},
  isCallPageLoader = false,
}: CallApiPostParams): Promise<T> {
  devLog(`📱 [${title}]`, url, body)
  if (isCallPageLoader) pageLoaderController.open()

  let returnValue = ''

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 쿠키 인증으로 변경 - 액세스 토큰 제거
    // if (accessToken) {
    //   headers['Authorization'] = `Bearer ${accessToken}`
    // }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include', // 쿠키를 포함하기 위해 추가
      mode: 'cors', // CORS 모드 명시적 설정
    })

    returnValue = await response.text()
    devLog(`📱 [${title}] 응답`, returnValue)
  } catch (error) {
    devLog(`❌ [${title}] API 요청 에러`, error)
    returnValue = '[]'
  } finally {
    if (isCallPageLoader) pageLoaderController.close()
  }

  try {
    return JSON.parse(returnValue)
  } catch (e) {
    devWarn(`⚠️ [${title}] JSON 파싱 실패`, e)
    return [] as T
  }
}

