"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import styled from "styled-components";
const CustomSidebarHeader = ({ isCollapsed, showTime = true, // 기본값: 시간 표시
iconSrc = "/icon_user.png", // 기본값: 유저 아이콘
name = "User", // 기본값: User
iconSize = 24, // 기본 아이콘 크기
 }) => {
    const [currentTime, setCurrentTime] = useState("");
    const [imgSrc, setImgSrc] = useState(iconSrc);
    useEffect(() => {
        setImgSrc(iconSrc);
    }, [iconSrc]);
    useEffect(() => {
        if (!showTime) {
            setCurrentTime("");
            return;
        }
        const updateTime = () => {
            const now = new Date();
            const formattedTime = now.toLocaleString("ko-KR", {
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            setCurrentTime(formattedTime);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [showTime]);
    return (_jsx(Header, { children: !isCollapsed && (_jsxs(_Fragment, { children: [showTime && (_jsx(Padding20, { children: _jsx("span", { children: currentTime }) })), _jsxs(Flex, { children: [imgSrc && (_jsx(StyledIconWrapper, { children: _jsx("img", { src: iconSrc, alt: "user icon", width: iconSize, height: iconSize }) })), _jsx(UserName, { children: name })] })] })) }));
};
export default CustomSidebarHeader;
// --- Styled Components --- (기존 스타일 유지 및 IconWrapper 추가)
const Header = styled.div `
  height: 100px; // 필요시 조정
  display: flex;
  flex-direction: column; // 세로 정렬
  justify-content: center;
  align-items: center; // 기본 중앙 정렬
  padding-bottom: 10px; // 하단 패딩 조정
  border-bottom: 1px solid #444; // 구분선 유지
  overflow: hidden; // 헤더 내용 숨김 처리
  transition: height 0.3s ease; // 부드러운 높이 변화
`;
const Flex = styled.div `
  display: flex;
  width: 100%; // 너비 채움
  padding-left: 20px; // 좌측 패딩 조정
  align-items: center;
  color: #c4c5c9;
  margin-top: 10px; // 시간 표시와의 간격
`;
// IconImage의 스타일을 여기에 적용
const StyledIconWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px; // UserName과의 간격
`;
const UserName = styled.p `
  font-weight: 500;
  white-space: nowrap; // 이름 줄바꿈 방지
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Padding20 = styled.div `
  font-size: 18px; // 임시 폰트 크기
  font-weight: 500; // 임시 폰트 두께
  padding: 20px 0 0 0; // 패딩 조정
  display: flex;
  justify-content: center;
  width: 100%; // 너비 채움
`;
