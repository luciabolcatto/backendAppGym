import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const actividadStorage = multer.diskStorage({
  destination(req: Request, file: any, cb: (error: Error | null, destination: string) => void) {
    const id = (req as any).params?.id as string | undefined;
    if (!id) return cb(new Error('Missing actividad id in params'), '');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'actividad', id);
    try {
      ensureDir(uploadDir);
      cb(null, uploadDir);
    } catch (err: any) {
      cb(err, '');
    }
  },
  filename(req: Request, file: any, cb: (error: Error | null, filename: string) => void) {
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]+/gi, '_');
    const name = `${Date.now()}_${base}${ext.toLowerCase()}`;
    cb(null, name);
  },
});

export const actividadImageUpload = multer({ storage: actividadStorage });
