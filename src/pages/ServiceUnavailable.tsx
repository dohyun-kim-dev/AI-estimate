import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: black;
  text-align: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
`;

const Message = styled.p`
  font-size: 18px;
  margin-bottom: 30px;
  max-width: 500px;
  line-height: 1.6;
`;

const Icon = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
`;

export default function ServiceUnavailable() {
  return (
    <Container>
      {/* <Icon>🚫</Icon> */}
      <Title>서비스를 이용할 수 없습니다</Title>
      <Message>
        {/* 현재 이 서비스는 비활성화 상태입니다. */}
        <br />
        자세한 내용은 관리자에게 문의해주세요.
      </Message>
    </Container>
  );
}
