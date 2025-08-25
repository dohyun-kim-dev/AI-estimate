import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { FontFamily } from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import GapCursor from "@tiptap/extension-gapcursor";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Node } from "@tiptap/core";
import Underline from "@tiptap/extension-underline";
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdHighlight, MdLink, MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, } from "react-icons/md";
import "./Tiptap.css";
import "./BubbleMenu.css";
import MenuBar from "./MenuBar";
import { useCallback, useEffect } from "react";
// 폰트 크기 확장을 위한 커스텀 설정
const FontSize = TextStyle.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            fontSize: {
                default: null,
                parseHTML: (element) => element.style.fontSize.replace(/['"]+/g, ""),
                renderHTML: (attributes) => {
                    if (!attributes.fontSize) {
                        return {};
                    }
                    return {
                        style: `font-size: ${attributes.fontSize}`,
                    };
                },
            },
            lineHeight: {
                default: null,
                parseHTML: (element) => element.style.lineHeight || null,
                renderHTML: (attributes) => {
                    if (!attributes.lineHeight)
                        return {};
                    return { style: `line-height: ${attributes.lineHeight}` };
                },
            },
            letterSpacing: {
                default: "0",
                parseHTML: (element) => element.style.letterSpacing,
                renderHTML: (attributes) => {
                    if (!attributes.letterSpacing) {
                        return {};
                    }
                    return {
                        style: `letter-spacing: ${attributes.letterSpacing}`,
                    };
                },
            },
        };
    },
    addCommands() {
        return {
            ...this.parent?.(),
            setFontSize: (fontSize) => ({ commands }) => {
                return commands.setMark(this.name, { fontSize: fontSize });
            },
            unsetFontSize: () => ({ commands }) => {
                return commands.unsetMark(this.name);
            },
            setLineHeight: (lineHeight) => ({ commands }) => {
                return commands.setMark(this.name, { lineHeight: lineHeight });
            },
            setLetterSpacing: (letterSpacing) => ({ commands }) => {
                return commands.setMark(this.name, { letterSpacing: letterSpacing });
            },
        };
    },
});
const uploadImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
    });
};
// 이미지 노드 확장 설정
const CustomImage = Image.extend({
    renderHTML({ HTMLAttributes }) {
        return ["div", { class: "image-container" }, ["img", HTMLAttributes]];
    },
});
// YouTube 노드 정의
const YouTube = Node.create({
    name: "youtube",
    group: "block",
    atom: true,
    addAttributes() {
        return {
            src: {
                default: null,
            },
            width: {
                default: 640,
            },
            height: {
                default: 360,
            },
        };
    },
    parseHTML() {
        return [
            {
                tag: 'iframe[src*="youtube.com"]',
            },
        ];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            { class: "youtube-video-container" },
            [
                "iframe",
                {
                    ...HTMLAttributes,
                    frameborder: "0",
                    allowfullscreen: "true",
                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                },
            ],
        ];
    },
});
// YouTube 링크 감지 및 변환 확장
const YouTubeExtension = Extension.create({
    name: "youtubeExtension",
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("youtube-extension"),
                props: {
                    handlePaste: (view, event) => {
                        if (!event.clipboardData)
                            return false;
                        const text = event.clipboardData.getData("text/plain");
                        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
                        const match = text.match(youtubeRegex);
                        if (match) {
                            const videoId = match[1];
                            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.youtube.create({ src: embedUrl })));
                            return true;
                        }
                        return false;
                    },
                },
            }),
        ];
    },
});
const CustomTiptapEditor = ({ initialContent = "<p>여기에 내용을 입력하세요...</p>", onEditorReady, }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
            // StarterKit의 기본 Heading, Bold 등 외 추가/제외 설정 가능
            // 예: heading: { levels: [1, 2, 3] }
            // 기본적으로 Bold, Italic, Strike, Code, Paragraph, Blockquote, BulletList, OrderedList 등 포함
            }),
            Highlight,
            TextAlign.configure({
                types: ["heading", "paragraph"], // 정렬을 적용할 노드 타입 지정
            }),
            // TextStyle, // FontFamily, FontSize 사용을 위해 필요
            FontFamily,
            FontSize, // 커스텀 FontSize 확장 사용
            Link.configure({
                openOnClick: true, // 링크 클릭 시 새 탭에서 열기
                autolink: true, // URL 자동 링크 변환
                HTMLAttributes: {
                    rel: "noopener noreferrer",
                    target: "_blank",
                },
            }),
            Underline,
            GapCursor,
            CustomImage.configure({
                inline: true,
                allowBase64: true,
            }),
            ImageResize.configure({
            // minWidth: 100, // 최소 너비 100px
            // maxWidth: 200, // 최대 너비 200px
            // autoHeight: true, // 높이는 자동으로 맞춰주기
            }),
            YouTube,
            YouTubeExtension,
        ],
        content: initialContent,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                // 에디터 자체에 클래스 추가 가능
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl m-5 focus:outline-none",
            },
            handleDrop: (view, event, slice, moved) => {
                event.preventDefault();
                const files = event.dataTransfer?.files;
                if (files && files.length) {
                    // 여러 이미지 파일을 처리하기 위해 Array.from(files)를 사용
                    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
                    imageFiles.forEach((imageFile) => {
                        // 각 이미지를 Base64로 변환하여 URL 가져오기
                        uploadImage(imageFile).then((imageUrl) => {
                            // URL로 이미지를 에디터에 삽입
                            view.dispatch(view.state.tr.replaceSelectionWith(view.state.schema.nodes.image.create({ src: imageUrl })));
                        });
                    });
                }
                return true; // 드롭 처리 완료
            },
        },
    });
    // BubbleMenu에서 사용할 setLink 함수 (MenuBar와 동일하게 사용 가능)
    const setLink = useCallback(() => {
        if (!editor)
            return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL을 입력하세요", previousUrl);
        if (url === null)
            return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);
    // 이미지 업로드 핸들러
    const handleImageUpload = useCallback(() => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.click();
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (file) {
                const imageUrl = URL.createObjectURL(file);
                if (editor) {
                    editor.chain().focus().setImage({ src: imageUrl }).run();
                }
            }
        };
    }, [editor]);
    useEffect(() => {
        if (editor && onEditorReady) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);
    const handleContainerClick = () => {
        if (editor && !editor.isFocused) {
            editor.chain().focus().run();
        }
    };
    if (!editor) {
        return null;
    }
    return (_jsxs("div", { className: "tiptap-editor-container", onClick: handleContainerClick, children: [_jsx(MenuBar, { editor: editor }), _jsxs(BubbleMenu, { editor: editor, tippyOptions: { duration: 100, placement: "top-start" }, className: "tiptap-bubble-menu" // 스타일링을 위한 클래스
                , shouldShow: ({ editor, view, state, oldState, from, to }) => {
                    // 텍스트가 선택되었을 때만 버블 메뉴 표시
                    return from !== to;
                }, children: [_jsx("button", { onClick: () => editor.chain().focus().toggleBold().run(), className: editor.isActive("bold") ? "is-active" : "", children: _jsx(MdFormatBold, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleItalic().run(), className: editor.isActive("italic") ? "is-active" : "", children: _jsx(MdFormatItalic, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleUnderline().run(), className: editor.isActive("underline") ? "is-active" : "", children: _jsx(MdFormatUnderlined, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleStrike().run(), className: editor.isActive("strike") ? "is-active" : "", children: _jsx(MdStrikethroughS, {}) }), _jsx("button", { onClick: setLink, className: editor.isActive("link") ? "is-active" : "", children: _jsx(MdLink, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleHighlight().run(), className: editor.isActive("highlight") ? "is-active" : "", children: _jsx(MdHighlight, {}) }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("left").run(), className: editor.isActive({ textAlign: "left" }) ? "is-active" : "", children: _jsx(MdFormatAlignLeft, {}) }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("center").run(), className: editor.isActive({ textAlign: "center" }) ? "is-active" : "", children: _jsx(MdFormatAlignCenter, {}) }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("center").run(), className: editor.isActive({ textAlign: "right" }) ? "is-active" : "", children: _jsx(MdFormatAlignRight, {}) })] }), " ", _jsx(EditorContent, { editor: editor, className: "tiptap-editor-content" })] }));
};
export default CustomTiptapEditor;
