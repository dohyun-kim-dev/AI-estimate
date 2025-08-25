'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import { AppColors } from '@/styles/colors';
import CmsPopup from '@/components/CmsPopup';
import dayjs from 'dayjs';
import { promptHistoryGetList, promptUpdate } from '@/lib/api/admin/adminApi';
import SimpleGenericList from '@/components/CustomList/\bSimpleGenericList';
import { toast } from 'react-toastify';
import { TextField } from '@/components/TextField';
const PromptPopup = ({ index, isOpen, onClose, firstContent, firstCreatedTime }) => {
    const [selected, setSelected] = useState(null);
    const [description, setDescription] = useState('');
    const [promptList, setPromptList] = useState([]);
    const fetchData = async (_) => {
        const raw = await promptHistoryGetList({ index: Number(index) });
        const wrapper = raw?.[0];
        const data = wrapper?.data ?? [];
        if (data.length === 0) {
            return { data: [], totalItems: 0, allItems: 0 };
        }
        const base = data[0];
        const firstItem = {
            ...base,
            id: -1, // 가상의 ID
            index: base.index + 1,
            content: firstContent,
            createdTime: firstCreatedTime,
        };
        const combinedData = [firstItem, ...data];
        setPromptList(combinedData);
        setSelected(firstItem);
        setDescription(firstItem.content);
        return {
            data: combinedData,
            totalItems: combinedData.length,
            allItems: combinedData.length,
        };
    };
    const handleViewClick = (targetIndex) => {
        console.log('targetIndex:', targetIndex);
        const item = promptList.find((d) => d.index === targetIndex);
        console.log('item:', item);
        if (item) {
            setSelected(item);
            setDescription(item.content ?? '');
        }
    };
    const handleSave = async () => {
        if (!selected) {
            toast.error('선택된 항목이 없습니다.');
            return;
        }
        try {
            await promptUpdate({
                index: Number(selected.promptIndex),
                content: description,
            });
            toast.success('프롬프트가 저장되었습니다.');
            onClose();
        }
        catch (error) {
            console.error('프롬프트 저장 실패:', error);
            toast.error('저장 중 오류가 발생했습니다.');
        }
    };
    const closePopup = () => {
        onClose();
    };
    const columns = [
        {
            header: '작성일',
            accessor: 'createdTime',
            formatter: (value) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
            flex: 1,
        },
        { header: '작성자', accessor: 'createdId', flex: 1 },
        {
            header: '보기',
            accessor: 'index',
            flex: 1,
            formatter: (value) => _jsx(ViewButton, { onClick: () => handleViewClick(value), children: "\uBCF4\uAE30" }),
        },
    ];
    return (_jsx(CmsPopup, { title: "\uD504\uB86C\uD504\uD2B8 \uC218\uC815 \uC774\uB825", isOpen: isOpen, onClose: closePopup, isWide: true, children: _jsxs(PopupLayout, { children: [_jsxs(LeftSection, { children: [_jsx(LabelTitle, { children: selected?.label ?? '선택된 항목 없음' }), _jsx(SubTitle, { children: selected?.description ?? '선택된 항목 없음' }), _jsx(TextField, { radius: "0", multiline: true, minLines: 4, maxLines: 10, height: "500px", value: description, "$labelPosition": "horizontal", labelColor: "black", onChange: (e) => setDescription(e.target.value), placeholder: "\uBE44\uACE0\uB97C \uC785\uB825\uD558\uC138\uC694" }), _jsxs(PopupFooter, { children: [_jsx(SaveButton, { onClick: handleSave, disabled: !selected, children: "\uC800\uC7A5" }), _jsx(CancelButton, { onClick: closePopup, children: "\uB2EB\uAE30" })] })] }), _jsx(RightSection, { children: _jsx(SimpleGenericList, { title: "\uC218\uC815 \uC774\uB825", columns: columns, fetchData: fetchData, themeMode: "light" }) })] }) }));
};
export default PromptPopup;
// ------------------------ 스타일 ------------------------
const PopupLayout = styled.div `
  display: flex;
  gap: 24px;
  height: calc(85vh - 100px);
  min-width: 0;
`;
const LeftSection = styled.div `
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;
const RightSection = styled.div `
  flex: 1;
  overflow: hidden;
  min-width: 0;
  
  /* min-width: 600px; */
`;
const LabelTitle = styled.h2 `
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: '#fff';
`;
const SubTitle = styled.h2 `
  font-size: 16px;
  font-weight: 500;
    margin: 0 0 16px 0;
    margin-bottom: 20px;
    color: '#fff';
`;
const ContentBox = styled.div `
  flex: 1;
  padding: 16px;
  background-color: #fafafa;
  border: 1px solid ${AppColors.border};
  border-radius: 8px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.5;
  font-size: 14px;
  color: #000;

  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #ccc;
    border-radius: 4px;
  }
`;
const ViewButton = styled.span `
  font-size: 13px;
  color: ${AppColors.primary}; /* 텍스트 색상 */
  text-decoration: underline; /* 언더라인 추가 */
  cursor: pointer; /* 클릭 가능한 텍스트처럼 보이도록 설정 */

  &:hover {
    color: ${AppColors.hoverText}; /* 호버 시 색상 변경 */
  }
`;
const PopupFooter = styled.div `
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;
const FooterButton = styled.button `
  width: 120px;
  height: 48px;
  border-radius: 6px;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  border: none;
`;
const CancelButton = styled(FooterButton) `
  background-color: #ffffff;
  color: ${AppColors.onSurface};
  border: 1px solid ${AppColors.border};
`;
const SaveButton = styled(FooterButton) `
  background-color: ${AppColors.primary};
  color: ${AppColors.onPrimary};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;
