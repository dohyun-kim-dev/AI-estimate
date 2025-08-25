import React from 'react';
interface EstimateAccordionItemProps {
    name: string;
    price?: string;
    description?: string;
    items?: Array<{
        name: string;
        price: string;
        description: string;
    }>;
    depth: 1 | 2 | 3;
    onItemClick?: (item: any) => void;
    children?: React.ReactNode;
    isSelected?: boolean;
    onSelect?: () => void;
    selectedItemId?: string | null;
    onItemSelect?: (itemId: string) => void;
}
declare const EstimateAccordionItem: React.FC<EstimateAccordionItemProps>;
export default EstimateAccordionItem;
