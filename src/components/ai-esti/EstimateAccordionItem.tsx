"use client";

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';
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
  align-items: center;
  padding: ${({ depth }) => depth === 3 ? '24px 18px 24px 45px' : '24px 18px 24px 35px'};
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
  item_id: string;
}

interface EstimateAccordionItemProps {
  name: string;
  price?: string;
  description?: string;
  items?: EstimateItem[];
  depth: 1 | 2 | 3;
  onItemClick?: (item: EstimateItem) => void;
  onItemDelete?: (itemId: string, item: EstimateItem) => void;   // ✅ 추가
  onItemRestore?: (itemId: string, item: EstimateItem) => void;  // ✅ 추가
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

  const getStorageKey = () => `estimate_${chatRoomId}_${estimateId}_${name}`;
  
  const getInitialDeletedState = () => {
    if (!chatRoomId || !estimateId) return new Set<string>();
    const storedData = localStorage.getItem(getStorageKey());
    return storedData ? new Set(JSON.parse(storedData)) : new Set<string>();
  };

  const [deletedItems, setDeletedItems] = useState<Set<string>>(getInitialDeletedState());

  const totalAmount = useMemo(() => {
    if (!items.length) {
      return price || "0";
    }

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
      return;
    }

    if (onItemSelect) {
      onItemSelect(itemId);
    }
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const updateLocalStorage = (newDeletedItems: Set<string>) => {
    if (!chatRoomId || !estimateId) return;
    localStorage.setItem(getStorageKey(), JSON.stringify(Array.from(newDeletedItems)));
  };

  const handleDelete = (e: React.MouseEvent, itemId: string, item: EstimateItem) => {
    e.stopPropagation();
    e.preventDefault();

    const newDeletedItems = new Set(deletedItems).add(itemId);
    setDeletedItems(newDeletedItems);
    updateLocalStorage(newDeletedItems);
    
    if (onItemDelete) onItemDelete(itemId, { ...item, is_deleted: true });      
  };

  const handleCancelDelete = (e: React.MouseEvent, itemId: string, item: EstimateItem) => {
    e.stopPropagation();
    e.preventDefault();

    const newDeletedItems = new Set(deletedItems);
    newDeletedItems.delete(itemId);
    setDeletedItems(newDeletedItems);
    updateLocalStorage(newDeletedItems);

    if (onItemRestore) onItemRestore(itemId, { ...item, is_deleted: false });

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
                $isSelected={selectedItemId === itemId}
                $isDeleted={isDeleted}
                depth={depth}
              >
                <span className="name" onClick={() => handleItemClick(item, index)}>
                  {item.name}
                </span>
                <span className="price" onClick={() => handleItemClick(item, index)}>
                  {item.price}
                </span>
                <div className="actions">
                  {isDeleted ? (
                    <ActionButton onClick={(e) => handleCancelDelete(e, itemId, item)} aria-label="Cancel deletion">
                      <img src="/ai-estimate/delete_cancel_button.png" alt="Cancel deletion" />
                    </ActionButton>
                  ) : (
                    <ActionButton onClick={(e) => handleDelete(e, itemId, item)} aria-label="Delete item">
                      <img src="/ai-estimate/delete_button.png" alt="Delete item" />
                    </ActionButton>
                  )}
                  {/* 삭제된 항목일 경우 상세 아이콘 숨기기 */}
                  {!isDeleted && <IoChevronForward size={16} onClick={() => handleItemClick(item, index)} />}
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