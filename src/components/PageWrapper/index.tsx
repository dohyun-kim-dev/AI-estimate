import styled from "styled-components";
import React from "react";

/**
 * CMS 페이지용 공통 PageWrapper 컴포넌트
 * 
 * 기본 스타일:
 * - width: 100% (부모 컨테이너에 맞춤)
 * - flexbox layout with column direction
 * - gap: 20px
 * - margin: 0 auto (중앙 정렬)
 */
const StyledPageWrapper = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 0px 0px 0px 0px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CMS 페이지용 공통 PageWrapper 컴포넌트
 * 
 * @param children - 래핑할 컨텐츠
 * @param className - 추가 CSS 클래스명
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({ children, className }) => {
  return <StyledPageWrapper className={className}>{children}</StyledPageWrapper>;
};

export default PageWrapper;
