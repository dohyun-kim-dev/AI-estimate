import styled from 'styled-components';

interface GapProps {
  height?: string; // 수직 공간
  width?: string;  // 수평 공간
}

const Gap = styled.div<GapProps>`
  height: ${({ height }) => height || '0px'};
  width: ${({ width }) => width || '0px'};
`;

export default Gap;