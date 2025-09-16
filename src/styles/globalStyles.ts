import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    overflow-y: auto; /* 필요할 때만 스크롤바 표시 */
  }

  
  body {
    font-family: 'Noto Sans KR', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden; /* 가로 스크롤 방지 */
    width: 100%;
    min-height: 100vh;
    position: relative;
  }

  #root {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    position: relative;
    overflow: hidden;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    font: inherit;
    color: inherit;
    border-radius: 0;
    outline: none; 
  }
  
  button:focus {
    outline: none;
    box-shadow: none;
  }

  /* 스크롤바 스타일링 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.surface1};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.subtleText};
  }
  input, textarea, select {
    input:-webkit-autofill,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:active {
      background-color: #fff !important;
      -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
      -webkit-text-fill-color: #111827 !important;
      color: #111827 !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }
`