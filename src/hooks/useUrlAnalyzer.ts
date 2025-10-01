// src/hooks/useUrlAnalyzer.ts
// URL 분석 관련 유틸리티 함수들
import { devLog } from '@/utils/devLogger'

// URL 감지 및 처리 유틸리티 함수
export const detectUrls = (text: string): string[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// URL을 짧게 표시하는 함수
export const shortenUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    return `${domain}${urlObj.pathname !== '/' ? urlObj.pathname : ''}`;
  } catch {
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
};

// 빠른 제목 추출
export const extractTitle = (html: string): string => {
  const patterns = [
    /<title[^>]*>([^<]+)<\/title>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["'][^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 100); // 100자 제한
    }
  }
  return '';
};

// 빠른 설명 추출
export const extractDescription = (html: string): string => {
  const patterns = [
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 200); // 200자 제한
    }
  }
  return '';
};

// 검색 기반 정보 제공 함수 (CORS 오류 시 폴백)
const getSearchBasedInfo = async (url: string): Promise<{ title: string; content: string; error?: string }> => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    const path = urlObj.pathname.replace(/^\//, ''); // 선행 슬래시 제거

    // 도메인 기반 기본 정보 생성
    let title = `${domain} 웹사이트`;
    let content = '';

    // 주요 사이트별 특수 처리
    if (domain === 'naver.com') {
      title = '네이버';
      content = '네이버는 대한민국의 대표적인 포털 사이트입니다. 검색, 뉴스, 메일, 카페 등의 서비스를 제공합니다.';
    } else if (domain === 'google.com') {
      title = 'Google';
      content = 'Google은 세계적인 검색 엔진과 다양한 온라인 서비스를 제공하는 미국의 기업입니다.';
    } else if (domain === 'youtube.com') {
      title = 'YouTube';
      content = 'YouTube는 구글이 운영하는 세계 최대의 동영상 공유 플랫폼입니다.';
    } else if (domain === 'github.com') {
      title = 'GitHub';
      content = 'GitHub은 소프트웨어 개발을 위한 코드 호스팅 플랫폼입니다. Git 버전 관리 시스템을 기반으로 합니다.';
    } else if (domain.includes('blog') || domain.includes('tistory') || domain.includes('velog')) {
      title = `${domain} 블로그`;
      content = '개인 또는 단체가 운영하는 블로그 사이트입니다. 다양한 주제의 글과 정보를 공유합니다.';
    } else if (domain.includes('news') || domain.includes('mk.co.kr') || domain.includes('joongang')) {
      title = `${domain} 뉴스`;
      content = '뉴스 미디어 사이트입니다. 최신 뉴스와 기사를 제공합니다.';
    } else {
      // 일반적인 도메인 기반 추측
      if (path) {
        content = `${domain}의 ${path} 페이지입니다.`;
      } else {
        content = `${domain}은 다양한 웹 서비스를 제공하는 사이트입니다.`;
      }
    }

    return {
      title,
      content: content + ' (CORS 정책으로 직접 분석이 제한되어 기본 정보만 제공합니다)',
      error: 'CORS_RESTRICTED'
    };

  } catch (error) {
    // URL 파싱 실패 시 기본 정보
    return {
      title: '알 수 없는 웹사이트',
      content: 'URL을 분석할 수 없어 기본 정보만 제공합니다.',
      error: 'URL_PARSE_ERROR'
    };
  }
};

// URL에서 콘텐츠를 가져오는 함수 (최적화된 버전 - 빠른 메타데이터 추출)
export const fetchUrlContent = async (url: string): Promise<{ title: string; content: string; error?: string }> => {
  try {
    // 직접 fetch 시도 (속도 우선)
    let response;
    let usedProxy = false;

    // CORS가 덜 엄격한 사이트들 체크
    const corsFriendlySites = ['github.com', 'stackoverflow.com', 'medium.com', 'dev.to', 'velog.io'];
    const urlObj = new URL(url);
    const isCorsFriendly = corsFriendlySites.some(site => urlObj.hostname.includes(site));

    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Estimator/1.0)',
        }
      });
    } catch (corsError) {
      devLog('CORS 오류 감지:', url);

      // CORS 친화적인 사이트가 아니면 바로 검색 기반 정보 제공
      if (!isCorsFriendly) {
        devLog('CORS 제한 사이트, 검색 기반 정보로 대체');
        return await getSearchBasedInfo(url);
      }

      // CORS 친화적인 사이트라도 실패하면 프록시 시도
      const proxies = [
        `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        `https://cors-anywhere.herokuapp.com/${url}`,
        `https://thingproxy.freeboard.io/fetch/${url}`
      ];

      for (const proxyUrl of proxies) {
        try {
          devLog('프록시 시도:', proxyUrl.split('/')[2]);
          const proxyResponse = await fetch(proxyUrl);

          if (proxyResponse.ok) {
            let responseData;
            try {
              // allorigins.win은 JSON 응답
              if (proxyUrl.includes('allorigins.win')) {
                const proxyData = await proxyResponse.json();
                responseData = proxyData.contents;
              } else {
                // 다른 프록시는 HTML 직접 응답
                responseData = await proxyResponse.text();
              }

              response = {
                ok: true,
                text: () => Promise.resolve(responseData)
              } as any;
              usedProxy = true;
              devLog('프록시 사용 성공:', proxyUrl.split('/')[2]);
              break; // 성공하면 루프 종료
            } catch (parseError) {
              console.warn('프록시 응답 파싱 실패:', parseError);
              continue; // 다음 프록시 시도
            }
          }
        } catch (proxyError) {
          console.warn('프록시 실패:', proxyUrl.split('/')[2], proxyError);
          continue; // 다음 프록시 시도
        }
      }

      // 모든 프록시가 실패하면 검색 기반 정보로 대체
      if (!usedProxy) {
        console.warn('모든 프록시 실패, 검색 기반 정보로 대체');
        return await getSearchBasedInfo(url);
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();

    // 초고속 메타데이터 추출
    const title = extractTitle(html);
    const description = extractDescription(html);
    const keywords = extractKeywords(html);

    // 최소한의 정보만 포함한 요약
    const summary = [title, description, keywords.slice(0, 3).join(', ')]
      .filter(Boolean)
      .join(' | ')
      .substring(0, 500);

    return {
      title: title || `${new URL(url).hostname} 웹사이트`,
      content: summary || '기본 정보 추출됨'
    };

  } catch (error) {
    console.error('URL 분석 실패:', error);
    // 최종 폴백: 검색 기반 정보
    return await getSearchBasedInfo(url);
  }
};

