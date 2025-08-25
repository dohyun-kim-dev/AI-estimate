import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import styled from "styled-components";
import { FaChevronDown } from "react-icons/fa";
const DropdownCustom = ({ value, onChange, options, setCurrentPage, themeMode = "light", triggerIcon, }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (_jsxs(DropdownContainer, { children: [_jsxs(DropdownHeader, { onClick: () => setIsOpen(!isOpen), "$themeMode": themeMode, children: [triggerIcon ?? value, _jsx(MarginTop, { children: _jsx(FaChevronDown, {}) })] }), isOpen && (_jsx(DropdownList, { "$themeMode": themeMode, children: options.map((option) => (_jsx(DropdownItem, { onClick: () => {
                        onChange(option);
                        setIsOpen(false);
                        if (setCurrentPage)
                            setCurrentPage(1);
                    }, "$themeMode": themeMode, children: option }, option))) }))] }));
};
export default DropdownCustom;
// 스타일 그대로 사용
const DropdownContainer = styled.div `
  position: relative;
  width: 100px;
  font-family: "Pretendard Variable", sans-serif;
`;
const MarginTop = styled.div `
  margin-top: 8px;
`;
const DropdownHeader = styled.div `
  width: 88%;
  height: 28px;
  padding: 5px;
  border: none;
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "white" : "#333544")};
  color: ${({ $themeMode }) => ($themeMode === "light" ? "#000000" : "#FFFFFF")};
  font-size: 16px;
  text-align: center;
  cursor: pointer;
  border-radius: 0;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  &:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f0f0f0" : "#424451")};
  }
`;
const DropdownList = styled.ul `
  position: absolute;
  width: 89%;
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "white" : "#333544")};
  border: 1px solid ${({ $themeMode }) => ($themeMode === "light" ? "#ccc" : "#424451")};
  border-top: none;
  list-style: none;
  padding: 0;
  margin: 0;
  z-index: 10;
`;
const DropdownItem = styled.li `
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 0;
  color: ${({ $themeMode }) => ($themeMode === "light" ? "#000000" : "#FFFFFF")};

  &:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#e0e0e0" : "#424451")};
  }
`;
