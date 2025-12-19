/**
 * File helper utilities
 */

/**
 * Get file type from MIME type
 * @param {string} mimeType - The MIME type from file.type
 * @returns {'pdf' | 'docx' | 'txt'} - Normalized file type
 */
export const getFileTypeFromMime = (mimeType) => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
  return 'txt';
};

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is supported
 */
export const isValidFileType = (file) => {
  const validTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return validTypes.includes(file.type);
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
