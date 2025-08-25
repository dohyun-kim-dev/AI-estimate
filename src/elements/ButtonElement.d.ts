import { CSSObject } from "styled-components";
import React from "react";
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
declare const ButtonElement: React.FC<ButtonElementProps>;
export default ButtonElement;
