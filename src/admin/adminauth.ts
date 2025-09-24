import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Acceso denegado. Token no proporcionado." });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET!);
    (req as any).admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: "Token inválido de admin." });
  }
}