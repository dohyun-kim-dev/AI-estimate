import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import styled from 'styled-components';
const NotFoundContainer = styled.main `
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
`;
const Title = styled.h1 `
  font-size: 2rem;
  margin-bottom: 1rem;
`;
const Description = styled.p `
  font-size: 16px;
  color: ${({ theme }) => theme.subtleText};
`;
const HomeLink = styled(Link) `
  margin-top: 2rem;
  padding: 12px 24px;
  background-color: #1976D2;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1565C0;
  }
`;
export default function NotFound() {
    return (_jsxs(NotFoundContainer, { children: [_jsx(Title, { children: "\uD83D\uDEAB \uD398\uC774\uC9C0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" }), _jsx(Description, { children: "\uC694\uCCAD\uD558\uC2E0 \uC8FC\uC18C\uC5D0 \uD574\uB2F9\uD558\uB294 \uD398\uC774\uC9C0\uAC00 \uC874\uC7AC\uD558\uC9C0 \uC54A\uAC70\uB098 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." }), _jsx(HomeLink, { to: "/", children: "\uD648\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30" })] }));
}
