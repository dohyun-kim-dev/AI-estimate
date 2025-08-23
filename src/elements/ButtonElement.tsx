import styled, { css, CSSObject } from "styled-components";
import React from "react";
import { AppColors } from "@/styles/colors";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "success" | "outlined" | "text";
export type ButtonSize = "small" | "medium" | "large";

interface ButtonElementProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  isRounded?: boolean;
  bordered?: boolean;
  layered?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";

  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
  width?: string;
  height?: string;
  fontStyle?: CSSObject;
}

const ButtonElement: React.FC<ButtonElementProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  icon,
  iconPosition = "left",
  disabled = false,
  isRounded = false,
  bordered = false,
  layered = false,
  onClick,
  children,
  className,
  type = "button",
  borderRadius,
  backgroundColor,
  textColor,
  width,
  height,
  fontStyle,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $iconPosition={iconPosition}
      $isRounded={isRounded}
      $bordered={bordered}
      $layered={layered}
      $hasIcon={!!icon}
      $borderRadius={borderRadius}
      $backgroundColor={backgroundColor}
      $textColor={textColor}
      $width={width}
      $height={height}
      $fontStyle={fontStyle}
      disabled={disabled}
      onClick={onClick}
      className={className}
      type={type}
      {...props}>
      {icon && iconPosition === "left" && <IconWrapper>{icon}</IconWrapper>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <IconWrapper>{icon}</IconWrapper>}
    </StyledButton>
  );
};

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case "primary":
      return css`
        background-color: ${AppColors.primary};
        color: ${AppColors.onPrimary};
        &:hover:not(:disabled) {
          background-color: ${AppColors.buttonPrimaryHover};
        }
      `;
    case "secondary":
      return css`
        background-color: ${AppColors.secondary};
        color: ${AppColors.onSecondary};
        &:hover:not(:disabled) {
          background-color: ${AppColors.buttonSecondaryHover};
        }
      `;
    case "tertiary":
      return css`
        background-color: ${AppColors.tertiary};
        color: ${AppColors.onTertiary};
        &:hover:not(:disabled) {
          opacity: 0.8;
        }
      `;
    case "danger":
      return css`
        background-color: ${AppColors.error};
        color: ${AppColors.onPrimary};
        &:hover:not(:disabled) {
          filter: brightness(0.9);
        }
      `;
    case "success":
      return css`
        background-color: ${AppColors.success};
        color: ${AppColors.onPrimary};
        &:hover:not(:disabled) {
          filter: brightness(0.9);
        }
      `;
    case "outlined":
      return css`
        background-color: transparent;
        color: ${AppColors.primary};
        border: 1px solid ${AppColors.border};
        &:hover:not(:disabled) {
          background-color: ${AppColors.primary + "1A"};
          color: ${AppColors.primary};
        }
      `;
    case "text":
      return css`
        background-color: transparent;
        color: ${AppColors.primary};
        &:hover:not(:disabled) {
          background-color: ${AppColors.primary + "1A"};
        }
      `;
    default:
      return css`
        background-color: ${AppColors.primary};
        color: ${AppColors.onPrimary};
        &:hover:not(:disabled) {
          background-color: ${AppColors.buttonPrimaryHover};
        }
      `;
  }
};

const getSizeStyles = (size: ButtonSize, hasIcon: boolean) => {
  switch (size) {
    case "small":
      return css`
        padding: ${hasIcon ? "0.375rem 0.75rem" : "0.375rem 0.625rem"};
        font-size: 0.75rem;
      `;
    case "medium":
      return css`
        padding: ${hasIcon ? "0.5rem 1rem" : "0.5rem 0.875rem"};
        font-size: 0.875rem;
      `;
    case "large":
      return css`
        padding: ${hasIcon ? "0.625rem 1.25rem" : "0.625rem 1.125rem"};
        font-size: 1rem;
      `;
    default:
      return css`
        padding: ${hasIcon ? "0.5rem 1rem" : "0.5rem 0.875rem"};
        font-size: 0.875rem;
      `;
  }
};

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $iconPosition: "left" | "right";
  $isRounded: boolean;
  $bordered: boolean;
  $layered: boolean;
  $hasIcon: boolean;
  $borderRadius?: string;
  $backgroundColor?: string;
  $textColor?: string;
  $width?: string;
  $height?: string;
  $fontStyle?: CSSObject;
}

const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  border: none;
  transition: all 0.2s;
  cursor: pointer;

  ${(props) => !props.$backgroundColor && !props.$textColor && getVariantStyles(props.$variant)}
  ${(props) => !props.$fontStyle && getSizeStyles(props.$size, props.$hasIcon)}

  width: ${(props) => props.$width ?? (props.$fullWidth ? "100%" : "auto")};
  height: ${(props) => props.$height ?? "auto"};
  border-radius: ${(props) => props.$borderRadius ?? (props.$isRounded ? "9999px" : "0.375rem")};
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};

  ${(props) => props.$fontStyle && css(props.$fontStyle)}

  ${(props) =>
    props.$bordered &&
    css`
      border: 1px solid;
      border-color: ${AppColors.border};
    `}

  ${(props) =>
    props.$layered &&
    css`
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
    `}
    
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background-color: ${(props) => (props.$backgroundColor ? props.$backgroundColor : AppColors.buttonDisabled)};
    color: ${(props) => (props.$textColor ? props.$textColor : AppColors.onBackground)};
    border-color: transparent;
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`;

export default ButtonElement;
