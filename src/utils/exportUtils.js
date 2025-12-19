import { Document, Packer, Paragraph, TextRun } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Sanitize text for PDF export by replacing unsupported Unicode characters
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

// Export as TXT (Free tier)
export const exportAsTXT = (text, originalFilename = null) => {
  let link = null;
  try {
    // Generate filename from original or use default
    let filename = 'redacted-resume.txt';
    if (originalFilename) {
      const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
      filename = `${nameWithoutExt}_redacted.txt`;
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    if (link && link.parentNode) {
      document.body.removeChild(link);
    }
  }
};

// Export as DOCX (Pro tier only)
export const exportAsDOCX = async (text, originalFilename = null) => {
  let link = null;
  try {
    // Generate filename from original or use default
    let filename = 'redacted-resume.docx';
    if (originalFilename) {
      const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
      filename = `${nameWithoutExt}_redacted.docx`;
    }
    
    // Split text into paragraphs
    const paragraphs = text.split('\n').map(line => 
      new Paragraph({
        children: [new TextRun(line || ' ')],
        spacing: { after: 200 }
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  } finally {
    if (link && link.parentNode) {
      document.body.removeChild(link);
    }
  }
};

// Export as PDF (Pro tier only)
export const exportAsPDF = async (text, uploadedFile = null, piiItems = [], isPro = false, originalFilename = null) => {
  try {
    // Generate filename from original or use default
    let filename = 'redacted-resume.pdf';
    if (originalFilename) {
      const nameWithoutExt = originalFilename.replace(/\.[^/.]+$/, '');
      filename = `${nameWithoutExt}_redacted.pdf`;
    }
    
    // Sanitize text to remove unsupported Unicode characters
    const sanitizedText = sanitizeForPDF(text);
    
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    const fontSize = 11;
    const margin = 50;
    const pageWidth = 595; // A4 width in points
    const pageHeight = 842; // A4 height in points
    const maxWidth = pageWidth - 2 * margin;
    const lineHeight = fontSize * 1.2;
    
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;
    
    // Split text into lines
    const lines = sanitizedText.split('\n');
    
    for (const line of lines) {
      // Wrap long lines
      const words = line.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth > maxWidth && currentLine) {
          // Draw current line
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
      
      // Draw remaining text
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
      
      // Empty line spacing
      if (!line.trim()) {
        yPosition -= lineHeight / 2;
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    let link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

