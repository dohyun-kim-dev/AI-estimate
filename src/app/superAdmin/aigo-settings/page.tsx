import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TextField from '@/components/common/TextField';
import TextArea from '@/components/common/TextArea';
import CheckBox from '@/components/common/CheckBox';
import BidUnitSetting from '@/components/BidUnitSetting';
import Switch from '@components/Switch';
import CompanySearch from '@/components/CompanySearch/CompanySearch';
import { AppColors } from '@styles/colors';
import { ThemeProvider } from "styled-components";
import { lightTheme } from "@styles/theme";
import { getCompany, updateAISettings } from '@/lib/api/admin/adminApi';
import { useToast } from '@/components/common/ToastProvider';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import { getCompanyCodeFromUrl } from '@/utils/companyUtils';
import { devLog } from '@/utils/devLogger';

const Slider = styled.input.attrs({ type: 'range' })<{ value: number }>`
  width: 100%;
  height: 8px;
  background: linear-gradient(
    to right,
    #636994 0%,
    #636994 ${props => props.value}%,
    #ccc ${props => props.value}%,
    #ccc 100%
  );
  border-radius: 4px;
  -webkit-appearance: none;
  appearance: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #636994;
    border-radius: 50%;
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #636994;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const SettingsContainer = styled.div`
  // margin: 0 auto;
  padding: 44px 24px 24px 24px;
  width: 100%;
  // max-width: 800px;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 840px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  position: relative;
`;

const Heading = styled.h2`
  color: ${({ theme }) => theme.text};
  font-size: 24px;
  font-weight: bold;
  margin: 0;
`;

const CompanySearchWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
`;


const CardsWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  background-color: #F7F7F7;
  padding: 24px;
  border-radius: 8px;
`;

const Card = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 8px;
  max-width: 840px;
  // box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  // border: 1px solid #e5e5e5;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionNumber = styled.div`
  width: 24px;
  height: 24px;
  background-color: ${AppColors.primary};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.subtleText};
  margin-bottom: 16px;
  line-height: 1.4;
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModeText = styled.div`
display: flex;
  font-size: 16px;
  color: #555;
  margin-top: 24px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const SwitchFrom = styled.div`
  margin-left: 12px;
`;

const ExternalLink = styled.a`
  background-color: #2C2E3C;
  color: white;
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  display: inline-block;
  padding: 12px 16px;
  border-radius: 4px;
  float: right;
  
  &:hover {
  color: white;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  width: 100%;
`;

const SliderValue = styled.span`
  color: inherit;
  font-weight: 500;
  min-width: 30px;
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  background-color: #686B7E;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
    padding-right: 36px; /* X 버튼 자리 확보 */

  white-space: nowrap;
  z-index: 900;
  
  /* 말풍선 꼬리 */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 20px;
    border: 6px solid transparent;
    border-top-color: #686B7E;
  }
`;

export const CloseBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  opacity: 0.9;

  &:hover { opacity: 1; }
  &:active { transform: scale(0.96); }

  /* 버튼 클릭 영역이 겹쳐도 텍스트 선택 방지 */
  user-select: none;

  /* SVG 크기 제어 */
  svg { display: block; width: 10px; height: 10px; }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 8px;
`;

const SliderWrapper = styled.div`
  width: 100%;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;


const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  margin: 16px 0;
`;

const RadioItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
`;

const RadioInput = styled.input`
  margin: 0;
`;

const RateRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const RateLabel = styled.span`
  min-width: 80px;
  font-size: 14px;
`;

const RateInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
`;

const UnitLabel = styled.span`
  font-size: 14px;
  color: #666;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const SaveAllButton = styled.button`
  position: fixed;
  bottom: 24px;
  padding: 16px 20px;
  background-color: #2C2E3C;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  
`;

// ✅ 토글 비활성화 문제 해결: pointer-events를 토글 영역에서 제외
const CollapsibleCard = styled(Card)<{ $isCollapsed: boolean }>`
  transition: all 0.3s ease;
  ${({ $isCollapsed }) => $isCollapsed && `
    opacity: 0.6;
  `}
