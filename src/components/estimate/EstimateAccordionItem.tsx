import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { IoChevronDown, IoChevronForward } from 'react-icons/io5'
import { formatPrice, parsePrice } from '@/utils/format'

const ItemWrapper = styled.div<{ depth: number; $isOpen?: boolean }>`
  position: relative;
  overflow: visible;
  margin-bottom: ${({ depth, $isOpen }) => {
    if (depth !== 1) return '0'
    return $isOpen ? '40px' : '0'
  }};

  ${({ depth, theme }) =>
    depth === 1 &&
    `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${theme.surface1};
      border-radius: 12px;
      z-index: 0;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  `}

  ${({ depth, theme }) =>
    depth !== 1 &&
    `
    background: ${theme.surface2};
    border-bottom: 1px solid ${theme.border};

    &:last-child {
      border-bottom: none;
      padding-bottom: ${theme.body === '#FFFFFF' ? '12px' : '0'};
    }
  `}
`

const Header = styled.div<{
  depth: number
  $isSelected: boolean
  $isOpen: boolean
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ depth }) =>
    depth === 1 ? '24px 18px 24px 10px' : '24px 18px 24px 30px'};
  cursor: pointer;
  background-color: ${({ theme, depth, $isSelected }) =>
    $isSelected ? theme.primary : theme.surface1};
  font-weight: 600;
  border-bottom: ${({ theme, $isOpen }) =>
    $isOpen ? `1px solid ${theme.border}` : 'none'};
  transition: background-color 0.2s ease;
  color: ${({ theme, $isSelected }) => ($isSelected ? 'white' : theme.text)};
  border-radius: ${({ depth, $isOpen }) => {
    if (depth === 2) {
      return '0'
    }
    return $isOpen ? '12px 12px 0 0' : '12px'
  }};

  .title {
    flex-grow: 1;
  }

  .price {
    margin: 0 20px;
    font-size: 0.95em;
  }

  &:hover {
    background-color: ${({ theme }) => theme.primary}1A;
  }
`

const IconWrapper = styled.div<{ $isOpen: boolean; $isBottomToggle?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease-in-out;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`

const BottomToggleButton = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: -28px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.primary};
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${({ $isVisible }) =>
    $isVisible ? 'translateY(50%)' : 'translateY(50%) scale(0)'};
  transition: transform 0.3s ease-in-out;
  margin-bottom: 4px;

  &:hover {
    background-color: ${({ theme }) => theme.secondary};
  }

  svg {
    transform: rotate(180deg);
    color: white;
  }
`

const Content = styled.div<{ $isOpen: boolean; depth: number }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.35s ease-in-out;
  background-color: ${({ theme, depth }) =>
    depth === 1 ? theme.surface2 : theme.surface3};
  position: relative;
  clip-path: ${({ depth }) =>
    depth === 1 ? 'inset(0 0 12px 0 round 0 0 12px 12px)' : 'inset(0)'};
`

const ContentInner = styled.div`
  overflow: hidden;
`

const ListItem = styled.div<{ $isSelected: boolean; depth?: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ depth }) =>
    depth === 3 ? '24px 18px 40px 45px' : '24px 18px 24px 45px'};
  color: ${({ theme }) => theme.text};
  font-size: 0.95em;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.primary : 'transparent'};
  border-bottom: 1px solid ${({ theme }) => theme.border};

  &:last-child {
    border-bottom: none;
  }

  .name {
    flex-grow: 1;
    color: ${({ $isSelected }) => ($isSelected ? 'white' : 'inherit')};
  }

  .price {
    font-weight: 600;
    color: ${({ theme, $isSelected }) =>
      $isSelected ? 'white' : theme.subtleText};
    margin-right: 10px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.primary}1A;
  }

  svg {
    color: ${({ theme, $isSelected }) =>
      $isSelected ? 'white' : theme.subtleText};
  }
`

interface EstimateAccordionItemProps {
  name: string
  price?: string
  description?: string
  items?: Array<{ name: string; price: string; description: string }>
  depth: 1 | 2 | 3
  onItemClick?: (item: any) => void
  children?: React.ReactNode
  isSelected?: boolean
  onSelect?: () => void
  selectedItemId?: string | null
  onItemSelect?: (itemId: string) => void
}

export const EstimateAccordionItem: React.FC<EstimateAccordionItemProps> = ({
  name,
  price,
  items = [],
  depth,
  onItemClick,
  children,
  isSelected = false,
  onSelect,
  selectedItemId,
  onItemSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const hasItems = items.length > 0 || !!children

  const totalAmount = useMemo(() => {
    if (!items.length) return price || '0'
    return formatPrice(items.reduce((sum, item) => sum + parsePrice(item.price), 0))
  }, [items, price])

  const handleHeaderClick = () => {
    setIsOpen(!isOpen)
    if (onSelect) {
      onSelect()
    }
  }

  const handleItemClick = (item: any, index: number) => {
    if (onItemSelect) {
      onItemSelect(`${name}-${index}`)
    }
    if (onItemClick) {
      onItemClick(item)
    }
  }

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
          {children ||
            (hasItems &&
              items.map((item, index) => (
                <ListItem
                  key={index}
                  onClick={() => handleItemClick(item, index)}
                  $isSelected={selectedItemId === `${name}-${index}`}
                  depth={depth}
                >
                  <span className="name">{item.name}</span>
                  <span className="price">{item.price}</span>
                  <IoChevronForward size={16} />
                </ListItem>
              )))}
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
  )
}

export default EstimateAccordionItem
