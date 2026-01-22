import jsPDF from 'jspdf';
import { format } from 'date-fns';

const BRAND_COLOR: [number, number, number] = [33, 176, 254]; // #21B0FE

/**
 * Adds branded header to PDF for CoParrent Creations
 */
function addCreationsHeader(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Title - centered
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CoParrent Creations', pageWidth / 2, 13, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

/**
 * Adds footer with date and page info
 */
function addCreationsFooter(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, 14, pageHeight - 10);
  doc.text('coparrent.lovable.app', pageWidth - 14, pageHeight - 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

/**
 * Export coloring page to PDF with branding
 */
export async function exportColoringPagePDF(
  imageUrl: string,
  prompt: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF (letter size, portrait)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add branded header
      addCreationsHeader(doc);

      // Create image element to load the base64 data
      const img = new Image();
      img.onload = () => {
        // Calculate image dimensions to fit page with margins
        const headerHeight = 25; // mm below header
        const footerHeight = 15; // mm above footer
        const margin = 15; // side margins
        
        const maxWidth = pageWidth - (margin * 2);
        const maxHeight = pageHeight - headerHeight - footerHeight - 10;

        // Calculate aspect ratio
        const imgRatio = img.width / img.height;
        let imgWidth = maxWidth;
        let imgHeight = imgWidth / imgRatio;

        // If too tall, scale down
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = imgHeight * imgRatio;
        }

        // Center horizontally
        const x = (pageWidth - imgWidth) / 2;
        const y = headerHeight + 5;

        // Add image to PDF
        doc.addImage(imageUrl, 'PNG', x, y, imgWidth, imgHeight);

        // Add footer
        addCreationsFooter(doc);

        // Save the PDF
        const sanitizedPrompt = prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
        doc.save(`${sanitizedPrompt}-coloring-page.pdf`);
        
        resolve();
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = imageUrl;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Print coloring page with branding header
 */
export function printColoringPage(imageUrl: string, prompt: string): void {
  // Create a print-specific window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to print.');
  }

  const sanitizedPrompt = prompt.slice(0, 50);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>CoParrent Creations - ${sanitizedPrompt}</title>
      <style>
        @page {
          size: letter portrait;
          margin: 0.5in;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        .header {
          width: 100%;
          background: #21B0FE;
          color: white;
          text-align: center;
          padding: 12px 20px;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .image-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        
        img {
          max-width: 100%;
          max-height: calc(100vh - 160px);
          object-fit: contain;
        }
        
        .footer {
          width: 100%;
          text-align: center;
          color: #888;
          font-size: 10px;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        
        @media print {
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #21B0FE !important;
            color: white !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">CoParrent Creations</div>
      <div class="image-container">
        <img src="${imageUrl}" alt="Coloring page" />
      </div>
      <div class="footer">
        coparrent.lovable.app • Generated ${format(new Date(), 'MMMM d, yyyy')}
      </div>
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `);

  printWindow.document.close();
}
