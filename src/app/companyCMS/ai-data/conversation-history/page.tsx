import AiChatHistoryPage from '@/app/superAdmin/aiData/conversationHistory/page';

// Company CMS에서도 같은 AiChatHistoryPage 사용 (URL 기반 회사 코드 자동 추출)
export default function CompanyCMSConversationHistoryPage() {
  return <AiChatHistoryPage />;
}
