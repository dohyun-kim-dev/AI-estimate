import styled from 'styled-components';
const Gap = styled.div `
  height: ${({ height }) => height || '0px'};
  width: ${({ width }) => width || '0px'};
`;
export default Gap;
