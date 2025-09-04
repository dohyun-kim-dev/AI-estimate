import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';

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
  padding: 40px;
  border-radius: 12px;
  width: 450px;
  text-align: center;
  position: relative;
`;

const Title = styled.h2`
  ${AppTextStyles.headline2}
  color: ${AppColors.onSurface};
  margin-bottom: 20px;
`;

const SubTitle = styled.p`
  ${AppTextStyles.body2}
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 30px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background-color: ${AppColors.primary};
  color: white;
  border: none;
  
  &:hover {
    background-color: ${AppColors.primaryDark};
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: ${AppColors.primary};
  border: 1px solid ${AppColors.primary};
  
  &:hover {
    background-color: ${AppColors.primaryLight};
  }
`;

interface EstimateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EstimateConfirmModal: React.FC<EstimateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>더 확실한 견적을 원하시나요?</Title>
        <SubTitle>
          AI 견적만으로는 아쉽다면,<br />
          "여기닷"에서 받아보세요
        </SubTitle>
        <ButtonGroup>
          <SecondaryButton onClick={onClose}>
            다음에 할게요
          </SecondaryButton>
          <PrimaryButton onClick={onConfirm}>
            견적 받아보기
          </PrimaryButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};
