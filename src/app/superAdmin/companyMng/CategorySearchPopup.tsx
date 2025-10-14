const RightControls = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
`;

const Cnt = styled.div<{ $themeMode?: ThemeMode }>`
  font-size: 15px;
  color: ${({ $themeMode }) => $themeMode === 'dark' ? '#fff' : '#333'};
  font-weight: 500;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button<{ $themeMode?: ThemeMode }>`
  width: 24px;
  height: 24px;
  border-radius: 2px;
  border: none;
  padding: 2px 0 0 0 ;
  background: #fff;
  color: ${({ $themeMode }) => $themeMode === 'dark' ? '#fff' : '#333'};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
`;

const PageBox = styled.div<{ $themeMode?: ThemeMode }>`
  min-width: 60px;
  text-align: center;
  font-size: 15px;
  color: ${({ $themeMode }) => $themeMode === 'dark' ? '#fff' : '#333'};
  font-weight: 500;
`;
const EditButton = styled.button`
  background: #214A72;
  width: 100%;
  height: 100%;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const DeleteButton = styled.button`
  background: #2C2E3C;
   width: 100%;
  height: 100%;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;
'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CmsPopup from '@/components/CmsPopup';
import CommonTextField from '@/components/common/TextField';
import ActionButton from '@/components/ActionButton';
import { THEME_COLORS, ThemeMode } from '@/styles/theme_colors';
import CategoryRegisterPopup from './CategoryRegisterPopup';
import {getCategoryList} from '@/lib/api/admin/adminApi';
import { devLog } from '@/utils/devLogger'

interface CategorySearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (category: {categoryId: string, categoryName: string, categoryCode: string}) => void;
  showEditActions?: boolean; // 수정/삭제 헤더 표시 여부
  selectedCategoryId?: string; // 현재 선택된 카테고리 ID
}

