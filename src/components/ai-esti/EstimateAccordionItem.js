// src/app/ai-estimate/components/EstimateAccordionItem.tsx
"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';
import { formatPrice, parsePrice } from '@/utils/utils';
const ItemWrapper = styled.div `
  position: relative;
  overflow: visible;
  margin-bottom: ${({ depth, $isOpen }) => {
    if (depth !== 1)
        return '0';
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
      z-index: 1;
    }
  `}

  ${({ depth, theme }) => depth !== 1 && `
    background: ${theme[`accordionLevel${depth}`]};
    border-bottom: 1px solid ${theme.border};

    &:last-child {
      border-bottom: none;
      padding-bottom: ${theme.accordionLevel1 === '#ffffff' ? '12px' : '0'};
    }
  `}
`;
const Header = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ depth }) => depth === 1 ? '24px 18px 24px 10px' : '24px 18px 24px 30px'};
  cursor: pointer;
  background-color: ${({ theme, depth, $isSelected }) => $isSelected ? theme.pick : theme[`accordionLevel${depth}`]};
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
const IconWrapper = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`;
const BottomToggleButton = styled.div `
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
const Content = styled.div `
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.35s ease-in-out;
  background-color: ${({ theme, depth }) => theme[`accordionLevel${depth + 1}`]};
  position: relative;
  clip-path: ${({ depth }) => depth === 1 ? 'inset(0 0 12px 0 round 0 0 12px 12px)' : 'inset(0)'};
`;
const ContentInner = styled.div `
  overflow: hidden;
`;
const ListItem = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ depth }) => depth === 3 ? '24px 18px 40px 45px' : '24px 18px 24px 45px'};
  color: ${({ theme }) => theme.subtleText};
  font-size: 0.95em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${({ theme, $isSelected }) => $isSelected ? theme.pick : 'transparent'};
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }
  
  .name {
    flex-grow: 1;
  }

  .price {
    font-weight: 600;
    color: ${({ theme }) => theme.subtleText};
    margin-right: 10px;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.pick};
  }
`;
const EstimateAccordionItem = ({ name, price, items = [], depth, onItemClick, children, isSelected = false, onSelect, selectedItemId, onItemSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasItems = items.length > 0 || !!children;
    const totalAmount = useMemo(() => {
        if (!items.length)
            return price || "0";
        return formatPrice(items.reduce((sum, item) => sum + parsePrice(item.price), 0));
    }, [items, price]);
    const handleHeaderClick = () => {
        setIsOpen(!isOpen);
        if (onSelect) {
            onSelect();
        }
    };
    const handleItemClick = (item, index) => {
        if (onItemSelect) {
            onItemSelect(`${name}-${index}`);
        }
        if (onItemClick) {
            onItemClick(item);
        }
    };
    return (_jsxs(ItemWrapper, { depth: depth, "$isOpen": isOpen, children: [_jsxs(Header, { onClick: handleHeaderClick, depth: depth, "$isSelected": isSelected, "$isOpen": isOpen, children: [_jsx("span", { className: "title", children: name }), _jsx("span", { className: "price", children: totalAmount }), _jsx(IconWrapper, { "$isOpen": isOpen, children: _jsx(IoChevronDown, { size: 20 }) })] }), _jsx(Content, { "$isOpen": isOpen, depth: depth, children: _jsx(ContentInner, { children: children || (hasItems && items.map((item, index) => (_jsxs(ListItem, { onClick: () => handleItemClick(item, index), "$isSelected": selectedItemId === `${name}-${index}`, depth: depth, children: [_jsx("span", { className: "name", children: item.name }), _jsx("span", { className: "price", children: item.price }), _jsx(IoChevronForward, { size: 16 })] }, index)))) }) }), depth === 1 && (_jsx(BottomToggleButton, { "$isVisible": isOpen && hasItems, onClick: () => setIsOpen(false), children: _jsx(IoChevronDown, { size: 16 }) }))] }));
};
export default EstimateAccordionItem;
