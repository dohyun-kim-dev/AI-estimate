import React from 'react';
import styled from 'styled-components';
// import { Field, FloatingLabel, ErrorText } from './TextField'; // 스타일 재활용

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  errorMessage?: string;
  height?: string;
}
const StyledTextArea = styled.textarea<{ $height?: string }>`
  height: ${props => props.$height || '150px'};
  width: 100%;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #111827;
  padding: 14px;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: vertical; /* 사용자가 세로 크기를 조절할 수 있도록 함 */
  
  &::placeholder {
    color: #666666;
    opacity: 0.6;
  }

  &:focus {
    outline: none;
    border-color: #3391FF;
    box-shadow: 0 0 0 2px rgba(51, 145, 255, 0.12);
  }

  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #EF4444;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
  display: block;
`;

const Field = styled.div`
  position: relative;
  width: 100%;
`;

const FloatingLabel = styled.label`
  position: absolute;
  top: -10px;
  left: 12px;
  margin-top: 3px;
  padding: 0 4px;
  font-size: 12px;
  color: #666666;
  background: #ffffff;
  z-index: 1;
`;

export default function TextArea({ 
  id, 
  label, 
  errorMessage,
  minLines, 
  maxLines,
  ...props 
}: TextAreaProps) {
  return (
    <Field>
      <FloatingLabel htmlFor={id}>{label}</FloatingLabel>
      <StyledTextArea 
        id={id} 
        {...props} 
      />
      {errorMessage && <ErrorText>{errorMessage}</ErrorText>}
    </Field>
  );
}