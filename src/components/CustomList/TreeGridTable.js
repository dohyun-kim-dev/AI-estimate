import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import styled from "styled-components";
const TreeGridTable = ({ data, columns, onChange, onCellChange }) => {
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [editingCell, setEditingCell] = useState(null);
    const toggleExpand = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const updateNode = (nodes, id, key, value) => nodes.map((node) => {
        if (node.id === id) {
            return { ...node, [key]: value };
        }
        else if (node.children) {
            return { ...node, children: updateNode(node.children, id, key, value) };
        }
        return node;
    });
    const handleChange = (id, key, value) => {
        if (onCellChange) {
            onCellChange(id, key, value); // 🔹 셀 변경 즉시 콜백
        }
        const updated = updateNode(data, id, key, value);
        onChange(updated);
    };
    const renderRows = (nodes, depth = 0) => {
        return nodes.flatMap((node) => {
            const isExpanded = expandedIds.has(node.id);
            const hasChildren = node.children && node.children.length > 0;
            const row = (_jsx(Tr, { children: columns.map((col, idx) => {
                    const isEditing = editingCell?.id === node.id && editingCell.key === col.accessor;
                    return (_jsxs(Td, { style: { paddingLeft: idx === 0 ? depth * 20 + 8 : 8 }, children: [idx === 0 && hasChildren && (_jsx(ToggleBtn, { onClick: () => toggleExpand(node.id), children: isExpanded ? "▼" : "▶" })), isEditing ? (_jsx("input", { autoFocus: true, value: node[col.accessor] ?? "", onChange: (e) => handleChange(node.id, col.accessor, e.target.value), onBlur: () => setEditingCell(null) })) : (_jsx("span", { onDoubleClick: () => col.editable && setEditingCell({ id: node.id, key: col.accessor }), children: node[col.accessor] ?? "-" }))] }, col.accessor));
                }) }, node.id));
            const children = isExpanded && node.children ? renderRows(node.children, depth + 1) : [];
            return [row, ...children];
        });
    };
    return (_jsxs(Table, { children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col) => (_jsx(Th, { style: { width: col.width }, children: col.header }, col.accessor))) }) }), _jsx("tbody", { children: renderRows(data) })] }));
};
export default TreeGridTable;
// --- Styles ---
const Table = styled.table `
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;
const Th = styled.th `
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ccc;
  background: #f5f5f5;
`;
const Tr = styled.tr ``;
const Td = styled.td `
  padding: 8px;
  border-bottom: 1px solid #eee;
`;
const ToggleBtn = styled.button `
  margin-right: 6px;
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
`;
