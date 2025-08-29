import { uploadEstimatePdf } from '@/lib/api/user/userApi';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PrintableInvoice } from '@/components/ai-esti/PrintableInvoice'

export async function generateAndUploadPdf(estimate: any, sessionId: string | null, title: string, success: (msg: string) => void, error: (msg: string) => void) {
  if (!sessionId) {
    console.error('세션 ID가 없어 PDF를 업로드할 수 없습니다.');
    error('PDF 업로드에 실패했습니다: 채팅 세션 ID가 없습니다.');
    return;
  }
  
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
    const imgHeight = canvas.height * imgWidth / canvas.width;
    console.log("calculated sizes:", { imgWidth, imgHeight, pageHeight });

    const pdf = new jsPDF('p', 'mm');

    let heightLeft = imgHeight;
    let position = 0;
    let pageNumber = 1;

    const imageData = canvas.toDataURL('image/jpeg', 0.7);
    console.log("imageData prefix:", imageData.substring(0, 30));

    pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft >= 0) {
      position = -(pageHeight * pageNumber);
      pdf.addPage();
      pdf.addImage(imageData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      pageNumber++;
    }

    const pdfBlob = pdf.output('blob');
    console.log("PDF Blob 생성됨:", pdfBlob);
    
    const safeTitle = encodeURIComponent(title);
    const pdfFile = new File([pdfBlob], `${safeTitle}.pdf`, { type: 'application/pdf' });
    console.log("인코딩된 PDF File 객체 생성됨:", pdfFile);
    

    const uploadResponse = await uploadEstimatePdf(sessionId, title, pdfFile);

    if (uploadResponse && uploadResponse.statusCode === 200) {
      success('PDF가 성공적으로 업로드되었습니다.');
    } else {
      throw new Error(uploadResponse?.error?.message || 'PDF 업로드에 실패했습니다.');
    }
    
    reactRoot.unmount();
    document.body.removeChild(tempDiv);

  } catch (err) {
    console.error('PDF 생성 및 업로드 중 오류:', err);
    error('PDF 생성 및 업로드에 실패했습니다.');
  }
}