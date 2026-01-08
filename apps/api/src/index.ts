import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { z } from "zod";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "crypto";

import { db } from "./db";
import { getEnv } from "./env";
import { requireAuth, requireRole, signToken } from "./auth";

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
app.use(pinoHttp({
  logger,
  genReqId: (req) => (req.headers["x-request-id"] as string) || randomUUID(),
}));
// expõe X-Request-Id nas respostas para correlação
app.use((req, res, next) => {
  const id = (req as any).id as string | undefined;
  if (id) res.setHeader("X-Request-Id", id);
  next();
});

// Rate limit geral (aplica antes do CORS para proteger)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuração robusta de CORS para produção (Railway) e desenvolvimento
const allowedFromEnv = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const defaultAllowed = [
  "http://localhost:5173",
  "http://localhost:3000",
];

const allowedOrigins = [...defaultAllowed, ...allowedFromEnv];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (curl, same-origin)
    if (!origin) return callback(null, true);

    const isAllowedExplicit = allowedOrigins.includes(origin);
    // Permitir qualquer domínio *.up.railway.app (Web e API em Railway)
    const isRailwayDomain = origin.endsWith(".up.railway.app");

    if (isAllowedExplicit || isRailwayDomain) {
      return callback(null, true);
    }
    return callback(new Error("Origin não permitido"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "content-type",
    "Authorization",
    "authorization",
    "Origin",
  ],
  credentials: true,
  optionsSuccessStatus: 204,
};

// CORS PRIMEIRO - crítico para Railway
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Helmet após CORS com configurações permissivas para cross-origin
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: false, // Desabilita CSP para evitar conflitos em produção
}));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: "2mb" }));

// Rate limit específico para autenticação (mais restritivo)
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

app.get("/health", async (_req, res) => {
  try {
    // Verifica conectividade básica com o banco
    await db.$queryRaw`SELECT 1`;

    // Verificações do schema (tabelas e enums essenciais)
    const [userTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='User') AS exists;"
    );
    const [reqTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CleaningRequest') AS exists;"
    );
    const [cloudTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CloudConfig') AS exists;"
    );

    const [roleEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='Role') AS exists;"
    );
    const [statusEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='CleaningStatus') AS exists;"
    );
    const [providerEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='CloudProvider') AS exists;"
    );

    return res.json({
      ok: true,
      db: "up",
      schema: {
        tables: {
          User: userTable?.exists ?? false,
          CleaningRequest: reqTable?.exists ?? false,
          CloudConfig: cloudTable?.exists ?? false,
        },
        enums: {
          Role: roleEnum?.exists ?? false,
          CleaningStatus: statusEnum?.exists ?? false,
          CloudProvider: providerEnum?.exists ?? false,
        },
      },
    });
  } catch (e) {
    logger.error({ err: e }, "health db check failed");
    return res.status(503).json({ ok: false, db: "down" });
  }
});

app.post("/auth/register", authLimiter, async (req, res) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });

  const { email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "E-mail já cadastrado" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, passwordHash, role: "USER" },
    select: { id: true, email: true, role: true },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return res.status(201).json({ token, user });
});

app.post("/auth/login", authLimiter, async (req, res) => {
  const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Credenciais inválidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciais inválidas" });

  const token = signToken({ sub: user.id, role: user.role });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
});

app.get("/me", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string };
  const user = await db.user.findUnique({
    where: { id: auth.sub },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  return res.json({ user });
});

app.post("/requests", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string };
  const bodySchema = z.object({
    deviceInfo: z.string().max(500).optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });

  const created = await db.cleaningRequest.create({
    data: {
      userId: auth.sub,
      deviceInfo: parsed.data.deviceInfo,
      status: "PENDING",
    },
  });

  return res.status(201).json({ request: created });
});

app.get("/requests", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string; role: "USER" | "ADMIN" };

  const requests =
    auth.role === "ADMIN"
      ? await db.cleaningRequest.findMany({
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, email: true } } },
        })
      : await db.cleaningRequest.findMany({
          where: { userId: auth.sub },
          orderBy: { createdAt: "desc" },
        });

  return res.json({ requests });
});

app.patch("/requests/:id/status", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const bodySchema = z.object({
    status: z.enum(["PENDING", "APPROVED", "REJECTED", "SCANNED", "COMPLETED"]),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });

  const updated = await db.cleaningRequest.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  return res.json({ request: updated });
});

