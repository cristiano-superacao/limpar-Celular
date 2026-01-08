import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  PORT: z.coerce.number().int().positive().optional(),
  // Lista de origens permitidas para CORS (separadas por vírgula). Opcional.
  CORS_ORIGIN: z.string().optional(),
  // Nível de log: debug, info, warn, error
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional().default("info"),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // Intencionalmente direto: falha cedo se faltar env.
    throw new Error(`Config inválida: ${parsed.error.message}`);
  }
  return parsed.data;
}