`;

// ✅ 토글 버튼은 항상 활성화되도록 스타일 분리
const ToggleWrapper = styled.div`
  /* 토글은 항상 활성화 */
  pointer-events: auto;
`;

const CardContent = styled.div<{ $isDisabled: boolean }>`
  ${({ $isDisabled }) => $isDisabled && `
    pointer-events: none;
    opacity: 0.5;
  `}
`;

const CollapseContent = styled.div<{ $isVisible: boolean }>`
  transition: all 0.3s ease;
  max-height: ${({ $isVisible }) => $isVisible ? '1000px' : '0'};
  overflow: hidden;
  ${({ $isVisible }) => !$isVisible && `
    margin: 0;
    padding: 0;
  `}
`;

// 보안 키 입력 컴포넌트 스타일
const SecureKeyContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SecureKeyLabel = styled.label`
  position: absolute;
  top: -8px;
  left: 12px;
  background-color: white;
  padding: 0 4px;
  font-size: 12px;
  color: #79747E;
  z-index: 1;
`;

const SecureKeyTextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 1px solid #79747E;
  border-radius: 8px;
  font-size: 16px;
  resize: vertical;
  box-sizing: border-box;
  background: white;
  color: #000;
  
  /* 복사 방지 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  
  /* 우클릭 방지 */
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;

`;

// 보안 키 입력 컴포넌트
interface SecureKeyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SecureKeyInput: React.FC<SecureKeyInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder
}) => {
  // 마스킹된 값을 표시하는 함수
  const getMaskedValue = (inputValue: string) => {
    if (!inputValue) return '';
    
    if (inputValue.length <= 8) {
      return inputValue; // 8글자 이하면 그대로 표시
    }
    
    const firstFour = inputValue.substring(0, 4);
    const lastFour = inputValue.substring(inputValue.length - 4);
    const middleLength = inputValue.length - 8;
    const maskedMiddle = '●'.repeat(middleLength);
    
    return `${firstFour}${maskedMiddle}${lastFour}`;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    onChange(pastedText);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault(); // 우클릭 메뉴 방지
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+C, Ctrl+A 등 복사 관련 단축키 방지
    if (e.ctrlKey && (e.key === 'c' || e.key === 'a' || e.key === 'x')) {
      e.preventDefault();
    }
  };

  return (
    <SecureKeyContainer>
      <SecureKeyLabel htmlFor={id}>{label}</SecureKeyLabel>
      <SecureKeyTextArea
        id={id}
        value={getMaskedValue(value)}
        onPaste={handlePaste}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        readOnly
        title="붙여넣기만 가능합니다"
      />
    </SecureKeyContainer>
  );
};

