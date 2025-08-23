// src/app/ai-estimate/components/EstimateAccordion.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
import EstimateAccordionItem from './EstimateAccordionItem';

const AccordionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

interface EstimateAccordionProps {
  data: ProjectEstimate;
  onItemClick: (item: any) => void;
}

const EstimateAccordion: React.FC<EstimateAccordionProps> = ({ data, onItemClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);

  const handleSubItemSelect = (categoryName: string, subItemId: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubItem(subItemId);
  };

  return (
    <AccordionWrapper>
      {data.categories.map((category, index) => (
        <div key={index}>
          <EstimateAccordionItem
            name={category.category_name}
            depth={1}
            isSelected={selectedCategory === category.category_name}
            onSelect={() => {
              if (selectedCategory === category.category_name) {
                setSelectedCategory(null);
                setSelectedSubItem(null);
              } else {
                setSelectedCategory(category.category_name);
              }
            }}
            items={category.sub_categories.map(sub => ({
              name: sub.sub_category_name,
              price: sub.items.reduce((sum, item) => sum + parseInt(item.price.replace(/,/g, '')), 0).toLocaleString(),
              description: '',
              items: sub.items.map(item => ({
                name: item.name,
                price: item.price,
                description: item.description
              }))
            }))}
            selectedItemId={selectedSubItem}
            onItemSelect={(itemId) => handleSubItemSelect(category.category_name, itemId)}
          >
            {category.sub_categories.map((subCategory, subIndex) => (
              <EstimateAccordionItem
                key={subIndex}
                name={subCategory.sub_category_name}
                depth={2}
                isSelected={selectedSubItem === `${category.category_name}-${subIndex}`}
                onSelect={() => handleSubItemSelect(category.category_name, `${category.category_name}-${subIndex}`)}
                items={subCategory.items.map(item => ({
                  name: item.name,
                  price: item.price,
                  description: item.description
                }))}
                onItemClick={onItemClick}
              />
            ))}
          </EstimateAccordionItem>
        </div>
      ))}
    </AccordionWrapper>
  );
};

export default EstimateAccordion;