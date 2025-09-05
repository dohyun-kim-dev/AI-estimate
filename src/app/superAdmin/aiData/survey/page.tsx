'use client';

import React, { useState } from 'react';
import QuestionForm, { QuestionData } from '@/components/QuestionForm';
import { v4 as uuidv4 } from 'uuid';

const SurveyPage = () => {
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      id: uuidv4(),
      question: { native: '', foreign: '' },
      description: { native: '', foreign: '' },
      choices: [
        {
          id: uuidv4(),
          text: { native: '', foreign: '' },
        },
        {
          id: uuidv4(),
          text: { native: '', foreign: '' },
        },
      ],
      allowMultiple: false,
    },
  ]);

  const updateQuestion = (id: string, updated: QuestionData) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? updated : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const duplicateQuestion = (id: string) => {
    const original = questions.find(q => q.id === id);
    if (!original) return;

    const duplicated: QuestionData = {
      ...original,
      id: uuidv4(),
      choices: original.choices.map(choice => ({
        id: uuidv4(),
        text: { ...choice.text },
      })),
      question: { ...original.question },
      description: { ...original.description },
    };

    setQuestions(prev => [...prev, duplicated]);
  };

  const addNewQuestion = () => {
    const newQuestion: QuestionData = {
      id: uuidv4(),
      question: { native: '', foreign: '' },
      description: { native: '', foreign: '' },
      choices: [],
      allowMultiple: false,
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  return (
    <div style={{ padding: '24px' }}>
      {questions.map((q) => (
        <QuestionForm
          key={q.id}
          data={q}
          onUpdate={(updated) => updateQuestion(q.id, updated)}
          onDelete={() => deleteQuestion(q.id)}
          onDuplicate={() => duplicateQuestion(q.id)}
        />
      ))}

      <button onClick={addNewQuestion}>+ 질문 추가</button>
    </div>
  );
};

export default SurveyPage;
