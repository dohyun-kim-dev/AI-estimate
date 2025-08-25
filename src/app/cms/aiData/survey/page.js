'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import QuestionForm from '@/components/QuestionForm';
import { v4 as uuidv4 } from 'uuid';
const SurveyPage = () => {
    const [questions, setQuestions] = useState([
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
    const updateQuestion = (id, updated) => {
        setQuestions(prev => prev.map(q => (q.id === id ? updated : q)));
    };
    const deleteQuestion = (id) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };
    const duplicateQuestion = (id) => {
        const original = questions.find(q => q.id === id);
        if (!original)
            return;
        const duplicated = {
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
        const newQuestion = {
            id: uuidv4(),
            question: { native: '', foreign: '' },
            description: { native: '', foreign: '' },
            choices: [],
            allowMultiple: false,
        };
        setQuestions(prev => [...prev, newQuestion]);
    };
    return (_jsxs("div", { style: { padding: '24px' }, children: [questions.map((q) => (_jsx(QuestionForm, { data: q, onUpdate: (updated) => updateQuestion(q.id, updated), onDelete: () => deleteQuestion(q.id), onDuplicate: () => duplicateQuestion(q.id) }, q.id))), _jsx("button", { onClick: addNewQuestion, children: "+ \uC9C8\uBB38 \uCD94\uAC00" })] }));
};
export default SurveyPage;
