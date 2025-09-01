import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableInvoice } from '@/components/ai-esti/PrintableInvoice'

// 반환 타입 정의
type PDFResult = 
  | { blobUrl: string; pdfBlob: Blob }  // 미리보기용
  | any;  // 서버 업로드용 (ApiResponse)

// 공통 PDF 생성 함수
export async function generatePDF(
  estimate: any,
  options: {
    forPreview?: boolean;
    sessionId?: string | null;
    title?: string;
    pdfUuid?: string;
    userId?: string; // 회원 ID 또는 비회원 UUID
    success?: (msg: string) => void;
    error?: (msg: string) => void;
  } = {}
): Promise<PDFResult | null> {
  const { forPreview = false, sessionId, title, pdfUuid, userId, success, error } = options;
  
  try {
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
    reactRoot.render(<PrintableInvoice estimate={estimate} />);

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(root, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      imageTimeout: 0,
      backgroundColor: null
    });
    console.log("canvas size:", canvas.width, canvas.height);

    const imgWidth = 210;
    const pageHeight = 297;
    const marginBottom = 0; // 하단 여백을 더 늘림 (40mm)
    const effectivePageHeight = pageHeight - marginBottom; // 실제 사용 가능한 페이지 높이
    const imgHeight = canvas.height * imgWidth / canvas.width;
    console.log("calculated sizes:", { imgWidth, imgHeight, pageHeight, effectivePageHeight });

    const pdf = new jsPDF('p', 'mm');

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    console.log("imageData prefix:", imageData.substring(0, 30));

    pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= effectivePageHeight; // 여백을 고려한 페이지 높이 사용
    while (heightLeft >= 0) {
      position = -(effectivePageHeight * pageNumber);
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= effectivePageHeight; // 여백을 고려한 페이지 높이 사용
      pageNumber++;
    }

    const pdfBlob = pdf.output('blob');
    console.log("PDF Blob 생성됨:", pdfBlob);

    // 미리보기용인 경우 blob URL 반환
    if (forPreview) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      
      // React root 정리
      reactRoot.unmount();
      document.body.removeChild(tempDiv);
      
      return { blobUrl, pdfBlob };
    }

    // 서버 업로드용인 경우
    if (!sessionId) {
      throw new Error('세션 ID가 없어 PDF를 업로드할 수 없습니다.');
    }

    const pdfFileName = `${pdfUuid}.pdf`;
    console.log("PDF File Name:", pdfFileName);
    const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
    
    if (!userId) {
      throw new Error('사용자 ID가 없어 PDF를 업로드할 수 없습니다.');
    }

    const uploadResponse = await uploadEstimatePdf(sessionId, title || '견적서', pdfFile, userId);

    if (uploadResponse && uploadResponse.statusCode === 200) {
      success?.('PDF가 성공적으로 업로드되었습니다.');
    } else {
      throw new Error(uploadResponse?.error?.message || 'PDF 업로드에 실패했습니다.');
    }
    
    reactRoot.unmount();
    document.body.removeChild(tempDiv);

    return uploadResponse;

  } catch (err) {
    console.error('PDF 생성 중 오류:', err);
    error?.('PDF 생성에 실패했습니다.');
    return null;
  }
}

// 기존 함수명 유지 (하위 호환성)
export async function generateAndUploadPdf(
  estimate: any,
  sessionId: string | null,
  title: string,
  pdfUuid: string,
  userId: string, // 회원 ID 또는 비회원 UUID
  success: (msg: string) => void,
  error: (msg: string) => void
) {
  return generatePDF(estimate, {
    forPreview: false,
    sessionId,
    title,
    pdfUuid,
    userId,
    success,
    error
  });
}