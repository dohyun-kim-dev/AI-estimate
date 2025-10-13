"use client";

import React, { useState, useCallback } from "react";
import styled from "styled-components";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface BidUnitRange {
  index: number;
  minAmount: string;
  maxAmount: string;
  unitAmount: string;
  isNew?: boolean;
}

interface BidUnitSettingProps {
  onSave?: (ranges: BidUnitRange[]) => void;
  unitType?: 'week' | 'month' | 'amount'; // 단위 기준 설정
  settingType?: 'fixed' | 'dynamic'; // 단위 설정
}

const BidUnitSetting: React.FC<BidUnitSettingProps> = ({ onSave, unitType = 'month', settingType = 'dynamic' }) => {
  const [bidUnitRanges, setBidUnitRanges] = useState<BidUnitRange[]>([
    {
      index: 1,
      minAmount: "1",
      maxAmount: "10",
      unitAmount: "10",
    },
    {
      index: 2,
      minAmount: "3",
      maxAmount: "", // 마지막 구간은 빈값으로 두고 화면에서 "이상"으로 표시
      unitAmount: "",
    },
  ]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  // 단위 타입에 따른 단위 텍스트
  const getUnitText = () => {
    switch (unitType) {
      case 'week':
        return '주';
      case 'month':
        return '개월';
      case 'amount':
        return '개';
      default:
        return '개월';
    }
  };

  // 설정 타입에 따른 단위 텍스트
  const getSettingUnitText = () => {
    return settingType === 'fixed' ? '원' : '%';
  };

  const validateRange = (currentRange: BidUnitRange) => {
    const minAmount = Number(currentRange.minAmount);
    const maxAmount = Number(currentRange.maxAmount);
    const unitAmount = Number(currentRange.unitAmount);

    if (minAmount < 0 || (maxAmount < 0 && currentRange.maxAmount !== "")) {
      return false;
    }

    if (currentRange.maxAmount !== "" && minAmount >= maxAmount) {
      return false;
    }

    if (unitAmount <= 0) {
      return false;
    }

    return true;
  };

  const handleValueChange = (index: number, field: keyof BidUnitRange, value: string) => {
    if (field === "minAmount" || field === "maxAmount" || field === "unitAmount") {
      const numericValue = value.toString().replace(/[^0-9]/g, "");
      const limitedValue = numericValue.slice(0, 10);
      
      setBidUnitRanges((ranges) => {
        const updatedRanges = [...ranges];
        const currentRangeIndex = updatedRanges.findIndex(r => r.index === index);
        
        if (currentRangeIndex >= 0) {
          updatedRanges[currentRangeIndex] = {
            ...updatedRanges[currentRangeIndex],
            [field]: limitedValue
          };
        }
        
        // 구간 간 연동 로직
        if (field === "maxAmount" && currentRangeIndex >= 0) {
          const nextRangeIndex = currentRangeIndex + 1;
          if (nextRangeIndex < updatedRanges.length) {
            const newMinAmount = limitedValue ? (Number(limitedValue) + 1).toString() : "";
            updatedRanges[nextRangeIndex] = {
              ...updatedRanges[nextRangeIndex],
              minAmount: newMinAmount
            };
          }
        } else if (field === "minAmount" && currentRangeIndex > 0) {
          const prevRangeIndex = currentRangeIndex - 1;
          const newMaxAmount = limitedValue ? (Number(limitedValue) - 1).toString() : "";
          updatedRanges[prevRangeIndex] = {
            ...updatedRanges[prevRangeIndex],
            maxAmount: newMaxAmount
          };
        }
        
        return updatedRanges;
      });
    }
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/[^0-9]/g, "");
    return number ? Number(number).toLocaleString() : "";
  };

  const handleAddRange = () => {
    const newIndex = bidUnitRanges.length;
    const secondLastRange = bidUnitRanges[bidUnitRanges.length - 2];
    
    const newMinAmount = secondLastRange?.maxAmount ? 
      (Number(secondLastRange.maxAmount) + 1).toString() : "";
    
    let rangeSize = 100000;
    if (secondLastRange?.maxAmount && secondLastRange?.minAmount) {
      rangeSize = Number(secondLastRange.maxAmount) - Number(secondLastRange.minAmount) + 1;
      rangeSize = Math.max(rangeSize, 10000);
    }
    
    const newRange = {
      index: newIndex,
      minAmount: newMinAmount,
      maxAmount: newMinAmount ? (Number(newMinAmount) + rangeSize - 1).toString() : "",
      unitAmount: "",
    };
    
    const updatedRanges = [...bidUnitRanges];
    updatedRanges.splice(-1, 0, newRange);
    
    if (newRange.maxAmount) {
      const lastRangeIndex = updatedRanges.length - 1;
      updatedRanges[lastRangeIndex] = {
        ...updatedRanges[lastRangeIndex],
        minAmount: (Number(newRange.maxAmount) + 1).toString()
      };
    }
    
    const reindexedRanges = updatedRanges.map((range, idx) => ({
      ...range,
      index: idx + 1
    }));
    
    setBidUnitRanges(reindexedRanges);
  };

  const handleDeleteClick = (indexToDelete: number) => {
    setDeleteTargetIndex(indexToDelete);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetIndex !== null && bidUnitRanges.length > 2) {
      const updatedRanges = bidUnitRanges.filter(range => range.index !== deleteTargetIndex);
      const reindexedRanges = updatedRanges.map((range, idx) => ({
        ...range,
        index: idx + 1
      }));
      setBidUnitRanges(reindexedRanges);
    }
    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteTargetIndex(null);
  };

  return (
    <Wrapper>
      <Header>
      </Header>
      
      <RangesContainer>
        {bidUnitRanges.map((range, idx) => {
          const isLastRange = idx === bidUnitRanges.length - 1;
          return (
            <RangeItem key={range.index}>
              <InputGroup>
                <AmountGroup>
                  {/* <InputWrapper>
                    <InputLabel>{getUnitText()}</InputLabel>
                    <Input
                      type="text"
                      value={range.minAmount === "1" && idx === 0 ? "1" : formatNumber(range.minAmount)}
                      onChange={(e) => handleValueChange(range.index, "minAmount", e.target.value)}
                      placeholder={`${getUnitText()}를 입력해주세요`}
                      readOnly={idx === 0}
                    />
                  </InputWrapper>
                  <Separator>~</Separator> */}
                  <InputWrapper>
                    <InputLabel>{getUnitText()}</InputLabel>
                    <Input
                      type="text"
                      value={isLastRange ? "이상" : formatNumber(range.maxAmount)}
                      onChange={isLastRange ? undefined : (e) => handleValueChange(range.index, "maxAmount", e.target.value)}
                      placeholder={isLastRange ? "이상" : `${getUnitText()}를 입력해주세요`}
                      readOnly={isLastRange}
                    />
                  </InputWrapper>
                                                      <Separator>{getUnitText()}</Separator>

                  <InputWrapper>
                    <InputLabel>{settingType === 'fixed' ? '금액' : '할인율'}</InputLabel>
                    <Input
                      type="text"
                      value={formatNumber(range.unitAmount)}
                      onChange={(e) => handleValueChange(range.index, "unitAmount", e.target.value)}
                      placeholder={settingType === 'fixed' ? '금액을 입력해주세요' : '할인율을 입력해주세요'}
                    />
                  </InputWrapper>
                                    <Separator>{getSettingUnitText()}</Separator>
                </AmountGroup>
                <UnitGroup>
                  <ActionButtons>
                    {idx > 0 && (
                      <ActionButton onClick={() => handleDeleteClick(range.index)}>삭제</ActionButton>
                    )}
                  </ActionButtons>
                </UnitGroup>
              </InputGroup>
            </RangeItem>
          );
        })}
        
        <AddRangeContainer>
          <AddButton onClick={handleAddRange}>
            + 구간 추가
          </AddButton>
        </AddRangeContainer>
      </RangesContainer>

      <DeleteConfirmModal
        open={deleteModalOpen}
        title="구간 삭제 확인"
        content={"정말로 이 구간을 삭제하시겠습니까?\n삭제된 구간은 복구할 수 없습니다."}
        confirmText="예"
        cancelText="아니오"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Wrapper>
  );
};

