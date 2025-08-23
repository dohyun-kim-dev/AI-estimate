import React, { useState } from 'react';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

interface ChoiceItem {
  id: string;
  text: {
    native: string;
    foreign: string;
  };
  subQuestion?: QuestionData;
}

export interface QuestionData {
  id: string;
  question: {
    native: string;
    foreign: string;
  };
  description: {
    native: string;
    foreign: string;
  };
  choices: ChoiceItem[];
  allowMultiple: boolean;
}

interface QuestionFormProps {
  data: QuestionData;
  onUpdate: (data: QuestionData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  lang?: 'native' | 'foreign'; // 상위에서 지정되거나 기본 자국어
  isSubQuestion?: boolean; // 다국어 탭 표시 여부
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  data,
  onUpdate,
  onDelete,
  onDuplicate,
  lang: parentLang,
  isSubQuestion = false,
}) => {
  const [lang, setLang] = useState<'native' | 'foreign'>(parentLang || 'native');
  const [expandedSubIds, setExpandedSubIds] = useState<Set<string>>(new Set());

  const currentLang = parentLang || lang;

  const handleFieldChange = (field: 'question' | 'description', value: string) => {
    onUpdate({
      ...data,
      [field]: {
        ...data[field],
        [currentLang]: value,
      },
    });
  };

  const handleChoiceChange = (id: string, value: string) => {
    onUpdate({
      ...data,
      choices: data.choices.map(choice =>
        choice.id === id
          ? {
              ...choice,
              text: {
                ...choice.text,
                [currentLang]: value,
              },
            }
          : choice
      ),
    });
  };

  const handleAddChoice = () => {
    const newChoice: ChoiceItem = {
      id: uuidv4(),
      text: { native: '', foreign: '' },
    };
    onUpdate({ ...data, choices: [...data.choices, newChoice] });
  };

  const handleDeleteChoice = (id: string) => {
    onUpdate({ ...data, choices: data.choices.filter(c => c.id !== id) });
  };

  const toggleAllowMultiple = () => {
    onUpdate({ ...data, allowMultiple: !data.allowMultiple });
  };

  const handleAddSubQuestion = (id: string) => {
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

  const handleUpdateSubQuestion = (choiceId: string, sub: QuestionData) => {
    const updated = data.choices.map(choice =>
      choice.id === choiceId ? { ...choice, subQuestion: sub } : choice
    );
    onUpdate({ ...data, choices: updated });
  };

  const handleDeleteSubQuestion = (choiceId: string) => {
    const updated = data.choices.map(choice =>
      choice.id === choiceId ? { ...choice, subQuestion: undefined } : choice
    );
    onUpdate({ ...data, choices: updated });
  };

  const toggleExpanded = (choiceId: string) => {
    setExpandedSubIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(choiceId)) newSet.delete(choiceId);
      else newSet.add(choiceId);
      return newSet;
    });
  };

  return (
    <Wrapper>
      {!isSubQuestion && (
        <LanguageTabs>
          <Tab active={lang === 'native'} onClick={() => setLang('native')}>자국어</Tab>
          <Tab active={lang === 'foreign'} onClick={() => setLang('foreign')}>외국어</Tab>
        </LanguageTabs>
      )}

      <Input
        placeholder="질문 입력"
        value={data.question[currentLang]}
        onChange={(e) => handleFieldChange('question', e.target.value)}
      />

      <Input
        placeholder="설명 입력"
        value={data.description[currentLang]}
        onChange={(e) => handleFieldChange('description', e.target.value)}
      />

      {data.choices.map((choice, index) => (
        <div key={choice.id}>
          <ChoiceRow>
            <ChoiceInput
              placeholder={`항목 ${index + 1}`}
              value={choice.text[currentLang]}
              onChange={(e) => handleChoiceChange(choice.id, e.target.value)}
            />
            <ButtonGroup>
              <SmallButton onClick={() => handleAddSubQuestion(choice.id)}>＋</SmallButton>
              <SmallButton onClick={() => handleDeleteChoice(choice.id)}>✕</SmallButton>
            </ButtonGroup>
          </ChoiceRow>

          {choice.subQuestion && (
            <SubWrapper>
              <ToggleExpand onClick={() => toggleExpanded(choice.id)}>
                {expandedSubIds.has(choice.id) ? '▼ 하위 질문 접기' : '▶ 하위 질문 펼치기'}
              </ToggleExpand>

              {expandedSubIds.has(choice.id) && (
                <QuestionForm
                  data={choice.subQuestion}
                  onUpdate={(sub) => handleUpdateSubQuestion(choice.id, sub)}
                  onDelete={() => handleDeleteSubQuestion(choice.id)}
                  onDuplicate={() => {}} // 선택 항목에 대한 질문 복제는 옵션
                  lang={currentLang}
                  isSubQuestion
                />
              )}
            </SubWrapper>
          )}
        </div>
      ))}

      <AddChoiceButton onClick={handleAddChoice}>+ 항목 추가</AddChoiceButton>

      <OptionRow>
        <label>
          복수 선택
          <Toggle
            type="checkbox"
            checked={data.allowMultiple}
            onChange={toggleAllowMultiple}
          />
        </label>

        <Actions>
          <ActionButton onClick={onDuplicate}>📄</ActionButton>
          <ActionButton onClick={onDelete}>🗑️</ActionButton>
        </Actions>
      </OptionRow>
    </Wrapper>
  );
};

export default QuestionForm;

const Wrapper = styled.div`
  border: 1px solid #444;
  border-radius: 10px;
  padding: 16px;
  background: #1c1c1c;
  color: white;
  margin-bottom: 24px;
`;

const LanguageTabs = styled.div`
  display: flex;
  margin-bottom: 12px;
`;

const Tab = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 8px;
  background: ${({ active }) => (active ? '#0a6d39' : '#2a2a2a')};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background: #2a2a2a;
  color: white;
  border: none;
  border-radius: 6px;
  margin-bottom: 10px;
`;

const ChoiceRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const ChoiceInput = styled.input`
  flex: 1;
  padding: 8px;
  background: #2a2a2a;
  border: none;
  border-radius: 6px;
  color: white;
`;

const ButtonGroup = styled.div`
  display: flex;
  margin-left: 8px;
`;

const SmallButton = styled.button`
  background: transparent;
  color: #bbb;
  font-size: 16px;
  margin-left: 4px;
  cursor: pointer;
  border: none;
`;

const AddChoiceButton = styled.button`
  margin-top: 8px;
  padding: 6px 12px;
  background: #0a6d39;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const OptionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  align-items: center;
`;

const Toggle = styled.input`
  margin-left: 10px;
  transform: scale(1.2);
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background: transparent;
  color: white;
  font-size: 18px;
  cursor: pointer;
  border: none;
`;

const SubWrapper = styled.div`
  margin-left: 24px;
  margin-top: 8px;
`;

const ToggleExpand = styled.button`
  background: none;
  color: #aaa;
  border: none;
  margin-bottom: 4px;
  cursor: pointer;
`;
