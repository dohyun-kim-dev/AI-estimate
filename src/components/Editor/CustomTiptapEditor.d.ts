import { Editor } from "@tiptap/react";
import "./Tiptap.css";
import "./BubbleMenu.css";
interface CustomTiptapEditorProps {
    initialContent?: string;
    onEditorReady?: (editor: Editor) => void;
}
declare const CustomTiptapEditor: ({ initialContent, onEditorReady, }: CustomTiptapEditorProps) => import("react/jsx-runtime").JSX.Element | null;
export default CustomTiptapEditor;
