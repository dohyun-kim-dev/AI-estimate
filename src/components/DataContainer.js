import { jsx as _jsx } from "react/jsx-runtime";
export default function DataContainer({ message, successChild, noDataChild }) {
    const isSuccess = message === 'success';
    return (_jsx("div", { style: { flex: 1 }, children: isSuccess ? successChild : noDataChild ?? _jsx("p", { children: "\uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." }) }));
}
