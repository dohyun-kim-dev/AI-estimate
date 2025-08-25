interface TokenInfo {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}
interface PromptLogInfo {
    templateId: string;
    userInput: string;
    combinedPrompt: string;
    tokenInfo?: TokenInfo;
}
export declare const logPromptInfo: (info: PromptLogInfo) => void;
export declare const estimateTokens: (text: string) => number;
export {};
