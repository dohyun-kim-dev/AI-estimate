import React, { useState } from "react";
import styled from "styled-components";

interface TreeNode {
  id: string | number;
  [key: string]: any;
  children?: TreeNode[];
}

interface ColumnDefinition {
  header: string;
  accessor: string;
  editable?: boolean;
  width?: string;
}

interface TreeGridTableProps {
  data: TreeNode[];
  columns: ColumnDefinition[];
  onChange: (updatedData: TreeNode[]) => void;
  onCellChange?: (id: string | number, key: string, value: any) => void; // 🔹 추가
}

const TreeGridTable: React.FC<TreeGridTableProps> = ({ data, columns, onChange, onCellChange }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [editingCell, setEditingCell] = useState<{ id: string | number; key: string } | null>(null);

  const toggleExpand = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateNode = (nodes: TreeNode[], id: string | number, key: string, value: any): TreeNode[] =>
    nodes.map((node) => {
      if (node.id === id) {
        return { ...node, [key]: value };
      } else if (node.children) {
        return { ...node, children: updateNode(node.children, id, key, value) };
      }
      return node;
    });

  const handleChange = (id: string | number, key: string, value: any) => {
    if (onCellChange) {
      onCellChange(id, key, value); // 🔹 셀 변경 즉시 콜백
    }
    const updated = updateNode(data, id, key, value);
    onChange(updated);
  };

  const renderRows = (nodes: TreeNode[], depth = 0): React.ReactNode[] => {
    return nodes.flatMap((node) => {
      const isExpanded = expandedIds.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      const row = (
        <Tr key={node.id}>
          {columns.map((col, idx) => {
            const isEditing = editingCell?.id === node.id && editingCell.key === col.accessor;
            return (
              <Td key={col.accessor} style={{ paddingLeft: idx === 0 ? depth * 20 + 8 : 8 }}>
                {idx === 0 && hasChildren && (
                  <ToggleBtn onClick={() => toggleExpand(node.id)}>
                    {isExpanded ? "▼" : "▶"}
                  </ToggleBtn>
                )}
                {isEditing ? (
                  <input
                    autoFocus
                    value={node[col.accessor] ?? ""}
                    onChange={(e) =>
                      handleChange(node.id, col.accessor, e.target.value)
                    }
                    onBlur={() => setEditingCell(null)}
                  />
                ) : (
                  <span
                    onDoubleClick={() =>
                      col.editable && setEditingCell({ id: node.id, key: col.accessor })
                    }
                  >
                    {node[col.accessor] ?? "-"}
                  </span>
                )}
              </Td>
            );
          })}
        </Tr>
      );

      const children = isExpanded && node.children ? renderRows(node.children, depth + 1) : [];
      return [row, ...children];
    });
  };

  return (
    <Table>
      <thead>
        <tr>
          {columns.map((col) => (
            <Th key={col.accessor} style={{ width: col.width }}>{col.header}</Th>
          ))}
        </tr>
      </thead>
      <tbody>{renderRows(data)}</tbody>
    </Table>
  );
};

export default TreeGridTable;

// --- Styles ---
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ccc;
  background: #f5f5f5;
`;

const Tr = styled.tr``;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #eee;
`;

const ToggleBtn = styled.button`
  margin-right: 6px;
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
`;
