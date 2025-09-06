"use client";

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { IoChevronDown, IoChevronForward, IoCloseCircleOutline, IoRefreshCircleOutline } from 'react-icons/io5';
import { formatPrice, parsePrice } from '@/utils/utils';

const ItemWrapper = styled.div<{ depth: number; $isOpen?: boolean }>`
  position: relative;
  overflow: visible;
  margin-bottom: ${({ depth, $isOpen }) => {
    if (depth !== 1) return '0';
    return $isOpen ? '40px' : '0';
  }};

  ${({ depth, theme }) => depth === 1 && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme[`accordionLevel${depth}`]};
      border-radius: 12px;
      z-index: 0;
    }

    > * {
      position: relative;
      // z-index: 1;
    }
  `}

  ${({ depth, theme }) => depth !== 1 && `
    background: ${theme[`accordionLevel${depth}`]};
    border-bottom: 1px solid ${theme.border};

    &:last-child {
      border-bottom: none;
      padding-bottom: ${theme.accordionLevel1 === '#ffffff' ? '12px' : '0px'};
    }
  `}
`;

const Header = styled.div<{ depth: number; $isSelected: boolean; $isOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ depth }) => depth === 1 ? '24px 18px 24px 10px' : '24px 18px 24px 30px'};
  cursor: pointer;
  background-color: ${({ theme, depth, $isSelected }) => 
    $isSelected ? theme.pick : theme[`accordionLevel${depth}`]};

  font-weight: 600;
  border-bottom: ${({ theme, $isOpen }) => $isOpen ? `1px solid ${theme.border}` : 'none'};
  transition: background-color 0.2s ease;
  color: ${({ theme }) => theme.text};
  border-radius: ${({ depth, $isOpen }) => {
    if (depth === 2) {
      return '0';
    }
    return $isOpen ? '12px 12px 0 0' : '12px';
  }};

  .title {
    flex-grow: 1;
  }
  
  .price {
    margin: 0 20px;
    font-size: 0.95em;
  }

  &:hover {
    background-color: ${({ theme }) => theme.accent}1A;
  }
`;

const IconWrapper = styled.div<{ $isOpen: boolean; $isBottomToggle?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

const BottomToggleButton = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: -28px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.pick};
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $isVisible }) => $isVisible ? 'translateY(50%)' : 'translateY(50%) scale(0)'};
  transition: transform 0.3s ease-in-out;
  margin-bottom: 4px;
  
  &:hover {
    background-color: ${({ theme }) => theme.accent}1A;
  }

  svg {
    transform: rotate(180deg);
  }
`;

const Content = styled.div<{ $isOpen: boolean; depth: number }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.35s ease-in-out;
  background-color: ${({ theme, depth }) => theme[`accordionLevel${depth+1}`]};
  position: relative;
  clip-path: ${({ depth }) => depth === 1 ? 'inset(0 0 12px 0 round 0 0 12px 12px)' : 'inset(0)'};
`;

const ContentInner = styled.div`
  overflow: hidden;
`;

const ListItem = styled.div<{ $isSelected: boolean; $isDeleted: boolean; depth?: number }>`
  display: flex;
  justify-content: space-between;
  
  align-items: center;
  padding: ${({ depth }) => depth === 3 ? '24px 18px 50px 45px' : '24px 18px 24px 35px'};
  color: ${({ theme }) => theme.subtleText};
  font-size: 0.95em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: relative;
  
  // 삭제된 항목 스타일
  opacity: ${({ $isDeleted }) => $isDeleted ? '0.5' : '1'};
  ${({ $isDeleted }) => $isDeleted && `
    text-decoration: line-through;
    color: #a1a1aa;
    .price {
      text-decoration: line-through;
    }
  `}

  &:last-child {
    border-bottom: none;
    padding-bottom: 24px;
  }
  
  .name {
    margin-right: 0px;
    // width:100px;
  }

  .price {
  display: flex;
    font-weight: 600;
    color: ${({ theme, $isDeleted }) => $isDeleted ? '#a1a1aa' : theme.subtleText};
  }

  .actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.pick};
  }
`;

