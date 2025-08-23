interface TokenInfo {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface PromptLogInfo {
  templateId: string;
  userInput: string;
  combinedPrompt: string;
  tokenInfo?: TokenInfo;
}

// 토큰당 비용 (KRW)
const TOKEN_COSTS = {
  prompt: 0.001,     // 입력 토큰당 0.001원
  completion: 0.002  // 출력 토큰당 0.002원
};

// ANSI 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

export const logPromptInfo = (info: PromptLogInfo) => {
  console.group(`${colors.bright}${colors.cyan}🤖 AI Chat Log${colors.reset}`);
  
  // 템플릿 ID
  console.log(`${colors.yellow}Template ID:${colors.reset} ${info.templateId}`);
  
  // 사용자 입력
  console.log(`${colors.yellow}User Input:${colors.reset} ${info.userInput}`);
  
  // 결합된 프롬프트 (접었다 펼 수 있게)
  console.groupCollapsed(`${colors.yellow}Combined Prompt:${colors.reset}`);
  console.log(info.combinedPrompt);
  console.groupEnd();
  
  // 토큰 정보가 있는 경우
  if (info.tokenInfo) {
    const { promptTokens, completionTokens, totalTokens } = info.tokenInfo;
    
    // 비용 계산
    const promptCost = promptTokens * TOKEN_COSTS.prompt;
    const completionCost = completionTokens * TOKEN_COSTS.completion;
    const totalCost = promptCost + completionCost;
    
    console.group(`${colors.yellow}Token Usage & Cost:${colors.reset}`);
    console.log(`${colors.green}Prompt Tokens:${colors.reset} ${promptTokens.toLocaleString()} (₩${promptCost.toFixed(2)})`);
    console.log(`${colors.green}Completion Tokens:${colors.reset} ${completionTokens.toLocaleString()} (₩${completionCost.toFixed(2)})`);
    console.log(`${colors.green}Total Tokens:${colors.reset} ${totalTokens.toLocaleString()}`);
    console.log(`${colors.bright}${colors.green}Total Cost:${colors.reset} ₩${totalCost.toFixed(2)}`);
    console.groupEnd();
  }
  
  console.groupEnd();
};

// 토큰 수를 대략적으로 추정하는 함수
export const estimateTokens = (text: string): number => {
  // 영어 기준으로 단어 당 약 1.3 토큰
  // 한글은 글자 당 약 2~3 토큰
  const words = text.split(/\s+/).length;
  const koreanChars = (text.match(/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/g) || []).length;
  
  return Math.ceil(words * 1.3 + koreanChars * 2.5);
};
