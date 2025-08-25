import React from "react";
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
    onCellChange?: (id: string | number, key: string, value: any) => void;
}
declare const TreeGridTable: React.FC<TreeGridTableProps>;
export default TreeGridTable;
