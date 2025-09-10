"use client";

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { formatPrice, parsePrice } from '@/utils/utils';
import { useLocation } from 'react-router-dom';

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
      // position: absolute;
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
    padding: ${({ depth, theme }) => {
      if (depth === 1) return '24px 18px 24px 10px';
      // theme.body가 어두운 계열이면 다크모드로 간주
      const isDark = theme.body && typeof theme.body === 'string' && theme.body.toLowerCase() !== '#ffffff';
      return isDark ? '24px 18px 36px 30px' : '24px 18px 24px 30px';
    }};
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
  align-items: center;
  padding: ${({ depth }) => depth === 3 ? '24px 18px 24px 45px' : '24px 18px 24px 35px'};
  color: ${({ theme }) => theme.subtleText};
  font-size: 0.95em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: relative;
  overflow: visible;
  // 삭제된 항목 스타일
  opacity: ${({ $isDeleted }) => $isDeleted ? '0.5' : '1'};
  ${({ $isDeleted }) => $isDeleted && `
    text-decoration: line-through;
    color: #a1a1aa;
    .price {
      text-decoration: line-through;
    }
  `}

  // 마지막 아이템: 다크모드(배경이 어두움)면 40px, 라이트모드면 24px
  &:last-child {
    border-bottom: none;
    padding-bottom: ${({ depth, theme }) => {
      if (depth === 2 || depth === 3) {
        // theme.body가 어두운 계열이면 다크모드로 간주
        const isDark = theme.body && typeof theme.body === 'string' && theme.body.toLowerCase() !== '#ffffff';
        return isDark ? '40px' : '24px';
      }
      return '24px';
    }};
  }
  
  .name {
    flex: 1;
    margin-right: 16px;
    display: flex;
    align-items: center;
  }

  .price {
    display: flex;
    align-items: center;
    font-weight: 600;
    color: ${({ theme, $isDeleted }) => $isDeleted ? '#a1a1aa' : theme.subtleText};
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    z-index: 2;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.pick};
  }
`;

const ActionButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0;
  z-index: 3;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
  }
`;

interface EstimateItem {
  name: string;
  price: string;
  description: string;
  is_deleted: boolean;
  item_id?: string;  // 옵셔널로 변경
}

interface EstimateAccordionItemProps {
  name: string;
  price?: string;
  description?: string;
  items?: EstimateItem[];
  depth: 1 | 2 | 3;
  onItemClick?: (item: EstimateItem) => void;
  onItemDelete?: (itemId: string, item: EstimateItem) => void;
  onItemRestore?: (itemId: string, item: EstimateItem) => void;
  children?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: () => void;
  selectedItemId?: string | null;
  onItemSelect?: (itemId: string) => void;
  chatRoomId?: string;
  estimateId?: string;
}

const EstimateAccordionItem: React.FC<EstimateAccordionItemProps> = ({
  name,
  price,
  items = [],
  depth,
  onItemClick,
  onItemDelete,
  onItemRestore,
  children,
  isSelected = false,
  onSelect,
  selectedItemId,
  onItemSelect,
  chatRoomId,
  estimateId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasItems = items.length > 0 || !!children;
  const location = useLocation();

  const isSharePage = useMemo(() => {
    const url = `${location.pathname}${location.search}${location.hash}`.toLowerCase();
    return url.includes('share');
  }, [location]);

  const totalAmount = useMemo(() => {
    if (!items.length) {
      return price || "0";
    }

    const currentItems = items.filter((item) => !item.is_deleted);
    
    return formatPrice(currentItems.reduce((sum, item) => sum + parsePrice(item.price), 0));
  }, [items, price]);

  const handleHeaderClick = () => {
    setIsOpen(!isOpen);
    if (onSelect) {
      onSelect();
    }
  };

  const handleItemClick = (item: any, index: number) => {
    const itemId = item.item_id || `${name}-${index}`;
    if (item.is_deleted) {
      return;
    }

    if (onItemSelect) {
      onItemSelect(itemId);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleDelete = (e: React.MouseEvent, item: EstimateItem) => {
    e.stopPropagation();
    e.preventDefault();
    if (onItemDelete) onItemDelete(item.item_id || '', { ...item, is_deleted: true });      
  };

  const handleCancelDelete = (e: React.MouseEvent, item: EstimateItem) => {
    e.stopPropagation();
    e.preventDefault();
    if (onItemRestore) onItemRestore(item.item_id || '', { ...item, is_deleted: false });
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
            return (
              <ListItem
                key={item.item_id || index} 
                $isSelected={selectedItemId === (item.item_id || `${name}-${index}`)}
                $isDeleted={!!item.is_deleted}
                depth={depth}
              >
                <span className="name" onClick={() => handleItemClick(item, index)}>
                  {item.name}
                </span>
                <span className="price" onClick={() => handleItemClick(item, index)}>
                  {item.price}
                </span>
                <div className="actions">
                {
                    !isSharePage && (
                      item.is_deleted ? (
                        <ActionButton onClick={(e) => handleCancelDelete(e, item)} aria-label="Cancel deletion">
                          <img src="/ai-estimate/delete_cancel_button.png" alt="Cancel deletion" />
                        </ActionButton>
                      ) : (
                        <ActionButton onClick={(e) => handleDelete(e, item)} aria-label="Delete item">
                          <img src="/ai-estimate/delete_button.png" alt="Delete item" />
                        </ActionButton>
                      )
                    )
                  }
                  {/* 삭제된 항목일 경우 상세 아이콘 숨기기 */}
                  {!item.is_deleted && <IoChevronForward size={16} onClick={() => handleItemClick(item, index)} />}
                </div>
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
