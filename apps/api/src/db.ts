import { PrismaClient } from "../generated/prisma";
import { getEnv } from "./env";

// Inicializa PrismaClient
getEnv(); // Validação de env para fail-fast
export const db = new PrismaClient();
