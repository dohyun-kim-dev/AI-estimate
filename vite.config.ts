import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import type { ProxyOptions } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  // 환경 변수 설정
  const API_HOST = env.VITE_API_HOST
  const ENV_NAME = env.VITE_ENV_NAME || mode

  console.log(`현재 환경: ${ENV_NAME}`)
  console.log(`API HOST: ${API_HOST}`)

    // 프록시 설정 - 모든 환경에서 사용
  const proxyConfig: Record<string, ProxyOptions> = {
    '/api': {
      target: ENV_NAME === 'dev' ? API_HOST : API_HOST,
      changeOrigin: true,
      secure: false,
      rewrite: (path: string) => path.replace(/^\/api/, ''),
      headers: {
        'x-company-code': 'heredot'
      }
    }
  }

  return {
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: [
            'babel-plugin-styled-components'
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@ai': path.resolve(__dirname, './src/ai'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/components'),
        '@config': path.resolve(__dirname, './src/config'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@elements': path.resolve(__dirname, './src/elements'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@layout': path.resolve(__dirname, './src/layout'),
        '@lib': path.resolve(__dirname, './src/lib'),
        '@store': path.resolve(__dirname, './src/store'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@utils': path.resolve(__dirname, './src/utils'),
        // MUI icons tree shaking
        '@mui/icons-material': '@mui/icons-material/esm',
      }
    },
    server: {
      proxy: proxyConfig,
      cors: true, // CORS 활성화
      host: true, // 외부 접속 허용
    },
    build: {
      rollupOptions: {
        // 번들 최적화 설정
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'styled': ['styled-components'],
            'mui': ['@mui/material', '@mui/icons-material'],
          }
        }
      }
    }
  }
})