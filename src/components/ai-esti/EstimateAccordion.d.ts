import React from 'react';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
interface EstimateAccordionProps {
    data: ProjectEstimate;
    onItemClick: (item: any) => void;
}
declare const EstimateAccordion: React.FC<EstimateAccordionProps>;
export default EstimateAccordion;
