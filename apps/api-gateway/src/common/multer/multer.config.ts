import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const multerConfig = {
  storage: memoryStorage(), // keep in memory, we stream to MinIO
  limits: {
    fileSize: 50 * 1024 * 1024, // hard limit — per-type limits enforced in service
    files: 5, // max 5 files per request
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    // basic MIME check at multer level — detailed validation in service
    if (!file.mimetype) {
      return cb(new BadRequestException('File has no MIME type'), false);
    }
    cb(null, true);
  },
};
