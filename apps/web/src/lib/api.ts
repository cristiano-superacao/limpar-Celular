import { getToken } from "./auth";

const DEFAULT_API_URL = "http://localhost:4000";

export function getApiUrl(): string {
  // Prioridade: 1) VITE_API_URL, 2) Detectar Railway, 3) Localhost
  const viteUrl = (import.meta as any).env?.VITE_API_URL;
  
  if (viteUrl) {
    return viteUrl;
  }
  
  return DEFAULT_API_URL;
}

export type ApiError = {
  message: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  // Em produção no Railway, sem VITE_API_URL, o Web acaba chamando localhost/URL errada
  // e o browser mostra "erro de CORS". Retornamos uma mensagem explícita para orientar.
  if (
    typeof window !== "undefined" &&
    window.location.hostname.includes("railway.app") &&
    ((import.meta as any).env?.VITE_API_URL == null || (import.meta as any).env?.VITE_API_URL === "")
  ) {
    throw new Error(
      "Configuração ausente: defina VITE_API_URL no Railway apontando para a API (ex.: https://SEU-API.up.railway.app)."
    );
  }

  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiError | null;
    throw new Error(data?.message || `Erro HTTP ${res.status}`);
  }

  return (await res.json()) as T;
}

export type UserRole = "USER" | "ADMIN";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type CleaningStatus = "PENDING" | "APPROVED" | "REJECTED" | "SCANNED" | "COMPLETED";

export type CleaningRequest = {
  id: string;
  userId: string;
  status: CleaningStatus;
  deviceInfo?: string | null;
  scanResultJson?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string };
};

export async function register(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function login(email: string, password: string) {
  return request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me() {
  return request<{ user: User }>("/me");
}

export async function createRequest(deviceInfo?: string) {
  return request<{ request: CleaningRequest }>("/requests", {
    method: "POST",
    body: JSON.stringify({ deviceInfo }),
  });
}

export async function listRequests() {
  return request<{ requests: CleaningRequest[] }>("/requests");
}

export async function adminSetRequestStatus(id: string, status: CleaningStatus) {
  return request<{ request: CleaningRequest }>(`/requests/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function runMockScan(id: string) {
  return request<{ request: CleaningRequest; scan: unknown }>(`/requests/${id}/scan/mock`, {
    method: "POST",
  });
}

export type CloudProvider = "NONE" | "AZURE_BLOB" | "AWS_S3" | "GOOGLE_DRIVE" | "OTHER";

export type CloudConfig = {
  id: string;
  provider: CloudProvider;
  enabled: boolean;
  bucketOrContainer?: string | null;
  region?: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getCloudConfig() {
  return request<{ config: CloudConfig | null }>("/admin/cloud-config");
}

export async function setCloudConfig(input: Omit<CloudConfig, "id" | "createdAt" | "updatedAt">) {
  return request<{ config: CloudConfig }>("/admin/cloud-config", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
