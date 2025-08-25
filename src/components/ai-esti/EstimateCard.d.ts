import React from 'react';
import { ProjectEstimate } from '@/app/ai-estimate/types/projectEstimate';
interface EstimateCardProps {
    estimate: ProjectEstimate;
}
declare const EstimateCard: React.FC<EstimateCardProps>;
export default EstimateCard;
