import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  
  const API_URL = env.VITE_API_URL || 'http://121.157.229.40:8535'
  const ENV = env.VITE_ENV || 'development'

  console.log(`현재 환경: ${ENV}`)
  console.log(`API URL: ${API_URL}`)

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
      proxy: {
        // API 프록시 설정
        '/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
        }
      },
      cors: true // CORS 활성화
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