const DeleteButton = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  margin-left: 10px;
  
  &:hover {
    color: #ff4d4f;
  }
`;

const CancelButton = styled(DeleteButton)`
  margin-left: 10px;

  &:hover {
    color: #52c41a;
  }
`;

interface EstimateAccordionItemProps {
  name: string;
  price?: string;
  description?: string;
  items?: Array<{name: string; price: string; description: string}>;
  depth: 1 | 2 | 3;
  onItemClick?: (item: any) => void;
  children?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  selectedItemId?: string | null;
  onItemSelect?: (itemId: string) => void;
}

const EstimateAccordionItem: React.FC<EstimateAccordionItemProps> = ({
  name,
  price,
  items = [],
  depth,
  onItemClick,
  children,
  isSelected = false,
  onSelect,
  selectedItemId,
  onItemSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // 삭제된 항목의 ID를 저장하는 상태
  const [deletedItems, setDeletedItems] = useState(new Set<string>());
  const hasItems = items.length > 0 || !!children;

  const totalAmount = useMemo(() => {
    if (!items.length) {
      // items가 없는 경우
      return price || "0";
    }

    // 삭제된 항목을 제외하고 총 가격 계산
    const currentItems = items.filter((_, index) => {
      const itemId = `${name}-${index}`;
      return !deletedItems.has(itemId);
    });
    
    return formatPrice(currentItems.reduce((sum, item) => sum + parsePrice(item.price), 0));
  }, [items, price, deletedItems, name]);

  const handleHeaderClick = () => {
    setIsOpen(!isOpen);
    if (onSelect) {
      onSelect();
    }
  };

  const handleItemClick = (item: any, index: number) => {
    const itemId = `${name}-${index}`;
    if (deletedItems.has(itemId)) {
      return; // 삭제된 항목은 클릭 이벤트 무시
    }

    if (onItemSelect) {
      onItemSelect(itemId);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  // 삭제 버튼 핸들러
  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // 부모의 onClick 이벤트 방지
    setDeletedItems(prev => new Set(prev).add(itemId));
  };

  // 취소 버튼 핸들러
  const handleCancelDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation(); // 부모의 onClick 이벤트 방지
    setDeletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  return (
    <ItemWrapper depth={depth} $isOpen={isOpen}>
      <Header 
        onClick={handleHeaderClick} 
        depth={depth}
        $isSelected={isSelected}
        $isOpen={isOpen}
      >
        <span className="title">{name}</span>
        <span className="price">{totalAmount}</span>
        <IconWrapper $isOpen={isOpen}>
          <IoChevronDown size={20} />
        </IconWrapper>
      </Header>
      <Content $isOpen={isOpen} depth={depth}>
        <ContentInner>
          {children || (hasItems && items.map((item, index) => {
            const itemId = `${name}-${index}`;
            const isDeleted = deletedItems.has(itemId);
            return (
              <ListItem 
                key={index} 
                onClick={() => handleItemClick(item, index)}
                $isSelected={selectedItemId === itemId}
                $isDeleted={isDeleted}
                depth={depth}
              >
                <span className="name">{item.name}</span>
                <span className="price">{item.price}
                <div className="actions">
                  {/* 삭제/취소 버튼 조건부 렌더링 */}
                  {isDeleted ? (
                    <CancelButton onClick={(e) => handleCancelDelete(e, itemId)} aria-label="Cancel deletion">
                      <IoRefreshCircleOutline size={20} />
                    </CancelButton>
                  ) : (
                    <DeleteButton onClick={(e) => handleDelete(e, itemId)} aria-label="Delete item">
                      <IoCloseCircleOutline size={20} />
                    </DeleteButton>
                  )}
                  {!isDeleted && <IoChevronForward size={16} />}
                </div>
                </span>
              </ListItem>
            );
          }))}
        </ContentInner>
      </Content>
      {depth === 1 && (
        <BottomToggleButton 
          $isVisible={isOpen && hasItems}
          onClick={() => setIsOpen(false)}
        >
          <IoChevronDown size={16} />
        </BottomToggleButton>
      )}
    </ItemWrapper>
  );
};

export default EstimateAccordionItem;
