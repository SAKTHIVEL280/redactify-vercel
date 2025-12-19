import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Sanitize text for PDF export by replacing unsupported Unicode characters
 * WinAnsi encoding only supports basic Latin characters
 */
function sanitizeForPDF(text) {
  if (!text) return '';
  
  // First normalize line endings (remove \r)
  let sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Then replace other unsupported characters
  sanitized = sanitized
    .replace(/→/g, '->')  // Arrow
    .replace(/←/g, '<-')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
    .replace(/—/g, '-')   // Em dash
    .replace(/–/g, '-')   // En dash
    .replace(/'/g, "'")   // Smart quotes
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/…/g, '...')  // Ellipsis
    .replace(/•/g, '*')   // Bullet
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Remove control characters except \n and \t
    .replace(/[^\x00-\xFF]/g, '?'); // Replace any other non-Latin1 characters
  
  return sanitized;
}

/**
 * Export batch of files as ZIP
 * @param {Array} files - Array of {name, redactedText} objects
 * @param {string} format - 'txt' or 'pdf'
 */
export const exportBatchAsZip = async (files, format = 'txt') => {
  if (files.length === 0) {
    throw new Error('No files to export');
  }

  const zip = new JSZip();
  const timestamp = Date.now();

  if (format === 'txt') {
    // Add each text file to ZIP
    files.forEach((file, index) => {
      const filename = `${file.name}-redacted.txt`;
      zip.file(filename, file.redactedText);
    });

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `redacted-batch-${timestamp}.zip`);
  } else if (format === 'pdf') {
    // Generate PDFs and add to ZIP
    for (const file of files) {
      const pdfBytes = await generatePDFBytes(file.redactedText);
      const filename = `${file.name}-redacted.pdf`;
      zip.file(filename, pdfBytes);
    }

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `redacted-batch-${timestamp}.zip`);
  }
};

// Helper to generate PDF bytes
async function generatePDFBytes(text) {
  // Sanitize text to remove unsupported Unicode characters
  const sanitizedText = sanitizeForPDF(text);
  
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  
  const fontSize = 11;
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;
  const maxWidth = pageWidth - 2 * margin;
  const lineHeight = fontSize * 1.2;
  
  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let yPosition = pageHeight - margin;
  
  const lines = sanitizedText.split('\n');
  
  for (const line of lines) {
    const words = line.split(' ');
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth > maxWidth && currentLine) {
        if (yPosition < margin + lineHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: timesRomanFont,
          color: rgb(0, 0, 0)
        });
        
        yPosition -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      if (yPosition < margin + lineHeight) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        yPosition = pageHeight - margin;
      }
      
      page.drawText(currentLine, {
        x: margin,
        y: yPosition,
        size: fontSize,
        font: timesRomanFont,
        color: rgb(0, 0, 0)
      });
      
      yPosition -= lineHeight;
    }
    
    if (!line.trim()) {
      yPosition -= lineHeight / 2;
    }
  }
  
  return await pdfDoc.save();
}
