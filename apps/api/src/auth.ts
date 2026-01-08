import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { getEnv } from "./env";

export type AuthRole = "USER" | "ADMIN";

export type AuthClaims = {
  sub: string;
  role: AuthRole;
};

export function signToken(claims: AuthClaims): string {
  const env = getEnv();
  return jwt.sign(claims, env.JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const token = header.slice("Bearer ".length);
  try {
    const env = getEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthClaims;
    (req as any).auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function requireRole(role: AuthRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth as AuthClaims | undefined;
    if (!auth) return res.status(401).json({ message: "Não autenticado" });
    if (auth.role !== role) return res.status(403).json({ message: "Sem permissão" });
    return next();
  };
}
