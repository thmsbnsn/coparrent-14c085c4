/**
 * CoParrent Creations Export Utility
 * 
 * Layout contract: All CoParrent Kids Hub exports MUST use this utility 
 * to ensure branding consistency. This includes PDF exports, print views,
 * and any downloadable content from Kids Hub tools.
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';

// Brand color for CoParrent Creations header
const BRAND_COLOR: [number, number, number] = [33, 176, 254]; // #21B0FE

export interface CreationsPdfOptions {
  /** Title text - defaults to 'CoParrent Creations' */
  title?: string;
  /** Optional subtitle (e.g., prompt, child name) */
  subtitle?: string;
  /** Primary image as data URL */
  imageDataUrl?: string;
  /** Optional footer note */
  footerNote?: string;
  /** Page format - defaults to 'letter' */
  pageFormat?: 'letter' | 'a4';
  /** Filename for download (without extension) */
  filename?: string;
}

export interface CreationsPrintOptions {
  /** Title text - defaults to 'CoParrent Creations' */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Image URL or data URL */
  imageUrl: string;
  /** Alt text for image */
  imageAlt?: string;
  /** Optional footer note */
  footerNote?: string;
}

/**
 * Add branded header to PDF document
 */
function addCreationsHeader(doc: jsPDF, title: string = 'CoParrent Creations', subtitle?: string): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header bar
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Title - centered
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 13, { align: 'center' });
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  let yOffset = 25;
  
  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, yOffset, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    yOffset += 8;
  }
  
  return yOffset;
}

/**
 * Add footer with date and site info
 */
function addCreationsFooter(doc: jsPDF, footerNote?: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  const dateText = `Generated: ${format(new Date(), 'MMMM d, yyyy')}`;
  const siteText = 'coparrent.lovable.app';
  
  if (footerNote) {
    doc.text(footerNote, pageWidth / 2, pageHeight - 15, { align: 'center' });
  }
  
  doc.text(dateText, 14, pageHeight - 10);
  doc.text(siteText, pageWidth - 14, pageHeight - 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

/**
 * Generate and download a branded PDF with the CoParrent Creations header.
 * 
 * Primary use case: exporting coloring pages and other Kids Hub creations.
 * Ensures consistent margins, aspect ratio preservation, and branding.
 */
export async function generateCreationsPdf(options: CreationsPdfOptions): Promise<void> {
  const {
    title = 'CoParrent Creations',
    subtitle,
    imageDataUrl,
    footerNote,
    pageFormat = 'letter',
    filename = 'coparrent-creation',
  } = options;

  return new Promise((resolve, reject) => {
    try {
      // Create new PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageFormat,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Add branded header
      const contentStartY = addCreationsHeader(doc, title, subtitle);

      // If image provided, add it
      if (imageDataUrl) {
        const img = new Image();
        img.onload = () => {
          // Calculate image dimensions to fit page with margins
          const margin = 15; // 15mm side margins (approx 0.6 inch)
          const footerHeight = 20; // Space for footer
          
          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = pageHeight - contentStartY - footerHeight - 10;

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
          const y = contentStartY + 5;

          // Add image to PDF
          doc.addImage(imageDataUrl, 'PNG', x, y, imgWidth, imgHeight);

          // Add footer
          addCreationsFooter(doc, footerNote);

          // Save the PDF
          const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '-');
          doc.save(`${sanitizedFilename}.pdf`);
          
          resolve();
        };

        img.onerror = () => {
          reject(new Error('Failed to load image for PDF export'));
        };

        img.src = imageDataUrl;
      } else {
        // No image - just save with header/footer
        addCreationsFooter(doc, footerNote);
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '-');
        doc.save(`${sanitizedFilename}.pdf`);
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Open a print-ready view with CoParrent Creations branding.
 * 
 * Opens a new window with the image and header, then triggers print dialog.
 * Uses print-specific CSS for clean margins and crisp output.
 */
export function openCreationsPrintView(options: CreationsPrintOptions): void {
  const {
    title = 'CoParrent Creations',
    subtitle,
    imageUrl,
    imageAlt = 'CoParrent creation',
    footerNote,
  } = options;

  // Create a print-specific window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups to print.');
  }

  const subtitleHtml = subtitle ? `<div class="subtitle">${subtitle}</div>` : '';
  const footerNoteHtml = footerNote ? `<div class="footer-note">${footerNote}</div>` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
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
          margin-bottom: 12px;
          border-radius: 4px;
        }
        
        .subtitle {
          text-align: center;
          color: #666;
          font-size: 12px;
          margin-bottom: 16px;
          max-width: 80%;
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
          max-height: calc(100vh - 180px);
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
        
        .footer-note {
          font-size: 9px;
          color: #999;
          margin-bottom: 4px;
        }
        
        @media print {
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: #21B0FE !important;
            color: white !important;
          }
          
          body {
            padding: 0;
          }
          
          img {
            max-height: calc(100vh - 140px);
          }
        }
      </style>
    </head>
    <body>
      <div class="header">${title}</div>
      ${subtitleHtml}
      <div class="image-container">
        <img src="${imageUrl}" alt="${imageAlt}" />
      </div>
      <div class="footer">
        ${footerNoteHtml}
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

/**
 * Download an image as PNG with standardized filename.
 * 
 * Helper function for consistent download behavior across Kids Hub tools.
 */
export function downloadCreationPng(imageDataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = imageDataUrl;
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 50);
  link.download = `${sanitizedFilename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
