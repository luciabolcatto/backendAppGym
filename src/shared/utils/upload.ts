import multer, { StorageEngine, FileFilterCallback } from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';

// Crea el directorio si no existe
export function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export type EntityUploadOptions = {
  entity: string; // nombre de la entidad, p.ej. 'actividad'
  idParam?: string; // nombre del parámetro en la ruta, por defecto 'id'
  uploadsRoot?: string; // raíz de uploads relativa al cwd, por defecto 'public/uploads'
  fileFilter?: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => void;
  limits?: multer.Options['limits'];
};

export function createEntityImageUpload(
  opts: EntityUploadOptions & { allowTemp?: boolean }
) {
  const {
    entity,
    idParam = 'id',
    uploadsRoot = path.join('public', 'uploads'),
    fileFilter,
    limits,
    allowTemp = false,
  } = opts;

  const storage: StorageEngine = multer.diskStorage({
    destination(
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) {
      let id = (req as any).params?.[idParam] as string | undefined;
      if (!id && allowTemp) {
        id = 'temp';
      }
      if (!id) return cb(new Error(`Missing ${entity} ${idParam} in params`), '');

      const uploadDir = path.join(process.cwd(), uploadsRoot, entity, id);

      try {
        ensureDir(uploadDir);
        cb(null, uploadDir);
      } catch (err) {
        cb(err as Error, '');
      }
    },
    filename(
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path
        .basename(file.originalname, ext)
        .replace(/[^a-z0-9_-]+/gi, '_');
      const name = `${Date.now()}_${base}${ext}`;
      cb(null, name);
    },
  });

  return multer({ storage, fileFilter, limits });
}

// Helper para construir la URL pública
export function buildPublicImagePath(
  entity: string,
  id: string,
  filename: string,
  publicBase = '/public/uploads'
) {
  const cleanEntity = entity.replace(/[^a-z0-9_-]+/gi, '_');
  return `${publicBase}/${cleanEntity}/${id}/${filename}`;
}