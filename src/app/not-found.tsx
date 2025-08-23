import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.main`
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

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.subtleText};
`;

const HomeLink = styled(Link)`
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
  return (
    <NotFoundContainer>
      <Title>🚫 페이지를 찾을 수 없습니다</Title>
      <Description>
        요청하신 주소에 해당하는 페이지가 존재하지 않거나 삭제되었습니다.
      </Description>
      <HomeLink to="/">
        홈으로 돌아가기
      </HomeLink>
    </NotFoundContainer>
  );
}