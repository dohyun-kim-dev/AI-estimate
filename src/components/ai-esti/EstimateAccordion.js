import { jsx as _jsx } from "react/jsx-runtime";
// src/app/ai-estimate/components/EstimateAccordion.tsx
import { useState } from 'react';
import styled from 'styled-components';
import EstimateAccordionItem from './EstimateAccordionItem';
const AccordionWrapper = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const EstimateAccordion = ({ data, onItemClick }) => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubItem, setSelectedSubItem] = useState(null);
    const handleSubItemSelect = (categoryName, subItemId) => {
        setSelectedCategory(categoryName);
        setSelectedSubItem(subItemId);
    };
    return (_jsx(AccordionWrapper, { children: data.categories.map((category, index) => (_jsx("div", { children: _jsx(EstimateAccordionItem, { name: category.category_name, depth: 1, isSelected: selectedCategory === category.category_name, onSelect: () => {
                    if (selectedCategory === category.category_name) {
                        setSelectedCategory(null);
                        setSelectedSubItem(null);
                    }
                    else {
                        setSelectedCategory(category.category_name);
                    }
                }, items: category.sub_categories.map(sub => ({
                    name: sub.sub_category_name,
                    price: sub.items.reduce((sum, item) => sum + parseInt(item.price.replace(/,/g, '')), 0).toLocaleString(),
                    description: '',
                    items: sub.items.map(item => ({
                        name: item.name,
                        price: item.price,
                        description: item.description
                    }))
                })), selectedItemId: selectedSubItem, onItemSelect: (itemId) => handleSubItemSelect(category.category_name, itemId), children: category.sub_categories.map((subCategory, subIndex) => (_jsx(EstimateAccordionItem, { name: subCategory.sub_category_name, depth: 2, isSelected: selectedSubItem === `${category.category_name}-${subIndex}`, onSelect: () => handleSubItemSelect(category.category_name, `${category.category_name}-${subIndex}`), items: subCategory.items.map(item => ({
                        name: item.name,
                        price: item.price,
                        description: item.description
                    })), onItemClick: onItemClick }, subIndex))) }) }, index))) }));
};
export default EstimateAccordion;
