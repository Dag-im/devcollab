import * as path from 'path';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/zip',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.docx',
  '.doc',
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.txt',
  '.zip',
]);

const SIZE_LIMITS: Record<string, number> = {
  'image/jpeg': 10 * 1024 * 1024, // 10MB
  'image/png': 10 * 1024 * 1024,
  'image/gif': 10 * 1024 * 1024,
  'image/webp': 10 * 1024 * 1024,
  default: 50 * 1024 * 1024, // 50MB for documents
};

export function validateFile(file: Express.Multer.File): string | null {
  const ext = path.extname(file.originalname).toLowerCase();
  const limit = SIZE_LIMITS[file.mimetype] ?? SIZE_LIMITS.default;

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return `File type ${file.mimetype} is not allowed`;
  }
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return `File extension ${ext} is not allowed`;
  }
  if (file.size > limit) {
    return `File size exceeds limit of ${limit / 1024 / 1024}MB`;
  }
  return null; // valid
}
