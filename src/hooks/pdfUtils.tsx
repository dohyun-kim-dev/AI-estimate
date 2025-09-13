// pdf.ts (발췌)
import { uploadEstimatePdf } from '@/lib/api/user/userApi';

// 공통: AI 전문 생성 유틸 — 아래 3) 참고
import { buildFullEstimateData } from '@/hooks/buildFullEstimateData';
import { extractInvoiceJSON } from './estimate';

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

      const res = await uploadEstimatePdf(
        sessionId,
        title || '견적서',
        userId,
        data,
        estimateId // 업데이트면 전달
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
    root.style.width = '780px';
    root.style.backgroundColor = 'white';
    tempDiv.appendChild(root);

    const { createRoot } = await import('react-dom/client');
    const reactRoot = createRoot(root);
    const { PrintableInvoice } = await import('@/components/ai-esti/PrintableInvoice');
    reactRoot.render(<PrintableInvoice estimate={estimate} />);

    await new Promise((r) => setTimeout(r, 100));

    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');

    const canvas = await html2canvas(root, { scale: 1.5, useCORS: true, logging: false, imageTimeout: 0, backgroundColor: null });

    const imgWidth = 210;
    const pageHeight = 297;
    const marginBottom = 0;
    const effectivePageHeight = pageHeight - marginBottom;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'mm');
    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= effectivePageHeight;

    while (heightLeft >= 0) {
      position = -(effectivePageHeight * pageNumber);
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= effectivePageHeight;
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
  console.log("html",html)
  const estimateJson = extractInvoiceJSON(html);
  if (!estimateJson) throw new Error('invoiceData가 없습니다.');

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  const root = document.createElement('div');
  root.style.width = '780px';
  root.style.backgroundColor = 'white';
  tempDiv.appendChild(root);

  const { createRoot } = await import('react-dom/client');
  const reactRoot = createRoot(root);
  const { PrintableInvoice } = await import('@/components/ai-esti/PrintableInvoice');

  // PrintableInvoice가 estimate 형태를 받는다고 가정
  reactRoot.render(<PrintableInvoice estimate={estimateJson} />);

  await new Promise((r) => setTimeout(r, 100));

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(root, {
    scale: 1.5,
    useCORS: true,
    logging: false,
    imageTimeout: 0,
    backgroundColor: null,
  });

  const imgWidth = 210;
  const pageHeight = 297;
  const marginTop = 15; // 위쪽 여백
  const marginBottom = 30; // 아래쪽 여백
  const effectivePageHeight = pageHeight - marginTop - marginBottom;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm');
  let heightLeft = imgHeight;
  let position = marginTop; // 위쪽 여백부터 시작
  let pageNumber = 1;

  const imageData = canvas.toDataURL('image/jpeg', 0.7);
  pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= effectivePageHeight;

  while (heightLeft >= 0) {
    position = marginTop - (effectivePageHeight * pageNumber); // 각 페이지 위쪽 여백 유지
    pdf.addPage();
    pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= effectivePageHeight;
    pageNumber++;
  }

  const pdfBlob = pdf.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  reactRoot.unmount();
  document.body.removeChild(tempDiv);

  return { blobUrl, pdfBlob };
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
