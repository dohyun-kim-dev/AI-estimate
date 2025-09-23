'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS, ThemeMode } from '@/styles/theme_colors';

interface CategorySearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategorySearchPopup: React.FC<CategorySearchPopupProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // TODO: 카테고리 목록 조회 API 호출
  const loadCategories = async (keyword?: string) => {
    setLoading(true);
    try {
      // 임시 데이터
      setCategories([
        { id: '1', name: '미디어플랫폼', code: '001001' },
        { id: '2', name: '금융', code: '001002' },
        { id: '3', name: '헬스케어', code: '001003' },
      ]);
    } catch (error) {
      console.error('카테고리 조회 에러:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleSearch = () => {
    loadCategories(searchTerm);
  };

  return (
    <CmsPopup
      title="카테고리 조회"
      isOpen={isOpen}
      onClose={onClose}
      height="auto"
      backgroundColor="#ffffff"
    >
      <SearchContainer>
        <Flex>
          <CategorySearchInput
            type="text"
            placeholder="카테고리명을 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton onClick={handleSearch}>
            조회
          </SearchButton>
        </Flex>

        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <th>No</th>
                <th>카테고리명</th>
                <th>카테고리코드</th>
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={3}>
                    <LoadingText>검색 중...</LoadingText>
                  </td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <TableRow key={category.id} $isEven={index % 2 === 1}>
                    <td>{index + 1}</td>
                    <td>{category.name}</td>
                    <td>{category.code}</td>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    <NoResults>검색 결과가 없습니다.</NoResults>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </SearchContainer>
    </CmsPopup>
  );
};

export default CategorySearchPopup;

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Flex = styled.div`
  display: flex;
  align-items: center;
`;

const CategorySearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 10px 15px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  background-color: #ffffff;
  color: #333333;
  cursor: pointer;
  background-image: url("/icon_search.png");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px 16px;
  margin: 0px;

  &:focus {
    outline: none;
    border-color: ${THEME_COLORS.light.primary};
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SearchButton = styled.button`
  width: 86px;
  height: 48px;
  margin-left: 10px;
  background: #2C2E3C;
  color: ${THEME_COLORS.light.buttonText};
  border: 1px solid ${THEME_COLORS.light.borderColor};
  border-left: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const TableContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #dddddd;
  border-radius: 4px;
  margin-top: 15px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #f8f8f8;
  
  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #333333;
    border-bottom: 1px solid #dddddd;
    border-right: 1px solid #E6E7E9;
  }
`;

const TableBody = styled.tbody`
  tr:last-child td {
    border-bottom: none;
  }
`;

const TableRow = styled.tr<{ $isEven?: boolean }>`
  cursor: pointer;
  background-color: ${({ $isEven }) => $isEven ? '#f9f9f9' : 'transparent'};
  
  td {
    padding: 12px;
    color: #333333;
    border-right: 1px solid #E6E7E9;
  }

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LoadingText = styled.div`
  padding: 20px;
  text-align: center;
  color: #666666;
`;

const NoResults = styled.div`
  padding: 20px;
  text-align: center;
  color: #666666;
`;