export default function AigoSettingsPage() {
  const { show: showToast } = useToast();
  const [showTooltip, setShowTooltip] = useState(true);
  const [selectedCompanyCode, setSelectedCompanyCode] = useState<string | null>(''); // 빈 값으로 초기화
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>(''); // 기본값 설정
  const [isLoading, setIsLoading] = useState(false);
  const bidUnitSettingRef = React.useRef<{ getCheckpointList: () => Array<{checkpoint: number; discountRate: number}> } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // URL에서 회사 코드 추출하여 초기화
  useEffect(() => {
    const currentPath = window.location.pathname;
    
    // URL에서 /cms/가 포함되면 회사 코드 자동 추출
    if (currentPath.includes('/cms/')) {
      const extractedCompanyCode = getCompanyCodeFromUrl();
      if (extractedCompanyCode && extractedCompanyCode !== 'aigo') {
        setSelectedCompanyCode(extractedCompanyCode);
        setSelectedCompanyName(extractedCompanyCode.toUpperCase());
        devLog('🏢 [AIGO 설정] URL에서 회사 코드 자동 추출:', {
          path: currentPath,
          companyCode: extractedCompanyCode
        });
      }
    }
  }, []);

  // 회사 코드가 변경되면 데이터 자동 로드
  useEffect(() => {
    // selectedCompanyCode가 존재하고 빈 문자열이 아닐 때만 로드
    if (selectedCompanyCode && selectedCompanyCode.trim() !== '') {
      loadAISettings(selectedCompanyCode);
    }
  }, [selectedCompanyCode]);
  
  const [formData, setFormData] = useState({
    theme: 'light',
    maxGuestQueries: '',
    maxMemberQueries: '',
    maxMonthlyMemberQueries: '',
    maxStaffQueries: '',
    maxMonthlyStaffQueries: '',
    inferencePerformance: 50,
    licenseKey: '',
    projectRateEnabled: true,
    projectName1: '',
    projectRate1: '',
    projectName2: '',
    projectRate2: '',
    projectName3: '',
    projectRate3: '',
    rateIncrease: 'simple',
    basicRate: '',
    advancedRate: '',
    premiumRate: '',
    // 단위 기준 설정 (단일 선택)
    discountRate: 'MONTH' as 'WEEK' | 'MONTH' | 'QUANTITY',
    // 단위 설정 (단일 선택)
    rateRule: 'FIXED' as 'FIXED' | 'DYNAMIC'
  });

  // checkpointList 데이터를 별도로 관리
  const [checkpointList, setCheckpointList] = useState<Array<{checkpoint: number; discountRate: number}>>([]);

  // AI 설정 로드 함수
  const loadAISettings = async (companyCode: string) => {
    // 컴퍼니 코드가 없거나 빈 문자열이면 API 호출하지 않음
    if (!companyCode || companyCode.trim() === '') {
      console.log('컴퍼니 코드가 없어 AI 설정 로드를 건너뜁니다.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await getCompany(companyCode);
      
      let company: any = null;
      if (result && typeof result === 'object') {
        if (Array.isArray(result)) {
          const firstItem = result[0];
          if (firstItem && typeof firstItem === 'object' && 'data' in firstItem) {
            const responseData = firstItem.data as any;
            if (responseData && typeof responseData === 'object' && 'data' in responseData) {
              company = responseData.data;
            }
          }
        } else if ('data' in result) {
          const resultData = result as any;
          company = resultData.data;
        }
      }
      
      if (company) {
        setFormData(prev => ({
          ...prev,
          maxGuestQueries: (company.guestDailyQueryLimit || 0).toString(),
          maxMemberQueries: (company.userDailyQueryLimit || 0).toString(),
          maxMonthlyMemberQueries: (company.userMonthlyQueryLimit || 0).toString(),
          maxStaffQueries: (company.employeeDailyQueryLimit || 0).toString(),
          maxMonthlyStaffQueries: (company.employeeMonthlyQueryLimit || 0).toString(),
          inferencePerformance: company.aiConfidence || 50,
          licenseKey: company.geminiApiKey || '',
          theme: (company.mode || 'LIGHT').toLowerCase(),
          discountRate: company.discountRate || 'MONTH',
          rateRule: company.rateRule || 'FIXED',
          projectName1: (company.minValue || 0).toString(),
          projectName2: (company.maxValue || 0).toString(),
        }));
        
        // checkpointList 데이터 설정
        if (company.checkpointList && Array.isArray(company.checkpointList)) {
          setCheckpointList(company.checkpointList);
          console.log('Loaded checkpointList:', company.checkpointList);
        } else {
          setCheckpointList([]);
        }
      }
      
    } catch (error) {
      console.error('AI 설정 로드 실패:', error);
      showToast('AI 설정을 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 숫자 전용 입력 핸들러
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // 숫자만 허용 (빈 문자열도 허용)
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleCheckBoxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleUnitBasisChange = (unitType: 'WEEK' | 'MONTH' | 'QUANTITY') => {
    setFormData(prev => ({
      ...prev,
      discountRate: unitType
    }));
  };

  const handleUnitSettingChange = (settingType: 'FIXED' | 'DYNAMIC') => {
    setFormData(prev => ({
      ...prev,
      rateRule: settingType
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, inferencePerformance: parseInt(e.target.value, 10) }));
  };

  const handleSaveAll = () => {
    // 컴퍼니 코드 검증
    if (!selectedCompanyCode || selectedCompanyCode.trim() === '') {
      showToast('고객사를 선택해주세요.', 'error');
      return;
    }

    // validation 체크
    if (!validateDiscountRates()) {
      return;
    }

    // 확인 모달 표시
    setShowConfirmModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmModal(false);
    
    // 컴퍼니 코드가 없으면 저장하지 않음
    if (!selectedCompanyCode || selectedCompanyCode.trim() === '') {
      showToast('고객사를 선택해주세요.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updateParams = {
        guestDailyQueryLimit: parseInt(formData.maxGuestQueries) || 0,
        guestMonthlyQueryLimit: 10000, // 기본값 - 필요시 formData에 추가
        userDailyQueryLimit: parseInt(formData.maxMemberQueries) || 0,
        userMonthlyQueryLimit: parseInt(formData.maxMonthlyMemberQueries) || 0,
        employeeDailyQueryLimit: parseInt(formData.maxStaffQueries) || 0,
        employeeMonthlyQueryLimit: parseInt(formData.maxMonthlyStaffQueries) || 0,
        geminiApiKey: formData.licenseKey,
        discountRate: formData.discountRate,
        rateRule: formData.rateRule,
        aiConfidence: formData.inferencePerformance,
        mode: formData.theme.toUpperCase() as 'DARK' | 'LIGHT',
        checkpointList: bidUnitSettingRef.current?.getCheckpointList() || [], // 저장 시 동적으로 가져오기
        minValue: parseInt(formData.projectName1) || 0, // 최소 구간 추가
        maxValue: parseInt(formData.projectName2) || 0, // 최대 구간 추가
      };

      // 컴퍼니 코드와 함께 API 호출
      await updateAISettings(selectedCompanyCode, updateParams);
      showToast('설정이 성공적으로 저장되었습니다.', 'success');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      showToast('설정 저장에 실패했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 고객사 선택 핸들러
  const handleCompanySelect = (company: { id: string; name: string }) => {
    // 동일한 회사가 선택된 경우 아무 작업하지 않음
    if (selectedCompanyCode === company.id) {
      return;
    }
    
    setSelectedCompanyCode(company.id);
    setSelectedCompanyName(company.name);
    
    // 새로운 고객사 선택 시 모든 상태 초기화
    setFormData({
      theme: 'light',
      maxGuestQueries: '',
      maxMemberQueries: '',
      maxMonthlyMemberQueries: '',
      maxStaffQueries: '',
      maxMonthlyStaffQueries: '',
      inferencePerformance: 50,
      licenseKey: '',
      projectRateEnabled: true,
      projectName1: '', // 최소 구간
      projectRate1: '',
      projectName2: '', // 최대 구간
      projectRate2: '',
      projectName3: '',
      projectRate3: '',
      rateIncrease: 'simple',
      basicRate: '',
      advancedRate: '',
      premiumRate: '',
      discountRate: 'MONTH' as 'WEEK' | 'MONTH' | 'QUANTITY',
      rateRule: 'FIXED' as 'FIXED' | 'DYNAMIC'
    });
    
    // checkpointList 초기화
    setCheckpointList([]);
    
    // 새로운 고객사 선택 시 해당 고객사의 설정을 로드
    // 컴퍼니 코드가 유효한 경우에만 API 호출
    if (company.id && company.id.trim() !== '') {
      loadAISettings(company.id);
    }
  };

  // 할인율 validation 함수들
  const validateDiscountRates = () => {
    // 1. 필수 필드 체크 (최소/최대 단위)
    if (formData.projectRateEnabled) {
      if (!formData.projectName1 || formData.projectName1.trim() === '') {
        showToast('최소 단위를 입력해주세요.', 'error');
        return false;
      }
      if (!formData.projectName2 || formData.projectName2.trim() === '') {
        showToast('최대 단위를 입력해주세요.', 'error');
        return false;
      }
    }

    // 2. BidUnitSetting에서 checkpointList 가져오기
    const checkpointList = bidUnitSettingRef.current?.getCheckpointList() || [];
    
    if (formData.projectRateEnabled && checkpointList.length === 0) {
      showToast('할인율을 입력해주세요.', 'error');
      return false;
    }

    // 3. 할인율 빈 칸 체크
    console.log('🔍 Validation Debug - checkpointList:', checkpointList);
    const emptyDiscountRates = checkpointList.filter(item => {
      const discountRate = item.discountRate;
      const isEmpty = discountRate === undefined || 
                     discountRate === null || 
                     discountRate === 0 || 
                     isNaN(Number(discountRate)) ||
                     Number(discountRate) <= 0;
      console.log('🔍 Discount Rate Check:', { 
        checkpoint: item.checkpoint, 
        discountRate: discountRate,
        type: typeof discountRate,
        isEmpty: isEmpty 
      });
      return isEmpty;
    });
    
    if (emptyDiscountRates.length > 0) {
      console.log('🔍 Empty discount rates found:', emptyDiscountRates);
      showToast('모든 구간의 할인율을 입력해주세요.', 'error');
      return false;
    }

    // 4. 할인율이 100%를 초과하는지 확인
    const invalidRates = checkpointList.filter(item => item.discountRate > 100);
    if (invalidRates.length > 0) {
      showToast('할인율은 100%를 초과할 수 없습니다.', 'error');
      return false;
    }

    // 5. 고정 설정일 경우 특별 계산
    if (formData.rateRule === 'FIXED') {
      const minUnit = parseInt(formData.projectName1) || 0;
      const maxUnit = parseInt(formData.projectName2) || 0;
      const discountRate = checkpointList[0]?.discountRate || 0;
      const checkpoint = checkpointList[0]?.checkpoint || 0;
      
      if (minUnit > 0 && maxUnit > 0 && minUnit < maxUnit) {
        // 5-1. 최대 단위가 체크포인트로 나누어떨어지는지 확인
        if (checkpoint > 0 && maxUnit % checkpoint !== 0) {
          showToast(`고정 설정에서 최대 단위(${maxUnit})는 체크포인트(${checkpoint})로 나누어떨어져야 합니다.`, 'error');
          return false;
        }
        
        // 5-2. 단위 범위가 있는 경우의 validation
        const unitRange = maxUnit - minUnit + 1;
        const totalDiscountRate = discountRate * unitRange;
        
        if (totalDiscountRate > 100) {
          showToast(`고정 설정에서 총 할인율(${discountRate}% × ${unitRange}단위 = ${totalDiscountRate}%)이 100%를 초과합니다.`, 'error');
          return false;
        }
      }
    }

    // 6. checkpoint 값들이 유효한지 확인
    const invalidCheckpoints = checkpointList.filter(item => item.checkpoint <= 0);
    if (invalidCheckpoints.length > 0) {
      showToast('구간별 체크포인트 값이 올바르지 않습니다.', 'error');
      return false;
    }

    // 7. checkpoint 값들이 오름차순인지 확인 (각 checkpoint는 다음 checkpoint보다 작아야 함)
    for (let i = 0; i < checkpointList.length - 1; i++) {
      const currentCheckpoint = checkpointList[i].checkpoint;
      const nextCheckpoint = checkpointList[i + 1].checkpoint;
      
      if (currentCheckpoint >= nextCheckpoint) {
        showToast(`구간별 체크포인트는 오름차순이어야 합니다. (${currentCheckpoint} < ${nextCheckpoint})`, 'error');
        return false;
      }
    }

    return true;
  };

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <SettingsContainer>
        <HeaderContainer>
          <Heading>AIGO 설정 관리</Heading>
          {/* CMS 환경이 아닐 때만 CompanySearch 표시 */}
          {!window.location.pathname.includes('/cms/') && (
            <CompanySearchWrapper>
              <CompanySearch
                selectedCompanyCode={selectedCompanyCode}
                selectedCompanyName={selectedCompanyName}
                onCompanySelect={handleCompanySelect}
                themeMode="light"
                placeholder="고객사를 선택하세요"
                width="300px"
              />
            </CompanySearchWrapper>
          )}
        </HeaderContainer>
        
        <CardsWrapper>
          <MainContent>
          {/* 1. 채팅 질의 횟수 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                채팅 질의 횟수 설정
              </CardTitle>
            </CardHeader>
            <Description>
              AI 답변은 질의 응답에 약 20원 내외 가치로 사용됩니다.<br/>
              비회원은 체험용으로 10회가 적당합니다.
            </Description>
            <Group>
              <TextField
                id="maxGuestQueries"
                label="[1일] 비회원 최대 질의 횟수"
                name="maxGuestQueries"
                value={formData.maxGuestQueries}
                onChange={handleNumericChange}
                placeholder="숫자만 입력해주세요"
              />
              <TextField
                id="maxMemberQueries"
                label="[1일] 로그인 회원 최대 질의 횟수"
                name="maxMemberQueries"
                value={formData.maxMemberQueries}
                onChange={handleNumericChange}
                placeholder="숫자만 입력해주세요"
              />
              <TextField
                id="maxMonthlyMemberQueries"
                label="[한달] 회원 최대 질의 횟수"
                name="maxMonthlyMemberQueries"
                value={formData.maxMonthlyMemberQueries}
                onChange={handleNumericChange}
                placeholder="숫자만 입력해주세요"
              />
              <TextField
                id="maxStaffQueries"
                label="[1일] 직원 최대 질의 횟수"
                name="maxStaffQueries"
                value={formData.maxStaffQueries}
                onChange={handleNumericChange}
                placeholder="숫자만 입력해주세요"
              />
              <TextField
                id="maxMonthlyStaffQueries"
                label="[한달] 직원 최대 질의 횟수"
                name="maxMonthlyStaffQueries"
                value={formData.maxMonthlyStaffQueries}
                onChange={handleNumericChange}
                placeholder="숫자만 입력해주세요"
              />
            </Group>
          </Card>

          {/* 2. AI 추론 성능 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                AI 추론 성능 설정
              </CardTitle>
            </CardHeader>
            <Description>
              AI 추론 성능을 높일수록 전문가스럽게 답변합니다.<br/>
              0으로 해놓아도 기본적인 AI 답변은 훌륭합니다.<br/>
              추론 성능이 높을수록 답변 속도가 느려지며, 질의 당 과금 비용이 높아집니다.
            </Description>
            <ButtonContainer>
              <TooltipWrapper>
                {showTooltip && (
                  <Tooltip>
                    AIGO는 <strong>Gemini 2.5 Flash</strong><br/>
                    모델을 사용합니다.
                    <CloseBtn onClick={handleCloseTooltip} aria-label="닫기">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M5.00052 5.93288L1.73385 9.19954C1.61163 9.32177 1.45608 9.38288 1.26719 9.38288C1.0783 9.38288 0.922743 9.32177 0.800521 9.19954C0.678298 9.07732 0.617188 8.92177 0.617188 8.73288C0.617188 8.54399 0.678298 8.38843 0.800521 8.26621L4.06719 4.99954L0.800521 1.73288C0.678298 1.61066 0.617188 1.4551 0.617188 1.26621C0.617188 1.07732 0.678298 0.921766 0.800521 0.799544C0.922743 0.677322 1.0783 0.616211 1.26719 0.616211C1.45608 0.616211 1.61163 0.677322 1.73385 0.799544L5.00052 4.06621L8.26719 0.799544C8.38941 0.677322 8.54497 0.616211 8.73385 0.616211C8.92274 0.616211 9.0783 0.677322 9.20052 0.799544C9.32274 0.921766 9.38385 1.07732 9.38385 1.26621C9.38385 1.4551 9.32274 1.61066 9.20052 1.73288L5.93385 4.99954L9.20052 8.26621C9.32274 8.38843 9.38385 8.54399 9.38385 8.73288C9.38385 8.92177 9.32274 9.07732 9.20052 9.19954C9.0783 9.32177 8.92274 9.38288 8.73385 9.38288C8.54497 9.38288 8.38941 9.32177 8.26719 9.19954L5.00052 5.93288Z" fill="white"/>
                      </svg>
                    </CloseBtn>
                  </Tooltip>
                )}
                <ExternalLink 
                  href="https://ai.google.dev/gemini-api/docs/pricing?hl=ko#standard_1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  // onMouseEnter={() => setShowTooltip(true)}
                  // onMouseLeave={() => setShowTooltip(false)}
                >
                  가격표 보기
                </ExternalLink>
              </TooltipWrapper>
            </ButtonContainer>
            <SliderWrapper>
              <SliderContainer>
                <Slider
                  min="0"
                  max="100"
                  value={formData.inferencePerformance}
                  onChange={handleSliderChange}
                />
              </SliderContainer>
              <SliderLabels>
                <span>0</span>
                <span>100</span>
              </SliderLabels>
            </SliderWrapper>
          </Card>

          {/* 3. 사용자 컬러 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle>
                사용자 컬러 테마 설정
              </CardTitle>
            
            </CardHeader>
            <Description>
              컬러 테마는 Light 모드와 Dark 모드 중 하나를 위해하여 일괄 적용 수 있습니다.
            </Description>
            <ModeText>
            라이트모드
              <SwitchFrom><Switch
                checked={formData.theme === 'light'}
                onToggle={() => setFormData(prev => ({ 
                  ...prev, 
                  theme: prev.theme === 'dark' ? 'light' : 'dark' 
                }))}
              /></SwitchFrom>
              </ModeText>
          </Card>

          {/* 4. 구글 AI Key 입력 */}
          <Card>
            <CardHeader>
              <CardTitle>
                구글 AI Key 입력
              </CardTitle>
            </CardHeader>
            <Description>
              Google Cloud Vertex AI에서 발급받은 API Key를 입력해주세요.
            </Description>
            <Group>
              <SecureKeyInput
                id="licenseKey"
                label="AI Key"
                value={formData.licenseKey}
                onChange={(value) => setFormData(prev => ({ ...prev, licenseKey: value }))}
                placeholder="AI Key를 입력해주세요"
              />
            </Group>
          </Card>

          {/* 5. 프로젝트 요율 관리 */}
          <CollapsibleCard $isCollapsed={!formData.projectRateEnabled}>
            <CardHeader>
              <CardTitle>
                프로젝트 요율 관리
              </CardTitle>
              <ToggleWrapper>
                <Switch
                  checked={formData.projectRateEnabled}
                  onToggle={() => handleToggle('projectRateEnabled')}
                />
              </ToggleWrapper>
            </CardHeader>
            <CollapseContent $isVisible={formData.projectRateEnabled}>
              <CardContent $isDisabled={!formData.projectRateEnabled}>
                <Description>
                  프로젝트 진행 단위를 선택하고 최소·최대 단위를 입력해주세요. <br/>
                  설정된 단위는 프로젝트 요율 계산 시 기준 값으로 사용됩니다.
                </Description>
                
                <div style={{ marginBottom: '24px' }}>
                  <strong style={{ color:"#555555", fontSize: '14px' }}>단위 기준 설정</strong>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <CheckBox
                      id="unitWeek"
                      label="주"
                      checked={formData.discountRate === 'WEEK'}
                      onChange={() => handleUnitBasisChange('WEEK')}
                      color="#636994"
                    />
                    <CheckBox
                      id="unitMonth"
                      label="달"
                      checked={formData.discountRate === 'MONTH'}
                      onChange={() => handleUnitBasisChange('MONTH')}
                      color="#636994"
                    />
                    <CheckBox
                      id="unitAmount"
                      label="수량"
                      checked={formData.discountRate === 'QUANTITY'}
                      onChange={() => handleUnitBasisChange('QUANTITY')}
                      color="#636994"
                    />
                  </div>
                </div>

                <Group>
                  <div>
                    <strong style={{ color:"#555555",fontSize: '14px', fontWeight: '500' }}>프로젝트 단위</strong>
                    <div style={{ marginTop: '16px' }}>
                      <TextField
                        id="projectName1"
                        label="최소 단위"
                        name="projectName1"
                        value={formData.projectName1}
                        onChange={handleNumericChange}
                        placeholder="숫자만 입력해주세요"
                      />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <TextField
                        id="projectName2"
                        label="최대 단위"
                        name="projectName2"
                        value={formData.projectName2}
                        onChange={handleNumericChange}
                        placeholder="숫자만 입력해주세요"
                      />
                    </div>
                  </div>
                </Group>
              </CardContent>
            </CollapseContent>
          </CollapsibleCard>

          {/* 6. 요율(증가 규칙) 설정 */}
          {formData.projectRateEnabled && (
            <Card>
              <CardHeader>
                <CardTitle>
                  요율(증가 규칙) 설정
                </CardTitle>
              </CardHeader>
              <Description>
                기간 중에 따라 요율을 변동하는 규칙을 설정합니다.
              </Description>
              
              <div style={{ marginBottom: '24px' }}>
                <strong style={{ color:"#555555",fontSize: '14px' }}>단위 설정</strong>
                <div style={{ marginTop: '16px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <CheckBox
                    id="unitFixed"
                    label="단위 고정 설정"
                    checked={formData.rateRule === 'FIXED'}
                    onChange={() => handleUnitSettingChange('FIXED')}
                    color="#636994"
                  />
                  <CheckBox
                    id="unitDynamic"
                    label="단위 동적 설정"
                    checked={formData.rateRule === 'DYNAMIC'}
                    onChange={() => handleUnitSettingChange('DYNAMIC')}
                    color="#636994"
                  />
                </div>
                
                <BidUnitSetting
                  ref={bidUnitSettingRef}
                  unitType={formData.discountRate}
                  settingType={formData.rateRule}
                  minUnit={formData.projectName1}
                  maxUnit={formData.projectName2}
                  initialCheckpoints={checkpointList}
                />
              </div>
              
              <div>
           

                {formData.rateIncrease === 'detailed' && (
                  <Group>
                    <TextField
                      id="basicRate"
                      label="베이직"
                      name="basicRate"
                      value={formData.basicRate}
                      onChange={handleChange}
                      placeholder="베이직 등급을 입력해주세요"
                    />
                    <TextField
                      id="advancedRate"
                      label="어드밴스"
                      name="advancedRate"
                      value={formData.advancedRate}
                      onChange={handleChange}
                      placeholder="어드밴스 등급을 입력해주세요"
                    />
                    <TextField
                      id="premiumRate"
                      label="프리미엄"
                      name="premiumRate"
                      value={formData.premiumRate}
                      onChange={handleChange}
                      placeholder="프리미엄 등급을 입력해주세요"
                    />
                  </Group>
                )}
              </div>
            </Card>
          )}

    
      </MainContent>

        </CardsWrapper>
    <SaveButtonContainer>
          <SaveAllButton 
            onClick={handleSaveAll} 
            disabled={isLoading || !selectedCompanyCode || selectedCompanyCode.trim() === ''}
          >
            {isLoading ? '저장 중...' : '전체 저장'}
          </SaveAllButton>
        </SaveButtonContainer>
      </SettingsContainer>

      {/* 전체 저장 확인 모달 */}
      <DeleteConfirmModal
        open={showConfirmModal}
        title="설정 저장 확인"
        content={`${selectedCompanyName}의 AIGO 설정을 저장하시겠습니까?`}
        confirmText="저장"
        cancelText="취소"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowConfirmModal(false)}
        reverseButtons={false}
      />
    </ThemeProvider>
  );
}