import { PrismaClient } from "../generated/prisma";
import { getEnv } from "./env";

// Inicializa PrismaClient sem adapter (Postgres)
// Mantemos validação de env para fail-fast em runtime.
getEnv();
export const db = new PrismaClient();
