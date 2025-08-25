export interface PromptTemplate {
    id: string;
    title: string;
    content: string;
    description?: string;
}
export declare const promptTemplates: PromptTemplate[];
export declare const getPromptTemplate: (id: string) => PromptTemplate | undefined;
export declare const combinePrompts: (templateId: string, userInput: string) => string;
