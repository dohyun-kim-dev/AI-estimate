import React from 'react';
interface AiResponseMessageProps {
    profileImage?: string;
    name?: string;
    content: string | React.ReactNode;
    className?: string;
    isLoading?: boolean;
}
declare const AiResponseMessage: React.FC<AiResponseMessageProps>;
export default AiResponseMessage;
