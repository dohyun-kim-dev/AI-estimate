import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
const QuestionForm = ({ data, onUpdate, onDelete, onDuplicate, lang: parentLang, isSubQuestion = false, }) => {
    const [lang, setLang] = useState(parentLang || 'native');
    const [expandedSubIds, setExpandedSubIds] = useState(new Set());
    const currentLang = parentLang || lang;
    const handleFieldChange = (field, value) => {
        onUpdate({
            ...data,
            [field]: {
                ...data[field],
                [currentLang]: value,
            },
        });
    };
    const handleChoiceChange = (id, value) => {
        onUpdate({
            ...data,
            choices: data.choices.map(choice => choice.id === id
                ? {
                    ...choice,
                    text: {
                        ...choice.text,
                        [currentLang]: value,
                    },
                }
                : choice),
        });
    };
    const handleAddChoice = () => {
        const newChoice = {
            id: uuidv4(),
            text: { native: '', foreign: '' },
        };
        onUpdate({ ...data, choices: [...data.choices, newChoice] });
    };
    const handleDeleteChoice = (id) => {
        onUpdate({ ...data, choices: data.choices.filter(c => c.id !== id) });
    };
    const toggleAllowMultiple = () => {
        onUpdate({ ...data, allowMultiple: !data.allowMultiple });
    };
    const handleAddSubQuestion = (id) => {
        const updated = data.choices.map(choice => {
            if (choice.id === id) {
                return {
                    ...choice,
                    subQuestion: {
                        id: uuidv4(),
                        question: { native: '', foreign: '' },
                        description: { native: '', foreign: '' },
                        choices: [],
                        allowMultiple: false,
                    },
                };
            }
            return choice;
        });
        onUpdate({ ...data, choices: updated });
        setExpandedSubIds(prev => new Set(prev).add(id));
    };
    const handleUpdateSubQuestion = (choiceId, sub) => {
        const updated = data.choices.map(choice => choice.id === choiceId ? { ...choice, subQuestion: sub } : choice);
        onUpdate({ ...data, choices: updated });
    };
    const handleDeleteSubQuestion = (choiceId) => {
        const updated = data.choices.map(choice => choice.id === choiceId ? { ...choice, subQuestion: undefined } : choice);
        onUpdate({ ...data, choices: updated });
    };
    const toggleExpanded = (choiceId) => {
        setExpandedSubIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(choiceId))
                newSet.delete(choiceId);
            else
                newSet.add(choiceId);
            return newSet;
        });
    };
    return (_jsxs(Wrapper, { children: [!isSubQuestion && (_jsxs(LanguageTabs, { children: [_jsx(Tab, { active: lang === 'native', onClick: () => setLang('native'), children: "\uC790\uAD6D\uC5B4" }), _jsx(Tab, { active: lang === 'foreign', onClick: () => setLang('foreign'), children: "\uC678\uAD6D\uC5B4" })] })), _jsx(Input, { placeholder: "\uC9C8\uBB38 \uC785\uB825", value: data.question[currentLang], onChange: (e) => handleFieldChange('question', e.target.value) }), _jsx(Input, { placeholder: "\uC124\uBA85 \uC785\uB825", value: data.description[currentLang], onChange: (e) => handleFieldChange('description', e.target.value) }), data.choices.map((choice, index) => (_jsxs("div", { children: [_jsxs(ChoiceRow, { children: [_jsx(ChoiceInput, { placeholder: `항목 ${index + 1}`, value: choice.text[currentLang], onChange: (e) => handleChoiceChange(choice.id, e.target.value) }), _jsxs(ButtonGroup, { children: [_jsx(SmallButton, { onClick: () => handleAddSubQuestion(choice.id), children: "\uFF0B" }), _jsx(SmallButton, { onClick: () => handleDeleteChoice(choice.id), children: "\u2715" })] })] }), choice.subQuestion && (_jsxs(SubWrapper, { children: [_jsx(ToggleExpand, { onClick: () => toggleExpanded(choice.id), children: expandedSubIds.has(choice.id) ? '▼ 하위 질문 접기' : '▶ 하위 질문 펼치기' }), expandedSubIds.has(choice.id) && (_jsx(QuestionForm, { data: choice.subQuestion, onUpdate: (sub) => handleUpdateSubQuestion(choice.id, sub), onDelete: () => handleDeleteSubQuestion(choice.id), onDuplicate: () => { }, lang: currentLang, isSubQuestion: true }))] }))] }, choice.id))), _jsx(AddChoiceButton, { onClick: handleAddChoice, children: "+ \uD56D\uBAA9 \uCD94\uAC00" }), _jsxs(OptionRow, { children: [_jsxs("label", { children: ["\uBCF5\uC218 \uC120\uD0DD", _jsx(Toggle, { type: "checkbox", checked: data.allowMultiple, onChange: toggleAllowMultiple })] }), _jsxs(Actions, { children: [_jsx(ActionButton, { onClick: onDuplicate, children: "\uD83D\uDCC4" }), _jsx(ActionButton, { onClick: onDelete, children: "\uD83D\uDDD1\uFE0F" })] })] })] }));
};
export default QuestionForm;
const Wrapper = styled.div `
  border: 1px solid #444;
  border-radius: 10px;
  padding: 16px;
  background: #1c1c1c;
  color: white;
  margin-bottom: 24px;
`;
const LanguageTabs = styled.div `
  display: flex;
  margin-bottom: 12px;
`;
const Tab = styled.button `
  flex: 1;
  padding: 8px;
  background: ${({ active }) => (active ? '#0a6d39' : '#2a2a2a')};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
`;
const Input = styled.input `
  width: 100%;
  padding: 10px;
  background: #2a2a2a;
  color: white;
  border: none;
  border-radius: 6px;
  margin-bottom: 10px;
`;
const ChoiceRow = styled.div `
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;
const ChoiceInput = styled.input `
  flex: 1;
  padding: 8px;
  background: #2a2a2a;
  border: none;
  border-radius: 6px;
  color: white;
`;
const ButtonGroup = styled.div `
  display: flex;
  margin-left: 8px;
`;
const SmallButton = styled.button `
  background: transparent;
  color: #bbb;
  font-size: 16px;
  margin-left: 4px;
  cursor: pointer;
  border: none;
`;
const AddChoiceButton = styled.button `
  margin-top: 8px;
  padding: 6px 12px;
  background: #0a6d39;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;
const OptionRow = styled.div `
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
`;
const Toggle = styled.input `
  margin-left: 10px;
  transform: scale(1.2);
`;
const Actions = styled.div `
  display: flex;
  gap: 10px;
`;
const ActionButton = styled.button `
  background: transparent;
  color: white;
  font-size: 18px;
  cursor: pointer;
  border: none;
`;
const SubWrapper = styled.div `
  margin-left: 24px;
  margin-top: 8px;
`;
const ToggleExpand = styled.button `
  background: none;
  color: #aaa;
  border: none;
  margin-bottom: 4px;
  cursor: pointer;
`;
