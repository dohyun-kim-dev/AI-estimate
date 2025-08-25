import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from "react";
import { MdFormatBold, MdFormatItalic, MdFormatUnderlined, MdStrikethroughS, MdHighlight, MdLink, MdLinkOff, MdFormatAlignLeft, MdFormatAlignCenter, MdFormatAlignRight, MdFormatListBulleted, MdFormatListNumbered, MdFormatQuote, MdInsertPhoto, MdFormatLineSpacing, MdSpaceBar, } from "react-icons/md";
const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/upload-endpoint", {
        method: "POST",
        body: formData,
    });
    const data = await response.json();
    return data.imageUrl; // 서버에서 반환한 이미지 URL
};
const MenuBar = ({ editor }) => {
    if (!editor) {
        return null;
    }
    const [imageUrl, setImageUrl] = useState("");
    const [lineHeight, setLineHeight] = useState(parseFloat(editor.getAttributes("textStyle").lineHeight || "1.2") // 기본값 설정 또는 에디터 상태 반영
    );
    const [letterSpacing, setLetterSpacing] = useState(parseFloat(editor.getAttributes("textStyle").letterSpacing || "0") // 기본값 설정 또는 에디터 상태 반영
    );
    const handleLineHeightChange = (value) => {
        setLineHeight(value);
        if (!editor)
            return;
        editor.commands.setMark("textStyle", { lineHeight: String(value) });
    };
    const handleLetterSpacingChange = (value) => {
        setLetterSpacing(value);
        if (!editor)
            return;
        editor.commands.setMark("textStyle", { letterSpacing: `${value}px` });
    };
    // 이미지 업로드 및 에디터에 삽입 (미리보기만)
    const handleImageUpload = useCallback(() => {
        // 파일 input 요소 생성
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*"; // 이미지 파일만 선택 가능
        fileInput.click();
        // 파일이 선택되면 실행되는 이벤트 핸들러
        fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (file) {
                // 이미지 파일을 로컬 URL로 변환하여 미리보기 삽입
                const imageUrl = URL.createObjectURL(file); // 로컬 이미지 URL 생성
                setImageUrl(imageUrl); // 미리보기
                editor.chain().focus().setImage({ src: imageUrl }).run(); // 에디터에 삽입
            }
        };
    }, [editor]);
    const FONT_FAMILIES = [
        { name: "기본체", value: "" }, // 브라우저 기본 폰트 또는 CSS 기본값
        { name: "나눔고딕", value: "Nanum Gothic" },
        { name: "나눔명조", value: "Nanum Myeongjo" },
        { name: "Noto Sans KR", value: "Noto Sans KR" },
        { name: "Pretendard", value: "Pretendard" },
        // { name: 'D2Coding', value: 'D2Coding' }, // D2Coding 폰트 설정 필요
    ];
    const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "64px"];
    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("URL을 입력하세요", previousUrl);
        // cancelled
        if (url === null) {
            return;
        }
        // empty
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        // update link
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);
    useEffect(() => {
        if (!editor)
            return;
        const updateStates = () => {
            const textStyleAttrs = editor.getAttributes("textStyle");
            // 행간 값 가져오기
            const currentLineHeight = textStyleAttrs.lineHeight ? parseFloat(textStyleAttrs.lineHeight) : 1.2;
            // 자간 값 가져오기 (px 단위 제거)
            const currentLetterSpacing = textStyleAttrs.letterSpacing ? parseFloat(textStyleAttrs.letterSpacing) : 0;
            if (lineHeight !== currentLineHeight) {
                setLineHeight(currentLineHeight);
            }
            if (letterSpacing !== currentLetterSpacing) {
                setLetterSpacing(currentLetterSpacing);
            }
        };
        editor.on("transaction", updateStates);
        editor.on("selectionUpdate", updateStates);
        return () => {
            editor.off("transaction", updateStates);
            editor.off("selectionUpdate", updateStates);
        };
    }, [editor, lineHeight, letterSpacing]);
    return (_jsxs("div", { className: "tiptap-menu-bar", children: [_jsx("button", { onClick: () => editor.chain().focus().toggleBold().run(), disabled: !editor.can().chain().focus().toggleBold().run(), className: editor.isActive("bold") ? "is-active" : "", children: _jsx(MdFormatBold, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleItalic().run(), disabled: !editor.can().chain().focus().toggleItalic().run(), className: editor.isActive("italic") ? "is-active" : "", children: _jsx(MdFormatItalic, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleUnderline().run(), disabled: !editor.can().chain().focus().toggleUnderline().run(), className: editor.isActive("underline") ? "is-active" : "", children: _jsx(MdFormatUnderlined, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleStrike().run(), disabled: !editor.can().chain().focus().toggleStrike().run(), className: editor.isActive("strike") ? "is-active" : "", children: _jsx(MdStrikethroughS, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleHighlight().run(), disabled: !editor.can().chain().focus().toggleHighlight().run(), className: editor.isActive("highlight") ? "is-active" : "", children: _jsx(MdHighlight, {}) }), _jsx("button", { onClick: setLink, className: editor.isActive("link") ? "is-active" : "", children: _jsx(MdLink, {}) }), _jsx("button", { onClick: () => editor.chain().focus().unsetLink().run(), disabled: !editor.isActive("link"), children: _jsx(MdLinkOff, {}) }), _jsxs("button", { onClick: handleImageUpload, children: [_jsx(MdInsertPhoto, {}), " "] }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("left").run(), className: editor.isActive({ textAlign: "left" }) ? "is-active" : "", children: _jsx(MdFormatAlignLeft, {}) }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("center").run(), className: editor.isActive({ textAlign: "center" }) ? "is-active" : "", children: _jsx(MdFormatAlignCenter, {}) }), _jsx("button", { onClick: () => editor.chain().focus().setTextAlign("right").run(), className: editor.isActive({ textAlign: "right" }) ? "is-active" : "", children: _jsx(MdFormatAlignRight, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleBulletList().run(), className: editor.isActive("bulletList") ? "is-active" : "", children: _jsx(MdFormatListBulleted, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleOrderedList().run(), className: editor.isActive("orderedList") ? "is-active" : "", children: _jsx(MdFormatListNumbered, {}) }), _jsx("button", { onClick: () => editor.chain().focus().toggleBlockquote().run(), className: editor.isActive("blockquote") ? "is-active" : "", children: _jsx(MdFormatQuote, {}) }), _jsx("select", { value: FONT_FAMILIES.find((font) => editor.isActive("textStyle", { fontFamily: font.value }))?.value || "", onChange: (e) => editor.chain().focus().setFontFamily(e.target.value).run(), children: FONT_FAMILIES.map((font) => (_jsx("option", { value: font.value, children: font.name }, font.name))) }), _jsxs("select", { value: editor.getAttributes("textStyle").fontSize || "12px", onChange: (e) => editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run(), children: [_jsx("option", { value: "", children: "\uAE30\uBCF8 \uD06C\uAE30" }), FONT_SIZES.map((size) => (_jsx("option", { value: size, children: size }, size)))] }), _jsxs("div", { className: "spacing-control", children: [_jsxs("span", { children: [_jsx(MdFormatLineSpacing, {}), " \uD589\uAC04"] }), _jsx("input", { type: "range", min: "1.2", max: "3", step: "0.1", value: lineHeight, onChange: (e) => handleLineHeightChange(Number(e.target.value)) }), _jsx("span", { children: lineHeight.toFixed(1) })] }), _jsxs("div", { className: "spacing-control", children: [_jsxs("span", { children: [_jsx(MdSpaceBar, {}), " \uC790\uAC04"] }), _jsx("input", { type: "range", min: "-2", max: "10", step: "0.5", value: letterSpacing, onChange: (e) => handleLetterSpacingChange(Number(e.target.value)) }), _jsxs("span", { children: [letterSpacing.toFixed(1), "px"] })] })] }));
};
export default MenuBar;
