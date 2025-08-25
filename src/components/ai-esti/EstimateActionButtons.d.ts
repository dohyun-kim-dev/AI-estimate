import React from 'react';
interface EstimateActionButtonsProps {
    onConsult?: () => void;
    onAiEstimate?: () => void;
    onAiOptimize?: () => void;
}
declare const EstimateActionButtons: React.FC<EstimateActionButtonsProps>;
export default EstimateActionButtons;
