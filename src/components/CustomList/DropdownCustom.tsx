import { useState } from "react";
import styled from "styled-components";
import { FaChevronDown } from "react-icons/fa";
import { ThemeMode } from "@/styles/theme_colors";

type DropdownProps = {
  value: number;
  onChange: (value: number) => void;
  options: number[];
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  themeMode?: ThemeMode;
  triggerIcon?: React.ReactNode | null; // ✅ 아이콘 추가
};

const DropdownCustom: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  setCurrentPage,
  themeMode = "light",
  triggerIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContainer>
      <DropdownHeader onClick={() => setIsOpen(!isOpen)} $themeMode={themeMode}>
        {triggerIcon ?? value}
        <MarginTop>
          <FaChevronDown />
        </MarginTop>
      </DropdownHeader>

      {isOpen && (
        <DropdownList $themeMode={themeMode}>
          {options.map((option) => (
            <DropdownItem
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
                if (setCurrentPage) setCurrentPage(1);
              }}
              $themeMode={themeMode}
            >
              {option}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

export default DropdownCustom;

// 스타일 그대로 사용
const DropdownContainer = styled.div`
  position: relative;
  width: 100px;
  font-family: "Pretendard Variable", sans-serif;
`;

const MarginTop = styled.div`
  margin-top: 8px;
`;

const DropdownHeader = styled.div<{ $themeMode: ThemeMode }>`
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

const DropdownList = styled.ul<{ $themeMode: ThemeMode }>`
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

const DropdownItem = styled.li<{ $themeMode: ThemeMode }>`
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 0;
  color: ${({ $themeMode }) => ($themeMode === "light" ? "#000000" : "#FFFFFF")};

  &:hover {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#e0e0e0" : "#424451")};
  }
`;
