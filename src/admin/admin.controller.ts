import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export function adminLogin(req: Request, res: Response) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Contraseña requerida" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { role: "admin" },
      process.env.ADMIN_SECRET!,
      { expiresIn: "2h" }
    );
    return res.status(200).json({ token });
  }

  return res.status(401).json({ message: "Contraseña incorrecta" });
}