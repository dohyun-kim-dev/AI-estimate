import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from '@components/common/ToastProvider';
import { useModalStore } from '@/store/modalStore'; // useModalStore 추가

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

  const ModalContent = styled.div`
  background-color: white;
  color: ${AppColors.onSurface};
  padding: 0;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 450px;
  height: 500px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  margin: 12px;
`;

const RightPanel = styled.div`
  flex: 1;
  background-color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${AppColors.onSurface};
  text-align: center;
`;

const PageSubtitle = styled.p`
  ${AppTextStyles.body2}
  font-size: 14px;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 8px;
  margin-left: 4px;
`;

const GradientTitleText = styled.h2`
  ${AppTextStyles.headline2}
  font-size: 24px;
  font-weight: bold;
background: linear-gradient(90deg, #0314CF 33.86%, #AFB2D4 74.02%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-top: 0;
  margin-bottom: 24px;
  line-height: 1.2;
`;

const MainSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 20px;
  font-weight: bold;
  color: ${AppColors.onSurface};
  margin-bottom: 20px;
  white-space: pre-line;
  line-height: 2;
`;

const SubSloganText = styled.h3`
  ${AppTextStyles.title1}
  font-size: 14px;
  font-weight: 500;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 50px;
  white-space: pre-line;
  line-height: 2;
`;

const CountButton = styled.button`
  background-color: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: background-color 0.2s;
  width: 100%;
  max-width: 320px;

  &:hover {
    background-color: #f8f9fa;
  }

  img {
    width: 20px;
    height: 20px;
  }

  &:disabled {
    background-color: #f1f3f4;
    color: #bdc1c6;
    cursor: not-allowed;
    border-color: #f1f3f4;
  }
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${AppColors.onSurfaceVariant};

  .MuiSvgIcon-root {
    font-size: 28px;
  }

  &:hover {
    color: ${AppColors.onSurface};
  }
`;

interface CountModalProps {
  $isOpen: boolean;
  onClose: () => void;
}

export const CountModal: React.FC<CountModalProps> = ({
  $isOpen,
  onClose,
}) => {
  const { openEstimateModal } = useModalStore();

  const handleEstimateRequest = () => {
    onClose(); // 현재 모달을 닫고
    openEstimateModal(); // 필수 정보 입력 모달을 엽니다.
  };

  if (!$isOpen) {
    return null;
  }

  return (
    <ModalOverlay
      $isOpen={$isOpen}
      onClick={onClose}
    >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <StyledCloseButton onClick={onClose}>
          <CloseIcon />
        </StyledCloseButton>
        <RightPanel>
          <PageSubtitle>복잡한 견적, AI로 간단하게.</PageSubtitle>
          <GradientTitleText>AIGO</GradientTitleText>
          <MainSloganText>질문 횟수가 모두 소진되었어요</MainSloganText>
          <SubSloganText>추가로 궁금한 내용이 있다면 <br/>
          ‘여기닷’에게 견적요청을 남겨주세요<br/>
          전문 컨설턴트가 빠르게 도와드립니다.</SubSloganText>
          <CountButton
            onClick={handleEstimateRequest}
          >
            <span>견적 요청하기</span>
          </CountButton>
        </RightPanel>
      </ModalContent>
    </ModalOverlay>
  );
};