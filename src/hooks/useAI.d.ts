export type SimpleModel = 'gemini-2.5-flash' | 'gemini-2.5-flash-lite' | 'gemini-2.0-flash' | (string & {});
export default function useAI(initialModel?: SimpleModel): {
    modelName: SimpleModel;
    setModelName: import("react").Dispatch<import("react").SetStateAction<SimpleModel>>;
    generate: (prompt: string) => Promise<string>;
    sendChat: (message: string) => Promise<string>;
    resetChat: () => void;
    testModel: () => Promise<{
        ok: boolean;
        message: string;
    }>;
    setSystemInstruction: (sys: string | undefined) => void;
};
