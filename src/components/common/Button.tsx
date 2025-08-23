import styled from 'styled-components'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  
  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'primary':
        return `
          background-color: ${theme.primary};
          color: white;
          &:hover:not(:disabled) {
            filter: brightness(1.1);
          }
        `
      case 'secondary':
        return `
          background-color: ${theme.secondary};
          color: white;
          &:hover:not(:disabled) {
            filter: brightness(1.1);
          }
        `
      case 'outline':
        return `
          background-color: transparent;
          border: 1px solid ${theme.primary};
          color: ${theme.primary};
          &:hover:not(:disabled) {
            background-color: ${theme.surface1};
          }
        `
    }
  }}

  ${({ size = 'medium' }) => {
    switch (size) {
      case 'small':
        return `
          padding: 8px 16px;
          font-size: 14px;
        `
      case 'medium':
        return `
          padding: 12px 20px;
          font-size: 16px;
        `
      case 'large':
        return `
          padding: 16px 24px;
          font-size: 18px;
        `
    }
  }}

  ${({ fullWidth }) => fullWidth && `width: 100%;`}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return <StyledButton {...props}>{children}</StyledButton>
}

export default Button
