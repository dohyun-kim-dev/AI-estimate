import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { useThemeStore } from './store/themeStore'
import { GlobalStyle } from './styles/GlobalStyle'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AppRoutes from './routes'

function App() {
  const { theme } = useThemeStore()

  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <AppRoutes />
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App