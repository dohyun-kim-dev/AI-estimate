'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
export const GradientButton = ({ title, gradient = 'linear-gradient(to bottom, #e6dcc9, #ddc180)', href, onClick, titleColor = '#333', // ✅ 기본 텍스트 색
 }) => {
    const commonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        minWidth: 220,
        fontSize: 16,
        fontWeight: 500,
        color: titleColor, // ✅ 여기에 반영
        textDecoration: 'none',
        borderRadius: 8,
        background: gradient,
        transition: 'opacity 0.2s',
        boxShadow: 'none',
        cursor: 'pointer',
        border: 'none',
        outline: 'none',
        appearance: 'none',
    };
    const content = (_jsxs(_Fragment, { children: [_jsx("span", { children: title }), _jsx("span", { style: { fontSize: 18, marginLeft: 8 }, children: "\u203A" })] }));
    if (onClick) {
        return (_jsx("button", { type: "button", style: commonStyle, onClick: onClick, children: content }));
    }
    if (href) {
        return (_jsx("a", { href: href, target: "_blank", rel: "noopener noreferrer", style: commonStyle, children: content }));
    }
    return _jsx("div", { style: { ...commonStyle, opacity: 0.6, pointerEvents: 'none' }, children: content });
};
