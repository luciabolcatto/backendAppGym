import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export type EntityUploadOptions = {
  entity: string; // nombre de la entidad, p.ej. 'actividad'
  idParam?: string; // nombre del parámetro en la ruta, por defecto 'id'
  uploadsRoot?: string; // raíz de uploads relativa al cwd, por defecto 'public/uploads'
  fileFilter?: (req: Request, file: any, cb: (error: Error | null, acceptFile?: boolean) => void) => void; // opcional
  limits?: multer.Options['limits']; // límites de tamaño/cantidad
};

export function createEntityImageUpload(opts: EntityUploadOptions) {
  const { entity, idParam = 'id', uploadsRoot = path.join('public', 'uploads'), fileFilter, limits } = opts;

  const storage = multer.diskStorage({
    destination(req: Request, file: any, cb: (error: Error | null, destination: string) => void) {
      const id = (req as any).params?.[idParam] as string | undefined;
      if (!id) return cb(new Error(`Missing ${entity} ${idParam} in params`), '');
      const uploadDir = path.join(process.cwd(), uploadsRoot, entity, id);
      try {
        ensureDir(uploadDir);
        cb(null, uploadDir);
      } catch (err: any) {
        cb(err, '');
      }
    },
    filename(req: Request, file: any, cb: (error: Error | null, filename: string) => void) {
      const ext = (path.extname(file.originalname) || '').toLowerCase();
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]+/gi, '_');
      const name = `${Date.now()}_${base}${ext}`;
      cb(null, name);
    },
  });

  return multer({ storage, fileFilter, limits });
}

// Helper para construir la URL pública que sirve Express
export function buildPublicImagePath(entity: string, id: string, filename: string, publicBase = '/public/uploads') {
  const cleanEntity = entity.replace(/[^a-z0-9_-]+/gi, '_');
  return `${publicBase}/${cleanEntity}/${id}/${filename}`;
}
