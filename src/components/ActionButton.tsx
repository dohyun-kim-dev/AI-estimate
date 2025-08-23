import styled from 'styled-components';
import { THEME_COLORS, ThemeMode } from '@/styles/theme_colors';

const ActionButton = styled.button<{ $themeMode: ThemeMode }>`
  padding: 8px 15px;
  height: 36px;
  border-radius: 0px;
  border: none;
  background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#FFFFFF" : THEME_COLORS.dark.secondary)};
  color: ${({ $themeMode }) => ($themeMode === "light" ? THEME_COLORS.light.text : THEME_COLORS.dark.text)};
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover:not(:disabled) {
    background-color: ${({ $themeMode }) => ($themeMode === "light" ? "#f0f0f0" : "#424451")};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default ActionButton;