// Stub: gera um "scan" simulado e salva na solicitação
app.post("/requests/:id/scan/mock", requireAuth, async (req, res) => {
  const auth = (req as any).auth as { sub: string; role: "USER" | "ADMIN" };

  const request = await db.cleaningRequest.findUnique({ where: { id: req.params.id } });
  if (!request) return res.status(404).json({ message: "Solicitação não encontrada" });

  if (auth.role !== "ADMIN" && request.userId !== auth.sub) {
    return res.status(403).json({ message: "Sem permissão" });
  }

  const scan = {
    generatedAt: new Date().toISOString(),
    groups: [
      {
        theme: "WhatsApp",
        items: [
          { id: "wpp-photo-1", type: "photo", sizeBytes: 2_400_000, path: "WhatsApp/Media/WhatsApp Images/img1.jpg" },
          { id: "wpp-video-1", type: "video", sizeBytes: 18_500_000, path: "WhatsApp/Media/WhatsApp Video/vid1.mp4" },
          { id: "wpp-audio-1", type: "audio", sizeBytes: 950_000, path: "WhatsApp/Media/WhatsApp Audio/aud1.opus" },
          { id: "wpp-doc-1", type: "document", sizeBytes: 4_200_000, path: "WhatsApp/Media/WhatsApp Documents/doc1.pdf" }
        ]
      },
      {
        theme: "Downloads",
        items: [
          { id: "dl-1", type: "document", sizeBytes: 1_200_000, path: "Download/arquivo.zip" }
        ]
      }
    ]
  };

  const updated = await db.cleaningRequest.update({
    where: { id: request.id },
    data: {
      status: "SCANNED",
      scanResultJson: JSON.stringify(scan),
    },
  });

  return res.json({ request: updated, scan });
});

// Configuração de nuvem (admin) - stub
app.get("/admin/cloud-config", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  const config = await db.cloudConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  return res.json({ config });
});

app.put("/admin/cloud-config", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const bodySchema = z.object({
    provider: z.enum(["NONE", "AZURE_BLOB", "AWS_S3", "GOOGLE_DRIVE", "OTHER"]),
    enabled: z.boolean(),
    bucketOrContainer: z.string().max(200).optional().nullable(),
    region: z.string().max(100).optional().nullable(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Dados inválidos" });

  const existing = await db.cloudConfig.findFirst({ orderBy: { updatedAt: "desc" } });
  const config = existing
    ? await db.cloudConfig.update({
        where: { id: existing.id },
        data: parsed.data,
      })
    : await db.cloudConfig.create({ data: parsed.data });

  return res.json({ config });
});

// Admin: garantir schema do banco (idempotente)
app.post("/admin/db/ensure", requireAuth, requireRole("ADMIN"), async (_req, res) => {
  try {
    // Enums
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('USER','ADMIN');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "CleaningStatus" AS ENUM ('PENDING','APPROVED','REJECTED','SCANNED','COMPLETED');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await db.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "CloudProvider" AS ENUM ('NONE','AZURE_BLOB','AWS_S3','GOOGLE_DRIVE','OTHER');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // Tabelas
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "passwordHash" TEXT NOT NULL,
        "role" "Role" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CleaningRequest" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "status" "CleaningStatus" NOT NULL DEFAULT 'PENDING',
        "deviceInfo" TEXT,
        "scanResultJson" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "CleaningRequest_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "User"("id")
          ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CleaningRequest_userId_idx" ON "CleaningRequest"("userId");
    `);
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "CleaningRequest_status_idx" ON "CleaningRequest"("status");
    `);
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CloudConfig" (
        "id" TEXT PRIMARY KEY,
        "provider" "CloudProvider" NOT NULL DEFAULT 'NONE',
        "enabled" BOOLEAN NOT NULL DEFAULT FALSE,
        "bucketOrContainer" TEXT,
        "region" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    // Retornar status depois de garantir
    const [userTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='User') AS exists;"
    );
    const [reqTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CleaningRequest') AS exists;"
    );
    const [cloudTable]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='CloudConfig') AS exists;"
    );
    const [roleEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='Role') AS exists;"
    );
    const [statusEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='CleaningStatus') AS exists;"
    );
    const [providerEnum]: Array<{ exists: boolean }> = await db.$queryRawUnsafe(
      "SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname='CloudProvider') AS exists;"
    );

    return res.json({
      ok: true,
      ensured: true,
      schema: {
        tables: {
          User: userTable?.exists ?? false,
          CleaningRequest: reqTable?.exists ?? false,
          CloudConfig: cloudTable?.exists ?? false,
        },
        enums: {
          Role: roleEnum?.exists ?? false,
          CleaningStatus: statusEnum?.exists ?? false,
          CloudProvider: providerEnum?.exists ?? false,
        },
      },
    });
  } catch (e) {
    logger.error({ err: e }, "db ensure failed");
    return res.status(500).json({ ok: false, message: "Falha ao garantir schema" });
  }
});

const env = getEnv();
const port = env.PORT ?? 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API rodando em http://localhost:${port}`);
});

// Handler global de erros - mantém resposta consistente
// Deve vir após as rotas
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  (req as any).log?.error({ err }, "unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ message: "Erro interno" });
});
