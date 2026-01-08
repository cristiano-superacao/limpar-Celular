export type ApiError = { message: string };

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

export function getApiUrl(): string {
  // Para rodar em dispositivo físico, use o IP da sua máquina:
  // EXPO_PUBLIC_API_URL=http://SEU_IP:4000
  return process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";
}

async function request<T>(path: string, init?: RequestInit, token?: string | null): Promise<T> {
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

export async function me(token: string) {
  return request<{ user: User }>("/me", undefined, token);
}

export async function createRequest(token: string, deviceInfo?: string) {
  return request<{ request: CleaningRequest }>("/requests", {
    method: "POST",
    body: JSON.stringify({ deviceInfo }),
  }, token);
}

export async function listRequests(token: string) {
  return request<{ requests: CleaningRequest[] }>("/requests", undefined, token);
}

export async function runMockScan(token: string, id: string) {
  return request<{ request: CleaningRequest; scan: unknown }>(`/requests/${id}/scan/mock`, { method: "POST" }, token);
}

export async function getCloudConfig(token: string) {
  return request<{ config: CloudConfig | null }>("/admin/cloud-config", undefined, token);
}

export async function setCloudConfig(
  token: string,
  input: { provider: CloudProvider; enabled: boolean; bucketOrContainer?: string | null; region?: string | null }
) {
  return request<{ config: CloudConfig }>("/admin/cloud-config", {
    method: "PUT",
    body: JSON.stringify(input),
  }, token);
}