export default BidUnitSetting;

const Wrapper = styled.div`
  width: 100%;
  margin-top: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const AddButton = styled.button`
    width: 100%;
  padding: 12px 24px;
  background-color: transparent;
  color: #636994;
  border: 2px dashed #636994;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  min-width: 120px;
  
  &:hover {
    background-color: #636994;
    color: white;
  }
`;

const RangesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RangeItem = styled.div`
  border-radius: 4px;
  box-sizing: border-box;
`;

const AddRangeContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
`;

const AmountGroup = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const InputLabel = styled.div`
  background-color: white;
  position: absolute;
  top: -10px;
  left: 12px;
  font-size: 12px;
  color: #666666;
  margin-bottom: 4px;
  padding: 0 4px;
`;

const Input = styled.input<{ readOnly?: boolean }>`
  width: 100%;
  height: 40px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: white;
  box-sizing: border-box;
  min-width: 0;

  &:focus {
    outline: none;
    border-color: #636994;
    box-shadow: 0 0 0 2px rgba(99, 105, 148, 0.1);
  }

  &::placeholder {
    color: #ddd;
  }

  ${({ readOnly }) => readOnly && `
    background-color: #f9f9f9;
    cursor: not-allowed;
  `}
`;

const Separator = styled.div`
  font-size: 14px;
  color: #666;
  margin: 0 8px;
  padding-bottom: 8px;
  flex-shrink: 0;
  min-width: 20px;
  text-align: center;
`;

const UnitGroup = styled.div`
  display: flex;
  align-items: end;
  flex-shrink: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  width: 60px;
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
    color: #333;
  }
`;
