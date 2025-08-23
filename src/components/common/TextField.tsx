import styled from 'styled-components'

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

const Container = styled.div<{ fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`

const Label = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.text};
  margin-bottom: 4px;
`

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme, hasError }) => (hasError ? 'red' : theme.border)};
  background-color: ${({ theme }) => theme.surface1};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.subtleText};
  }
`

const ErrorText = styled.span`
  color: red;
  font-size: 12px;
  margin-top: 4px;
`

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  fullWidth,
  ...props
}) => {
  return (
    <Container fullWidth={fullWidth}>
      {label && <Label>{label}</Label>}
      <Input hasError={!!error} {...props} />
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  )
}

export default TextField
