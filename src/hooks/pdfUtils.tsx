// pdf.ts (발췌)
import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { devLog } from '@/utils/devLogger'

// 공통: AI 전문 생성 유틸 — 아래 3) 참고
import { buildFullEstimateData } from '@/hooks/buildFullEstimateData';
import { extractInvoiceJSON } from './estimate';
import { calculateTotalAmount } from '@/utils/estimateCalculator';

type PDFResult =
  | { blobUrl: string; pdfBlob: Blob } // 미리보기용
  | any;                               // 서버 응답

export async function generatePDF(
  estimate: any,
  options: {
    forPreview?: boolean;
    sessionId?: string | null;
    title?: string;
    pdfUuid?: string;     // 미리보기 파일명에만 사용
    userId?: string;
    estimateId?: string;  // ✅ 업데이트면 전달
    success?: (msg: string) => void;
    error?: (msg: string) => void;
    content?: string;     // AI 메시지 전체 텍스트
  } = {}
): Promise<PDFResult | null> {
  const {
    forPreview = false,
    sessionId,
    title,
    pdfUuid,
    userId,
    estimateId,
    success,
    error,
  } = options;

  try {
    if (!forPreview) {
      // ✅ 업로드 모드: PDF 생성 SKIP, 서버엔 data만 전송
      if (!sessionId) throw new Error('세션 ID가 없습니다.');
      if (!userId) throw new Error('사용자 ID가 없습니다.');

      // AI 전문(텍스트 + <script id="invoiceData">JSON</script>)을 문자열로 구성
      const data = buildFullEstimateData(options.content || estimate);

      // 실제 기능들을 계산한 총 금액 계산 (삭제된 기능 제외)
      const totalAmount = calculateTotalAmount(estimate);

      const res = await uploadEstimatePdf(
        sessionId,
        title || '견적서',
        userId,
        data,
        estimateId, // 업데이트면 전달
        undefined, // userInfo
        totalAmount // 총 금액
      );

      if (res?.statusCode === 200) {
        success?.(estimateId ? '견적서가 업데이트되었습니다.' : '견적서가 생성되었습니다.');
        return res;
      }
      throw new Error(res?.error?.customMessage || '업로드 실패');
    }

    // ✅ 미리보기 모드: 여기서만 PDF 생성
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const root = document.createElement('div');
    root.style.width = '210mm'; // A4 너비
    root.style.backgroundColor = 'white';
    root.style.padding = '10mm 10mm'; // 상하 10mm(원래 20mm에서 줄임), 좌우 10mm 패딩
    root.style.boxSizing = 'border-box';
    tempDiv.appendChild(root);

  const { createRoot } = await import('react-dom/client');
  const reactRoot = createRoot(root);
  const { PrintableInvoice } = await import('@/components/ai-esti/PrintableInvoice');
  
  // 비회원 정보가 있다면 estimate에 반영
  const guestInfo = sessionStorage.getItem('guestInfo');
  if (guestInfo) {
    const { name, email } = JSON.parse(guestInfo);
    if (estimate.customer) {
      estimate.customer.name = name || estimate.customer.name;
      estimate.customer.email = email || estimate.customer.email;
    } else {
      estimate.customer = { name, email };
    }
  }
  
  reactRoot.render(<PrintableInvoice estimate={estimate} />);    await new Promise((r) => setTimeout(r, 500)); // 더 충분한 렌더링 시간

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // 페이지별로 분할하여 캡처
    const pageHeight = 277; // A4 높이에서 패딩 제외 (297mm - 20mm, 원래 257에서 증가)
    const totalHeight = root.scrollHeight;
    const scale = 2; // 고해상도를 위한 스케일

    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentY = 0;
    let pageNumber = 0;

    while (currentY < totalHeight) {
      if (pageNumber > 0) {
        pdf.addPage();
      }

      // 현재 페이지 영역만 캡처
      const canvas = await html2canvas(root, {
        scale: scale,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        backgroundColor: 'white',
        y: currentY,
        height: Math.min(pageHeight * (96 / 25.4), totalHeight - currentY), // mm를 px로 변환
        scrollX: 0,
        scrollY: currentY
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgWidth = 190; // 좌우 10mm 패딩 적용 (210mm - 20mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 5mm 패딩을 적용하여 왼쪽으로 5px 이동, 위쪽 패딩도 줄임
      pdf.addImage(imgData, 'JPEG', 5, 10, imgWidth, imgHeight);

      currentY += pageHeight * (96 / 25.4); // 다음 페이지 시작점
      pageNumber++;
    }

    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    reactRoot.unmount();
    document.body.removeChild(tempDiv);

    return { blobUrl, pdfBlob };
  } catch (e) {
    console.error(e);
    error?.('처리 중 오류가 발생했습니다.');
    return null;
  }
}

//위에거 안쓰고 이것으로 로직변경 서버에서 견적서 text 받아와서 pdf 보여줌
export async function previewPdfFromServerData(html: string) {
  devLog("html",html)
  const estimateJson = extractInvoiceJSON(html);
  if (!estimateJson) throw new Error('invoiceData가 없습니다.');

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  const root = document.createElement('div');
  root.style.width = '210mm'; // A4 너비
  root.style.backgroundColor = 'white';
  root.style.padding = '10mm 10mm'; // 상하 10mm(원래 20mm에서 줄임), 좌우 10mm 패딩
  root.style.boxSizing = 'border-box';
  tempDiv.appendChild(root);

  const { createRoot } = await import('react-dom/client');
  const reactRoot = createRoot(root);
  const { PrintableInvoice } = await import('@/components/ai-esti/PrintableInvoice');

  // 비회원 정보가 있다면 estimateJson에 반영
  const guestInfo = sessionStorage.getItem('guestInfo');
  if (guestInfo) {
    const { name, email } = JSON.parse(guestInfo);
    if (estimateJson.customer) {
      estimateJson.customer.name = name || estimateJson.customer.name;
      estimateJson.customer.email = email || estimateJson.customer.email;
    } else {
      estimateJson.customer = { name, email };
    }
  }
  
  // PrintableInvoice가 estimate 형태를 받는다고 가정
  reactRoot.render(<PrintableInvoice estimate={estimateJson} />);

  await new Promise((r) => setTimeout(r, 500)); // 더 충분한 렌더링 시간

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  // 페이지별로 분할하여 캡처
  const pageHeight = 277; // A4 높이에서 패딩 제외 (297mm - 20mm, 원래 257에서 증가)
  const totalHeight = root.scrollHeight;
  const scale = 2; // 고해상도를 위한 스케일

  const pdf = new jsPDF('p', 'mm', 'a4');
  let currentY = 0;
  let pageNumber = 0;

  while (currentY < totalHeight) {
    if (pageNumber > 0) {
      pdf.addPage();
    }

    // 현재 페이지 영역만 캡처
    const canvas = await html2canvas(root, {
      scale: scale,
      useCORS: true,
      logging: false,
      imageTimeout: 0,
      backgroundColor: 'white',
      y: currentY,
      height: Math.min(pageHeight * (96 / 25.4), totalHeight - currentY), // mm를 px로 변환
      scrollX: 0,
      scrollY: currentY
    });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgWidth = 190; // 좌우 10mm 패딩 적용 (210mm - 20mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 5mm 패딩을 적용하여 왼쪽으로 5px 이동, 위쪽 패딩도 줄임
      pdf.addImage(imgData, 'JPEG', 5, 10, imgWidth, imgHeight);    currentY += pageHeight * (96 / 25.4); // 다음 페이지 시작점
    pageNumber++;
  }

  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  reactRoot.unmount();
  document.body.removeChild(tempDiv);

  return { blobUrl, pdfBlob };
}

// 서버 응답 데이터로 PDF 생성 후 바로 다운로드
export async function downloadPdfFromServerData(html: string, filename: string = '견적서') {
  try {
    devLog("다운로드용 PDF 생성 시작", html);
    const estimateJson = extractInvoiceJSON(html);
    if (!estimateJson) throw new Error('invoiceData가 없습니다.');

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const root = document.createElement('div');
    root.style.width = '210mm'; // A4 너비
    root.style.backgroundColor = 'white';
    root.style.padding = '10mm 10mm'; // 상하 10mm, 좌우 10mm 패딩
    root.style.boxSizing = 'border-box';
    tempDiv.appendChild(root);

    const { createRoot } = await import('react-dom/client');
    const reactRoot = createRoot(root);
    const { PrintableInvoice } = await import('@/components/ai-esti/PrintableInvoice');

    // 비회원 정보가 있다면 estimateJson에 반영
    const guestInfo = sessionStorage.getItem('guestInfo');
    if (guestInfo) {
      const { name, email } = JSON.parse(guestInfo);
      if (estimateJson.customer) {
        estimateJson.customer.name = name || estimateJson.customer.name;
        estimateJson.customer.email = email || estimateJson.customer.email;
      } else {
        estimateJson.customer = { name, email };
      }
    }
    
    reactRoot.render(<PrintableInvoice estimate={estimateJson} />);
    await new Promise((r) => setTimeout(r, 500)); // 렌더링 대기

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    // 페이지별로 분할하여 캡처
    const pageHeight = 277; // A4 높이에서 패딩 제외
    const totalHeight = root.scrollHeight;
    const scale = 2; // 고해상도를 위한 스케일

    const pdf = new jsPDF('p', 'mm', 'a4');
    let currentY = 0;
    let pageNumber = 0;

    while (currentY < totalHeight) {
      if (pageNumber > 0) {
        pdf.addPage();
      }

      // 현재 페이지 영역만 캡처
      const canvas = await html2canvas(root, {
        scale: scale,
        useCORS: true,
        logging: false,
        imageTimeout: 0,
        backgroundColor: 'white',
        y: currentY,
        height: Math.min(pageHeight * (96 / 25.4), totalHeight - currentY), // mm를 px로 변환
        scrollX: 0,
        scrollY: currentY
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const imgWidth = 190; // 좌우 10mm 패딩 적용 (210mm - 20mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // 5mm 패딩을 적용하여 왼쪽으로 5px 이동, 위쪽 패딩도 줄임
      pdf.addImage(imgData, 'JPEG', 5, 10, imgWidth, imgHeight);
      
      currentY += pageHeight * (96 / 25.4); // 다음 페이지 시작점
      pageNumber++;
    }

    // PDF 다운로드
    const pdfBlob = pdf.output('blob');
    
    // 모든 환경에서 파일 다운로드로 통일
    const link = document.createElement('a');
    const blobUrl = URL.createObjectURL(pdfBlob);
    link.href = blobUrl;
    link.download = `${filename}.pdf`;
    
    // 임시로 DOM에 추가 후 클릭
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 메모리 정리
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 1000);

    reactRoot.unmount();
    document.body.removeChild(tempDiv);

    devLog("PDF 다운로드 완료");
    return true;
  } catch (error) {
    console.error('PDF 다운로드 실패:', error);
    throw error;
  }
}


// 하위호환: 업로드(서버 저장) 용도로 호출
export async function generateAndUploadPdf(
  estimate: any,
  sessionId: string | null,
  title: string,
  _pdfUuid: string,   // 더 이상 서버엔 안 보냄
  userId: string,
  success: (msg: string) => void,
  error: (msg: string) => void,
  estimateId?: string, // ✅ 업데이트면 넘겨주기
  content?: string     // AI 메시지 전체 텍스트
) {
  return generatePDF(estimate, {
    forPreview: false,
    sessionId,
    title,
    userId,
    estimateId,
    success,
    error,
    content,
  });
}