const CategorySearchPopup: React.FC<CategorySearchPopupProps> = ({ isOpen, onClose, onSelect, showEditActions = false, selectedCategoryId }) => {
  // 페이징 관련 상태 (예시)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const themeMode: ThemeMode = 'light'; // 실제 테마 상태에 맞게 변경

  // 등록/수정 팝업 상태
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<'no'|'createdAt'|'name'|'code'>('no');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');

  // 카테고리 목록 조회 API 연결
  const loadCategories = async (keyword?: string) => {
    setLoading(true);
    try {
      const res = await getCategoryList();
      let arr: any[] = [];
      const resAny = res as any;
      if (Array.isArray(resAny) && resAny.length > 0 && resAny[0].data && Array.isArray(resAny[0].data.data)) {
        arr = resAny[0].data.data;
      } else if (resAny?.data?.data && Array.isArray(resAny.data.data)) {
        arr = resAny.data.data;
      }
      let filtered = arr;
      if (keyword) {
        filtered = filtered.filter((cat: any) => cat.name.includes(keyword));
      }
      setCategories(filtered.map((cat: any, idx: number) => ({
        name: cat.name,
        code: cat.code,
        id: cat._id,
        createdAt: cat.createdAt || '',
        no: idx + 1,
      })));
  devLog('카테고리 조회 결과:', arr);
    } catch (error) {
      console.error('카테고리 조회 에러:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTotalItems(categories.length);
    setAllItems(categories.length);
    setTotalPages(Math.max(1, Math.ceil(categories.length / 10)));
  }, [categories]);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleSearch = () => {
    loadCategories(searchTerm);
  };

    // 정렬 함수
    const sortedCategories = [...categories].sort((a, b) => {
      if (sortKey === 'no') {
        return sortOrder === 'desc' ? b.no - a.no : a.no - b.no;
      }
      if (sortKey === 'createdAt') {
        return sortOrder === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortKey === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      if (sortKey === 'code') {
        // 숫자형 문자열이면 숫자로 변환해서 비교, 아니면 문자열 비교
        const aNum = Number(a.code);
        const bNum = Number(b.code);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortOrder === 'desc' ? bNum - aNum : aNum - bNum;
        }
        return sortOrder === 'desc'
          ? b.code.localeCompare(a.code)
          : a.code.localeCompare(b.code);
      }
      return 0;
    });

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

        <RightControls>
          <Cnt $themeMode={themeMode}>
            전체 {`${allItems ?? '-'}건 중 ${totalItems}건`}
          </Cnt>
          <PaginationControls>
            <NavButton
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage <= 1 || isLoading}
              $themeMode={themeMode}
            >
              {/* 왼쪽 화살표 SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <g clipPath="url(#clip0_1059_40087)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.03647 9.43474C6.88649 9.58476 6.80224 9.78821 6.80224 10.0003C6.80224 10.2125 6.88649 10.4159 7.03647 10.5659L11.5621 15.0915C11.6359 15.1679 11.7241 15.2289 11.8217 15.2708C11.9193 15.3127 12.0243 15.3348 12.1305 15.3357C12.2368 15.3367 12.3421 15.3164 12.4404 15.2762C12.5387 15.236 12.6281 15.1766 12.7032 15.1015C12.7783 15.0263 12.8377 14.937 12.8779 14.8387C12.9182 14.7404 12.9384 14.635 12.9375 14.5288C12.9365 14.4226 12.9145 14.3176 12.8726 14.22C12.8306 14.1224 12.7697 14.0341 12.6933 13.9603L8.73327 10.0003L12.6933 6.04034C12.839 5.88946 12.9196 5.68738 12.9178 5.47762C12.916 5.26786 12.8319 5.06721 12.6835 4.91888C12.5352 4.77056 12.3345 4.68642 12.1248 4.6846C11.915 4.68278 11.713 4.76341 11.5621 4.90914L7.03647 9.43474Z" fill="#AAAAAA"/>
                </g>
                <defs>
                  <clipPath id="clip0_1059_40087">
                    <rect width="19.2" height="19.2" fill="white" transform="matrix(-1 0 0 1 19.6016 0.400391)"/>
                  </clipPath>
                </defs>
              </svg>
            </NavButton>
            <PageBox $themeMode={themeMode}>
              {currentPage} / {totalPages > 0 ? totalPages : 1}
            </PageBox>
            <NavButton
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages || isLoading}
              $themeMode={themeMode}
            >
              {/* 오른쪽 화살표 SVG (좌측 SVG을 x축 반전) */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ transform: 'scaleX(-1)' }}>
                <g clipPath="url(#clip0_1059_40087)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M7.03647 9.43474C6.88649 9.58476 6.80224 9.78821 6.80224 10.0003C6.80224 10.2125 6.88649 10.4159 7.03647 10.5659L11.5621 15.0915C11.6359 15.1679 11.7241 15.2289 11.8217 15.2708C11.9193 15.3127 12.0243 15.3348 12.1305 15.3357C12.2368 15.3367 12.3421 15.3164 12.4404 15.2762C12.5387 15.236 12.6281 15.1766 12.7032 15.1015C12.7783 15.0263 12.8377 14.937 12.8779 14.8387C12.9182 14.7404 12.9384 14.635 12.9375 14.5288C12.9365 14.4226 12.9145 14.3176 12.8726 14.22C12.8306 14.1224 12.7697 14.0341 12.6933 13.9603L8.73327 10.0003L12.6933 6.04034C12.839 5.88946 12.9196 5.68738 12.9178 5.47762C12.916 5.26786 12.8319 5.06721 12.6835 4.91888C12.5352 4.77056 12.3345 4.68642 12.1248 4.6846C11.915 4.68278 11.713 4.76341 11.5621 4.90914L7.03647 9.43474Z" fill="#AAAAAA"/>
                </g>
                <defs>
                  <clipPath id="clip0_1059_40087">
                    <rect width="19.2" height="19.2" fill="white" transform="matrix(-1 0 0 1 19.6016 0.400391)"/>
                  </clipPath>
                </defs>
              </svg>
            </NavButton>
          </PaginationControls>
        </RightControls>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr >
                <th onClick={() => {
                  setSortKey('no');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 80, position: 'relative' }}>
                    <span style={{ flex: 1, textAlign: 'center' }}>No</span>
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 17, display: 'inline-block' }}>
                      <span style={{ visibility: sortKey === 'no' ? 'visible' : 'hidden', display: 'inline-block', transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M4.83203 10L8.83203 6L12.832 10" stroke="#888888" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </span>
                  </span>
                </th>
                <th onClick={() => {
                  setSortKey('createdAt');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 100, position: 'relative' }}>
                    <span style={{ flex: 1, textAlign: 'center' }}>등록일</span>
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 17, display: 'inline-block' }}>
                      <span style={{ visibility: sortKey === 'createdAt' ? 'visible' : 'hidden', display: 'inline-block', transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M4.83203 10L8.83203 6L12.832 10" stroke="#888888" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </span>
                  </span>
                </th>
                <th onClick={() => {
                  setSortKey('name');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 120, position: 'relative' }}>
                    <span style={{ flex: 1, textAlign: 'center' }}>카테고리명</span>
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 17, display: 'inline-block' }}>
                      <span style={{ visibility: sortKey === 'name' ? 'visible' : 'hidden', display: 'inline-block', transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M4.83203 10L8.83203 6L12.832 10" stroke="#888888" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </span>
                  </span>
                </th>
                <th onClick={() => {
                  setSortKey('code');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }} style={{ cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 120, position: 'relative' }}>
                    <span style={{ flex: 1, textAlign: 'center' }}>카테고리코드</span>
                    <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 17, display: 'inline-block' }}>
                      <span style={{ visibility: sortKey === 'code' ? 'visible' : 'hidden', display: 'inline-block', transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M4.83203 10L8.83203 6L12.832 10" stroke="#888888" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                    </span>
                  </span>
                </th>
                {showEditActions && <th>수정</th>}
                {showEditActions && <th>삭제</th>}
              </tr>
            </TableHeader>
            <TableBody>
              {loading ? (
                <tr>
                  <td colSpan={showEditActions ? 6 : 4}>
                    <LoadingText>검색 중...</LoadingText>
                  </td>
                </tr>
              ) : sortedCategories.length > 0 ? (
                  sortedCategories.map((category, index) => (
                    <TableRow 
                      key={category.id} 
                      $isEven={index % 2 === 1}
                      $isSelected={selectedCategoryId === category.id}
                      onClick={() => {
                        if (onSelect) {
                          onSelect({ 
                            categoryId: category.id,
                            categoryName: category.name,
                            categoryCode: category.code
                          });
                          onClose();
                        }
                      }}
                    >
                      <td>{category.no}</td>
                      <td>{category.createdAt}</td>
                      <td>{category.name}</td>
                      <td>{category.code}</td>
                      {showEditActions && (
                        <td>
                          <EditButton onClick={(e) => { 
                            e.stopPropagation(); // 이벤트 버블링 방지
                            setEditCategory(category); 
                            setRegisterOpen(true); 
                          }}>수정</EditButton>
                        </td>
                      )}
                      {showEditActions && (
                        <td>
                          <DeleteButton onClick={(e) => e.stopPropagation()}>삭제</DeleteButton>
                        </td>
                      )}
                    </TableRow>
                  ))
              ) : (
                <tr>
                  <td colSpan={showEditActions ? 6 : 4}>
                    <NoResults>검색 결과가 없습니다.</NoResults>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      <BottomButtonRow>

        <SaveButton>저장</SaveButton>
        <CloseButton onClick={onClose}>닫기</CloseButton>
        {/* 등록/수정 팝업 */}
        <CategoryRegisterPopup
          isOpen={registerOpen}
          onClose={() => { 
            setRegisterOpen(false); 
            setEditCategory(null); // editData 초기화
            loadCategories(); 
          }}
          editData={editCategory}
        />
      </BottomButtonRow>
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

const BottomButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
`;

const SaveButton = styled.button`
  background: #2C2E3C;
  color: #fff;
  border: 1px solid #2C2E3C;
  border-radius: 2px;
  padding: 9px 53px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const CloseButton = styled.button`
  background: #fff;
  color: #2C2E3C;
  border: 1px solid #2C2E3C;
  border-radius: 2px;
  padding: 9px 53px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover {
    background: #f5f5f5;
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
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #f8f8f8;
  th {
    padding: 10px;
    text-align: center;
    font-weight: 600;
    color: #696969;
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
    padding: 10px;
    color: #333333;
    border-right: 1px solid #E6E7E9;
    text-align: center;
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
