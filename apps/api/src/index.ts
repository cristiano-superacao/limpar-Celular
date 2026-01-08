import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "./db";
import { getEnv } from "./env";
import { requireAuth, requireRole, signToken } from "./auth";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res) => {
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

app.post("/auth/login", async (req, res) => {
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

const env = getEnv();
const port = env.PORT ?? 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API rodando em http://localhost:${port}`);
});
