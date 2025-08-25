'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
export default function StyledComponentsRegistry({ children, }) {
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());
    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return _jsx(_Fragment, { children: styles });
    });
    if (typeof window !== 'undefined')
        return _jsx(_Fragment, { children: children });
    return (_jsx(StyleSheetManager, { sheet: styledComponentsStyleSheet.instance, children: children }));
}
