"use client";

import React, { useState, useCallback, useEffect } from "react";
import styled from "styled-components";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface BidUnitRange {
  index: number;
  minAmount: string;
  maxAmount: string;
  unitAmount: string;
  isNew?: boolean;
}

interface Checkpoint {
  checkpoint: number;
  discountRate: number;
}

interface BidUnitSettingProps {
  onSave?: (ranges: BidUnitRange[]) => void;
  ref?: React.MutableRefObject<{ getCheckpointList: () => Checkpoint[] } | null>; // ref를 통한 함수 노출
  unitType?: 'WEEK' | 'MONTH' | 'QUANTITY'; // 단위 기준 설정
  settingType?: 'FIXED' | 'DYNAMIC'; // 단위 설정
  minUnit?: string; // 최소 단위
  maxUnit?: string; // 최대 단위
  initialCheckpoints?: Checkpoint[]; // 초기 checkpoint 데이터
}

const BidUnitSetting = React.forwardRef<
  { getCheckpointList: () => Checkpoint[] } | null,
  BidUnitSettingProps
>(({ 
  onSave,
  unitType = 'MONTH', 
  settingType = 'DYNAMIC', 
  minUnit = '', 
  maxUnit = '',
  initialCheckpoints = []
}, ref) => {
  // 고정설정과 동적설정 데이터를 별도로 관리
  const [fixedData, setFixedData] = useState<BidUnitRange[]>([{
    index: 1,
    minAmount: "",
    maxAmount: "",
    unitAmount: "",
  }]);

  const [dynamicData, setDynamicData] = useState<BidUnitRange[]>([
    {
      index: 1,
      minAmount: "",
      maxAmount: "",
      unitAmount: "",
    },
    {
      index: 2,
      minAmount: "",
      maxAmount: "",
      unitAmount: "",
    },
  ]);

  // 현재 설정 타입에 따라 보여줄 데이터 결정
  const bidUnitRanges = settingType === 'FIXED' ? fixedData : dynamicData;
  const setBidUnitRanges = settingType === 'FIXED' ? setFixedData : setDynamicData;

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  // initialCheckpoints가 변경될 때마다 상태 초기화 및 설정
  React.useEffect(() => {
    if (initialCheckpoints && initialCheckpoints.length > 0) {
      // 현재 설정 타입에 해당하는 데이터만 설정
      if (settingType === 'FIXED') {
        // 고정 설정: 첫 번째 체크포인트만 사용
        const firstCheckpoint = initialCheckpoints[0];
        setFixedData([{
          index: 1,
          minAmount: firstCheckpoint.checkpoint.toString(),
          maxAmount: "",
          unitAmount: firstCheckpoint.discountRate.toString(),
        }]);
        
        // 동적 설정은 빈 값으로 초기화
        setDynamicData([
          {
            index: 1,
            minAmount: "",
            maxAmount: "",
            unitAmount: "",
          },
          {
            index: 2,
            minAmount: "",
            maxAmount: "",
            unitAmount: "",
          },
        ]);
      } else {
        // 동적 설정: 모든 체크포인트 사용
        const dynamicRanges = initialCheckpoints.map((checkpoint, index) => ({
          index: index + 1,
          minAmount: "",
          maxAmount: checkpoint.checkpoint.toString(),
          unitAmount: checkpoint.discountRate.toString(),
        }));
        
        // 마지막에 빈 구간 하나 더 추가 (필요시) - 필요없음 안해도됨
        // if (dynamicRanges.length > 0) {
        //   dynamicRanges.push({
        //     index: dynamicRanges.length + 1,
        //     minAmount: "",
        //     maxAmount: "",
        //     unitAmount: "",
        //   });
        // }
        
        setDynamicData(dynamicRanges.length > 0 ? dynamicRanges : [
          {
            index: 1,
            minAmount: "",
            maxAmount: "",
            unitAmount: "",
          },
          {
            index: 2,
            minAmount: "",
            maxAmount: "",
            unitAmount: "",
          },
        ]);
        
        // 고정 설정은 빈 값으로 초기화
        setFixedData([{
          index: 1,
          minAmount: "",
          maxAmount: "",
          unitAmount: "",
        }]);
      }
    } else {
      // initialCheckpoints가 빈 배열이거나 없을 때 - 모든 상태 초기화
      setFixedData([{
        index: 1,
        minAmount: "",
        maxAmount: "",
        unitAmount: "",
      }]);
      
      setDynamicData([
        {
          index: 1,
          minAmount: "",
          maxAmount: "",
          unitAmount: "",
        },
        {
          index: 2,
          minAmount: "",
          maxAmount: "",
          unitAmount: "",
        },
      ]);
    }
  }, [initialCheckpoints, settingType]); // settingType도 의존성에 추가하여 설정 변경 시에도 반응

  // checkpointList 생성 및 상위 컴포넌트로 전달
  const generateCheckpointList = React.useCallback((ranges: BidUnitRange[]): Checkpoint[] => {
    if (settingType === 'FIXED') {
      // 고정 설정: 1개의 checkpoint - minAmount 값을 checkpoint로 사용
      const firstRange = ranges[0];
      if (firstRange && firstRange.minAmount) {
        return [{
          checkpoint: parseInt(firstRange.minAmount) || 1,
          discountRate: parseFloat(firstRange.unitAmount) || 0 // 비어있어도 0으로 설정
        }];
      }
      return [];
    } else {
      // 동적 설정: 각 구간별로 checkpoint 생성
      const checkpoints: Checkpoint[] = [];
      
      ranges.forEach((range, index) => {
        const isFirstRange = index === 0;
        const isLastRange = index === ranges.length - 1;
        
        // 할인율이 비어있어도 checkpoint를 생성 (validation에서 체크하기 위해)
        let checkpointValue = 0;
        let hasValidCheckpoint = false;

        if (isLastRange) {
          // 마지막 구간: maxUnit 값을 checkpoint로 사용 (이상 구간)
          if (maxUnit) {
            checkpointValue = parseInt(maxUnit) || 0;
            hasValidCheckpoint = true;
          }
        } else if (isFirstRange) {
          // 첫 번째 구간: minUnit 값을 checkpoint로 사용 (minUnit이 설정되어 있는 경우)
          if (minUnit) {
            checkpointValue = parseInt(minUnit) || 0;
            hasValidCheckpoint = true;
          } else if (range.maxAmount) {
            // minUnit이 없으면 maxAmount 사용
            checkpointValue = parseInt(range.maxAmount) || 0;
            hasValidCheckpoint = true;
          }
        } else {
          // 중간 구간들: maxAmount 값을 checkpoint로 사용
          if (range.maxAmount) {
            checkpointValue = parseInt(range.maxAmount) || 0;
            hasValidCheckpoint = true;
          }
        }

        // 유효한 checkpoint가 있으면 추가 (할인율이 비어있어도 추가)
        if (hasValidCheckpoint) {
          checkpoints.push({
            checkpoint: checkpointValue,
            discountRate: parseFloat(range.unitAmount) || 0 // 비어있으면 0으로 설정
          });
        }
      });
      
      return checkpoints;
    }
  }, [settingType, maxUnit, minUnit]);

  // checkpointList를 외부에서 가져올 수 있도록 함수를 ref로 노출
  const getCheckpointList = React.useCallback(() => {
    return generateCheckpointList(bidUnitRanges);
  }, [bidUnitRanges, generateCheckpointList]);

  // ref를 통해 getCheckpointList 함수를 외부에 노출
  React.useImperativeHandle(ref, () => ({
    getCheckpointList
  }), [getCheckpointList]);

  // 단위 타입에 따른 단위 텍스트
  const getUnitText = () => {
    switch (unitType) {
      case 'WEEK':
        return '주';
      case 'MONTH':
        return '개월';
      case 'QUANTITY':
        return '개';
      default:
        return '개월';
    }
  };

  // 설정 타입에 따른 단위 텍스트
  const getSettingUnitText = () => {
    return settingType === 'FIXED' ? '%' : '%';
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
      let numericValue: string;
      
      if (field === "unitAmount") {
        // 할인율은 소수점 허용
        numericValue = value.toString().replace(/[^0-9.]/g, "");
        // 소수점이 2개 이상 있으면 첫 번째만 유지
        const parts = numericValue.split('.');
        if (parts.length > 2) {
          numericValue = parts[0] + '.' + parts.slice(1).join('');
        }
      } else {
        // 단위는 정수만 허용
        numericValue = value.toString().replace(/[^0-9]/g, "");
      }
      
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

  // 숫자만 입력 허용하는 키 이벤트 핸들러
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, allowDecimal: boolean = false) => {
    // 기본 허용 키들
    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    
    // 할인율 필드인 경우 소수점도 허용
    if (allowDecimal) {
      allowedKeys.push('.');
    }
    
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const formatNumber = (value: string, allowDecimal: boolean = false) => {
    if (allowDecimal) {
      // 할인율의 경우 소수점 유지
      return value;
    } else {
      // 단위의 경우 정수만 허용하고 콤마 포맷팅
      const number = value.replace(/[^0-9]/g, "");
      return number ? Number(number).toLocaleString() : "";
    }
  };

  const handleAddRange = (afterIndex?: number) => {
    const currentRangeIndex = afterIndex 
      ? bidUnitRanges.findIndex(r => r.index === afterIndex)
      : bidUnitRanges.length - 2; // 마지막에서 두 번째 위치
    
    // 새로운 빈 범위 생성 (자동완성 숫자 제거)
    const newRange = {
      index: 0, // 임시값, 나중에 재인덱싱
      minAmount: "",
      maxAmount: "",
      unitAmount: "",
    };
    
    const updatedRanges = [...bidUnitRanges];
    updatedRanges.splice(currentRangeIndex + 1, 0, newRange);
    
    // 인덱스 재설정
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
          const isFixedSetting = settingType === 'FIXED';
          
          return (
            <RangeItem key={range.index}>
              <InputGroup>
                <AmountGroup>
                  <InputWrapper>
                    <InputLabel>{getUnitText()}</InputLabel>
                    <Input
                      type="text"
                      value={isFixedSetting 
                        ? formatNumber(range.minAmount)
                        : (isLastRange 
                          ? (maxUnit ? formatNumber(maxUnit) : "")
                          : (idx === 0 && minUnit ? formatNumber(minUnit) : formatNumber(range.maxAmount))
                        )
                      }
                      onChange={isFixedSetting 
                        ? (e) => handleValueChange(range.index, "minAmount", e.target.value)
                        : (isLastRange || (idx === 0 && minUnit) ? undefined : (e) => handleValueChange(range.index, "maxAmount", e.target.value))
                      }
                      onKeyPress={handleKeyPress}
                      placeholder={isFixedSetting 
                        ? `숫자만 입력해주세요` 
                        : (isLastRange ? (maxUnit ? "" : "") : `숫자만 입력해주세요`)
                      }
                      readOnly={isFixedSetting 
                        ? false
                        : (isLastRange || (idx === 0 && !!minUnit))
                      }
                    />
                  </InputWrapper>
                  <Separator>{getUnitText()}</Separator>

                  <InputWrapper>
                    <InputLabel>{settingType === 'FIXED' ? '할인율' : '할인율'}</InputLabel>
                    <Input
                      type="text"
                      value={formatNumber(range.unitAmount, true)}
                      onChange={(e) => handleValueChange(range.index, "unitAmount", e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, true)}
                      placeholder="숫자만 입력해주세요"
                    />
                  </InputWrapper>
                  <Separator>{getSettingUnitText()}</Separator>
                </AmountGroup>
                
                {!isFixedSetting && (
                  <UnitGroup>
                    <ActionButtons $isFirstIndex={idx === 0}>
                      {idx > 0 && (
                        <ActionButton onClick={() => handleDeleteClick(range.index)}>삭제</ActionButton>
                      )}
                      <ActionButton 
                        $isWide={idx === 0}
                        onClick={() => handleAddRange(range.index)}
                      >
                        추가
                      </ActionButton>
                    </ActionButtons>
                  </UnitGroup>
                )}
              </InputGroup>
            </RangeItem>
          );
        })}
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
});

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
    background-color: #ffffff;
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

const ActionButtons = styled.div<{ $isFirstIndex?: boolean }>`
  display: flex;
  gap: 8px;
  width: ${({ $isFirstIndex }) => ($isFirstIndex ? '120px' : '120px')};
`;

const ActionButton = styled.button<{ $isWide?: boolean }>`
  padding: 8px 12px;
  background-color: white;
  color: #666;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  flex: ${({ $isWide }) => ($isWide ? '1' : 'none')};
  width: ${({ $isWide }) => ($isWide ? '100%' : '56px')};

  &:hover {
    border-color: #ddd;
    color: #333;
  }
`;
