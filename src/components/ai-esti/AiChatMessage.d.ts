import React from 'react';
import { ChatDictionary } from '@/app/ai/components/StepData';
/**
 * AiChatMessage 컴포넌트
 *
 * 이 컴포넌트는 채팅 메시지를 표시하는 역할을 합니다.
 * 사용자와 AI의 메시지를 구분하여 다른 스타일로 표시하며,
 * AI가 생성한 견적서를 테이블 형태로 표시합니다.
 */
export interface InvoiceFeatureItem {
    id: string;
    feature: string;
    description: string;
    amount: number | string;
    duration?: string;
    category?: string;
    pages?: number | string;
    menu?: string;
    note?: string;
}
interface InvoiceGroup {
    category: string;
    items: InvoiceFeatureItem[];
}
interface InvoiceTotal {
    amount: number;
    duration?: number;
    pages?: number;
    totalConvertedDisplay?: string;
}
export interface InvoiceDataType {
    project: string;
    invoiceGroup: InvoiceGroup[];
    total: InvoiceTotal;
}
export interface Message {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    imageUrl?: string;
    fileType?: string;
    invoiceData?: InvoiceDataType;
}
interface MessageProps extends Omit<Message, 'id'> {
    onActionClick: (action: string, data?: {
        featureId?: string;
    }) => void;
    calculatedTotalAmount?: number;
    calculatedTotalDuration?: number;
    calculatedTotalPages?: number;
    currentItems?: Array<InvoiceDataType['invoiceGroup'][number]['items'][number] & {
        isDeleted: boolean;
    }>;
    lang: string;
}
interface PrintableInvoiceProps {
    invoiceData: InvoiceDataType;
    invoiceDetailsForPdf: {
        items: Array<InvoiceDataType['invoiceGroup'][number]['items'][number] & {
            isDeleted: boolean;
        }>;
        currentTotal: number;
        currentTotalDuration: number;
        currentTotalPages: number;
    };
    t: ChatDictionary;
    countryCode: string;
    lang: string;
}
export declare const PrintableInvoice: React.FC<PrintableInvoiceProps>;
/**
 * AiChatMessage 컴포넌트 함수
 */
export declare function AiChatMessage({ sender, text, imageUrl, fileType, onActionClick, invoiceData, calculatedTotalAmount, calculatedTotalDuration, calculatedTotalPages, currentItems, lang, }: MessageProps): import("react/jsx-runtime").JSX.Element;
export {};
