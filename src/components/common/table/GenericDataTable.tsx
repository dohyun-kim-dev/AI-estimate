import React from 'react'
import styled from 'styled-components'
import { BaseRecord, ColumnDefinition, ThemeMode } from '@/types/list'

interface TableProps<T> {
  data: T[]
  columns: ColumnDefinition<T>[]
  isLoading?: boolean
  error?: string | null
  onRowClick?: (item: T, index: number) => void
  onHeaderClick?: (accessor: keyof T | string) => void
  sortKey?: string | null
  sortOrder?: 'asc' | 'desc'
  keyExtractor?: (item: T, index: number) => string | number
  themeMode?: ThemeMode
}

const Table = styled.table<{ $themeMode: ThemeMode }>`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.surface1};
`

const TableHeader = styled.thead<{ $themeMode: ThemeMode }>`
  background: ${({ theme }) => theme.surface2};
  position: sticky;
  top: 0;
  z-index: 1;
`

const TableHeaderCell = styled.th<{
  $sortable?: boolean
  $isActive?: boolean
  $themeMode: ThemeMode
  $align?: string
  $width?: string | number
}>`
  padding: 16px;
  text-align: ${({ $align }) => $align || 'left'};
  font-weight: 600;
  color: ${({ theme }) => theme.text};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  width: ${({ $width }) => ($width ? `${$width}px` : 'auto')};
  cursor: ${({ $sortable }) => ($sortable ? 'pointer' : 'default')};
  white-space: nowrap;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ $sortable, theme }) =>
      $sortable ? `${theme.primary}10` : 'inherit'};
  }

  ${({ $isActive, theme }) =>
    $isActive &&
    `
    color: ${theme.primary};
    background-color: ${theme.primary}10;
  `}
`

const TableBody = styled.tbody``

const TableRow = styled.tr<{
  $clickable?: boolean
  $themeMode: ThemeMode
}>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ $clickable, theme }) =>
      $clickable ? theme.surface2 : 'inherit'};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
`

const TableCell = styled.td<{
  $themeMode: ThemeMode
  $align?: string
}>`
  padding: 16px;
  text-align: ${({ $align }) => $align || 'left'};
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`

const LoadingContainer = styled.div<{ $themeMode: ThemeMode }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background: ${({ theme }) => theme.surface1};
`

const ErrorContainer = styled.div<{ $themeMode: ThemeMode }>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.error};
  background: ${({ theme }) => theme.surface1};
`

const SortIcon = styled.span<{ $order?: 'asc' | 'desc' }>`
  margin-left: 4px;
  &::after {
    content: '${({ $order }) => ($order === 'asc' ? '▲' : '▼')}';
    font-size: 10px;
    opacity: ${({ $order }) => ($order ? 1 : 0.3)};
  }
`

export function GenericDataTable<T extends BaseRecord>({
  data,
  columns,
  isLoading,
  error,
  onRowClick,
  onHeaderClick,
  sortKey,
  sortOrder,
  keyExtractor,
  themeMode = 'light',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <LoadingContainer $themeMode={themeMode}>
        데이터를 불러오는 중...
      </LoadingContainer>
    )
  }

  if (error) {
    return (
      <ErrorContainer $themeMode={themeMode}>
        오류가 발생했습니다: {error}
      </ErrorContainer>
    )
  }

  return (
    <Table $themeMode={themeMode}>
      <TableHeader $themeMode={themeMode}>
        <tr>
          {columns.map((column, index) => (
            <TableHeaderCell
              key={index}
              $sortable={column.sortable}
              $isActive={sortKey === column.accessor}
              $themeMode={themeMode}
              $align={column.align}
              $width={column.width}
              onClick={() =>
                column.sortable && onHeaderClick && onHeaderClick(column.accessor)
              }
            >
              {column.header}
              {column.sortable && (
                <SortIcon
                  $order={sortKey === column.accessor ? sortOrder : undefined}
                />
              )}
            </TableHeaderCell>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {data.map((item, rowIndex) => (
          <TableRow
            key={keyExtractor ? keyExtractor(item, rowIndex) : rowIndex}
            onClick={() => onRowClick && onRowClick(item, rowIndex)}
            $clickable={!!onRowClick}
            $themeMode={themeMode}
          >
            {columns.map((column, colIndex) => {
              const value = item[column.accessor as keyof T]
              const formattedValue = column.formatter
                ? column.formatter(value, item, rowIndex)
                : value

              return (
                <TableCell
                  key={colIndex}
                  $themeMode={themeMode}
                  $align={column.align}
                  className={column.className}
                >
                  {formattedValue}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default GenericDataTable
