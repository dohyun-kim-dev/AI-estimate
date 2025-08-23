import styled from 'styled-components'
import { Outlet } from 'react-router-dom'
import Header from './Header'

interface LayoutProps {
  compact?: boolean
}

const Main = styled.main<{ compact?: boolean }>`
  padding-top: ${({ compact }) => (compact ? '60px' : '72px')};
  min-height: 100vh;
`

export const Layout: React.FC<LayoutProps> = ({ compact }) => {
  return (
    <>
      <Header compact={compact} />
      <Main compact={compact}>
        <Outlet />
      </Main>
    </>
  )
}

export default Layout
