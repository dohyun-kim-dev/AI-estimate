import React from 'react';
import { EstimateItem } from '@/app/ai-estimate/types/estimateItem';
interface DetailModalProps {
    item: EstimateItem;
    onClose: () => void;
}
declare const DetailModal: React.FC<DetailModalProps>;
export default DetailModal;
