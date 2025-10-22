import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import { AppTextStyles } from '@/styles/textStyles';
import { useCompanyStore } from '@/store/companyStore';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.8);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;


const Highlight = styled.span`
  color: #2D50FF;
  // font-weight: bold;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 40px 40px 20px 40px;
  border-radius: 12px;
  width: 450px;
  text-align: center;
  position: relative;
  z-index: 100000;
`;

const Title = styled.h2`
  ${AppTextStyles.headline2}
  font-size: 24px;
  color: ${AppColors.onSurface};
  margin-bottom: 18px;
  line-height: 1.5;
`;

const SubTitle = styled.p`
  ${AppTextStyles.body2}
  font-size: 16px;
  font-weight: 500;
  color: ${AppColors.onSurfaceVariant};
  margin-bottom: 30px;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  gap: 12px;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
`;

const PrimaryButton = styled(Button)`
  background-color: #2D50FF;
  color: white;
  border: none;
  margin-bottom: 10px;
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #A9A9A9;
  font-size: 12px;
  border-radius: 0px;
  border-bottom: 1px solid #A9A9A9;
  // border: 1px solid ${AppColors.primary};
  padding: 0px;
  width: fit-content;
  margin: 0 auto;
`;

interface EstimateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
  primaryButtonText?: string;
  secondaryButtonText?: string;
}

export const EstimateConfirmModal: React.FC<EstimateConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  subTitle,
  primaryButtonText,
  secondaryButtonText,
}) => {
  const { companyInfo } = useCompanyStore();
  const companyName = companyInfo?.companyName || '여기닷';
  
  // 기본값 설정
  const displayTitle = title || (
    <>
      가장 정밀한​ <br />
      <Highlight>무료 견적</Highlight> 혜택받기​
    </>
  );
  
  const displaySubTitle = subTitle || (
    <>
      {companyName}에 AI견적 대화 기반​ <br/>정밀한 견적 요청 가능해요​
    </>
  );
  
  const displayPrimaryButtonText = primaryButtonText || '혜택 받고 이어서 대화하기';
  const displaySecondaryButtonText = secondaryButtonText || '혜택 없이 이어서 대화하기';

  return (
    <ModalOverlay $isOpen={isOpen} >
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Title>{displayTitle}</Title>
        <SubTitle>{displaySubTitle}</SubTitle>
        <ButtonGroup>
          <PrimaryButton onClick={onConfirm}>
            {displayPrimaryButtonText}
          </PrimaryButton>
          <SecondaryButton onClick={onClose}>
            {displaySecondaryButtonText}
          </SecondaryButton>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};