// URL 분석을 수행하는 메인 함수 (타임아웃 및 부분 결과 처리)
export const analyzeUrls = async (
  urls: string[],
  onProgress?: (progress: { completed: number; total: number; currentUrl?: string }) => void
): Promise<{
  results: Array<{ url: string; title: string; content: string; success: boolean }>;
  summary: string;
  hasPartialResults: boolean;
}> => {
  const results: Array<{ url: string; title: string; content: string; success: boolean }> = [];
  let completed = 0;

  // 동적 타임아웃 설정: URL당 8초 + 2초 여유 (참고용)
  const individualTimeout = 8000; // 개별 URL당 8초
  const totalTimeout = Math.max(urls.length * individualTimeout + 2000, 12000); // 최소 12초

  // 개별 URL별 타임아웃으로 빠른 분석 우선 처리
  const urlPromises = urls.map(async (url, index) => {
    try {
      onProgress?.({ completed, total: urls.length, currentUrl: shortenUrl(url) });

      // 개별 타임아웃 설정
      const individualController = new AbortController();
      const individualTimeoutId = setTimeout(() => {
        individualController.abort();
      }, individualTimeout);

      // 타임아웃이 있는 fetchUrlContent 호출
      const contentPromise = fetchUrlContent(url);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('개별 URL 분석 시간 초과')), individualTimeout);
      });

      const content = await Promise.race([contentPromise, timeoutPromise]);

      clearTimeout(individualTimeoutId);
      completed++;
      onProgress?.({ completed, total: urls.length });

      return { url, ...content, success: true };

    } catch (urlError) {
      console.warn(`URL ${index + 1} 분석 실패:`, urlError);
      completed++;
      onProgress?.({ completed, total: urls.length });

      return {
        url,
        title: '분석 실패',
        content: `빠른 분석에 실패했습니다.`,
        success: false
      };
    }
  });

  try {
    // Promise.allSettled를 사용해서 모든 URL 분석이 완료될 때까지 기다림
    // 개별 타임아웃이 적용되어 있으므로 전체 타임아웃은 개별 타임아웃의 합 + 여유 시간
    const settledResults = await Promise.allSettled(urlPromises);

    // 성공/실패 결과를 모두 처리
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.warn(`URL ${index + 1} 분석 실패:`, result.reason);
        results.push({
          url: urls[index],
          title: '분석 실패',
          content: `빠른 분석에 실패했습니다.`,
          success: false
        });
      }
    });
  } catch (error) {
    console.warn('전체 분석 중 예기치 않은 오류:', error);
  }

  // 성공한 결과만 필터링
  const successfulResults = results.filter(result => result.success);

  // AI용 요약 생성
  let summary = '';
  if (successfulResults.length > 0) {
    summary = successfulResults.map(({ url, title, content }) =>
      `[웹사이트 분석: ${title}]\nURL: ${url}\n내용: ${content}`
    ).join('\n\n');
  }

  return {
    results,
    summary,
    hasPartialResults: successfulResults.length > 0 && successfulResults.length < urls.length
  };
};

// 빠른 키워드 추출
export const extractKeywords = (html: string): string[] => {
  const keywords = [];

  // 메타 키워드
  const metaKeywords = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (metaKeywords && metaKeywords[1]) {
    keywords.push(...metaKeywords[1].split(',').map(k => k.trim()).slice(0, 3));
  }

  // 헤더 태그들 (빠른 추출)
  const headers = html.match(/<h[1-2][^>]*>([^<]+)<\/h[1-2]>/gi);
  if (headers) {
    keywords.push(...headers.map(h => h.replace(/<[^>]+>/g, '').trim()).slice(0, 2));
  }

  return keywords.slice(0, 5); // 최대 5개 키워드
};
