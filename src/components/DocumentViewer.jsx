import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import mammoth from 'mammoth';
import { highlightPII } from '../utils/piiDetector';

/**
 * DocumentViewer - Simple document viewer with PII highlights
 * Shows formatted text for all file types
 */
function DocumentViewer({ file, fileType, text, detectedPII }) {
  const [docxHtml, setDocxHtml] = useState('');
  const [loading, setLoading] = useState(false);

  // Render DOCX as HTML
  useEffect(() => {
    if (fileType === 'docx' && file) {
      renderDOCX();
    }
  }, [file, fileType]);

  const renderDOCX = useCallback(async () => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxHtml(result.value);
    } catch (error) {
      // Avoid console.error in production
      setDocxHtml(`<p style="color: red;">Error loading document: ${error.message}</p>`);
    } finally {
      setLoading(false);
    }
  }, [file]);

  // Generate highlighted HTML with sanitization
  const getHighlightedContent = useCallback(() => {
    if (!text) return '';
    if (!detectedPII || detectedPII.length === 0) {
      return formatStructuredText(text);
    }
    const highlighted = highlightPII(text, detectedPII);
    return formatStructuredText(highlighted);
  }, [text, detectedPII]);

  // Format text to preserve document structure - memoized for performance
  const formatStructuredText = useCallback((content) => {
    // Split into lines
    const lines = content.split('\n');
    let formatted = '';
    let consecutiveEmptyLines = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip excessive empty lines (max 1 br between content)
      if (!trimmed) {
        consecutiveEmptyLines++;
        if (consecutiveEmptyLines === 1) {
          formatted += '<br/>';
        }
        continue;
      }
      consecutiveEmptyLines = 0;
      
      // Check if it's a main section heading (ALL CAPS, standalone, common resume sections)
      const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
      const hasBlankBefore = (i === 0 || lines[i-1].trim() === '');
      const hasBlankAfter = (i === lines.length-1 || lines[i+1].trim() === '');
      const isStandalone = hasBlankBefore && hasBlankAfter;
      
      // Common resume section keywords
      const isResumeSection = /^(PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE|WORK EXPERIENCE|EDUCATION|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|PROJECTS|AWARDS|LANGUAGES|CONTACT|OBJECTIVE|ACHIEVEMENTS|REFERENCES)$/i.test(trimmed);
      
      // Heading must be: all caps, reasonable length (8-40 chars), standalone, and either a known section or multi-word
      const isReasonableHeading = trimmed.length >= 8 && trimmed.length <= 40;
      const hasMultipleWords = trimmed.split(/\s+/).length >= 2;
      const notNumber = !/^\d/.test(trimmed);
      
      if (isAllCaps && notNumber && isStandalone && (isResumeSection || (isReasonableHeading && hasMultipleWords))) {
        formatted += `<h2 style="font-size: 1.1em; font-weight: 700; margin: 1em 0 0.5em 0; letter-spacing: 0.5px;">${line}</h2>`;
      }
      // Check if it's a bullet point or list item
      else if (/^[•▪▫◦○●-]\s/.test(trimmed) || /^[\d]+\.\s/.test(trimmed)) {
        formatted += `<div style="margin-left: 1.5em; margin-bottom: 0.2em; text-indent: -1.5em; padding-left: 1.5em;">${line}</div>`;
      }
      // Check if it's a job title/subheading (starts with capital, has date/location pattern)
      else if (hasBlankBefore && trimmed.length < 100 && /^[A-Z]/.test(trimmed) && /[-–—]|\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(trimmed)) {
        formatted += `<h3 style="font-size: 1em; font-weight: 600; margin: 0.6em 0 0.2em 0;">${line}</h3>`;
      }
      // Short all-caps text that's NOT a heading (like "SQL", "AWS", etc.) - treat as regular text
      else if (isAllCaps && trimmed.length < 8) {
        formatted += `<p style="margin: 0.2em 0; line-height: 1.5;">${line}</p>`;
      }
      // Regular paragraph
      else {
        formatted += `<p style="margin: 0.2em 0; line-height: 1.5;">${line}</p>`;
      }
    }
    
    return formatted;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-sm font-mono">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white h-full">
      <div className="max-w-4xl mx-auto p-8 pb-20">
        {fileType === 'pdf' && (
          <div 
            className="pdf-content bg-white rounded-lg shadow-lg p-8"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#1a1a1a'
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getHighlightedContent()) }}
          />
        )}

        {fileType === 'docx' && (
          <div 
            className="docx-content bg-white rounded-lg shadow-lg p-8"
            style={{ 
              fontFamily: 'Calibri, Arial, sans-serif',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#1a1a1a'
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getHighlightedContent()) }}
          />
        )}

        {fileType === 'txt' && (
          <div 
            className="txt-content bg-white rounded-lg shadow-lg p-8"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#1a1a1a'
            }}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(getHighlightedContent()) }}
          />
        )}
      </div>

      <style>{`
        mark {
          padding: 2px 4px;
          border-radius: 3px;
          font-weight: 500;
        }

        mark[data-type="email"] {
          background-color: rgba(59, 130, 246, 0.3);
          color: rgb(30, 64, 175);
        }

        mark[data-type="phone"] {
          background-color: rgba(34, 197, 94, 0.3);
          color: rgb(21, 128, 61);
        }

        mark[data-type="name"] {
          background-color: rgba(239, 68, 68, 0.3);
          color: rgb(153, 27, 27);
        }

        mark[data-type="url"] {
          background-color: rgba(168, 85, 247, 0.3);
          color: rgb(107, 33, 168);
        }

        mark[data-type="address"] {
          background-color: rgba(249, 115, 22, 0.3);
          color: rgb(154, 52, 18);
        }

        mark[data-type="custom"] {
          background-color: rgba(236, 72, 153, 0.3);
          color: rgb(157, 23, 77);
        }

        mark[data-type="company"] {
          background-color: rgba(14, 165, 233, 0.3);
          color: rgb(7, 89, 133);
        }

        .pdf-content p,
        .docx-content p,
        .txt-content p {
          margin-bottom: 0.3em;
        }

        .pdf-content h1,
        .docx-content h1 {
          font-size: 1.8em;
          font-weight: bold;
          margin: 1.5em 0 0.5em 0;
          color: #000;
        }

        .pdf-content h2,
        .docx-content h2,
        .txt-content h2 {
          font-size: 1.1em;
          font-weight: 700;
          margin: 1.2em 0 0.4em 0;
          color: #000;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #333;
          padding-bottom: 0.2em;
        }

        .pdf-content h3,
        .docx-content h3,
        .txt-content h3 {
          font-size: 1em;
          font-weight: 600;
          margin: 0.8em 0 0.3em 0;
          color: #222;
        }
      `}</style>
    </div>
  );
}

DocumentViewer.propTypes = {
  file: PropTypes.object,
  fileType: PropTypes.oneOf(['pdf', 'docx', 'txt']),
  text: PropTypes.string.isRequired,
  detectedPII: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  })).isRequired,
};

export default DocumentViewer;
