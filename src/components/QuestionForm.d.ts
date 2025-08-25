import React from 'react';
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
    lang?: 'native' | 'foreign';
    isSubQuestion?: boolean;
}
declare const QuestionForm: React.FC<QuestionFormProps>;
export default QuestionForm;
